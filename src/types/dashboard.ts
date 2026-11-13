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

export interface DashboardWeeklyTrendDto {
  weekNumber: number
  weekLabel: string
  startDate: string
  endDate: string
  tasksCreated: number
  tasksCompleted: number
  tasksInProgress: number
  completionRate: number
}

export interface DashboardWeeklyTrendResponse {
  totalTasksCreated: number
  totalTasksCompleted: number
  averageCompletionRate: number
  weeks: DashboardWeeklyTrendDto[]
}