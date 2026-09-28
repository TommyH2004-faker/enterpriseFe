import React, { useEffect, useState } from 'react'
import { CButton, CCard, CCardBody, CFormTextarea, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAlignLeft, cilPencil, cilSave } from '@coreui/icons'

interface Props {
  description?: string | null
  saving?: boolean
  onSave: (description: string) => Promise<unknown> | void
}

const TaskDescriptionSection: React.FC<Props> = ({ description, saving = false, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(description || '')

  useEffect(() => setValue(description || ''), [description])

  const save = async () => {
    await onSave(value)
    setEditing(false)
  }

  return (
    <CCard className="border-0 shadow-sm mb-3">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-semibold">
            <CIcon icon={cilAlignLeft} className="me-2" />
            Mô tả
          </h6>
          {!editing && (
            <CButton color="light" size="sm" onClick={() => setEditing(true)}>
              <CIcon icon={cilPencil} className="me-1" />
              Chỉnh sửa
            </CButton>
          )}
        </div>

        {editing ? (
          <>
            <CFormTextarea
              rows={6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Nhập mô tả công việc..."
              disabled={saving}
            />
            <div className="d-flex justify-content-end gap-2 mt-2">
              <CButton color="light" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                Hủy
              </CButton>
              <CButton color="primary" size="sm" onClick={() => void save()} disabled={saving}>
                {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-1" />}
                {!saving && 'Lưu'}
              </CButton>
            </div>
          </>
        ) : (
          <div className="text-body-secondary" style={{ whiteSpace: 'pre-wrap' }}>
            {description?.trim() || 'Chưa có mô tả.'}
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TaskDescriptionSection
