import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import { CSpinner } from '@coreui/react'
import { Conversation } from 'src/types/Aichat'
import { formatSidebarTime } from './chatformat'





interface Props {
  conversations: Conversation[]
  activeId: string | null
  loading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function ChatConversationList({
  conversations,
  activeId,
  loading,
  onSelect,
  onDelete,
}: Props) {
  const handleDelete = (c: Conversation) => {
    if (window.confirm(`Xóa hội thoại "${c.title}"? Thao tác này không hoàn tác được.`)) {
      onDelete(c.id)
    }
  }

  if (loading) {
    return (
      <div className="aicw-state">
        <CSpinner size="sm" /> <span className="ms-2">Đang tải…</span>
      </div>
    )
  }

  if (conversations.length === 0) {
    return <div className="aicw-state">Chưa có hội thoại nào. Hãy đặt câu hỏi đầu tiên.</div>
  }

  return (
    <ul className="aicw-history">
      {conversations.map((c) => (
        <li key={c.id} className={`aicw-history__item${c.id === activeId ? ' is-active' : ''}`}>
          <button
            type="button"
            className="aicw-history__select"
            onClick={() => onSelect(c.id)}
            aria-current={c.id === activeId ? 'true' : undefined}
          >
            <span className="aicw-history__title">{c.title}</span>
            <span className="aicw-history__time">
              {formatSidebarTime(c.lastMessageAt ?? c.createdAt)}
            </span>
          </button>
          <button
            type="button"
            className="aicw-iconbtn aicw-history__delete"
            onClick={() => handleDelete(c)}
            aria-label={`Xóa hội thoại ${c.title}`}
          >
            <CIcon icon={cilTrash} size="sm" />
          </button>
        </li>
      ))}
    </ul>
  )
}