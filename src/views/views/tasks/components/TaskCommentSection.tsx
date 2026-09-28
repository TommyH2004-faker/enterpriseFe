import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CFormTextarea, CListGroup, CListGroupItem, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCommentSquare, cilSend, cilTrash } from '@coreui/icons'

import type { TaskComment } from 'src/types/comment'

interface Props {
  comments: TaskComment[]
  saving?: boolean
  onCreate: (content: string) => Promise<unknown> | void
  onDelete: (id: string) => Promise<unknown> | void
}

const TaskCommentSection: React.FC<Props> = ({ comments, saving = false, onCreate, onDelete }) => {
  const [content, setContent] = useState('')

  const submit = async () => {
    if (!content.trim()) return
    const result = await onCreate(content)
    if (result !== false) setContent('')
  }

  return (
    <CCard className="border-0 shadow-sm mb-3">
      <CCardBody>
        <h6 className="fw-semibold mb-3">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Bình luận
        </h6>

        <div className="d-flex gap-2 mb-3">
          <CFormTextarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            disabled={saving}
          />
          <CButton
            color="primary"
            className="align-self-end"
            onClick={() => void submit()}
            disabled={saving || !content.trim()}
          >
            {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSend} />}
          </CButton>
        </div>

        {comments.length === 0 ? (
          <div className="small text-body-secondary">Chưa có bình luận.</div>
        ) : (
          <CListGroup flush>
            {comments.map((comment) => (
              <CListGroupItem key={comment.id} className="px-0">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="fw-semibold small">
                      {comment.authorName || comment.employeeId || 'Nhân viên'}
                    </div>
                    <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>
                    <div className="small text-body-secondary mt-1">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString('vi-VN') : ''}
                      {comment.isEdited ? ' • Đã chỉnh sửa' : ''}
                    </div>
                  </div>
                  <CButton color="danger" variant="ghost" size="sm" onClick={() => void onDelete(comment.id)} disabled={saving}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </CListGroupItem>
            ))}
          </CListGroup>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TaskCommentSection
