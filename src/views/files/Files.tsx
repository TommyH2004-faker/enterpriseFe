import React from 'react'
import FeaturePage from '../../components/architecture/FeaturePage'

const Files: React.FC = () => (
  <FeaturePage
    title="Tệp dự án"
    subtitle="Quản lý file, thư mục, quyền chia sẻ và lịch sử tải lên theo chuẩn ARCHITECTURE.md"
    actions={["+ Tải lên", "Tạo thư mục", "Chia sẻ"]}
    stats={[
      { label: 'Tổng file', value: '128', hint: '+12', color: 'primary' },
      { label: 'Dung lượng', value: '2.4 GB', hint: '80%', color: 'info' },
      { label: 'Thư mục', value: '18', hint: '6 mới', color: 'success' },
      { label: 'Đang chia sẻ', value: '34', hint: 'Public link', color: 'warning' },
    ]}
    sections={[
      {
        title: 'Cấu trúc thư mục',
        subtitle: 'Breadcrumb > folders > files',
        items: [
          { label: 'Dự án: Website e-Commerce', value: '12 thư mục' },
          { label: 'Dự án: Mobile App V2', value: '7 thư mục' },
          { label: 'Dự án: CRM Internal System', value: '5 thư mục' },
        ],
      },
      {
        title: 'Tải lên gần đây',
        subtitle: 'Preview, download, share hoặc xóa',
        items: [
          { label: 'proposal-v2.pdf', value: '2.4 MB', meta: 'Nguyễn Văn A • 2 giờ trước', badge: 'PDF', badgeColor: 'danger' },
          { label: 'wireframe-homepage.fig', value: '18.2 MB', meta: 'Trần Thị B • 5 giờ trước', badge: 'Design', badgeColor: 'info' },
          { label: 'api-specs.docx', value: '1.1 MB', meta: 'Lê Văn C • Hôm qua', badge: 'Docs', badgeColor: 'secondary' },
        ],
      },
    ]}
    table={{
      columns: ['Tên file', 'Kích thước', 'Người tải', 'Cập nhật', 'Hành động'],
      rows: [
        ['frontend-dashboard.fig', '9.8 MB', 'Nguyễn Văn A', 'Hôm nay', 'Preview / Download / Share'],
        ['release-notes-2026-07.pdf', '2.1 MB', 'Trần Thị B', 'Hôm qua', 'Preview / Download / Share'],
        ['budget-plan.xlsx', '830 KB', 'Phạm Thị D', '3 ngày trước', 'Preview / Download / Share'],
      ],
    }}
  />
)

export default Files