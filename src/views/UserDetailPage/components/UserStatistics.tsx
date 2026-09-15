import React from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'

interface Props {
  stats: {
    total: number
    active: number
    pending: number
    inactive: number
    locked: number
  }
}

const UserStatistics = ({
  stats,
}: Props) => {
  const cards = [
    {
      title: 'Tổng người dùng',
      value: stats.total,
    },
    {
      title: 'Đang hoạt động',
      value: stats.active,
    },
    {
      title: 'Chờ kích hoạt',
      value: stats.pending,
    },
    {
      title: 'Không hoạt động',
      value: stats.inactive,
    },
    {
      title: 'Đang khóa',
      value: stats.locked,
    },
  ]

  return (
    <CRow className="mb-4">
      {cards.map((card) => (
        <CCol
          key={card.title}
          sm={6}
          lg={4}
          xl
          className="mb-3 mb-xl-0"
        >
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody>
              <div className="text-body-secondary small">
                {card.title}
              </div>

              <div className="fs-3 fw-semibold mt-1">
                {card.value}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

export default UserStatistics