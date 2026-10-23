import { CAvatar } from '@coreui/react'
import { getInitials } from '../utils/logHelpers'


interface Props {
  name: string
  code?: string | null
  avatarUrl?: string | null
}

export default function ActorCell({ name, code, avatarUrl }: Props) {
  return (
    <div className="d-flex align-items-center gap-2">
      {avatarUrl ? (
        <CAvatar src={avatarUrl} size="md" />
      ) : (
        <CAvatar color="primary" textColor="white" size="md">
          {getInitials(name)}
        </CAvatar>
      )}
      <div className="lh-sm">
        <div className="fw-semibold">{name}</div>
        {code && <small className="text-body-secondary">{code}</small>}
      </div>
    </div>
  )
}
