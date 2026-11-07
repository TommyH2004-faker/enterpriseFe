import { CSpinner } from '@coreui/react'
import { useEffect, useRef } from 'react'
import { ChatMessage } from 'src/types/Aichat'
import ChatWelcome from './Chatwelcome'
import ChatMessageItem from './Chatmessageitem'
import ChatLoading from './Chatloading'


interface Props {
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
  onRetry: (messageId: string) => void
  onPickSuggestion: (question: string) => void
  onNavigateSource?: () => void
}

export default function ChatMessageList({
  messages,
  loading,
  sending,
  onRetry,
  onPickSuggestion,
  onNavigateSource,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, sending, loading])

  if (loading) {
    return (
      <div className="aicw-list aicw-list--center">
        <CSpinner size="sm" /> <span className="ms-2">Đang tải hội thoại…</span>
      </div>
    )
  }

  if (messages.length === 0 && !sending) {
    return (
      <div className="aicw-list">
        <ChatWelcome onPick={onPickSuggestion} disabled={sending} />
      </div>
    )
  }

  return (
    <div className="aicw-list" role="log" aria-live="polite">
      {messages.map((m) => (
        <ChatMessageItem key={m.id} message={m} onRetry={onRetry} onNavigateSource={onNavigateSource} />
      ))}
      {sending && <ChatLoading />}
      <div ref={endRef} />
    </div>
  )
}