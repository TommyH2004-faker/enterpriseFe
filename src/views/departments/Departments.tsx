import React, { useState } from "react";
import { CButton, CCard, CCardBody, CCardHeader, CSpinner } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilTrash } from "@coreui/icons";
import {
  CreateDepartmentRequest,
  DepartmentResponse,
} from "../../types/Department";
import { useDepartments } from "./useDepartments.ts";
import DepartmentContent from "./DepartmentContent";
import DepartmentFilters from "./DepartmentFilters";
import DepartmentModal from "./DepartmentModal";
import DepartmentPagination from "./DepartmentPagination";

const Departments: React.FC = () => {
  const api = useDepartments();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [visible, setVisible] = useState(false);
  const [editDept, setEditDept] = useState<DepartmentResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    code: "",
    name: "",
    description: "",
    isActive: null,
  });

  const openCreate = () => {
    setEditDept(null);
    setFormData({ code: "", name: "", description: "", isActive: null });
    setVisible(true);
  };
  const openEdit = (department: DepartmentResponse) => {
    setEditDept(department);
    setFormData({
      code: department.code,
      name: department.name,
      description: department.description,
      isActive: department.isActive,
    });
    setVisible(true);
  };
  const handleFormChange = (
    field: keyof CreateDepartmentRequest,
    value: string | boolean,
  ) => setFormData((previous) => ({ ...previous, [field]: value }));
  const handleSave = async () => {
    if (await api.saveDepartment(formData, editDept)) setVisible(false);
  };
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedIds(
      event.target.checked
        ? new Set(api.departments.map((department) => department.id))
        : new Set(),
    );
  const handleSelect = (id: string) =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= api.pagination.totalPages) {
      api.fetchDepartments(page);
      setSelectedIds(new Set());
    }
  };
  const handlePageSizeChange = (size: number) => {
    api.fetchDepartments(1, size);
    setSelectedIds(new Set());
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold text-dark">Quản lý Phòng ban</h2>
          <div className="text-muted small">
            Tổng: {api.pagination.totalCount} phòng ban{" "}
            {api.loading && (
              <CSpinner size="sm" className="ms-2" variant="border" />
            )}
          </div>
        </div>
        <CButton
          color="primary"
          onClick={openCreate}
          className="d-flex align-items-center gap-2"
        >
          <CIcon icon={cilPlus} />
          Thêm phòng ban
        </CButton>
      </div>
      <CCard className="border-0 shadow-sm rounded-3 mb-4">
        <CCardHeader className="bg-white border-bottom pt-3 pb-0 px-4">
          <DepartmentFilters
            searchName={api.searchName}
            sortOption={api.sortOption}
            viewMode={viewMode}
            onSearchNameChange={(value) => {
              api.setSearchName(value);
              setSelectedIds(new Set());
            }}
            onSortChange={(value) => {
              api.handleSortChange(value);
              setSelectedIds(new Set());
            }}
            onViewModeChange={setViewMode}
          />
          {selectedIds.size > 0 && (
            <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-primary bg-opacity-10 rounded-2 mb-3 border border-primary border-opacity-25">
              <span className="text-primary fw-semibold small">
                {selectedIds.size} phòng ban đã chọn
              </span>
              <div className="d-flex gap-2">
                <CButton
                  color="light"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Hủy chọn
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  className="text-white"
                  onClick={() => api.deleteSelected(selectedIds)}
                  disabled={api.loading}
                >
                  <CIcon icon={cilTrash} className="me-1" />
                  Xóa đã chọn
                </CButton>
              </div>
            </div>
          )}
        </CCardHeader>
        <CCardBody className="p-0">
          {api.loading && !api.departments.length ? (
            <div className="d-flex justify-content-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : api.departments.length ? (
            <DepartmentContent
              departments={api.departments}
              viewMode={viewMode}
              selectedIds={selectedIds}
              loading={api.loading}
              onSelectAll={handleSelectAll}
              onSelect={handleSelect}
              onEdit={openEdit}
              onDelete={api.deleteDepartment}
            />
          ) : (
            <div className="text-center py-5 text-muted">Không có dữ liệu</div>
          )}
          <DepartmentPagination
            pagination={api.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CCardBody>
      </CCard>
      <DepartmentModal
        visible={visible}
        loading={api.loading}
        editDept={editDept}
        formData={formData}
        onClose={() => setVisible(false)}
        onSave={handleSave}
        onChange={handleFormChange}
      />
    </>
  );
};

export default Departments;
