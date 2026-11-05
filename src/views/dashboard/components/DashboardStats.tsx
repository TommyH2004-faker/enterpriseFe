import React from 'react'
import { CCol, CRow } from '@coreui/react'
import {
  cilBriefcase,
  cilBuilding,
  cilCalendar,
  cilCheckCircle,
  cilClock,
  cilPeople,
  cilTask,
  cilWarning,
} from '@coreui/icons'
import { DashboardSummaryDto } from 'src/types/dashboard'
import DashboardStatCard, { DashboardStatCardProps } from './DashboardStatCard'

interface Props {
  summary: DashboardSummaryDto
}

const DashboardStats: React.FC<Props> = ({ summary }) => {
  const stats: Array<DashboardStatCardProps & { key: string }> = [
    { key: 'departments', title: 'Tổng phòng ban', value: summary.totalDepartments, icon: cilBuilding, color: 'info' },
    { key: 'employees', title: 'Tổng nhân viên', value: summary.totalEmployees, icon: cilPeople, color: 'success' },
    { key: 'projects', title: 'Tổng dự án', value: summary.totalProjects, icon: cilBriefcase, color: 'warning' },
    { key: 'tasks', title: 'Tổng công việc', value: summary.totalTasks, icon: cilTask, color: 'primary' },
    { key: 'inProgress', title: 'Đang thực hiện', value: summary.inProgressTasks, icon: cilClock, color: 'info' },
    { key: 'completed', title: 'Đã hoàn thành', value: summary.completedTasks, icon: cilCheckCircle, color: 'success' },
    { key: 'overdue', title: 'Công việc quá hạn', value: summary.overdueTasks, icon: cilWarning, color: 'danger' },
    { key: 'dueToday', title: 'Đến hạn hôm nay', value: summary.tasksDueToday, icon: cilCalendar, color: 'warning' },
  ]

  return (
    <CRow className="g-3 mb-4">
      {stats.map(({ key, ...stat }) => (
        <CCol sm={6} xl={3} key={key}>
          <DashboardStatCard {...stat} />
        </CCol>
      ))}
    </CRow>
  )
}

export default DashboardStats