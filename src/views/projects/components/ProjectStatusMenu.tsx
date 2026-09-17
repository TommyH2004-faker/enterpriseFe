// src/views/projects/components/ProjectStatusMenu.tsx

import React from 'react'

import {
  CButton,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { ProjectStatus } from 'src/types/ProjectType/project'


interface Props {
  status: ProjectStatus

  loading?: boolean

  onStart: () => void
  onHold: () => void
  onResume: () => void
  onComplete: () => void
  onCancel: () => void

  onActivate: () => void
  onDeactivate: () => void

  isActive?: boolean
}

const ProjectStatusMenu: React.FC<Props> = ({
  status,
  loading = false,

  onStart,
  onHold,
  onResume,
  onComplete,
  onCancel,

  onActivate,
  onDeactivate,

  isActive = true,
}) => {
  return (
    <CDropdown>
      <CDropdownToggle
        color="light"
        disabled={loading}
      >
        {status}
      </CDropdownToggle>

      <CDropdownMenu>
        {status === 'Planning' && (
          <CDropdownItem
            onClick={onStart}
          >
            Bắt đầu dự án
          </CDropdownItem>
        )}

        {status === 'Active' && (
          <>
            <CDropdownItem
              onClick={onHold}
            >
              Tạm dừng
            </CDropdownItem>

            <CDropdownItem
              onClick={onComplete}
            >
              Hoàn thành
            </CDropdownItem>

            <CDropdownItem
              onClick={onCancel}
            >
              Hủy dự án
            </CDropdownItem>
          </>
        )}

        {status === 'OnHold' && (
          <CDropdownItem
            onClick={onResume}
          >
            Tiếp tục dự án
          </CDropdownItem>
        )}

        {!isActive ? (
          <CDropdownItem
            onClick={onActivate}
          >
            Kích hoạt lại
          </CDropdownItem>
        ) : (
          <CDropdownItem
            onClick={onDeactivate}
          >
            Vô hiệu hóa
          </CDropdownItem>
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default ProjectStatusMenu