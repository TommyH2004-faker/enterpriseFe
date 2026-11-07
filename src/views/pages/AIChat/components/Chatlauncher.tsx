import CIcon from '@coreui/icons-react'
import { cilCommentSquare, cilX } from '@coreui/icons'

interface Props {
  open: boolean
  /** Có câu trả lời mới trong lúc khung chat đang đóng */
  unread: boolean
  /** AI đang xử lý câu hỏi */
  busy: boolean
  onClick: () => void
}

export default function ChatLauncher({ open, unread, busy, onClick }: Props) {
  const label = open ? 'Đóng trợ lý AI' : unread ? 'Mở trợ lý AI, có câu trả lời mới' : 'Mở trợ lý AI'
  return (
    <button
      type="button"
      className={`aicw-launcher${busy && !open ? ' is-busy' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      title={label}
    >
      <CIcon icon={open ? cilX : cilCommentSquare} size="xl" />
      {unread && !open && <span className="aicw-launcher__dot" aria-hidden="true" />}
    </button>
  )
}