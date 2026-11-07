import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilHistory, cilPlus, cilX } from '@coreui/icons'
import { ChatView } from 'src/types/Aichat'


interface Props {
  title: string
  view: ChatView
  onToggleHistory: () => void
  onNewChat: () => void
  onClose: () => void
}

export default function ChatHeader({ title, view, onToggleHistory, onNewChat, onClose }: Props) {
  const inHistory = view === 'history'
  return (
    <header className="aicw-header">
      <button
        type="button"
        className="aicw-iconbtn"
        onClick={onToggleHistory}
        aria-label={inHistory ? 'Quay lại hội thoại' : 'Xem lịch sử hội thoại'}
        title={inHistory ? 'Quay lại hội thoại' : 'Lịch sử hội thoại'}
      >
        <CIcon icon={inHistory ? cilArrowLeft : cilHistory} />
      </button>
      <div className="aicw-header__title" title={title}>
        {title}
      </div>
      <button
        type="button"
        className="aicw-iconbtn"
        onClick={onNewChat}
        aria-label="Hội thoại mới"
        title="Hội thoại mới"
      >
        <CIcon icon={cilPlus} />
      </button>
      <button type="button" className="aicw-iconbtn" onClick={onClose} aria-label="Đóng" title="Đóng">
        <CIcon icon={cilX} />
      </button>
    </header>
  )
}