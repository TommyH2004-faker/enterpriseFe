import React, { useCallback, useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import toast from 'react-hot-toast'
import { getHttpErrorMessage } from 'src/api/authApi'
import {
  buildClientCustomReportRows,
  reportService,
} from 'src/services/reportService'
import {
  CustomReportDisplayMode,
  CustomReportGroupBy,
  CustomReportRowDto,
  ReportFilterOptionsDto,
  ReportFilterParams,
  ReportOverviewDto,
  ReportTabKey,
} from 'src/types/reports'

import CustomReportCard from './components/CustomReportCard'
import DepartmentPerformanceCard from './components/DepartmentPerformanceCard'
import EmployeePerformanceCard from './components/EmployeePerformanceCard'
import ProjectProgressCard from './components/ProjectProgressCard'
import ReportsFilters from './components/ReportsFilters'
import ReportsHeader from './components/ReportsHeader'
import ReportsKpiCards from './components/ReportsKpiCards'
import ReportsTabs from './components/ReportsTabs'
import TasksOverTimeChartCard from './components/TasksOverTimeChartCard'

const EMPTY_OPTIONS: ReportFilterOptionsDto = {
  departments: [],
  projects: [],
  employees: [],
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTabKey>('projects')
  const [filters, setFilters] = useState<ReportFilterParams>({})
  const [reloadKey, setReloadKey] = useState(0)

  const [overview, setOverview] = useState<ReportOverviewDto | null>(null)
  const [filterOptions, setFilterOptions] =
    useState<ReportFilterOptionsDto>(EMPTY_OPTIONS)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<boolean>(false)

  // State cho Báo cáo tùy chỉnh
  const [customGroupBy, setCustomGroupBy] =
    useState<CustomReportGroupBy>('project')
  const [customDisplayMode, setCustomDisplayMode] =
    useState<CustomReportDisplayMode>('table')
  const [customRows, setCustomRows] = useState<CustomReportRowDto[]>([])
  const [customLoading, setCustomLoading] = useState<boolean>(false)

  // Tải dữ liệu tổng hợp Báo cáo khi bộ lọc hoặc reloadKey thay đổi
  useEffect(() => {
    let ignore = false

    const loadOverview = async () => {
      if (
        filters.fromDate &&
        filters.toDate &&
        filters.fromDate > filters.toDate
      ) {
        setError('Ngày bắt đầu không được lớn hơn ngày kết thúc.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await reportService.getOverview(filters)
        if (ignore) return

        setOverview(data)
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions)
        }
        setCustomRows(buildClientCustomReportRows(data, customGroupBy))
      } catch (err) {
        if (ignore) return
        setError(
          getHttpErrorMessage(err, '') ||
            (err instanceof Error && err.message) ||
            'Không thể tải dữ liệu báo cáo. Vui lòng thử lại.',
        )
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadOverview()

    return () => {
      ignore = true
    }
  }, [filters, reloadKey])

  // Tải báo cáo tùy chỉnh khi người dùng đổi tiêu chí nhóm (groupBy)
  const handleGroupByChange = useCallback(
    async (nextGroupBy: CustomReportGroupBy) => {
      setCustomGroupBy(nextGroupBy)
      if (!overview) return

      setCustomLoading(true)
      try {
        const rows = await reportService.getCustomReport(
          nextGroupBy,
          filters,
          overview,
        )
        setCustomRows(rows)
      } catch {
        setCustomRows(buildClientCustomReportRows(overview, nextGroupBy))
      } finally {
        setCustomLoading(false)
      }
    },
    [filters, overview],
  )

  const handleRefresh = () => {
    setReloadKey((k) => k + 1)
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = async () => {
    if (!overview) return
    setExporting(true)
    try {
      await reportService.exportExcel(filters, overview)
      toast.success('Đã xuất báo cáo Excel thành công!')
    } catch (err) {
      toast.error(
        (err instanceof Error && err.message) || 'Không thể xuất báo cáo Excel.',
      )
    } finally {
      setExporting(false)
    }
  }

  const handleExportPdf = () => {
    if (!overview) {
      window.print()
      return
    }
    reportService.exportPdfPrintView(overview)
  }

  return (
    <>
      <ReportsHeader
        loading={loading}
        exporting={exporting}
        onRefresh={handleRefresh}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
      />

      <ReportsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <ReportsFilters
        filters={filters}
        options={filterOptions}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {error && (
        <CAlert
          color="danger"
          className="d-flex justify-content-between align-items-center mb-4"
        >
          <span>{error}</span>
          <CButton
            color="danger"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            Thử lại
          </CButton>
        </CAlert>
      )}

      {loading && !overview && (
        <CCard className="shadow-sm border-0 mb-4">
          <CCardBody className="py-5 text-center">
            <CSpinner color="primary" />
            <div className="text-muted mt-3">
              Đang tổng hợp số liệu báo cáo...
            </div>
          </CCardBody>
        </CCard>
      )}

      {overview && (
        <>
          <ReportsKpiCards kpi={overview.kpiSummary} />

          {/* Tab 1 (Mặc định): Tổng quan & Tiến độ dự án theo đúng bố cục mẫu */}
          {activeTab === 'projects' && (
            <>
              <CRow className="mb-4">
                <CCol xs={12}>
                  <TasksOverTimeChartCard report={overview.tasksOverTime} />
                </CCol>
              </CRow>

              <CRow>
                <CCol xl={6} className="mb-4">
                  <ProjectProgressCard items={overview.projectProgress} />
                </CCol>

                <CCol xl={6} className="mb-4">
                  <EmployeePerformanceCard
                    items={overview.employeePerformance}
                  />
                </CCol>
              </CRow>

              <CRow className="g-4 mt-0">
                <CCol lg={4}>
                  <DepartmentPerformanceCard
                    items={overview.departmentPerformance}
                  />
                </CCol>

                <CCol lg={8}>
                  <CustomReportCard
                    rows={customRows}
                    groupBy={customGroupBy}
                    displayMode={customDisplayMode}
                    loading={customLoading}
                    onGroupByChange={handleGroupByChange}
                    onDisplayModeChange={setCustomDisplayMode}
                  />
                </CCol>
              </CRow>
            </>
          )}

          {/* Tab 2: Hiệu suất nhân viên chi tiết */}
          {activeTab === 'employees' && (
            <CRow className="mb-4">
              <CCol xs={12}>
                <EmployeePerformanceCard
                  items={overview.employeePerformance}
                  expanded
                />
              </CCol>
            </CRow>
          )}

          {/* Tab 3: Công việc theo thời gian chi tiết */}
          {activeTab === 'timeline' && (
            <CRow className="mb-4">
              <CCol xs={12}>
                <TasksOverTimeChartCard
                  report={overview.tasksOverTime}
                  expanded
                />
              </CCol>
            </CRow>
          )}

          {/* Tab 4: Theo phòng ban chi tiết */}
          {activeTab === 'departments' && (
            <CRow className="mb-4">
              <CCol xs={12}>
                <DepartmentPerformanceCard
                  items={overview.departmentPerformance}
                  expanded
                />
              </CCol>
            </CRow>
          )}

          {/* Tab 5: Báo cáo tùy chỉnh mở rộng */}
          {activeTab === 'custom' && (
            <CRow className="mb-4">
              <CCol xs={12}>
                <CustomReportCard
                  rows={customRows}
                  groupBy={customGroupBy}
                  displayMode={customDisplayMode}
                  loading={customLoading}
                  expanded
                  onGroupByChange={handleGroupByChange}
                  onDisplayModeChange={setCustomDisplayMode}
                />
              </CCol>
            </CRow>
          )}
        </>
      )}
    </>
  )
}

export default Reports
