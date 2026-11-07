import React, { useState } from 'react'
import {
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheck, cilPeople, cilSearch, cilX } from '@coreui/icons'
import { ChatService, CreateGroupRequest } from 'src/services/chatService'
import { useCreateGroup } from '../hooks/useCreateGroup'
import ToastAlert from 'src/components/ToastAlert'
import { initialOf } from '../utils/utils'

interface Props {
  visible: boolean
  service: ChatService
  currentUserId: string
  onClose: () => void
  /** Trả về chuỗi lỗi, hoặc null nếu thành công */
  onSubmit: (request: CreateGroupRequest) => Promise<string | null>
}

const CreateGroupModal: React.FC<Props> = ({
  visible,
  service,
  currentUserId,
  onClose,
  onSubmit,
}) => {
  const g = useCreateGroup(service, currentUserId, visible)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!g.canSubmit || submitting) return
    setSubmitting(true)
    const message = await onSubmit(g.buildRequest())
    setSubmitting(false)
    if (message) g.setError(message)
    else onClose()
  }

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
      backdrop="static"
      className="flat-chat-modal create-group-modal"
    >
      <CModalHeader closeButton>
        <CModalTitle>
          <CIcon icon={cilPeople} className="me-2 text-primary" />
          Tạo nhóm chat
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="group-modal-body">
        <div className="flat-search-box">
          <input
            type="text"
            value={g.name}
            placeholder="Nhập tên nhóm..."
            onChange={(e) => g.setName(e.target.value)}
          />
        </div>

        <div className="group-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={g.mode === 'members' ? 'active' : ''}
            onClick={() => g.setMode('members')}
          >
            Chọn thành viên
          </button>
          <button
            type="button"
            role="tab"
            className={g.mode === 'department' ? 'active' : ''}
            onClick={() => g.setMode('department')}
          >
            Theo phòng ban
          </button>
        </div>

        {g.mode === 'members' ? (
          <div className="flat-search-box">
            <CIcon icon={cilSearch} className="flat-search-icon" />
            <input
              autoFocus
              value={g.query}
              placeholder="Tìm nhân viên (ít nhất 2 ký tự)..."
              onChange={(e) => g.setQuery(e.target.value)}
            />
            {g.query && (
              <button
                type="button"
                className="flat-search-clear"
                aria-label="Xóa tìm kiếm"
                onClick={() => g.setQuery('')}
              >
                <CIcon icon={cilX} size="sm" />
              </button>
            )}
          </div>
        ) : (
          <CFormSelect
            value={g.departmentId}
            onChange={(e) => void g.setDepartmentId(e.target.value)}
          >
            <option value="">-- Chọn phòng ban --</option>
            {g.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </CFormSelect>
        )}

        {g.selectedList.length > 0 && (
          <div className="selected-employee-chips">
            {g.selectedList.map((p) => (
              <button
                type="button"
                key={p.userId}
                className="selected-employee-chip"
                title="Bỏ chọn"
                onClick={() => g.toggle(p)}
              >
                <span>{p.fullName}</span>
                <CIcon icon={cilX} size="sm" className="chip-close-icon" />
              </button>
            ))}
          </div>
        )}

        <ToastAlert message={g.error} />

        <div className="employee-candidate-list">
          {g.loading ? (
            <div className="candidate-empty">
              <CSpinner size="sm" /> Đang tải nhân viên...
            </div>
          ) : g.results.length ? (
            <>
              {g.mode === 'department' && (
                <div
                  className="employee-candidate-row group-person-all"
                  onClick={g.toggleAll}
                >
                  <span className={`candidate-check ${g.allChecked ? 'checked' : ''}`}>
                    {g.allChecked && <CIcon icon={cilCheck} size="sm" />}
                  </span>
                  <div className="candidate-copy">
                    <div className="candidate-name">Chọn tất cả ({g.results.length})</div>
                  </div>
                </div>
              )}
              {g.results.map((p) => {
                const checked = !!g.selected[p.userId]
                return (
                  <div
                    key={p.userId}
                    className={`employee-candidate-row ${checked ? 'checked' : ''}`}
                    onClick={() => g.toggle(p)}
                  >
                    <span className="member-circle-avatar">{initialOf(p.fullName)}</span>
                    <div className="candidate-copy">
                      <div className="candidate-name">{p.fullName}</div>
                      <div className="candidate-dept">{p.departmentName || p.username}</div>
                    </div>
                    <span className={`candidate-check ${checked ? 'checked' : ''}`}>
                      {checked && <CIcon icon={cilCheck} size="sm" />}
                    </span>
                  </div>
                )
              })}
            </>
          ) : (
            <div className="candidate-empty">
              {g.mode === 'members'
                ? 'Nhập tên để tìm nhân viên.'
                : 'Chọn phòng ban để xem nhân viên.'}
            </div>
          )}
        </div>
      </CModalBody>

      <CModalFooter className="add-members-footer">
        <div className="selected-counter-text">
          Đã chọn {g.selectedList.length} người (cần ít nhất 2)
        </div>
        <div className="add-members-footer-btns">
          <button
            type="button"
            className="flat-btn flat-btn-outline"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="button"
            className="flat-btn flat-btn-primary"
            disabled={!g.canSubmit || submitting}
            onClick={submit}
          >
            {submitting ? 'Đang tạo...' : 'Tạo nhóm'}
          </button>
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default CreateGroupModal
