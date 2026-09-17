// src/views/projects/components/ProjectEmptyState.tsx

import React from 'react'

import {
  CCard,
  CCardBody,
  CButton,
} from '@coreui/react'

interface Props {
  hasFilter?: boolean
  onCreate: () => void
}

const ProjectEmptyState: React.FC<Props> = ({
  hasFilter = false,
  onCreate,
}) => {
  return (
    <CCard>
      <CCardBody className="text-center py-5">
        <h5>
          {hasFilter
            ? 'Không tìm thấy dự án'
            : 'Chưa có dự án'}
        </h5>

        <p className="text-body-secondary">
          {hasFilter
            ? 'Hãy thử thay đổi điều kiện tìm kiếm hoặc bộ lọc.'
            : 'Bắt đầu bằng cách tạo dự án đầu tiên.'}
        </p>

        {!hasFilter && (
          <CButton
            color="primary"
            onClick={onCreate}
          >
            Tạo dự án
          </CButton>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProjectEmptyState