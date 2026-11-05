import React, { useMemo, useState } from 'react'
import { CButton, CFormTextarea } from '@coreui/react'
import { TaskCommentResponse } from 'src/types/TaskDetailType/comment'
import { authStorage } from 'src/services/authStorage'

interface CommentSectionProps {
  comments: TaskCommentResponse[]
  saving: boolean
  onCreate: (content: string, parentCommentId?: string) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
}

const getCurrentUserIds = (): Set<string> => {
  const token = authStorage.getAccessToken()
  if (!token) return new Set()

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return new Set(
      [payload.sub, payload.nameid, payload.userId, payload.user_id, payload.employeeId, payload.employee_id]
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
        .map((value) => value.toLowerCase()),
    )
  } catch {
    return new Set()
  }
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  saving,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [content, setContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const currentUserIds = useMemo(getCurrentUserIds, [])
  const canManage = (comment: TaskCommentResponse) =>
    currentUserIds.has(comment.employeeId.toLowerCase())

  const parentIdOf = (comment: TaskCommentResponse) => comment.parentCommentId || null
  const roots = comments.filter((comment) => !parentIdOf(comment))
  const repliesByParentId = useMemo(() => {
    const grouped = new Map<string, TaskCommentResponse[]>()

    comments.forEach((comment) => {
      const parentId = parentIdOf(comment)
      if (!parentId) return

      const key = parentId.toLowerCase()
      const replies = grouped.get(key) ?? []
      replies.push(comment)
      grouped.set(key, replies)
    })

    return grouped
  }, [comments])

  const renderComment = (comment: TaskCommentResponse, depth = 0, parent?: TaskCommentResponse) => (
    <div
      key={comment.id}
      className={`d-flex gap-3 ${depth > 0 ? 'mt-3' : ''}`}
      style={depth > 0 ? { marginLeft: `${Math.min(depth, 4) * 24}px` } : undefined}
    >
      <div
        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
        style={{ width: 36, height: 36, flexShrink: 0 }}
      >
        {comment.employeeName?.trim().charAt(0).toUpperCase() || '?'}
      </div>

      <div className="flex-grow-1 min-w-0">
        <div className="d-flex gap-2 align-items-baseline mb-1">
          <span className="fw-bold fs-6">{comment.employeeName}</span>
          <span className="small text-body-secondary">
            {new Date(comment.createdAt).toLocaleString('vi-VN')}
            {comment.isEdited && ' (đã sửa)'}
          </span>
        </div>

        {depth > 0 && parent && (
          <div className="border-start border-3 border-primary-subtle bg-light-subtle rounded-end px-3 py-2 mb-2 small">
            <div className="fw-semibold text-body-secondary">
              Đang trả lời {parent.employeeName || 'bình luận'}
            </div>
            <div className="text-body-secondary text-truncate">{parent.content}</div>
          </div>
        )}

        {editingId === comment.id ? (
          <div className="mt-2">
            <CFormTextarea rows={2} value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
            <div className="d-flex gap-2 mt-2">
              <CButton
                size="sm"
                color="primary"
                disabled={saving || !editingContent.trim()}
                onClick={() => {
                  onUpdate(comment.id, editingContent.trim())
                  setEditingId(null)
                }}
              >
                Lưu
              </CButton>
              <CButton size="sm" color="secondary" variant="ghost" onClick={() => setEditingId(null)}>
                Hủy
              </CButton>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3 bg-light rounded-3 text-body" style={{ whiteSpace: 'pre-wrap' }}>
              {comment.content}
            </div>
            <div className="d-flex gap-3 mt-1">
              {!canManage(comment) && (
                <button
                  className="btn btn-link btn-sm p-0 text-decoration-none text-body-secondary"
                  onClick={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                    setReplyContent('')
                  }}
                >
                  Trả lời
                </button>
              )}
              {canManage(comment) && (
                <>
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
                </>
              )}
            </div>
            {replyingTo === comment.id && (
              <div className="mt-2">
                <CFormTextarea
                  rows={2}
                  placeholder="Trả lời bình luận..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <CButton
                  size="sm"
                  color="primary"
                  className="mt-2"
                  disabled={saving || !replyContent.trim()}
                  onClick={() => {
                    onCreate(replyContent.trim(), comment.id)
                    setReplyContent('')
                    setReplyingTo(null)
                  }}
                >
                  Gửi trả lời
                </CButton>
              </div>
            )}
            {(repliesByParentId.get(comment.id.toLowerCase()) ?? []).length > 0 && (
              <div className="border-start border-2 border-light-subtle ps-3">
                {(repliesByParentId.get(comment.id.toLowerCase()) ?? []).map((reply) =>
                  renderComment(reply, depth + 1, comment),
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <section>
      <h6 className="fw-bold mb-3">Bình luận</h6>
      <div className="d-flex gap-3 mb-4">
        <div
          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 36, height: 36, flexShrink: 0 }}
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
            <CButton
              size="sm"
              color="primary"
              className="mt-2"
              disabled={saving}
              onClick={() => {
                onCreate(content.trim())
                setContent('')
              }}
            >
              Lưu bình luận
            </CButton>
          )}
        </div>
      </div>

      <div
        className="d-flex flex-column gap-4 pe-2"
        style={{ maxHeight: 420, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {roots.map((comment) => renderComment(comment))}
        {comments.length === 0 && <span className="small text-muted">Chưa có bình luận.</span>}
      </div>
    </section>
  )
}
