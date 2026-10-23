import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilList, cilLockLocked, cilPencil, cilPeople, cilPlus, cilX } from '@coreui/icons'
import { humanize } from '../utils/logHelpers'


interface Style {
  icon: string | string[]
  color: string
}

/** Enum ActivityType có thể nhiều giá trị -> chọn icon/màu theo từ khoá trong tên. */
function getStyle(type: string): Style {
  if (/^(create|add)/i.test(type)) return { icon: cilPlus, color: 'success' }
  if (/(assign|join|member)/i.test(type)) return { icon: cilPeople, color: 'info' }
  if (/(complete|done|finish)/i.test(type)) return { icon: cilCheckCircle, color: 'warning' }
  if (/(delete|remove)/i.test(type)) return { icon: cilX, color: 'danger' }
  if (/(update|change|edit|comment)/i.test(type)) return { icon: cilPencil, color: 'primary' }
  if (/login/i.test(type)) return { icon: cilLockLocked, color: 'info' }
  return { icon: cilList, color: 'secondary' }
}

export default function ActivityTypeCell({ type }: { type: string }) {
  const { icon, color } = getStyle(type)
  return (
    <div className="d-flex align-items-center gap-2">
      <span
        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color} text-white flex-shrink-0`}
        style={{ width: 32, height: 32 }}
      >
        <CIcon icon={icon} size="sm" />
      </span>
      <span className={`fw-medium text-${color}`}>{humanize(type)}</span>
    </div>
  )
}
