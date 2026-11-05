// src/views/projects/components/ProjectCardMenu.tsx

import React from 'react'

import {
  CButton,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilTrash,
  cilSettings,
} from '@coreui/icons'
import { ProjectSummary } from 'src/types/ProjectType/project'



interface Props {
  project: ProjectSummary

  canUpdate?: boolean
  canDelete?: boolean

  onView: () => void
  onEdit: () => void
  onStatus: () => void
  onSettings: () => void
  onDelete: () => void
}

const ProjectCardMenu: React.FC<Props> = ({
  project,
  canUpdate = true,
  canDelete = true,

  onView,
  onEdit,
  onStatus,
  onSettings,
  onDelete,
}) => {
  return (
    <CDropdown>
      <CDropdownToggle
        color="light"
        size="sm"
      >
        ⋮
      </CDropdownToggle>

      <CDropdownMenu >
        <CDropdownItem
          onClick={onView}
        >
          Xem chi tiết
        </CDropdownItem>

      

        {canUpdate && (
          <CDropdownItem
            onClick={onStatus}
          >
            Trạng thái
          </CDropdownItem>
        )}



        <CDropdownDivider />
      </CDropdownMenu>
    </CDropdown>
  )
}

export default ProjectCardMenu