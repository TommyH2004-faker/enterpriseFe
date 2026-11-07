import { ApiResponse, getErrorMessage } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'
import { departmentService } from 'src/services/departmentService'
import { employeeService } from 'src/services/employeeService'
import { projectService } from 'src/services/projectService'
import {
  CustomReportGroupBy,
  CustomReportRowDto,
  DepartmentPerformanceReportItemDto,
  EmployeePerformanceReportItemDto,
  ProjectProgressReportItemDto,
  ReportFilterParams,
  ReportOverviewDto,
  TasksOverTimeReportDto,
} from 'src/types/reports'

const BASE_URL = '/api/v1/reports'

function cleanParams(filters?: ReportFilterParams): Record<string, string> {
  if (!filters) return {}
  const params: Record<string, string> = {}
  if (filters.fromDate) params.fromDate = filters.fromDate
  if (filters.toDate) params.toDate = filters.toDate
  if (filters.departmentId) params.departmentId = filters.departmentId
  if (filters.projectId) params.projectId = filters.projectId
  if (filters.employeeId) params.employeeId = filters.employeeId
  return params
}

function escapeXml(value?: string | number | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Fallback tổng hợp từ các API hiện có (projects, departments, employees)
 * trong trường hợp Backend chưa kịp restart để nhận ReportsController mới.
 */
async function buildFallbackOverview(
  filters?: ReportFilterParams,
): Promise<ReportOverviewDto> {
  const [deptRes, projRes, empRes] = await Promise.allSettled([
    departmentService.getAllDepartments(1, 100),
    projectService.getProjects({
      page: 1,
      pageSize: 100,
      departmentId: filters?.departmentId || undefined,
    }),
    employeeService.getEmployees({
      departmentId: filters?.departmentId || undefined,
      includeInactive: false,
    }),
  ])

  const rawDepts =
    deptRes.status === 'fulfilled' ? (deptRes.value?.items ?? []) : []
  const rawProjects =
    projRes.status === 'fulfilled' ? (projRes.value?.items ?? []) : []
  const rawEmployees = empRes.status === 'fulfilled' ? (empRes.value ?? []) : []

  const filteredProjects = rawProjects.filter((p) => {
    if (filters?.projectId && p.id !== filters.projectId) return false
    if (filters?.departmentId && p.departmentId !== filters.departmentId)
      return false
    return true
  })

  // Lấy thống kê tiến độ và danh sách công việc cho từng dự án từ API hiện có
  const projectDetails = await Promise.all(
    filteredProjects.map(async (proj) => {
      const [progressRes, tasksRes] = await Promise.allSettled([
        projectService.getProgress(proj.id),
        projectService.getProjectTasks(proj.id),
      ])
      const progressData =
        progressRes.status === 'fulfilled' ? progressRes.value : null
      const tasksData =
        tasksRes.status === 'fulfilled' ? (tasksRes.value ?? []) : []
      return { proj, progressData, tasksData }
    }),
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const allTasks = projectDetails.flatMap((d) =>
    d.tasksData.map((t) => ({ ...t, projectId: d.proj.id, departmentId: d.proj.departmentId })),
  )

  const projectProgress: ProjectProgressReportItemDto[] = projectDetails.map(
    ({ proj, progressData, tasksData }) => {
      const totalTasks = progressData?.totalTasks ?? tasksData.length
      const completedTasks =
        progressData?.completedTasks ??
        tasksData.filter((t) => String(t.status).toLowerCase() === 'done' || Number(t.status) === 4).length
      const inProgressTasks =
        progressData?.inProgressTasks ??
        tasksData.filter((t) => String(t.status).toLowerCase() === 'inprogress' || Number(t.status) === 2).length
      const overdueTasks =
        progressData?.overdueTasks ??
        tasksData.filter((t) => {
          if (!t.dueDate) return false
          const due = new Date(t.dueDate)
          const isDone = String(t.status).toLowerCase() === 'done' || Number(t.status) === 4
          return !isDone && due < today
        }).length

      const progress =
        totalTasks > 0
          ? Math.round((completedTasks * 100) / totalTasks)
          : Math.round(progressData?.overallProgress ?? progressData?.progress ?? 0)

      let healthStatus = 'On track'
      let statusColor = progress >= 50 ? 'success' : 'info'

      if (overdueTasks > 0 && totalTasks > 0 && (overdueTasks * 100) / totalTasks >= 30) {
        healthStatus = 'Behind'
        statusColor = 'danger'
      } else if (overdueTasks > 0) {
        healthStatus = 'At risk'
        statusColor = 'warning'
      }

      return {
        projectId: proj.id,
        projectCode: proj.code || 'PRJ',
        projectName: proj.name,
        departmentId: proj.departmentId,
        departmentName: proj.departmentName || 'Chưa phân phòng ban',
        managerName: proj.managerName || 'Chưa gán',
        projectStatus: String(proj.status || 'Active'),
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        progress,
        healthStatus,
        statusColor,
        startDate: proj.startDate,
        endDate: proj.endDate,
      }
    },
  )

  const filteredEmps = rawEmployees.filter((e) => {
    if (filters?.employeeId && e.id !== filters.employeeId && e.userId !== filters.employeeId) {
      return false
    }
    return true
  })

  const employeePerformance: EmployeePerformanceReportItemDto[] = filteredEmps.map((emp) => {
    const empTasks = allTasks.filter((t: any) => {
      const assignees: any[] = t.assignees ?? t.assigneeIds ?? []
      return assignees.some(
        (a) =>
          a === emp.id ||
          a === emp.userId ||
          a?.id === emp.id ||
          a?.employeeId === emp.id ||
          a?.userId === emp.userId,
      )
    })

    const total = empTasks.length
    const completed = empTasks.filter(
      (t) => String(t.status).toLowerCase() === 'done' || Number(t.status) === 4,
    ).length
    const inProgress = empTasks.filter(
      (t) => String(t.status).toLowerCase() === 'inprogress' || Number(t.status) === 2,
    ).length
    const overdue = empTasks.filter((t) => {
      if (!t.dueDate) return false
      const isDone = String(t.status).toLowerCase() === 'done' || Number(t.status) === 4
      return !isDone && new Date(t.dueDate) < today
    }).length

    const completionRate = total > 0 ? Math.round((completed * 100) / total) : 0
    let evaluation = 'Chưa giao việc'
    let badgeColor = 'secondary'
    if (total > 0) {
      if (completionRate >= 90 && overdue === 0) {
        evaluation = 'Xuất sắc'
        badgeColor = 'success'
      } else if (completionRate >= 75) {
        evaluation = 'Tốt'
        badgeColor = 'success'
      } else if (completionRate >= 50) {
        evaluation = 'Khá'
        badgeColor = 'warning'
      } else {
        evaluation = 'Cần chú ý'
        badgeColor = 'danger'
      }
    }

    return {
      employeeId: emp.id,
      userId: emp.userId || emp.id,
      employeeCode: emp.employeeCode || 'NV',
      fullName: emp.fullName,
      departmentId: emp.departmentId,
      departmentName: emp.departmentName || 'Chưa phân phòng ban',
      totalAssignedTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      completionRate,
      evaluation,
      badgeColor,
    }
  })

  const departmentPerformance: DepartmentPerformanceReportItemDto[] = rawDepts
    .filter((d) => !filters?.departmentId || d.id === filters.departmentId)
    .map((dept) => {
      const deptProjects = projectProgress.filter((p) => p.departmentId === dept.id)
      const totalTasks = deptProjects.reduce((acc, p) => acc + p.totalTasks, 0)
      const completedTasks = deptProjects.reduce((acc, p) => acc + p.completedTasks, 0)
      const inProgressTasks = deptProjects.reduce((acc, p) => acc + p.inProgressTasks, 0)
      const overdueTasks = deptProjects.reduce((acc, p) => acc + p.overdueTasks, 0)
      const completionRate = totalTasks > 0 ? Math.round((completedTasks * 100) / totalTasks) : 0
      const activeEmployeesCount = rawEmployees.filter((e) => e.departmentId === dept.id).length

      return {
        departmentId: dept.id,
        departmentCode: dept.code,
        departmentName: dept.name,
        activeEmployeesCount,
        totalProjects: deptProjects.length,
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completionRate,
        badgeColor:
          completionRate >= 80
            ? 'success'
            : completionRate >= 60
              ? 'warning'
              : totalTasks > 0
                ? 'info'
                : 'secondary',
      }
    })

  // Build 7 months points
  const points = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const monthTasks = allTasks.filter((t: any) => {
      if (!t.createdAt) return false
      const c = new Date(t.createdAt)
      return c >= d && c < nextMonth
    })
    const completedInMonth = allTasks.filter((t: any) => {
      const isDone = String(t.status).toLowerCase() === 'done' || Number(t.status) === 4
      if (!isDone) return false
      const refDate = t.completedDate || t.updatedAt || t.createdAt
      if (!refDate) return false
      const c = new Date(refDate)
      return c >= d && c < nextMonth
    })
    points.push({
      label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
      periodKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      createdCount: monthTasks.length,
      completedCount: completedInMonth.length,
      overdueCount: 0,
    })
  }

  const totalTasksCount = projectProgress.reduce((s, p) => s + p.totalTasks, 0)
  const completedTasksCount = projectProgress.reduce((s, p) => s + p.completedTasks, 0)
  const inProgressTasksCount = projectProgress.reduce((s, p) => s + p.inProgressTasks, 0)
  const overdueTasksCount = projectProgress.reduce((s, p) => s + p.overdueTasks, 0)

  return {
    kpiSummary: {
      exportableReportsCount: 4,
      onTrackProjects: projectProgress.filter((p) => p.healthStatus === 'On track').length,
      atRiskProjects: projectProgress.filter((p) => p.healthStatus === 'At risk').length,
      behindProjects: projectProgress.filter((p) => p.healthStatus === 'Behind').length,
      totalProjects: projectProgress.length,
      totalTasks: totalTasksCount,
      completedTasks: completedTasksCount,
      inProgressTasks: inProgressTasksCount,
      overdueTasks: overdueTasksCount,
      overallCompletionRate:
        totalTasksCount > 0 ? Math.round((completedTasksCount * 100) / totalTasksCount) : 0,
    },
    tasksOverTime: {
      points,
      rangeLabel: '7 tháng gần đây',
      sourceLabel: 'Tasks + Projects',
      generatedAt: new Date().toISOString(),
    },
    projectProgress,
    employeePerformance,
    departmentPerformance,
    filterOptions: {
      departments: rawDepts.map((d) => ({ id: d.id, code: d.code, name: d.name })),
      projects: rawProjects.map((p) => ({
        id: p.id,
        code: p.code || '',
        name: p.name,
        departmentId: p.departmentId,
      })),
      employees: rawEmployees.map((e) => ({
        id: e.id,
        userId: e.userId || e.id,
        employeeCode: e.employeeCode || '',
        fullName: e.fullName,
        departmentId: e.departmentId,
        departmentName: e.departmentName || '',
      })),
    },
    generatedAt: new Date().toISOString(),
  }
}

export function buildClientCustomReportRows(
  overview: ReportOverviewDto,
  groupBy: CustomReportGroupBy,
): CustomReportRowDto[] {
  if (groupBy === 'department') {
    return overview.departmentPerformance.map((d) => ({
      key: d.departmentId,
      name: d.departmentName,
      subtitle: `${d.departmentCode} · ${d.activeEmployeesCount} nhân sự · ${d.totalProjects} dự án`,
      totalTasks: d.totalTasks,
      completedTasks: d.completedTasks,
      inProgressTasks: d.inProgressTasks,
      overdueTasks: d.overdueTasks,
      completionRate: d.completionRate,
      statusLabel:
        d.completionRate >= 80
          ? 'Hiệu quả cao'
          : d.completionRate >= 50
            ? 'Ổn định'
            : 'Cần cải thiện',
      statusColor: d.badgeColor,
    }))
  }

  if (groupBy === 'employee') {
    return overview.employeePerformance.map((e) => ({
      key: e.employeeId,
      name: e.fullName,
      subtitle: `${e.employeeCode} · ${e.departmentName}`,
      totalTasks: e.totalAssignedTasks,
      completedTasks: e.completedTasks,
      inProgressTasks: e.inProgressTasks,
      overdueTasks: e.overdueTasks,
      completionRate: e.completionRate,
      statusLabel: e.evaluation,
      statusColor: e.badgeColor,
    }))
  }

  return overview.projectProgress.map((p) => ({
    key: p.projectId,
    name: p.projectName,
    subtitle: `${p.projectCode} · ${p.departmentName} · QL: ${p.managerName}`,
    totalTasks: p.totalTasks,
    completedTasks: p.completedTasks,
    inProgressTasks: p.inProgressTasks,
    overdueTasks: p.overdueTasks,
    completionRate: p.progress,
    statusLabel: p.healthStatus,
    statusColor: p.statusColor,
  }))
}

export const reportService = {
  async getOverview(filters?: ReportFilterParams): Promise<ReportOverviewDto> {
    try {
      const response = await axiosClient.get<ApiResponse<ReportOverviewDto>>(
        `${BASE_URL}/overview`,
        { params: cleanParams(filters) },
      )
      const { isSuccess, data, errors, message } = response.data
      if (!isSuccess || !data) {
        throw new Error(getErrorMessage(errors, message || 'Không nhận được dữ liệu báo cáo.'))
      }
      return data
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return buildFallbackOverview(filters)
      }
      throw err
    }
  },

  async getProjectProgress(
    filters?: ReportFilterParams,
  ): Promise<ProjectProgressReportItemDto[]> {
    const response = await axiosClient.get<
      ApiResponse<ProjectProgressReportItemDto[]>
    >(`${BASE_URL}/projects`, { params: cleanParams(filters) })
    return response.data.data ?? []
  },

  async getEmployeePerformance(
    filters?: ReportFilterParams,
  ): Promise<EmployeePerformanceReportItemDto[]> {
    const response = await axiosClient.get<
      ApiResponse<EmployeePerformanceReportItemDto[]>
    >(`${BASE_URL}/employees`, { params: cleanParams(filters) })
    return response.data.data ?? []
  },

  async getTasksOverTime(
    filters?: ReportFilterParams,
  ): Promise<TasksOverTimeReportDto> {
    const response = await axiosClient.get<ApiResponse<TasksOverTimeReportDto>>(
      `${BASE_URL}/tasks-over-time`,
      { params: cleanParams(filters) },
    )
    if (!response.data.data) {
      throw new Error('Không thể tải biểu đồ công việc theo thời gian.')
    }
    return response.data.data
  },

  async getDepartmentPerformance(
    filters?: ReportFilterParams,
  ): Promise<DepartmentPerformanceReportItemDto[]> {
    const response = await axiosClient.get<
      ApiResponse<DepartmentPerformanceReportItemDto[]>
    >(`${BASE_URL}/departments`, { params: cleanParams(filters) })
    return response.data.data ?? []
  },

  async getCustomReport(
    groupBy: CustomReportGroupBy,
    filters?: ReportFilterParams,
    fallbackOverview?: ReportOverviewDto | null,
  ): Promise<CustomReportRowDto[]> {
    try {
      const response = await axiosClient.get<ApiResponse<CustomReportRowDto[]>>(
        `${BASE_URL}/custom`,
        {
          params: {
            groupBy,
            ...cleanParams(filters),
          },
        },
      )
      return response.data.data ?? []
    } catch (err: any) {
      if (fallbackOverview) {
        return buildClientCustomReportRows(fallbackOverview, groupBy)
      }
      throw err
    }
  },

  async exportExcel(
    filters?: ReportFilterParams,
    overviewFallback?: ReportOverviewDto | null,
  ): Promise<void> {
    try {
      const response = await axiosClient.get(`${BASE_URL}/export`, {
        params: {
          format: 'excel',
          ...cleanParams(filters),
        },
        responseType: 'blob',
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.ms-excel; charset=utf-8',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const nowStr = new Date().toISOString().slice(0, 10)
      link.setAttribute('download', `BaoCao_TongHop_${nowStr}.xls`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      if (overviewFallback) {
        this.downloadClientExcel(overviewFallback)
      } else {
        throw new Error('Không thể xuất file Excel. Vui lòng thử lại.')
      }
    }
  },

  downloadClientExcel(overview: ReportOverviewDto): void {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2563EB" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Title"><Font ss:Size="13" ss:Bold="1"/></Style>
 </Styles>
 <Worksheet ss:Name="Tien Do Du An">
  <Table>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">BÁO CÁO TIẾN ĐỘ DỰ ÁN</Data></Cell></Row>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Mã dự án</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tên dự án</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Phòng ban</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Quản lý</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Hoàn thành</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tổng công việc</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Quá hạn</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tiến độ (%)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Trạng thái</Data></Cell>
   </Row>
   ${overview.projectProgress
     .map(
       (p) => `<Row>
    <Cell><Data ss:Type="String">${escapeXml(p.projectCode)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.projectName)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.departmentName)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.managerName)}</Data></Cell>
    <Cell><Data ss:Type="Number">${p.completedTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${p.totalTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${p.overdueTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${p.progress}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.healthStatus)}</Data></Cell>
   </Row>`,
     )
     .join('\n')}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Hieu Suat Nhan Vien">
  <Table>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">BÁO CÁO HIỆU SUẤT NHÂN VIÊN</Data></Cell></Row>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Mã NV</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Họ và tên</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Phòng ban</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Được giao</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Hoàn thành</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Quá hạn</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tỷ lệ (%)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Đánh giá</Data></Cell>
   </Row>
   ${overview.employeePerformance
     .map(
       (e) => `<Row>
    <Cell><Data ss:Type="String">${escapeXml(e.employeeCode)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(e.fullName)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(e.departmentName)}</Data></Cell>
    <Cell><Data ss:Type="Number">${e.totalAssignedTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${e.completedTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${e.overdueTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${e.completionRate}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(e.evaluation)}</Data></Cell>
   </Row>`,
     )
     .join('\n')}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Theo Phong Ban">
  <Table>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">BÁO CÁO THEO PHÒNG BAN</Data></Cell></Row>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Mã PB</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tên phòng ban</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Nhân sự</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Số dự án</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tổng việc</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Hoàn thành</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tỷ lệ (%)</Data></Cell>
   </Row>
   ${overview.departmentPerformance
     .map(
       (d) => `<Row>
    <Cell><Data ss:Type="String">${escapeXml(d.departmentCode)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(d.departmentName)}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.activeEmployeesCount}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.totalProjects}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.totalTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.completedTasks}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.completionRate}</Data></Cell>
   </Row>`,
     )
     .join('\n')}
  </Table>
 </Worksheet>
</Workbook>`

    const blob = new Blob(['\uFEFF' + xml], {
      type: 'application/vnd.ms-excel; charset=utf-8',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `BaoCao_TongHop_${new Date().toISOString().slice(0, 10)}.xls`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  exportPdfPrintView(overview: ReportOverviewDto): void {
    const win = window.open('', '_blank', 'width=1100,height=850')
    if (!win) {
      window.print()
      return
    }

    const generatedTime = new Date(overview.generatedAt).toLocaleString('vi-VN')
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Báo cáo tổng hợp - Enterprise Task Management</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1e293b; margin: 28px; font-size: 13px; }
    h1 { font-size: 22px; margin-bottom: 4px; color: #0f172a; }
    h2 { font-size: 15px; margin-top: 24px; margin-bottom: 8px; color: #1d4ed8; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .meta { color: #64748b; margin-bottom: 18px; font-size: 12px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .kpi-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
    .kpi-val { font-size: 22px; font-weight: bold; margin-top: 4px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; color: #334155; }
    .text-center { text-align: center; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>BÁO CÁO TỔNG HỢP QUẢN LÝ CÔNG VIỆC</h1>
  <div class="meta">Thời điểm trích xuất: ${escapeXml(generatedTime)} · Tổng dự án: ${overview.kpiSummary.totalProjects} · Tổng công việc: ${overview.kpiSummary.totalTasks}</div>

  <div class="kpi-grid">
    <div class="kpi-box"><div class="kpi-label">Báo cáo có thể xuất</div><div class="kpi-val">${overview.kpiSummary.exportableReportsCount}</div></div>
    <div class="kpi-box"><div class="kpi-label">On track</div><div class="kpi-val" style="color:#16a34a">${overview.kpiSummary.onTrackProjects}</div></div>
    <div class="kpi-box"><div class="kpi-label">At risk</div><div class="kpi-val" style="color:#d97706">${overview.kpiSummary.atRiskProjects}</div></div>
    <div class="kpi-box"><div class="kpi-label">Behind</div><div class="kpi-val" style="color:#dc2626">${overview.kpiSummary.behindProjects}</div></div>
  </div>

  <h2>1. Tiến độ Dự án</h2>
  <table>
    <thead>
      <tr>
        <th>Mã dự án</th>
        <th>Tên dự án</th>
        <th>Phòng ban</th>
        <th>Quản lý</th>
        <th class="text-center">Hoàn thành / Tổng</th>
        <th class="text-center">Quá hạn</th>
        <th class="text-center">Tiến độ</th>
        <th class="text-center">Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${overview.projectProgress
        .map(
          (p) => `<tr>
        <td>${escapeXml(p.projectCode)}</td>
        <td><strong>${escapeXml(p.projectName)}</strong></td>
        <td>${escapeXml(p.departmentName)}</td>
        <td>${escapeXml(p.managerName)}</td>
        <td class="text-center">${p.completedTasks} / ${p.totalTasks}</td>
        <td class="text-center">${p.overdueTasks}</td>
        <td class="text-center"><strong>${p.progress}%</strong></td>
        <td class="text-center">${escapeXml(p.healthStatus)}</td>
      </tr>`,
        )
        .join('')}
    </tbody>
  </table>

  <h2>2. Hiệu suất Nhân viên</h2>
  <table>
    <thead>
      <tr>
        <th>Mã NV</th>
        <th>Nhân viên</th>
        <th>Phòng ban</th>
        <th class="text-center">Hoàn thành / Được giao</th>
        <th class="text-center">Tỷ lệ hoàn thành</th>
        <th class="text-center">Quá hạn</th>
        <th class="text-center">Đánh giá</th>
      </tr>
    </thead>
    <tbody>
      ${overview.employeePerformance
        .map(
          (e) => `<tr>
        <td>${escapeXml(e.employeeCode)}</td>
        <td><strong>${escapeXml(e.fullName)}</strong></td>
        <td>${escapeXml(e.departmentName)}</td>
        <td class="text-center">${e.completedTasks} / ${e.totalAssignedTasks}</td>
        <td class="text-center"><strong>${e.completionRate}%</strong></td>
        <td class="text-center">${e.overdueTasks}</td>
        <td class="text-center">${escapeXml(e.evaluation)}</td>
      </tr>`,
        )
        .join('')}
    </tbody>
  </table>

  <h2>3. Hiệu suất theo Phòng ban</h2>
  <table>
    <thead>
      <tr>
        <th>Mã PB</th>
        <th>Phòng ban</th>
        <th class="text-center">Nhân sự</th>
        <th class="text-center">Số dự án</th>
        <th class="text-center">Hoàn thành / Tổng việc</th>
        <th class="text-center">Tỷ lệ hoàn thành</th>
      </tr>
    </thead>
    <tbody>
      ${overview.departmentPerformance
        .map(
          (d) => `<tr>
        <td>${escapeXml(d.departmentCode)}</td>
        <td><strong>${escapeXml(d.departmentName)}</strong></td>
        <td class="text-center">${d.activeEmployeesCount}</td>
        <td class="text-center">${d.totalProjects}</td>
        <td class="text-center">${d.completedTasks} / ${d.totalTasks}</td>
        <td class="text-center"><strong>${d.completionRate}%</strong></td>
      </tr>`,
        )
        .join('')}
    </tbody>
  </table>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 250); };
  </script>
</body>
</html>`

    win.document.open()
    win.document.write(html)
    win.document.close()
  },
}
