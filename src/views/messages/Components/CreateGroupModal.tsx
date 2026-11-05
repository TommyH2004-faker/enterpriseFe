import React, { useState } from 'react'
import {
  CButton,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
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
    <CModal visible={visible} onClose={onClose} alignment="center" backdrop="static">
      <CModalHeader>
        <CModalTitle>Tạo nhóm chat</CModalTitle>
      </CModalHeader>

      <CModalBody className="group-modal-body">
        <CFormInput
          value={g.name}
          placeholder="Tên nhóm"
          onChange={(e) => g.setName(e.target.value)}
        />

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
          <CFormInput
            autoFocus
            value={g.query}
            placeholder="Tìm nhân viên (ít nhất 2 ký tự)..."
            onChange={(e) => g.setQuery(e.target.value)}
          />
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
          <div className="group-chips">
            {g.selectedList.map((p) => (
              <button
                type="button"
                key={p.userId}
                className="group-chip"
                title="Bỏ chọn"
                onClick={() => g.toggle(p)}
              >
                {p.fullName} ✕
              </button>
            ))}
          </div>
        )}

        <ToastAlert message={g.error} />

        <div className="group-results">
          {g.loading ? (
            <div className="chat-loading">
              <CSpinner size="sm" /> Đang tải nhân viên...
            </div>
          ) : g.results.length ? (
            <>
              {g.mode === 'department' && (
                <label className="group-person group-person-all">
                  <input type="checkbox" checked={g.allChecked} onChange={g.toggleAll} />
                  <strong>Chọn tất cả ({g.results.length})</strong>
                </label>
              )}
              {g.results.map((p) => (
                <label key={p.userId} className="group-person">
                  <input
                    type="checkbox"
                    checked={!!g.selected[p.userId]}
                    onChange={() => g.toggle(p)}
                  />
                  <span className="chat-avatar small">{initialOf(p.fullName)}</span>
                  <span className="group-person-copy">
                    <strong>{p.fullName}</strong>
                    <small>{p.departmentName || p.username}</small>
                  </span>
                </label>
              ))}
            </>
          ) : (
            <div className="chat-empty-list">
              <small>
                {g.mode === 'members'
                  ? 'Nhập tên để tìm nhân viên.'
                  : 'Chọn phòng ban để xem nhân viên.'}
              </small>
            </div>
          )}
        </div>
      </CModalBody>

      <CModalFooter>
        <small className="me-auto text-muted">
          Đã chọn {g.selectedList.length} người (cần ít nhất 2)
        </small>
        <CButton color="light" onClick={onClose} disabled={submitting}>
          Huỷ
        </CButton>
        <CButton color="primary" disabled={!g.canSubmit || submitting} onClick={submit}>
          {submitting ? <CSpinner size="sm" /> : 'Tạo nhóm'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default CreateGroupModal