import React from 'react'
import {
  CButton
} from '@coreui/react'
import { cilPlus } from '@coreui/icons'
import { POSITION_MESSAGES } from './contants/positionConstants'
import CIcon from '@coreui/icons-react'


interface PositionPageHeaderProps {
  onAddClick: () => void
}

const PositionPageHeader: React.FC<PositionPageHeaderProps> = ({
  onAddClick,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h1 className="h3 fw-bold mb-1">
          {POSITION_MESSAGES.PAGE_TITLE}
        </h1>

        <div className="text-muted">
          {POSITION_MESSAGES.PAGE_DESC}
        </div>
      </div>

      <CButton
        color="primary"
        onClick={onAddClick}
      >
        <CIcon
          icon={cilPlus}
          className="me-2"
        />

        {POSITION_MESSAGES.BUTTON_CREATE}
      </CButton>
    </div>
  )
}

export default PositionPageHeader