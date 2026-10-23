
import {
  CButton,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import type { SessionManagementItem } from 'src/types/sessionManagement'
import SessionStatusBadge from './SessionStatusBadge'
import {
  formatDate,
  formatRelativePast,
  formatRemaining,
  getSessionState,
  parseUserAgent,
} from './sessionUtils.ts'

interface SessionTableProps {
  sessions: SessionManagementItem[]
  loading: boolean
  isFiltered: boolean
  onRevoke: (session: SessionManagementItem) => void
}

const COLUMN_COUNT = 6

const SessionTable = ({
  sessions,
  loading,
  isFiltered,
  onRevoke,
}: SessionTableProps) => {
  const isInitialLoading = loading && sessions.length === 0

  return (
    <div className="table-responsive">
      <CTable hover align="middle" className="mb-0">
        <CTableHead className="text-body-secondary small">
          <CTableRow>
            <CTableHeaderCell className="ps-4 fw-medium">
              Tài khoản
            </CTableHeaderCell>
            <CTableHeaderCell className="fw-medium">
              Thiết bị
            </CTableHeaderCell>
            <CTableHeaderCell className="fw-medium">
              Hoạt động gần nhất
            </CTableHeaderCell>
            <CTableHeaderCell className="fw-medium">
              Hết hạn
            </CTableHeaderCell>
            <CTableHeaderCell className="fw-medium">
              Trạng thái
            </CTableHeaderCell>
            <CTableHeaderCell className="pe-4 text-end fw-medium">
              Thao tác
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody
          style={{
            opacity: loading && !isInitialLoading ? 0.5 : 1,
            transition: 'opacity .15s',
          }}
        >
          {isInitialLoading ? (
            <CTableRow>
              <CTableDataCell
                colSpan={COLUMN_COUNT}
                className="text-center text-body-secondary py-5"
              >
                <CSpinner size="sm" className="me-2" />
                Đang tải danh sách session...
              </CTableDataCell>
            </CTableRow>
          ) : sessions.length === 0 ? (
            <CTableRow>
              <CTableDataCell
                colSpan={COLUMN_COUNT}
                className="text-center py-5"
              >
                <div className="fw-semibold mb-1">
                  {isFiltered
                    ? 'Không có session nào khớp bộ lọc'
                    : 'Chưa có session nào'}
                </div>

                <div className="text-body-secondary small">
                  {isFiltered
                    ? 'Thử username khác hoặc xóa bộ lọc.'
                    : 'Session sẽ xuất hiện khi có người đăng nhập.'}
                </div>
              </CTableDataCell>
            </CTableRow>
          ) : (
            sessions.map((session) => {
              const state = getSessionState(session)
              const isActive = state === 'active'
              const remaining = isActive
                ? formatRemaining(session.expiredAt)
                : null

              return (
                <CTableRow key={session.id}>
                  {/* Tài khoản */}
                  <CTableDataCell className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0 ${
                          isActive
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-secondary-subtle text-body-secondary'
                        }`}
                        style={{ width: 36, height: 36 }}
                        aria-hidden
                      >
                        {session.username?.charAt(0).toUpperCase() || '?'}
                      </div>

                      <div>
                        <div
                          className={`fw-semibold ${
                            isActive ? '' : 'text-body-secondary'
                          }`}
                        >
                          {session.username}
                        </div>

                        <small
                          className="text-body-secondary"
                          title={session.id}
                        >
                          #{String(session.id).slice(0, 8)}
                        </small>
                      </div>
                    </div>
                  </CTableDataCell>

                  {/* Thiết bị */}
                  <CTableDataCell>
                    <div title={session.userAgent || undefined}>
                      {parseUserAgent(session.userAgent)}
                    </div>

                    <small className="text-body-secondary">
                      {session.ipAddress || '—'}
                    </small>
                  </CTableDataCell>

                  {/* Hoạt động */}
                  <CTableDataCell>
                    <div>
                      {formatRelativePast(session.lastActivityAt)}
                    </div>

                    <small className="text-body-secondary">
                      Tạo {formatDate(session.createdAt)}
                    </small>
                  </CTableDataCell>

                  {/* Hết hạn */}
                  <CTableDataCell>
                    <div>{formatDate(session.expiredAt)}</div>

                    {remaining && (
                      <small className="text-body-secondary">
                        {remaining}
                      </small>
                    )}
                  </CTableDataCell>

                  {/* Trạng thái */}
                  <CTableDataCell>
                    <SessionStatusBadge session={session} />
                  </CTableDataCell>

                  {/* Chỉ đăng xuất một session */}
                  <CTableDataCell className="pe-4 text-end">
                    {isActive ? (
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => onRevoke(session)}
                      >
                        Đăng xuất
                      </CButton>
                    ) : (
                      <span className="text-body-tertiary">—</span>
                    )}
                  </CTableDataCell>
                </CTableRow>
              )
            })
          )}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default SessionTable
