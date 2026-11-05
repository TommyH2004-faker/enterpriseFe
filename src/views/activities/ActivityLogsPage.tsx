
import { useState } from 'react'
import { CCard, CCardBody } from '@coreui/react'
import ToastAlert from 'src/components/ToastAlert'

import type {
  ActivityFilters,
  ActivityLogFilterOptions,
  SelectOption,
} from 'src/types/activityLog'

import ActivityStats from './components/ActivityStats'
import ActivityTable from './components/ActivityTable'
import { getCurrentMonthRange, toParam } from './utils/logHelpers'
import { useAsync } from './hooks/useAsync'
import { useFilters } from './hooks/useFilters'
import PageHeader from './common/PageHeader'
import FilterBar from './common/FilterBar'
import FilterSelect from './common/FilterSelect'
import LogPagination from './common/LogPagination'
import activityLogQueryService from 'src/services/activityLogQueryService'

const PAGE_SIZE = 10

const INITIAL_FILTERS: ActivityFilters = {
  search: '',
  activityType: '',
  employeeId: '',
  fromDate: '',
  toDate: '',
}
function toOptions(values?: string[]): SelectOption[] {
  return (values ?? []).map((value) => ({
    value,
    label: value,
  }))
}

export default function ActivityLogsPage() {
  const { draft, applied, patch, apply, reset } =
    useFilters<ActivityFilters>(INITIAL_FILTERS)

  const [page, setPage] = useState(1)

  const list = useAsync(
    () =>
      activityLogQueryService.getActivityLogs({
        page,
        pageSize: PAGE_SIZE,
        ...applied,
        fromDate: toParam(applied.fromDate),
        toDate: toParam(applied.toDate),
      }),
    [applied, page],
  )

  const stats = useAsync(
    () =>
      activityLogQueryService.getActivityLogStats({
        fromDate: toParam(applied.fromDate),
        toDate: toParam(applied.toDate),
      }),
    [applied.fromDate, applied.toDate],
  )

  const filterOptions = useAsync<ActivityLogFilterOptions>(
    () => activityLogQueryService.getActivityLogFilters(),
    [],
  )

  const employeeOptions: SelectOption[] = (
    filterOptions.data?.employees ?? []
  ).map((employee) => ({
    value: employee.id,
    label: employee.employeeCode
      ? `${employee.fullName} (${employee.employeeCode})`
      : employee.fullName,
  }))

  const activityTypeOptions = toOptions(
    filterOptions.data?.activityTypes,
  )

  const handleApply = () => {
    apply()
    setPage(1)
  }

  const handleReset = () => {
    reset()
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="Nhật ký hoạt động (Activity Logs)"
        subtitle="Theo dõi dòng thời gian hoạt động của nhân viên trong hệ thống"
      />

      <ActivityStats stats={stats.data ?? null} />

      <CCard className="mt-3">
        <CCardBody>
          <FilterBar
            searchPlaceholder="Tìm kiếm tên nhân viên, tiêu đề, mô tả..."
            value={draft}
            onChange={patch}
            onApply={handleApply}
            onReset={handleReset}
            loading={list.loading}
          >
            <FilterSelect
              value={draft.employeeId}
              placeholder="Tất cả nhân viên"
              options={employeeOptions}
              onChange={(value) => patch({ employeeId: value })}
            />

            <FilterSelect
              value={draft.activityType}
              placeholder="Tất cả loại hoạt động"
              options={activityTypeOptions}
              onChange={(value) => patch({ activityType: value })}
            />
          </FilterBar>

          <ToastAlert message={list.error} />

          <div className="mt-3">
            <ActivityTable
              items={list.data?.items ?? []}
              loading={list.loading}
            />
          </div>

          <LogPagination
            page={page}
            totalPages={list.data?.totalPages ?? 1}
            pageSize={PAGE_SIZE}
            totalCount={list.data?.totalCount ?? 0}
            onChange={setPage}
          />
        </CCardBody>
      </CCard>
    </>
  )
}
