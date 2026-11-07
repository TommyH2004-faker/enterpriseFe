export type ReportTabKey =
  | 'projects'
  | 'employees'
  | 'timeline'
  | 'departments'
  | 'custom'

export type CustomReportGroupBy =
  | 'project'
  | 'department'
  | 'employee'
  | 'priority'
  | 'status'

export type CustomReportDisplayMode = 'both' | 'table' | 'chart'

export interface ReportFilterParams {
  fromDate?: string
  toDate?: string
  departmentId?: string
  projectId?: string
  employeeId?: string
}

export interface ReportOptionItemDto {
  id: string
  code: string
  name: string
}

export interface ReportProjectOptionDto {
  id: string
  code: string
  name: string
  departmentId: string
}

export interface ReportEmployeeOptionDto {
  id: string
  userId: string
  employeeCode: string
  fullName: string
  departmentId: string
  departmentName: string
}

export interface ReportFilterOptionsDto {
  departments: ReportOptionItemDto[]
  projects: ReportProjectOptionDto[]
  employees: ReportEmployeeOptionDto[]
}

export interface ReportKpiSummaryDto {
  exportableReportsCount: number
  onTrackProjects: number
  atRiskProjects: number
  behindProjects: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  overallCompletionRate: number
}

export interface TasksOverTimePointDto {
  label: string
  periodKey: string
  createdCount: number
  completedCount: number
  overdueCount: number
}

export interface TasksOverTimeReportDto {
  points: TasksOverTimePointDto[]
  rangeLabel: string
  sourceLabel: string
  generatedAt: string
}

export interface ProjectProgressReportItemDto {
  projectId: string
  projectCode: string
  projectName: string
  departmentId: string
  departmentName: string
  managerName: string
  projectStatus: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  progress: number
  healthStatus: string
  statusColor: string
  startDate: string
  endDate?: string | null
}

export interface EmployeePerformanceReportItemDto {
  employeeId: string
  userId: string
  employeeCode: string
  fullName: string
  departmentId: string
  departmentName: string
  totalAssignedTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  evaluation: string
  badgeColor: string
}

export interface DepartmentPerformanceReportItemDto {
  departmentId: string
  departmentCode: string
  departmentName: string
  activeEmployeesCount: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  badgeColor: string
}

export interface CustomReportRowDto {
  key: string
  name: string
  subtitle: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  statusLabel: string
  statusColor: string
}

export interface ReportOverviewDto {
  kpiSummary: ReportKpiSummaryDto
  tasksOverTime: TasksOverTimeReportDto
  projectProgress: ProjectProgressReportItemDto[]
  employeePerformance: EmployeePerformanceReportItemDto[]
  departmentPerformance: DepartmentPerformanceReportItemDto[]
  filterOptions: ReportFilterOptionsDto
  generatedAt: string
}
