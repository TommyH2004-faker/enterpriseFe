import React from 'react'
import { CCard, CCardBody, CNav, CNavItem, CNavLink } from '@coreui/react'
import { ReportTabKey } from 'src/types/reports'

interface ReportsTabsProps {
  activeTab: ReportTabKey
  onTabChange: (tab: ReportTabKey) => void
}

const REPORT_TABS: Array<{ key: ReportTabKey; label: string }> = [
  { key: 'projects', label: 'Tiến độ dự án' },
  { key: 'employees', label: 'Hiệu suất nhân viên' },
  { key: 'timeline', label: 'Công việc theo thời gian' },
  { key: 'departments', label: 'Theo phòng ban' },
  { key: 'custom', label: 'Tùy chỉnh' },
]

const ReportsTabs: React.FC<ReportsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody className="pb-0">
        <CNav variant="tabs" className="border-bottom-0">
          {REPORT_TABS.map((tab) => (
            <CNavItem key={tab.key}>
              <CNavLink
                role="button"
                active={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
                style={{ cursor: 'pointer' }}
              >
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>
      </CCardBody>
    </CCard>
  )
}

export default ReportsTabs
