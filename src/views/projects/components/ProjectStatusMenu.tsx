// src/views/projects/components/ProjectStatusMenu.tsx

import React from 'react'

import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { ProjectStatus } from 'src/types/ProjectType/project'


interface Props {
  status: ProjectStatus
  progress?: number

  loading?: boolean

  onStart: () => void
  onHold: () => void
  onResume: () => void
  onComplete: () => void
  onCancel: () => void
  onReopen: () => void
}

const ProjectStatusMenu: React.FC<Props> = ({
  status,
  progress = 0,
  loading = false,

  onStart,
  onHold,
  onResume,
  onComplete,
  onCancel,
  onReopen,
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

            {progress >= 100 && (
              <CDropdownItem onClick={onComplete}>
                Hoàn thành
              </CDropdownItem>
            )}

            <CDropdownItem
              onClick={onCancel}
            >
              Hủy dự án
            </CDropdownItem>
          </>
        )}

        {status === 'Cancelled' && (
          <CDropdownItem onClick={onReopen}>
            Kích hoạt lại
          </CDropdownItem>
        )}

        {status === 'OnHold' && (
          <CDropdownItem onClick={onResume}>
            Kích hoạt lại
          </CDropdownItem>
        )}

      </CDropdownMenu>
    </CDropdown>
  )
}

export default ProjectStatusMenu