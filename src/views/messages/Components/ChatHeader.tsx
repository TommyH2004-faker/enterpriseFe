import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilUserPlus } from '@coreui/icons'
import {
  ConversationDetail,
  ConversationMemberRole,
  ConversationType,
} from 'src/services/chatService'
import { getGroupPermissions, normalizeRole } from '../utils/groupPermissions'
import ConversationAvatar from './ConversationAvatar'

interface Props {
  conversation: ConversationDetail
  currentUserId?: string
  onOpenInfo?: () => void
  onOpenAddMembers?: () => void
}

const ChatHeader: React.FC<Props> = ({
  conversation,
  currentUserId,
  onOpenInfo,
  onOpenAddMembers,
}) => {
  const isDirect = conversation.conversationType === ConversationType.Direct
  const activeMembers = (conversation.members ?? []).filter((m) => m.isActive)
  const activeMembersCount = activeMembers.length || conversation.memberCount || 0

  const me = activeMembers.find(
    (m) => currentUserId && m.userId.toLowerCase() === currentUserId.toLowerCase(),
  )
  const myRole = normalizeRole(me?.role ?? ConversationMemberRole.Member)
  const perm = getGroupPermissions(conversation.conversationType, myRole)

  return (
    <header className="thread-header">
      <div className="thread-header-info">
        <ConversationAvatar
          name={conversation.name}
          type={conversation.conversationType}
          avatarUrl={conversation.avatarUrl}
          size="md"
          showBadge={!isDirect}
        />

        <div className="thread-meta">
          <h2 className="thread-title">
            {conversation.name || (isDirect ? 'Cuộc trò chuyện riêng' : 'Nhóm chat')}
          </h2>

          {isDirect ? (
            <div className="thread-subtitle">Chat riêng</div>
          ) : (
            <div className="thread-subtitle">
              <strong>Nhóm</strong> · {activeMembersCount} thành viên
            </div>
          )}
        </div>
      </div>

      {!isDirect && (
        <div className="thread-header-actions">
          {perm.canAddMembers && !conversation.isArchived && onOpenAddMembers && (
            <button
              type="button"
              className="thread-action-btn"
              title="Thêm thành viên"
              aria-label="Thêm thành viên"
              onClick={onOpenAddMembers}
            >
              <CIcon icon={cilUserPlus} />
              <span>Thêm thành viên</span>
            </button>
          )}

          {onOpenInfo && (
            <button
              type="button"
              className="thread-info-btn"
              title="Thông tin nhóm"
              aria-label="Thông tin nhóm"
              onClick={onOpenInfo}
            >
              <CIcon icon={cilInfo} />
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default ChatHeader
