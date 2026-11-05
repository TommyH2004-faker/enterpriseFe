import React from 'react'

const DashboardHeader: React.FC = () => {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
      <div className="d-flex flex-column">
        <h1 className="h3 fw-bold mb-1">Dashboard</h1>
        <div className="text-muted">
          Tổng quan phòng ban, nhân sự, dự án và công việc trong hệ thống
        </div>
      </div>
      <div className="text-muted text-capitalize">{today}</div>
    </div>
  )
}

export default DashboardHeader