import React from "react";
import {
  CButton,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from "@coreui/react";
import {
  CreateDepartmentRequest,
  DepartmentResponse,
} from "../../types/Department";

interface Props {
  visible: boolean;
  loading: boolean;
  editDept: DepartmentResponse | null;
  formData: CreateDepartmentRequest;
  onClose: () => void;
  onSave: () => void;
  onChange: (
    field: keyof CreateDepartmentRequest,
    value: string | boolean,
  ) => void;
}

const DepartmentModal: React.FC<Props> = ({
  visible,
  loading,
  editDept,
  formData,
  onClose,
  onSave,
  onChange,
}) => (
  <CModal visible={visible} onClose={onClose} alignment="center">
    <CModalHeader className="border-bottom-0 pb-0">
      <CModalTitle className="fw-bold">
        {editDept ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
      </CModalTitle>
    </CModalHeader>
    <CModalBody className="px-4 pb-2">
      <CForm>
        <div className="mb-3">
          <CFormLabel className="fw-semibold text-dark">
            Mã phòng ban <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            placeholder="VD: DEP001"
            value={formData.code}
            onChange={(e) => onChange("code", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <CFormLabel className="fw-semibold text-dark">
            Tên phòng ban <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            placeholder="VD: Phòng Kỹ thuật"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <CFormLabel className="fw-semibold text-dark">Mô tả</CFormLabel>
          <CFormTextarea
            rows={3}
            placeholder="Mô tả chức năng và trách nhiệm của phòng ban..."
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <CFormCheck
            type="checkbox"
            id="department-is-active"
            className="form-switch m-0"
            checked={formData.isActive === true}
            onChange={(e) => onChange("isActive", e.target.checked)}
            label={
              formData.isActive === null
                ? "Vui lòng chọn trạng thái"
                : formData.isActive
                  ? "Hoạt động"
                  : "Không hoạt động"
            }
          />
        </div>
      </CForm>
    </CModalBody>
    <CModalFooter className="border-top-0">
      <CButton color="light" onClick={onClose} disabled={loading}>
        Hủy
      </CButton>
      <CButton color="primary" onClick={onSave} disabled={loading}>
        {loading && <CSpinner size="sm" className="me-2" variant="border" />}Lưu
      </CButton>
    </CModalFooter>
  </CModal>
);
export default DepartmentModal;
