import React from "react";
import {
  CButton,
  CCol,
  CFormCheck,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";
import CIconComponent from "@coreui/icons-react";
import { cilBuilding, cilPencil, cilPeople, cilTrash } from "@coreui/icons";
import { DepartmentResponse } from "../../types/Department";
import { authStorage } from "../../services/authStorage";

const colors = [
  "#321FDB",
  "#2ED8B6",
  "#FFC107",
  "#E55353",
  "#54A3FF",
  "#8A1515",
];
interface Props {
  departments: DepartmentResponse[];
  viewMode: "list" | "grid";
  selectedIds: Set<string>;
  loading: boolean;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (id: string) => void;
  onEdit: (department: DepartmentResponse) => void;
  onDelete: (id: string) => void;
  onViewMembers: (department: DepartmentResponse) => void;
}
const formatDate = (date: string) => new Date(date).toLocaleDateString("vi-VN");

const DepartmentContent: React.FC<Props> = ({
  departments,
  viewMode,
  selectedIds,
  loading,
  onSelectAll,
  onSelect,
  onEdit,
  onDelete,
  onViewMembers,
}) => {
  const canEdit =
    authStorage.hasPermission("DEPARTMENT.UPDATE") || authStorage.isAdmin();
  const canDelete =
    authStorage.hasPermission("DEPARTMENT.DELETE") || authStorage.isAdmin();

  return viewMode === "list" ? (
    <div className="table-responsive">
      <CTable hover className="mb-0 align-middle border-top">
        <CTableHead>
          <CTableRow className="bg-light">
            <CTableHeaderCell className="ps-4" style={{ width: "48px" }}>
              <CFormCheck
                onChange={onSelectAll}
                checked={
                  selectedIds.size === departments.length &&
                  departments.length > 0
                }
              />
            </CTableHeaderCell>
            <CTableHeaderCell>Tên phòng ban</CTableHeaderCell>
            <CTableHeaderCell>Mã phòng</CTableHeaderCell>
            <CTableHeaderCell>Trạng thái</CTableHeaderCell>
            <CTableHeaderCell>Mô tả</CTableHeaderCell>
            <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
            <CTableHeaderCell className="pe-4 text-end">
              Hành động
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {departments.map((department, index) => (
            <CTableRow
              key={department.id}
              style={{ height: "60px" }}
              className={selectedIds.has(department.id) ? "table-active" : ""}
            >
              <CTableDataCell className="ps-4">
                <CFormCheck
                  checked={selectedIds.has(department.id)}
                  onChange={() => onSelect(department.id)}
                />
              </CTableDataCell>
              <CTableDataCell>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: "32px",
                      height: "32px",
                      background: `${colors[index % colors.length]}20`,
                      color: colors[index % colors.length],
                    }}
                  >
                    <CIconComponent icon={cilBuilding} />
                  </div>
                  <span className="fw-semibold text-dark">
                    {department.name}
                  </span>
                </div>
              </CTableDataCell>
              <CTableDataCell>
                <span className="badge bg-light text-dark">
                  {department.code}
                </span>
              </CTableDataCell>
              <CTableDataCell>
                <span
                  className={`badge ${department.isActive ? "bg-success" : "bg-secondary"}`}
                >
                  {department.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </CTableDataCell>
              <CTableDataCell>
                <span
                  className="text-muted text-truncate d-block"
                  style={{ maxWidth: "250px" }}
                >
                  {department.description || "N/A"}
                </span>
              </CTableDataCell>
              <CTableDataCell className="text-muted small">
                {formatDate(department.createdAt)}
              </CTableDataCell>
              <CTableDataCell className="pe-4 text-end">
                <CButton
                  color="light"
                  size="sm"
                  className="border-0 text-success me-1"
                  title="Quản lý thành viên"
                  onClick={() => onViewMembers(department)}
                  disabled={loading}
                >
                  <CIconComponent icon={cilPeople} className="me-1" />
                  <span className="small d-none d-md-inline">Thành viên</span>
                </CButton>
                {canEdit && (
                  <CButton
                    color="light"
                    size="sm"
                    className="border-0 text-primary me-1"
                    title="Chỉnh sửa"
                    onClick={() => onEdit(department)}
                    disabled={loading}
                  >
                    <CIconComponent icon={cilPencil} />
                  </CButton>
                )}
                {canDelete && (
                  <CButton
                    color="light"
                    size="sm"
                    className="border-0 text-danger"
                    title="Xóa"
                    onClick={() => onDelete(department.id)}
                    disabled={loading}
                  >
                    <CIconComponent icon={cilTrash} />
                  </CButton>
                )}
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  ) : (
    <div className="p-4">
      <CRow className="g-4">
        {departments.map((department, index) => (
          <CCol sm={6} lg={4} xl={3} key={department.id}>
            <div
              className="bg-white border rounded-3 h-100"
              style={{
                borderColor: "#E8EAED",
                maxWidth: "300px",
                margin: "0 auto",
              }}
            >
              <div className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0 text-truncate pe-2">
                    {department.name}
                  </h6>
                  <span className="badge bg-light text-dark">
                    {department.code}
                  </span>
                </div>
                <div className="text-center py-3 mb-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: "56px",
                      height: "56px",
                      background: `${colors[index % colors.length]}15`,
                      color: colors[index % colors.length],
                    }}
                  >
                    <CIconComponent
                      icon={cilBuilding}
                      style={{ width: "28px", height: "28px" }}
                    />
                  </div>
                </div>
                <div className="mb-3 pb-3 border-bottom">
                  <div className="text-muted mb-2 small">TRẠNG THÁI</div>
                  <span
                    className={`badge ${department.isActive ? "bg-success" : "bg-secondary"}`}
                  >
                    {department.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>
                <div className="mb-3 pb-3 border-bottom">
                  <div className="text-muted mb-2 small">MÔ TẢ</div>
                  <p className="text-dark mb-0 text-truncate small">
                    {department.description || "Chưa có mô tả"}
                  </p>
                </div>
                <div className="mb-4 text-muted small">
                  Ngày tạo: {formatDate(department.createdAt)}
                </div>
              </div>
              <div className="px-4 pb-4 d-flex flex-column gap-2">
                <CButton
                  color="success"
                  variant="outline"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center gap-1"
                  onClick={() => onViewMembers(department)}
                  disabled={loading}
                >
                  <CIconComponent icon={cilPeople} />
                  Quản lý thành viên
                </CButton>
                {(canEdit || canDelete) && (
                  <div className="d-flex gap-2">
                    {canEdit && (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => onEdit(department)}
                        disabled={loading}
                      >
                        Chỉnh sửa
                      </CButton>
                    )}
                    {canDelete && (
                      <CButton
                        color="danger"
                        size="sm"
                        className="flex-grow-1 text-white"
                        onClick={() => onDelete(department.id)}
                        disabled={loading}
                      >
                        Xóa
                      </CButton>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CCol>
        ))}
      </CRow>
    </div>
  );
};

export default DepartmentContent;
