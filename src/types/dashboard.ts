export interface DashboardTaskStatusDto {
  status: string
  count: number
}

export interface DashboardTaskPriorityDto {
  priority: string
  count: number
}

export interface DashboardSummaryDto {
  totalDepartments: number
  totalEmployees: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  tasksDueToday: number
  tasksByStatus: DashboardTaskStatusDto[]
  tasksByPriority: DashboardTaskPriorityDto[]
}