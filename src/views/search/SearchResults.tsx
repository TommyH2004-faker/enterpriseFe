import React from 'react'
import FeaturePage from '../../components/architecture/FeaturePage'

const SearchResults: React.FC = () => (
  <FeaturePage
    title="Kết quả tìm kiếm"
    subtitle="Global search cho công việc, dự án, nhân viên, phòng ban"
    actions={["Advanced search", "Save search"]}
    stats={[
      { label: 'Kết quả', value: '2,345', hint: 'All', color: 'primary' },
      { label: 'Tasks', value: '1,112', hint: 'Matches', color: 'success' },
      { label: 'Projects', value: '98', hint: 'Matches', color: 'info' },
      { label: 'People', value: '427', hint: 'Matches', color: 'warning' },
    ]}
    sections={[
      {
        title: 'Bộ lọc theo loại',
        subtitle: 'Tabs: Tất cả / Công việc / Dự án / Nhân viên / Phòng ban',
        items: [
          { label: 'Tasks', value: 'Checkbox filters' },
          { label: 'Projects', value: 'Manager + status' },
          { label: 'People', value: 'Department + role' },
        ],
      },
      {
        title: 'Không tìm thấy kết quả',
        subtitle: 'Suggestion state when query is empty or invalid',
        items: [
          { label: 'Kiểm tra chính tả', value: 'Search hints' },
          { label: 'Xoá filter', value: 'Reset state' },
          { label: 'Tìm nâng cao', value: 'Advanced modal' },
        ],
      },
    ]}
  />
)

export default SearchResults