import React from 'react'
import FeaturePage from '../../components/architecture/FeaturePage'

const Activities: React.FC = () => (
  <FeaturePage
    title="Lịch sử hoạt động"
    subtitle="Project-level activity log, filter theo user/action/date range"
    actions={["Export CSV", "Export PDF"]}
    stats={[
      { label: 'Hôm nay', value: '42', hint: 'Live', color: 'primary' },
      { label: 'Tuần này', value: '218', hint: 'Trend up', color: 'success' },
      { label: 'Theo dõi', value: '15', hint: 'Members', color: 'info' },
      { label: 'Cần xem lại', value: '7', hint: 'Audit', color: 'warning' },
    ]}
    sections={[
      {
        title: 'Timeline gần đây',
        subtitle: 'Newest first',
        items: [
          { label: 'Nguyễn Văn A tạo task', value: '2 giờ trước', meta: 'Frontend Dashboard' },
          { label: 'Trần Thị B đổi trạng thái', value: '3 giờ trước', meta: 'API Integration' },
          { label: 'Lê Văn C thêm thành viên', value: 'Hôm nay', meta: 'Web App' },
        ],
      },
      {
        title: 'Bộ lọc',
        subtitle: 'User / action / project / date range',
        items: [
          { label: 'Tất cả', value: 'Default' },
          { label: 'Tasks', value: '24 records' },
          { label: 'Members', value: '11 records' },
        ],
      },
    ]}
  />
)

export default Activities