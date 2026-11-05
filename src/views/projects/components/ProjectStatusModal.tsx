// src/views/projects/components/ProjectStatusModal.tsx

import React from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMediaPlay,
  cilMediaPause,
  cilCheckCircle,
  cilBan,
  cilReload,
} from '@coreui/icons'
import { ProjectStatus } from 'src/types/ProjectType/project'

interface StatusAction {
  label: string
  description: string
  icon: any
  color: string
  badgeColor: string
  handler: () => void
}

interface Props {
  visible: boolean
  projectName: string
  projectCode: string
  currentStatus: ProjectStatus
  progress?: number
  loading?: boolean
  onClose: () => void
  onStart: () => void
  onHold: () => void
  onResume: () => void
  onComplete: () => void
  onCancel: () => void
  onReopen: () => void
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  Planning: { label: 'Đang lên kế hoạch', color: 'info' },
  Active: { label: 'Đang hoạt động', color: 'success' },
  OnHold: { label: 'Tạm dừng', color: 'warning' },
  Completed: { label: 'Hoàn thành', color: 'primary' },
  Cancelled: { label: 'Đã hủy', color: 'danger' },
}

const ProjectStatusModal: React.FC<Props> = ({
  visible,
  projectName,
  projectCode,
  currentStatus,
  progress = 0,
  loading = false,
  onClose,
  onStart,
  onHold,
  onResume,
  onComplete,
  onCancel,
  onReopen,
}) => {
  const statusInfo = STATUS_LABEL[currentStatus] ?? { label: currentStatus, color: 'secondary' }

  const actions: StatusAction[] = []

  if (currentStatus === 'Planning') {
    actions.push({
      label: 'Bắt đầu dự án',
      description: 'Chuyển dự án sang trạng thái Đang hoạt động',
      icon: cilMediaPlay,
      color: 'success',
      badgeColor: 'success',
      handler: onStart,
    })
  }

  if (currentStatus === 'Active') {
    actions.push({
      label: 'Tạm dừng',
      description: 'Tạm dừng dự án để chờ xử lý tiếp.',
      icon: cilMediaPause,
      color: 'warning',
      badgeColor: 'warning',
      handler: onHold,
    })
    if (progress >= 100) {
      actions.push({
        label: 'Hoàn thành',
        description: 'Đánh dấu dự án đã hoàn thành thành công',
        icon: cilCheckCircle,
        color: 'primary',
        badgeColor: 'primary',
        handler: onComplete,
      })
    }

    actions.push({
      label: 'Hủy dự án',
      description: 'Hủy bỏ dự án này vĩnh viễn',
      icon: cilBan,
      color: 'danger',
      badgeColor: 'danger',
      handler: onCancel,
    })
  }

  if (currentStatus === 'Cancelled') {
    actions.push({
      label: 'Kích hoạt lại',
      description: 'Đưa dự án đã hủy về trạng thái đang hoạt động',
      icon: cilReload,
      color: 'success',
      badgeColor: 'success',
      handler: onReopen,
    })
  }

  if (currentStatus === 'OnHold') {
    actions.push({
      label: 'Kích hoạt lại',
      description: 'Đưa dự án tạm dừng trở lại trạng thái đang hoạt động',
      icon: cilReload,
      color: 'success',
      badgeColor: 'success',
      handler: onResume,
    })
  }

  const handleAction = (handler: () => void) => {
    handler()
  }

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" size="lg">
      <CModalHeader>
        <CModalTitle>
          <div className="d-flex align-items-center gap-2">
            Thay đổi trạng thái dự án
          </div>
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {/* Project info */}
        <div className="p-3 mb-4 rounded" style={{ background: 'var(--cui-body-bg, #f8f9fa)', border: '1px solid var(--cui-border-color, #dee2e6)' }}>
          <div className="fw-semibold">{projectName}</div>
          <div className="small text-body-secondary mb-2">Mã dự án: {projectCode}</div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-body-secondary">Trạng thái hiện tại:</span>
            <CBadge color={statusInfo.color} className="px-2 py-1">
              {statusInfo.label}
            </CBadge>
          </div>
        </div>

        {/* Available actions */}
        {actions.length === 0 ? (
          <div className="text-center text-body-secondary py-3">
            <div className="mb-1">Không có hành động nào khả dụng</div>
            <div className="small">Dự án ở trạng thái không thể thay đổi.</div>
          </div>
        ) : (
          <>
            <div className="small text-body-secondary fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.05em' }}>
              Chọn hành động
            </div>
                  <CListGroup>
          {actions.map((action) => (
            <CListGroupItem
              key={action.label}
              onClick={() => {
                if (!loading) {
                  handleAction(action.handler)
                }
              }}
              className="d-flex align-items-center gap-3 py-3 border-0"
              style={{
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  background: `var(--cui-${action.color}-bg, rgba(0,0,0,.05))`,
                }}
              >
                <CIcon
                  icon={action.icon}
                  className={`text-${action.color}`}
                />
              </div>

              <div className="text-start">
                <div className="fw-semibold">{action.label}</div>
                <div className="small text-body-secondary">
                  {action.description}
                </div>
              </div>
            </CListGroupItem>
          ))}
        </CListGroup>
          </>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton color="light" onClick={onClose} disabled={loading}>
          Đóng
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ProjectStatusModal
