import React from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow
} from '@coreui/react'
import { cilCheck } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { ROLE_MESSAGES } from '../contants/RoleConstants'


interface RoleStatisticsProps {
  totalRoles: number
}

/**
 * Component hiển thị card thống kê số lượng Role
 */
const RoleStatistics: React.FC<RoleStatisticsProps> = ({ totalRoles }) => {
  return (
    <CRow className="mb-4">
      <CCol md={6} xl={4}>
        <CCard className="border-0 shadow-sm h-100">
          <CCardBody>
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                <CIcon
                  icon={cilCheck}
                  size="xl"
                  className="text-primary"
                />
              </div>

              <div>
                <div className="text-body-secondary small">
                  {ROLE_MESSAGES.STAT_TOTAL_ROLES}
                </div>

                <div className="fs-4 fw-semibold">
                  {totalRoles}
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default RoleStatistics