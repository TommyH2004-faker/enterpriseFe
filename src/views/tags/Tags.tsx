import React from 'react'
import FeaturePage from '../../components/architecture/FeaturePage'

const Tags: React.FC = () => (
  <FeaturePage
    title="Quản lý Thẻ"
    subtitle="Keywords, categories và cloud view cho bộ lọc dự án/công việc"
    actions={["+ Tạo thẻ mới", "Advanced search"]}
    stats={[
      { label: 'Tổng thẻ', value: '31', hint: '12 nhóm', color: 'primary' },
      { label: 'Đang dùng', value: '26', hint: 'Active', color: 'success' },
      { label: 'Ít dùng', value: '5', hint: 'Low usage', color: 'warning' },
      { label: 'Cloud score', value: '87%', hint: 'Balanced', color: 'info' },
    ]}
    sections={[
      {
        title: 'Tag cloud',
        subtitle: 'Kích thước theo mức độ sử dụng',
        items: [
          { label: 'urgent', value: '8 tasks', badge: 'Priority', badgeColor: 'danger' },
          { label: 'documentation', value: '6 tasks', badge: 'Docs', badgeColor: 'info' },
          { label: 'refactor', value: '5 tasks', badge: 'Technical', badgeColor: 'secondary' },
        ],
      },
      {
        title: 'Tìm kiếm & gợi ý',
        subtitle: 'Autocomplete khi gắn tag cho task',
        items: [
          { label: 'Filter theo tag', value: 'Searchable dropdown' },
          { label: 'Tạo mới', value: 'On-the-fly creation' },
          { label: 'Gán nhiều tag', value: 'Multi-select' },
        ],
      },
    ]}
  />
)

export default Tags