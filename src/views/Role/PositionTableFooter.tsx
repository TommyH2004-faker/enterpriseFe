import React from 'react'
import { POSITION_MESSAGES } from './contants/positionConstants'


interface PositionTableFooterProps {
  filteredCount: number
  totalCount: number
  show: boolean
}

const PositionTableFooter: React.FC<PositionTableFooterProps> = ({
  filteredCount,
  totalCount,
  show,
}) => {
  if (!show) return null

  return (
    <div className="px-4 py-3 border-top text-muted small">
      {POSITION_MESSAGES.SHOWING_RESULTS} {filteredCount}{' '}
      {POSITION_MESSAGES.OF} {totalCount}{' '}
      {POSITION_MESSAGES.POSITIONS}
    </div>
  )
}

export default PositionTableFooter