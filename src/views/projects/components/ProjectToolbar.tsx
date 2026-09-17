// src/views/projects/components/ProjectToolbar.tsx

import React from 'react'

import {
  CButton,
  CCard,
  CCardBody,
  CFormInput,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import {
  cilGrid,
  cilList,
  cilPlus,
} from '@coreui/icons'

interface Props {
  search: string
  onSearchChange: (value: string) => void

  view: 'grid' | 'list'
  onViewChange: (
    view: 'grid' | 'list',
  ) => void

  canCreate?: boolean
  onCreate: () => void
}

const ProjectToolbar: React.FC<Props> = ({
  search,
  onSearchChange,
  view,
  onViewChange,
  canCreate = true,
  onCreate,
}) => {
  return (
    <CCard className="mb-3">
      <CCardBody>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div
            className="flex-grow-1"
            style={{ minWidth: 260 }}
          >
            <CFormInput
              value={search}
              onChange={(e) =>
                onSearchChange(
                  e.target.value,
                )
              }
              placeholder="Tìm kiếm dự án..."
            />
          </div>

          <div className="d-flex gap-1">
            <CButton
              color={
                view === 'grid'
                  ? 'primary'
                  : 'light'
              }
              onClick={() =>
                onViewChange('grid')
              }
            >
              <CIcon icon={cilGrid} />
            </CButton>

            <CButton
              color={
                view === 'list'
                  ? 'primary'
                  : 'light'
              }
              onClick={() =>
                onViewChange('list')
              }
            >
              <CIcon icon={cilList} />
            </CButton>
          </div>

          {canCreate && (
            <CButton
              color="primary"
              onClick={onCreate}
            >
              <CIcon
                icon={cilPlus}
                className="me-1"
              />
              Tạo dự án
            </CButton>
          )}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ProjectToolbar