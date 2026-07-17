import React from 'react'
import FeaturePage from '../../components/architecture/FeaturePage'

const Labels: React.FC = () => (
  <FeaturePage
    title="Quản lý Nhãn"
    subtitle="Tạo, sửa, xoá nhãn và theo dõi mức độ sử dụng trong task/project"
    actions={["+ Tạo nhãn mới", "Bulk actions"]}
    stats={[
      { label: 'Tổng nhãn', value: '24', hint: '8 màu', color: 'primary' },
      { label: 'Đang dùng', value: '18', hint: '12 tasks', color: 'success' },
      { label: 'Cần dọn', value: '6', hint: 'Unused', color: 'warning' },
      { label: 'Nhãn nóng', value: '3', hint: 'High usage', color: 'danger' },
    ]}
    sections={[
      {
        title: 'Danh sách nhãn',
        subtitle: 'Card hoặc table đều phải hỗ trợ theo mô tả',
        items: [
          { label: 'Frontend', value: '12 tasks', badge: 'Bug/Feature' },
          { label: 'Backend', value: '10 tasks', badge: 'API' },
          { label: 'Urgent', value: '8 tasks', badge: 'Priority', badgeColor: 'danger' },
        ],
      },
      {
        title: 'Thao tác nhanh',
        subtitle: 'Modal create/edit/delete, replace label',
        items: [
          { label: 'Tạo nhãn', value: 'Palette + hex input' },
          { label: 'Đổi màu', value: '8-12 preset colors' },
          { label: 'Xóa nhãn', value: 'Có xác nhận' },
        ],
      },
    ]}
  />
)

export default Labels