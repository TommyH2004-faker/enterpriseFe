import React from 'react'

interface UserTableFooterProps {
  filteredCount: number
  totalCount: number
  show?: boolean
}

const UserTableFooter: React.FC<UserTableFooterProps> = ({
  filteredCount,
  totalCount,
  show = true,
}) => {
  if (!show) return null

  return (
    <div className="px-3 py-2 border-top d-flex justify-content-between align-items-center">
      <small className="text-body-secondary">
        Hiển thị <strong>{filteredCount}</strong> người dùng
      </small>

      <small className="text-body-secondary">
        Tổng cộng <strong>{totalCount}</strong> người dùng
      </small>
    </div>
  )
}

export default UserTableFooter