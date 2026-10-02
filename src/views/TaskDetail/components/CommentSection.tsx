import React, { useState } from 'react'
import { CButton, CFormTextarea } from '@coreui/react'
import { TaskCommentResponse } from 'src/types/TaskDetailType/comment'

interface CommentSectionProps {
  comments: TaskCommentResponse[]
  saving: boolean
  onCreate: (content: string) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  saving,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  return (
    <section>
      <h6 className="fw-bold mb-3">Bình luận</h6>

      {/* =========================
          CREATE COMMENT
      ========================== */}
      <div className="d-flex gap-3 mb-4">
        <div
          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
          }}
        >
          ME
        </div>

        <div className="flex-grow-1">
          <CFormTextarea
            rows={2}
            className="bg-light border-0"
            placeholder="Thêm bình luận..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {content.trim() && (
            <div className="mt-2">
              <CButton
                size="sm"
                color="primary"
                disabled={saving}
                onClick={() => {
                  onCreate(content.trim())
                  setContent('')
                }}
              >
                Lưu bình luận
              </CButton>
            </div>
          )}
        </div>
      </div>

      {/* =========================
          COMMENT LIST
      ========================== */}
      <div className="d-flex flex-column gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="d-flex gap-3">
            {/* Avatar */}
            <div
              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
              }}
            >
              {comment.employeeName
                ?.trim()
                .charAt(0)
                .toUpperCase() || '?'}
            </div>

            <div className="flex-grow-1">
              {/* =========================
                  NAME + TIME
              ========================== */}
              <div className="d-flex gap-2 align-items-baseline mb-1">
                <span className="fw-bold fs-6">
                  {comment.employeeName}
                </span>

                <span className="small text-body-secondary">
                  {new Date(comment.createdAt).toLocaleString('vi-VN')}

                  {comment.isEdited && ' (đã sửa)'}
                </span>
              </div>

              {/* =========================
                  EDIT COMMENT
              ========================== */}
              {editingId === comment.id ? (
                <div className="mt-2">
                  <CFormTextarea
                    rows={2}
                    value={editingContent}
                    onChange={(e) =>
                      setEditingContent(e.target.value)
                    }
                  />

                  <div className="d-flex gap-2 mt-2">
                    <CButton
                      size="sm"
                      color="primary"
                      disabled={
                        saving || !editingContent.trim()
                      }
                      onClick={() => {
                        onUpdate(
                          comment.id,
                          editingContent.trim(),
                        )

                        setEditingId(null)
                      }}
                    >
                      Lưu
                    </CButton>

                    <CButton
                      size="sm"
                      color="secondary"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null)
                        setEditingContent('')
                      }}
                    >
                      Hủy
                    </CButton>
                  </div>
                </div>
              ) : (
                <>
                  {/* =========================
                      CONTENT
                  ========================== */}
                  <div
                    className="p-3 bg-light rounded-3 text-body"
                    style={{
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {comment.content}
                  </div>

                  {/* =========================
                      ACTIONS
                  ========================== */}
                  <div className="d-flex gap-3 mt-1">
                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none text-body-secondary"
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditingContent(comment.content)
                      }}
                    >
                      Sửa
                    </button>

                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none text-body-secondary"
                      onClick={() => onDelete(comment.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}