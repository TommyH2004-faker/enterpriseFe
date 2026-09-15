import React from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBriefcase,
  cilCheckCircle,
  cilPeople,
  cilXCircle,
} from '@coreui/icons'
import { PositionStats } from '../hooks/usePositionStatistics'
import { POSITION_MESSAGES } from '../contants/positionConstants'


interface PositionStatisticsProps {
  stats: PositionStats
}

const PositionStatistics: React.FC<PositionStatisticsProps> = ({ stats }) => {
  return (
    <CRow className="g-3 mb-4">
      {/* Total */}
      <CCol xs={12} sm={6} xl={3}>
        <CCard className="border-0 shadow-sm h-100">
          <CCardBody className="p-4">
            <div className="role-stat-icon role-stat-primary">
              <CIcon icon={cilBriefcase} />
            </div>
            <div className="role-stat-value">
              {stats.totalPositions}
            </div>
            <div className="text-muted small">
              {POSITION_MESSAGES.STAT_TOTAL}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Active */}
      <CCol xs={12} sm={6} xl={3}>
        <CCard className="border-0 shadow-sm h-100">
          <CCardBody className="p-4">
            <div className="role-stat-icon role-stat-success">
              <CIcon icon={cilCheckCircle} />
            </div>
            <div className="role-stat-value">
              {stats.activePositions}
            </div>
            <div className="text-muted small">
              {POSITION_MESSAGES.STAT_ACTIVE}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Inactive */}
      <CCol xs={12} sm={6} xl={3}>
        <CCard className="border-0 shadow-sm h-100">
          <CCardBody className="p-4">
            <div className="role-stat-icon role-stat-secondary">
              <CIcon icon={cilXCircle} />
            </div>
            <div className="role-stat-value">
              {stats.inactivePositions}
            </div>
            <div className="text-muted small">
              {POSITION_MESSAGES.STAT_INACTIVE}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Employees */}
      <CCol xs={12} sm={6} xl={3}>
        <CCard className="border-0 shadow-sm h-100">
          <CCardBody className="p-4">
            <div className="role-stat-icon role-stat-info">
              <CIcon icon={cilPeople} />
            </div>
            <div className="role-stat-value">
              {stats.totalEmployees}
            </div>
            <div className="text-muted small">
              {POSITION_MESSAGES.STAT_EMPLOYEES}
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PositionStatistics