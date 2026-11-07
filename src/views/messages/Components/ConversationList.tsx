import React, { useEffect, useMemo, useState } from 'react'
import { CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilActionUndo,
  cilChatBubble,
  cilInbox,
  cilPeople,
  cilPlus,
  cilSearch,
  cilX,
} from '@coreui/icons'
import {
  ConversationListItem,
  ConversationScope,
  ConversationType,
} from 'src/services/chatService'
import ConversationAvatar from './ConversationAvatar'

interface Props {
  conversations: ConversationListItem[]
  activeId?: string
  loading: boolean
  query: string
  scope: ConversationScope
  onScopeChange: (scope: ConversationScope) => void
  onQueryChange: (value: string) => void
  onSelect: (item: ConversationListItem) => void
  onToggleNewChat: () => void
  onCreateGroup: () => void
  /** Lưu trữ (ẩn) hội thoại */
  onArchive: (item: ConversationListItem) => void
  /** Bỏ lưu trữ */
  onUnarchive: (item: ConversationListItem) => void
  /** Khôi phục nhóm đã giải tán */
  onRestoreGroup: (item: ConversationListItem) => void
  children?: React.ReactNode // NewChatBox
}

type Tab = 'all' | 'unread' | 'group' | 'archive'
type ArchiveView = 'archived' | 'dissolved'

