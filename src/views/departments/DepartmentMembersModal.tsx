import React, { useEffect, useState } from "react";
import {
  CBadge,
  CButton,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilPeople,
  cilPlus,
  cilTrash,
  cilUser,
} from "@coreui/icons";
import toast from "react-hot-toast";
import {
  DepartmentMemberResponse,
  DepartmentMemberRole,
  DepartmentResponse,
} from "../../types/Department";
import { departmentService } from "../../services/departmentService";
import { employeeService } from "../../services/employeeService";
import { EmployeeResponse } from "../../types/Employee";

interface Props {
  visible: boolean;
  department: DepartmentResponse | null;
  onClose: () => void;
}

const getRoleBadge = (role: DepartmentMemberRole) => {
  switch (role) {
    case DepartmentMemberRole.Head:
      return <CBadge color="danger">Trưởng phòng</CBadge>;
    case DepartmentMemberRole.DeputyHead:
      return <CBadge color="info">Phó phòng</CBadge>;
    case DepartmentMemberRole.Member:
      return <CBadge color="secondary">Thành viên</CBadge>;
    default:
      return <CBadge color="light">Khác</CBadge>;
  }
};

const DepartmentMembersModal: React.FC<Props> = ({
  visible,
  department,
  onClose,
}) => {
  const [members, setMembers] = useState<DepartmentMemberResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form thêm thành viên
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<DepartmentMemberRole>(
    DepartmentMemberRole.Member,
  );

  useEffect(() => {
    if (visible && department) {
      loadMembers();
      loadAllEmployees();
    } else {
      setMembers([]);
      setSelectedUserId("");
    }
  }, [visible, department]);

  const loadMembers = async () => {
    if (!department) return;
    setLoading(true);
    try {
      const data = await departmentService.getMembers(department.id);
      setMembers(data);
    } catch {
      toast.error("Không thể tải danh sách thành viên phòng ban");
    } finally {
      setLoading(false);
    }
  };

  const loadAllEmployees = async () => {
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data || []);
    } catch {
      // Bỏ qua lỗi phụ
    }
  };

  const handleAddMember = async () => {
    if (!department || !selectedUserId) {
      toast.error("Vui lòng chọn nhân viên để thêm");
      return;
    }

    setActionLoading(true);
    try {
      await departmentService.addMember(department.id, {
        userId: selectedUserId,
        role: Number(selectedRole) as DepartmentMemberRole,
      });
      toast.success("Thêm thành viên vào phòng ban thành công!");
      setSelectedUserId("");
      await loadMembers();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.description ||
        "Thêm thành viên thất bại";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: DepartmentMemberRole,
  ) => {
    if (!department) return;
    setActionLoading(true);
    try {
      await departmentService.updateMemberRole(department.id, userId, {
        role: Number(newRole) as DepartmentMemberRole,
      });
      toast.success("Cập nhật vai trò thành công!");
      await loadMembers();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.description ||
        "Không thể cập nhật vai trò";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!department) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa "${memberName}" khỏi phòng ban này không?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await departmentService.removeMember(department.id, userId);
      toast.success("Xóa thành viên khỏi phòng ban thành công!");
      await loadMembers();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.description ||
        "Không thể xóa thành viên";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Lọc những nhân viên chưa có trong phòng ban này để hiển thị trong select
  const currentMemberUserIds = new Set(members.map((m) => m.userId));
  const availableEmployees = employees.filter(
    (e) => !currentMemberUserIds.has(e.userId),
  );

  return (
    <CModal visible={visible} onClose={onClose} size="lg" alignment="center">
      <CModalHeader className="bg-light border-bottom">
        <CModalTitle className="fw-bold d-flex align-items-center gap-2">
          <CIcon icon={cilPeople} className="text-primary" />
          Quản lý thành viên - {department?.name}
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        {/* Header Thông tin phòng ban */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3">
          <div>
            <div className="fw-bold text-dark">{department?.name}</div>
            <div className="text-muted small">
              Mã phòng: <span className="fw-semibold">{department?.code}</span> | 
              Tổng thành viên: <span className="text-primary fw-bold">{members.length}</span>
            </div>
          </div>
          <CBadge color={department?.isActive ? "success" : "secondary"}>
            {department?.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
          </CBadge>
        </div>

        {/* Section: Thêm thành viên mới */}
        <div className="card mb-4 border-0 shadow-sm bg-body-tertiary">
          <div className="card-body p-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <CIcon icon={cilPlus} className="text-success" />
              Thêm nhân viên vào phòng ban
            </h6>
            <div className="row g-2 align-items-center">
              <div className="col-md-6">
                <CFormSelect
                  size="sm"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.userId} value={emp.userId}>
                      {emp.fullName} ({emp.employeeCode} - {emp.email})
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="col-md-4">
                <CFormSelect
                  size="sm"
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      Number(e.target.value) as DepartmentMemberRole,
                    )
                  }
                  disabled={actionLoading}
                >
                  <option value={DepartmentMemberRole.Member}>Thành viên</option>
                  <option value={DepartmentMemberRole.DeputyHead}>
                    Phó phòng
                  </option>
                  <option value={DepartmentMemberRole.Head}>Trưởng phòng</option>
                </CFormSelect>
              </div>
              <div className="col-md-2">
                <CButton
                  color="primary"
                  size="sm"
                  className="w-100"
                  onClick={handleAddMember}
                  disabled={!selectedUserId || actionLoading}
                >
                  {actionLoading ? (
                    <CSpinner size="sm" />
                  ) : (
                    "Thêm"
                  )}
                </CButton>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách thành viên */}
        <h6 className="fw-bold mb-2">Danh sách thành viên hiện tại</h6>
        {loading ? (
          <div className="text-center py-4">
            <CSpinner color="primary" />
            <div className="text-muted small mt-2">Đang tải thành viên...</div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-4 text-muted border rounded-3 bg-light">
            Phòng ban này chưa có thành viên nào.
          </div>
        ) : (
          <div className="table-responsive border rounded-3">
            <CTable hover align="middle" className="mb-0">
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                  <CTableHeaderCell>Chức danh</CTableHeaderCell>
                  <CTableHeaderCell>Vai trò phòng ban</CTableHeaderCell>
                  <CTableHeaderCell>Ngày tham gia</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {members.map((m) => (
                  <CTableRow key={m.id}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-2">
                        {m.avatarUrl ? (
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="rounded-circle"
                            style={{ width: "34px", height: "34px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                            style={{ width: "34px", height: "34px" }}
                          >
                            <CIcon icon={cilUser} />
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold text-dark">{m.fullName}</div>
                          <div className="text-muted small">
                            {m.employeeCode} &bull; {m.email}
                          </div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <span className="text-muted small">
                        {m.positionName || "Chưa có"}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-2">
                        {getRoleBadge(m.role)}
                        <CFormSelect
                          size="sm"
                          style={{ width: "130px" }}
                          value={m.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              m.userId,
                              Number(e.target.value) as DepartmentMemberRole,
                            )
                          }
                          disabled={actionLoading}
                        >
                          <option value={DepartmentMemberRole.Head}>
                            Trưởng phòng
                          </option>
                          <option value={DepartmentMemberRole.DeputyHead}>
                            Phó phòng
                          </option>
                          <option value={DepartmentMemberRole.Member}>
                            Thành viên
                          </option>
                        </CFormSelect>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-muted small">
                      {new Date(m.joinedDate).toLocaleDateString("vi-VN")}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        color="danger"
                        variant="ghost"
                        size="sm"
                        title="Xóa khỏi phòng ban"
                        onClick={() => handleRemoveMember(m.userId, m.fullName)}
                        disabled={actionLoading}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CModalBody>

      <CModalFooter className="border-top">
        <CButton color="secondary" onClick={onClose}>
          Đóng
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default DepartmentMembersModal;

