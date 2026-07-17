import React from 'react'
import FeaturePage from '../../components/architecture/FeaturePage'

const AuditLog: React.FC = () => (
  <FeaturePage
    title="Nhật ký kiểm toán"
    subtitle="Audit trail dành cho admin: create/update/delete/login, IP, resource, status"
    actions={["Export audit log", "Retention 90 days"]}
    stats={[
      { label: 'Success', value: '1,284', hint: '99.2%', color: 'success' },
      { label: 'Failed', value: '11', hint: 'Review', color: 'danger' },
      { label: 'Resources', value: '48', hint: 'User/Task/Project', color: 'primary' },
      { label: 'Archived', value: '90d', hint: 'Policy', color: 'warning' },
    ]}
    table={{
      columns: ['Thời gian', 'Người dùng', 'Hành động', 'Tài nguyên', 'Địa chỉ IP', 'Trạng thái'],
      rows: [
        ['17/07/2026 09:12:31', 'Nguyễn Văn A', 'Update', 'Task PROJ-123', '192.168.1.10', 'Success'],
        ['17/07/2026 08:45:10', 'Admin', 'Login', 'User session', '14.161.23.12', 'Success'],
        ['16/07/2026 22:01:44', 'Trần Thị B', 'Delete', 'Department Kỹ thuật', '192.168.1.14', 'Failed'],
      ],
    }}
  />
)

export default AuditLog