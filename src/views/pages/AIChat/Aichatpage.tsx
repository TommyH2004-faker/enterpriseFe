import { useCallback, useRef, useState } from 'react'
import './components/Aichatwidget.css'
import { usePersistentState } from './hooks/Usepersistentstate'
import { aiChatConfig } from 'src/api/Aichat.config'

import { useAIChat } from './hooks/Useaichat '
import ChatPanel from './components/Chatpanel'
import ChatLauncher from './components/Chatlauncher'
import { ChatView } from 'src/types/Aichat'

/**
 * Widget AI Chat nổi ở góc phải dưới màn hình.
 * Gắn MỘT LẦN trong layout chính (sau khi đăng nhập) để giữ nguyên khi chuyển trang.
 * Khung chat đóng thì state, hội thoại và câu hỏi đang xử lý vẫn được giữ.
 */
export default function AIChatPage() {
  const [open, setOpen] = usePersistentState<boolean>(aiChatConfig.storageKeys.open, false)
  // Chỉ gọi API sau khi người dùng mở widget lần đầu
  const [hasOpened, setHasOpened] = useState(open)
  const [unread, setUnread] = useState(false)
  const [view, setView] = useState<ChatView>('chat')

  const openRef = useRef(open)
  openRef.current = open

  const chat = useAIChat({
    enabled: hasOpened,
    onAnswer: () => {
      if (!openRef.current) setUnread(true)
    },
  })

  const close = useCallback(() => setOpen(false), [setOpen])

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    setHasOpened(true)
    setUnread(false)
  }

  // Trên màn hình nhỏ, khung chat phủ toàn màn hình nên cần đóng khi chuyển sang trang nguồn
  const handleNavigateSource = () => {
    if (window.matchMedia('(max-width: 575.98px)').matches) close()
  }

  return (
    <>
      {hasOpened && (
        <ChatPanel
          chat={chat}
          open={open}
          view={view}
          onViewChange={setView}
          onClose={close}
          onNavigateSource={handleNavigateSource}
        />
      )}
      <ChatLauncher open={open} unread={unread} busy={chat.sending} onClick={toggle} />
    </>
  )
}