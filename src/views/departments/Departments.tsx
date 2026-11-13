import React, { useState, useEffect } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBriefcase, cilBuilding, cilPlus, cilTrash } from "@coreui/icons";
import { useSearchParams } from "react-router-dom";
import {
  CreateDepartmentRequest,
  DepartmentResponse,
} from "../../types/Department";
import { useDepartments } from "./useDepartments.ts";
import DepartmentContent from "./DepartmentContent";
import DepartmentFilters from "./DepartmentFilters";
import DepartmentModal from "./DepartmentModal";
import DepartmentPagination from "./DepartmentPagination";
import DepartmentMembersModal from "./DepartmentMembersModal";
import PositionRoleUser from "../PositionPage/PositonRoleUser";
import { authStorage } from "../../services/authStorage";

type TabType = "departments" | "positions";

const Departments: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "departments";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Cập nhật URL khi chuyển tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam && (tabParam === "departments" || tabParam === "positions")) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // =========================
  // DEPARTMENT TAB LOGIC
  // =========================
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

  // Modal quản lý thành viên phòng ban
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [selectedDepartmentForMembers, setSelectedDepartmentForMembers] =
    useState<DepartmentResponse | null>(null);

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

  const openMembersModal = (department: DepartmentResponse) => {
    setSelectedDepartmentForMembers(department);
    setMembersModalVisible(true);
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
    <div className="departments-page">
      {/* 2 Tabs: Phòng ban & Chức vụ */}
      <CCard className="border-0 shadow-sm rounded-3 mb-4">
        <CCardBody className="p-2">
          <CNav variant="pills" className="d-flex gap-2">
            <CNavItem>
              <CNavLink
                role="button"
                active={activeTab === "departments"}
                onClick={() => handleTabChange("departments")}
                className={`d-flex align-items-center gap-2 fw-semibold px-4 py-2 rounded-2 ${
                  activeTab === "departments"
                    ? "bg-primary text-white shadow-sm"
                    : "text-secondary bg-transparent"
                }`}
                style={{ cursor: "pointer" }}
              >
                <CIcon icon={cilBuilding} />
                Phòng ban
                {api.pagination.totalCount > 0 && (
                  <span
                    className={`badge rounded-pill ms-1 ${
                      activeTab === "departments"
                        ? "bg-white text-primary"
                        : "bg-light text-dark"
                    }`}
                  >
                    {api.pagination.totalCount}
                  </span>
                )}
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                role="button"
                active={activeTab === "positions"}
                onClick={() => handleTabChange("positions")}
                className={`d-flex align-items-center gap-2 fw-semibold px-4 py-2 rounded-2 ${
                  activeTab === "positions"
                    ? "bg-primary text-white shadow-sm"
                    : "text-secondary bg-transparent"
                }`}
                style={{ cursor: "pointer" }}
              >
                <CIcon icon={cilBriefcase} />
                Chức vụ
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardBody>
      </CCard>

      {/* TAB 1: PHÒNG BAN */}
      {activeTab === "departments" && (
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
            {(authStorage.hasPermission("DEPARTMENT.CREATE") ||
              authStorage.isAdmin()) && (
              <CButton
                color="primary"
                onClick={openCreate}
                className="d-flex align-items-center gap-2"
              >
                <CIcon icon={cilPlus} />
                Thêm phòng ban
              </CButton>
            )}
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
                    {(authStorage.hasPermission("DEPARTMENT.DELETE") ||
                      authStorage.isAdmin()) && (
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
                    )}
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
                  onViewMembers={openMembersModal}
                />
              ) : (
                <div className="text-center py-5 text-muted">
                  Không có dữ liệu phòng ban
                </div>
              )}
              <DepartmentPagination
                pagination={api.pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </CCardBody>
          </CCard>

          {/* Modal CRUD phòng ban */}
          <DepartmentModal
            visible={visible}
            loading={api.loading}
            editDept={editDept}
            formData={formData}
            onClose={() => setVisible(false)}
            onSave={handleSave}
            onChange={handleFormChange}
          />

          {/* Modal Quản lý thành viên phòng ban */}
          <DepartmentMembersModal
            visible={membersModalVisible}
            department={selectedDepartmentForMembers}
            onClose={() => setMembersModalVisible(false)}
          />
        </>
      )}

      {/* TAB 2: CHỨC VỤ (POSITION CRUD) */}
      {activeTab === "positions" && (
        <div className="positions-tab-wrapper">
          <PositionRoleUser />
        </div>
      )}
    </div>
  );
};

export default Departments;
