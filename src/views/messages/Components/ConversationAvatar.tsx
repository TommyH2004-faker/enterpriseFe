import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilPeople } from '@coreui/icons'
import { ConversationType } from 'src/services/chatService'
import { initialOf } from '../utils/utils'

interface ConversationAvatarProps {
  name: string
  type?: ConversationType
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showBadge?: boolean
  isOnline?: boolean
  className?: string
}

const ConversationAvatar: React.FC<ConversationAvatarProps> = ({
  name,
  type = ConversationType.Direct,
  avatarUrl,
  size = 'md',
  showBadge = true,
  isOnline,
  className = '',
}) => {
  const isDirect = type === ConversationType.Direct
  const sizeClass = `avatar-${size}`
  const typeClass = isDirect ? 'avatar-direct' : 'avatar-group'

  return (
    <div className={`chat-avatar-wrapper ${sizeClass} ${typeClass} ${className}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="chat-avatar-img" />
      ) : (
        <div className="chat-avatar-inner">
          <span className="avatar-letter">{initialOf(name || (isDirect ? 'U' : 'N'))}</span>
        </div>
      )}

      {showBadge && !isDirect && (
        <span className="avatar-group-badge" title="Nhóm">
          <CIcon icon={cilPeople} />
        </span>
      )}

      {isOnline && (
        <span className="avatar-online-dot" title="Đang hoạt động" aria-label="Đang hoạt động" />
      )}
    </div>
  )
}

export default ConversationAvatar
