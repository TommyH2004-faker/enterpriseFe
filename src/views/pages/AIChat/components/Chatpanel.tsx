import type { KeyboardEvent } from 'react'
import { AIChatController } from '../hooks/useAIChat'
import { ChatView } from 'src/types/Aichat'
import { aiChatConfig } from 'src/api/Aichat.config'
import ChatHeader from './Chatheader'
import ChatConversationList from './Chatconversationlist'
import ChatMessageList from './Chatmessagelist'
import ChatError from './Chaterror'
import ChatInput from './Chatinput'


interface Props {
  chat: AIChatController
  open: boolean
  view: ChatView
  onViewChange: (view: ChatView) => void
  onClose: () => void
  onNavigateSource?: () => void
}

export default function ChatPanel({ chat, open, view, onViewChange, onClose, onNavigateSource }: Props) {
  const inHistory = view === 'history'

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <section
      className={`aicw-panel${open ? ' is-open' : ''}`}
      role="dialog"
      aria-label={aiChatConfig.title}
      onKeyDown={handleKeyDown}
    >
      <ChatHeader
        title={inHistory ? 'Lịch sử hội thoại' : chat.activeTitle ?? aiChatConfig.title}
        view={view}
        onToggleHistory={() => onViewChange(inHistory ? 'chat' : 'history')}
        onNewChat={() => {
          chat.startNewChat()
          onViewChange('chat')
        }}
        onClose={onClose}
      />

      {inHistory ? (
        <div className="aicw-body">
          <ChatConversationList
            conversations={chat.conversations}
            activeId={chat.activeId}
            loading={chat.loadingList}
            onSelect={(id) => {
              chat.selectConversation(id)
              onViewChange('chat')
            }}
            onDelete={chat.deleteConversation}
          />
        </div>
      ) : (
        <>
          <ChatMessageList
            messages={chat.messages}
            loading={chat.loadingMessages}
            sending={chat.sending}
            onRetry={chat.retryMessage}
            onPickSuggestion={chat.sendMessage}
            onNavigateSource={onNavigateSource}
          />
          {chat.error && <ChatError message={chat.error} onDismiss={chat.dismissError} />}
          <ChatInput
            active={open}
            disabled={chat.sending || chat.loadingMessages}
            onSend={chat.sendMessage}
          />
        </>
      )}
    </section>
  )
}