const ConversationList: React.FC<Props> = ({
  conversations,
  activeId,
  loading,
  query,
  scope,
  onScopeChange,
  onQueryChange,
  onSelect,
  onToggleNewChat,
  onCreateGroup,
  onArchive,
  onUnarchive,
  onRestoreGroup,
  children,
}) => {
  const [tab, setTab] = useState<Tab>('all')
  const [archiveView, setArchiveView] = useState<ArchiveView>('archived')

  // Đồng bộ tab → scope gửi lên BE
  useEffect(() => {
    const next: ConversationScope = tab === 'archive' ? archiveView : 'active'
    if (next !== scope) onScopeChange(next)
  }, [tab, archiveView]) // eslint-disable-line react-hooks/exhaustive-deps

  const inArchive = tab === 'archive'

  const visible = useMemo(() => {
    if (inArchive) return conversations
    if (tab === 'unread') return conversations.filter((c) => c.unreadCount > 0)
    if (tab === 'group') return conversations.filter((c) => c.conversationType !== ConversationType.Direct)
    return conversations
  }, [conversations, tab, inArchive])

  const unreadTotal = useMemo(
    () => (inArchive ? 0 : conversations.filter((c) => c.unreadCount > 0).length),
    [conversations, inArchive],
  )

  const emptyText = (() => {
    if (inArchive) {
      return archiveView === 'archived'
        ? { title: 'Chưa có cuộc trò chuyện lưu trữ', hint: 'Cuộc trò chuyện bạn lưu trữ sẽ nằm ở đây. Có tin nhắn mới, chúng sẽ tự hiện lại.' }
        : { title: 'Không có nhóm đã giải tán', hint: 'Nhóm bạn là Người tạo và đã giải tán sẽ nằm ở đây để khôi phục.' }
    }
    if (tab === 'unread') return { title: 'Bạn đã đọc hết tin nhắn', hint: 'Không còn cuộc trò chuyện chưa đọc.' }
    if (tab === 'group') return { title: 'Chưa có nhóm nào', hint: 'Bấm nút nhóm phía trên để tạo nhóm trò chuyện.' }
    return { title: 'Chưa có cuộc trò chuyện', hint: 'Bấm dấu + để bắt đầu nhắn tin.' }
  })()

  return (
    <aside className="chat-conversations">
      <div className="chat-panel-heading">
        <h1>Đoạn chat</h1>
        <div className="chat-heading-actions">
          <button
            type="button"
            className="chat-icon-btn"
            title="Tạo nhóm"
            aria-label="Tạo nhóm"
            onClick={onCreateGroup}
          >
            <CIcon icon={cilPeople} />
          </button>
          <button
            type="button"
            className="chat-icon-btn"
            title="Nhắn tin riêng"
            aria-label="Nhắn tin riêng"
            onClick={onToggleNewChat}
          >
            <CIcon icon={cilPlus} />
          </button>
        </div>
      </div>

      <div className="chat-search">
        <CIcon icon={cilSearch} className="search-icon" />
        <input
          value={query}
          placeholder="Tìm kiếm cuộc trò chuyện"
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button type="button" className="chat-search-clear" aria-label="Xóa tìm kiếm" onClick={() => onQueryChange('')}>
            <CIcon icon={cilX} size="sm" />
          </button>
        )}
      </div>

      <div className="chat-tabs" role="tablist">
        {(
          [
            ['all', 'Tất cả'],
            ['unread', 'Chưa đọc'],
            ['group', 'Nhóm'],
            ['archive', 'Lưu trữ'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`chat-tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {key === 'archive' && <CIcon icon={cilInbox} size="sm" />}
            {label}
            {key === 'unread' && unreadTotal > 0 && <span className="chat-tab-count">{unreadTotal}</span>}
          </button>
        ))}
      </div>

      {inArchive && (
        <div className="chat-subtabs">
          <button
            type="button"
            className={archiveView === 'archived' ? 'active' : ''}
            onClick={() => setArchiveView('archived')}
          >
            Đã lưu trữ
          </button>
          <button
            type="button"
            className={archiveView === 'dissolved' ? 'active' : ''}
            onClick={() => setArchiveView('dissolved')}
          >
            Nhóm đã giải tán
          </button>
        </div>
      )}

      {children}

      <div className="conversation-scroll">
        {loading && !conversations.length ? (
          <div className="chat-loading">
            <CSpinner size="sm" /> Đang tải hội thoại...
          </div>
        ) : visible.length ? (
          visible.map((item) => {
            const unread = item.unreadCount > 0
            const isDirect = item.conversationType === ConversationType.Direct
            const preview = item.lastMessage?.isDeleted
              ? 'Tin nhắn đã bị thu hồi'
              : item.lastMessage?.content || 'Chưa có tin nhắn'

            return (
              <div key={item.id} className="conversation-row-wrap">
                <button
                  type="button"
                  className={`conversation-row ${activeId === item.id ? 'active' : ''} ${
                    unread ? 'unread' : ''
                  }`}
                  onClick={() => onSelect(item)}
                >
                  <ConversationAvatar
                    name={item.name || (isDirect ? 'TH' : 'DA')}
                    type={item.conversationType}
                    avatarUrl={item.avatarUrl}
                    size="md"
                    showBadge={!isDirect}
                  />
                  <span className="conversation-copy">
                    <strong>{item.name || (isDirect ? 'Cuộc trò chuyện riêng' : 'Nhóm chat')}</strong>
                    <small>{preview}</small>
                  </span>
                  {unread && (
                    <span className="unread-dot">
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </span>
                  )}
                </button>

                {!inArchive && (
                  <button
                    type="button"
                    className="conversation-hide-btn"
                    title="Lưu trữ cuộc trò chuyện"
                    aria-label="Lưu trữ cuộc trò chuyện"
                    onClick={() => onArchive(item)}
                  >
                    <CIcon icon={cilInbox} size="sm" />
                  </button>
                )}

                {inArchive && (
                  <button
                    type="button"
                    className="conversation-hide-btn visible"
                    title={archiveView === 'archived' ? 'Bỏ lưu trữ' : 'Khôi phục nhóm'}
                    aria-label={archiveView === 'archived' ? 'Bỏ lưu trữ' : 'Khôi phục nhóm'}
                    onClick={() =>
                      archiveView === 'archived' ? onUnarchive(item) : onRestoreGroup(item)
                    }
                  >
                    <CIcon icon={cilActionUndo} size="sm" />
                  </button>
                )}
              </div>
            )
          })
        ) : (
          <div className="chat-empty-list">
            <CIcon icon={inArchive ? cilInbox : cilChatBubble} size="xl" />
            <p>{emptyText.title}</p>
            <small>{emptyText.hint}</small>
          </div>
        )}
      </div>
    </aside>
  )
}

export default ConversationList
