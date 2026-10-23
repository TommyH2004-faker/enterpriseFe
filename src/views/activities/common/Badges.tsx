import { CBadge } from '@coreui/react'
import { getActionColor, humanize } from '../utils/logHelpers'

const MODULE_COLOR: Record<string, string> = {
  HRM: 'info',
  ProjectManagement: 'success',
  Security: 'warning',
  Authentication: 'primary',
  System: 'secondary',
}

export function ActionBadge({ action }: { action: string }) {
  return (
    <CBadge color={getActionColor(action)} className="px-3 py-2 fw-medium">
      {humanize(action)}
    </CBadge>
  )
}

export function ModuleBadge({ module }: { module: string }) {
  return (
    <CBadge color={MODULE_COLOR[module] ?? 'secondary'} className="px-3 py-2 fw-medium">
      {humanize(module)}
    </CBadge>
  )
}
