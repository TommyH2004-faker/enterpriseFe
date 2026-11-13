import React, { useMemo } from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilUserPlus } from '@coreui/icons'
import {
  ConversationDetail,
  ConversationMemberRole,
  ConversationType,
} from 'src/services/chatService'
import { getGroupPermissions, normalizeRole } from '../utils/groupPermissions'
import { formatLastSeen } from '../utils/utils'
import ConversationAvatar from './ConversationAvatar'

interface Props {
  conversation: ConversationDetail
  currentUserId?: string
  isUserOnline?: (userId?: string | null) => boolean
  getUserLastSeen?: (userId?: string | null, fallback?: string | null) => string | null
  onOpenInfo?: () => void
  onOpenAddMembers?: () => void
}

const ChatHeader: React.FC<Props> = ({
  conversation,
  currentUserId,
  isUserOnline,
  getUserLastSeen,
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

  // Thông tin người nhận nếu là cuộc trò chuyện 1-1
  const otherMember = activeMembers.find(
    (m) => currentUserId && m.userId.toLowerCase() !== currentUserId.toLowerCase(),
  )
  const otherUserId = conversation.otherUserId || otherMember?.userId
  const isDirectOnline = otherUserId && isUserOnline ? isUserOnline(otherUserId) : false
  const fallbackLastLogin = conversation.otherUserLastLoginAt || otherMember?.lastLoginAt
  const lastSeenAt = otherUserId && getUserLastSeen ? getUserLastSeen(otherUserId, fallbackLastLogin) : fallbackLastLogin

  // Số lượng thành viên đang online trong nhóm
  const onlineGroupMembersCount = useMemo(() => {
    if (!isUserOnline || isDirect) return 0
    return activeMembers.filter((m) => isUserOnline(m.userId)).length
  }, [activeMembers, isUserOnline, isDirect])

  return (
    <header className="thread-header">
      <div className="thread-header-info">
        <ConversationAvatar
          name={conversation.name}
          type={conversation.conversationType}
          avatarUrl={conversation.avatarUrl}
          size="md"
          showBadge={!isDirect}
          isOnline={isDirect ? isDirectOnline : false}
        />

        <div className="thread-meta">
          <h2 className="thread-title">
            {conversation.name || (isDirect ? 'Cuộc trò chuyện riêng' : 'Nhóm chat')}
          </h2>

          {isDirect ? (
            <div className="thread-subtitle">
              {isDirectOnline ? (
                <span className="status-online">
                  <span className="status-dot-green" /> Đang hoạt động
                </span>
              ) : (
                <span className="status-offline">
                  <span className="status-dot-gray" /> {formatLastSeen(lastSeenAt)}
                </span>
              )}
            </div>
          ) : (
            <div className="thread-subtitle">
              <strong>Nhóm</strong> · {activeMembersCount} thành viên
              {onlineGroupMembersCount > 0 && (
                <span className="group-online-count"> ({onlineGroupMembersCount} đang hoạt động)</span>
              )}
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
