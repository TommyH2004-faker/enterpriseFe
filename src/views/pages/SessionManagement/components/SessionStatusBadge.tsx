import { CBadge } from '@coreui/react'
import type { SessionManagementItem } from 'src/types/sessionManagement'
import { getSessionState, type SessionState } from './sessionUtils'

interface SessionStatusBadgeProps {
  session: SessionManagementItem
}

const CONFIG: Record<
  SessionState,
  { label: string; badge: string; dot: string }
> = {
  active: {
    label: 'Đang hoạt động',
    badge: 'bg-success-subtle text-success-emphasis',
    dot: 'bg-success',
  },
  expired: {
    label: 'Đã hết hạn',
    badge: 'bg-secondary-subtle text-body-secondary',
    dot: 'bg-secondary',
  },
  revoked: {
    label: 'Đã thu hồi',
    badge: 'bg-danger-subtle text-danger-emphasis',
    dot: 'bg-danger',
  },
}

const SessionStatusBadge = ({ session }: SessionStatusBadgeProps) => {
  const { label, badge, dot } = CONFIG[getSessionState(session)]

  return (
    <CBadge
      className={`${badge} d-inline-flex align-items-center gap-2 rounded-pill fw-medium px-2 py-1`}
    >
      <span
        className={`${dot} rounded-circle d-inline-block`}
        style={{ width: 6, height: 6 }}
      />
      {label}
    </CBadge>
  )
}

export default SessionStatusBadge