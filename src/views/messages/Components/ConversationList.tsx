import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChatBubble, cilPeople, cilPlus, cilSearch } from '@coreui/icons'
import { ConversationListItem } from 'src/services/chatService'
import { initialOf } from '../utils/utils'


interface Props {
  conversations: ConversationListItem[]
  activeId?: string
  loading: boolean
  query: string
  onQueryChange: (value: string) => void
  onSelect: (item: ConversationListItem) => void
  onToggleNewChat: () => void
  onCreateGroup: () => void
  onDelete: (item: ConversationListItem) => void
  children?: React.ReactNode // NewChatBox
}

const ConversationList: React.FC<Props> = ({
  conversations,
  activeId,
  loading,
  query,
  onQueryChange,
  onSelect,
  onToggleNewChat,
  onCreateGroup,
  children,
}) => (
  <aside className="chat-conversations">
    <div className="chat-panel-heading">
      <h1>Đoạn chat</h1>
      <div className="chat-heading-actions">
        <CButton
          color="light"
          className="chat-icon-btn"
          title="Tạo nhóm"
          aria-label="Tạo nhóm"
          onClick={onCreateGroup}
        >
          <CIcon icon={cilPeople} />
        </CButton>
        <CButton
          color="light"
          className="chat-icon-btn"
          title="Nhắn tin riêng"
          aria-label="Nhắn tin riêng"
          onClick={onToggleNewChat}
        >
          <CIcon icon={cilPlus} />
        </CButton>
      </div>
    </div>

    <div className="chat-search">
      <CIcon icon={cilSearch} />
      <input
        value={query}
        placeholder="Tìm kiếm trên Messenger"
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>

    {children}

    <div className="conversation-scroll">
      {loading && !conversations.length ? (
        <div className="chat-loading">
          <CSpinner size="sm" /> Đang tải hội thoại...
        </div>
      ) : conversations.length ? (
        conversations.map((item) => {
          const unread = item.unreadCount > 0
          const preview = item.lastMessage?.isDeleted
            ? 'Tin nhắn đã bị thu hồi'
            : item.lastMessage?.content || 'Chưa có tin nhắn'

          return (
            <button
              key={item.id}
              className={`conversation-row ${activeId === item.id ? 'active' : ''} ${
                unread ? 'unread' : ''
              }`}
              onClick={() => onSelect(item)}
            >
              <span className="chat-avatar">{initialOf(item.name || 'D')}</span>
              <span className="conversation-copy">
                <strong>{item.name || 'Cuộc trò chuyện riêng'}</strong>
                <small>{preview}</small>
              </span>
              {unread && <span className="unread-dot">{item.unreadCount > 99 ? '99+' : item.unreadCount}</span>}
            </button>
          )
        })
      ) : (
        <div className="chat-empty-list">
          <CIcon icon={cilChatBubble} size="xl" />
          <p>Chưa có cuộc trò chuyện</p>
          <small>Bấm dấu + để bắt đầu nhắn tin.</small>
        </div>
      )}
    </div>
  </aside>
)

export default ConversationList