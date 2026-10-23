import { useState } from 'react'
import { CAlert, CCard, CCardBody } from '@coreui/react'

import auditLogService from 'src/services/auditLogService'
import { AuditFilters } from 'src/types/auditLog'
import { getCurrentMonthRange, toOptions } from '../activities/utils/logHelpers'
import { useFilters } from '../activities/hooks/useFilters'
import { useAsync } from '../activities/hooks/useAsync'
import PageHeader from '../activities/common/PageHeader'
import AuditStats from './components/AuditStats'
import FilterBar from '../activities/common/FilterBar'
import FilterSelect from '../activities/common/FilterSelect'
import AuditTable from './components/AuditTable'
import LogPagination from '../activities/common/LogPagination'
import AuditDetailPanel from './components/AuditDetailPanel'


const PAGE_SIZE = 10

const INITIAL_FILTERS: AuditFilters = {
  search: '',
  module: '',
  action: '',
  entityType: '',
  ...getCurrentMonthRange(),
}

export default function AuditLogsPage() {
  const { draft, applied, patch, apply, reset } = useFilters<AuditFilters>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const list = useAsync(
    () => auditLogService.getAuditLogs({ page, pageSize: PAGE_SIZE, ...applied }),
    [applied, page],
  )
  const stats = useAsync(
    () => auditLogService.getAuditLogStats({ fromDate: applied.fromDate, toDate: applied.toDate }),
    [applied.fromDate, applied.toDate],
  )
  const filterOptions = useAsync(() => auditLogService.getAuditLogFilters(), [])

  const handleApply = () => {
    apply()
    setPage(1)
  }
  const handleReset = () => {
    reset()
    setPage(1)
  }

  return (
    <div className="d-flex align-items-start gap-3">
      <div className="flex-grow-1 min-w-0">
        <PageHeader
          title="Nhật ký kiểm toán (Audit Logs)"
          subtitle="Theo dõi và truy vết các thay đổi quan trọng trong hệ thống"
        />

        <AuditStats stats={stats.data} />

        <CCard className="mt-3">
          <CCardBody>
            <FilterBar
              searchPlaceholder="Tìm kiếm người thực hiện, mô tả, mã đối tượng..."
              value={draft}
              onChange={patch}
              onApply={handleApply}
              onReset={handleReset}
              loading={list.loading}
            >
              <FilterSelect value={draft.module} placeholder="Tất cả module" options={toOptions(filterOptions.data?.modules)} onChange={(v) => patch({ module: v })} />
              <FilterSelect value={draft.action} placeholder="Tất cả hành động" options={toOptions(filterOptions.data?.actions)} onChange={(v) => patch({ action: v })} />
              <FilterSelect value={draft.entityType} placeholder="Tất cả đối tượng" options={toOptions(filterOptions.data?.entityTypes)} onChange={(v) => patch({ entityType: v })} />
            </FilterBar>

            {list.error && (
              <CAlert color="danger" className="mt-3 mb-0">
                {list.error}
              </CAlert>
            )}

            <div className="mt-3">
              <AuditTable
                items={list.data?.items ?? []}
                loading={list.loading}
                selectedId={selectedId}
                onSelect={setSelectedId}
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
      </div>

      {selectedId && <AuditDetailPanel logId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
