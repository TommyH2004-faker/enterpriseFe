import React from 'react'
import FeaturePage from '../../components/architecture/FeaturePage'

const Tasks: React.FC = () => (
  <FeaturePage
    title="Quản lý Công việc"
    subtitle="Danh sách task, quick add, copy/move, bulk actions và task detail drawer"
    actions={["+ Thêm công việc", "Bulk actions"]}
    stats={[
      { label: 'Tổng task', value: '482', hint: 'All projects', color: 'primary' },
      { label: 'Đang làm', value: '126', hint: 'Active', color: 'info' },
      { label: 'Quá hạn', value: '19', hint: 'Needs attention', color: 'danger' },
      { label: 'Hoàn thành', value: '217', hint: 'Closed', color: 'success' },
    ]}
    table={{
      columns: ['Task', 'Project', 'Assignee', 'Priority', 'Due date', 'Status'],
      rows: [
        ['API Integration', 'Website e-Commerce', 'Nguyễn Văn A', 'Cao', '30/12/2026', 'Đang làm'],
        ['Dashboard Layout', 'Mobile App V2', 'Trần Thị B', 'Trung bình', '22/12/2026', 'Đang review'],
        ['Audit Log', 'CRM Internal System', 'Lê Văn C', 'Khẩn cấp', '18/12/2026', 'Chưa bắt đầu'],
      ],
    }}
  />
)

export default Tasks