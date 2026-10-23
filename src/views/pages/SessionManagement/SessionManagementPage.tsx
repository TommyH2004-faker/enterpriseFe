
import { useCallback, useEffect, useRef, useState } from 'react'
import { CAlert, CButton, CCard, CSpinner } from '@coreui/react'

import sessionManagementService from 'src/services/sessionManagementService'
import type {
  SessionManagementItem,
  SessionManagementSummary,
} from 'src/types/sessionManagement'

import SessionFilters from './components/SessionFilters'
import SessionTable from './components/SessionTable'
import SessionPagination from './components/SessionPagination'
import SessionConfirmModal, {
  type SessionConfirmAction,
} from './components/SessionConfirmModal'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

const EMPTY_SUMMARY: SessionManagementSummary = {
  activeCount: 0,
  expiredCount: 0,
  revokedCount: 0,
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (
      error as {
        response?: { data?: { message?: string; title?: string } }
      }
    ).response

    return (
      response?.data?.message ||
      response?.data?.title ||
      'Không thể thực hiện yêu cầu. Vui lòng thử lại.'
    )
  }

  if (error instanceof Error) return error.message

  return 'Đã xảy ra lỗi không xác định.'
}

const SummaryItem = ({
  dotClass,
  count,
  label,
}: {
  dotClass: string
  count: number
  label: string
}) => (
  <span className="d-inline-flex align-items-center gap-2 text-nowrap">
    <span
      className={`${dotClass} rounded-circle d-inline-block`}
      style={{ width: 8, height: 8 }}
    />
    <strong>{count.toLocaleString('vi-VN')}</strong>
    <span className="text-body-secondary">{label}</span>
  </span>
)

const SessionManagementPage = () => {
  const [sessions, setSessions] = useState<SessionManagementItem[]>([])
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameFilter, setUsernameFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [summary, setSummary] =
    useState<SessionManagementSummary>(EMPTY_SUMMARY)

  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmAction, setConfirmAction] =
    useState<SessionConfirmAction | null>(null)

  // Không để response cũ ghi đè dữ liệu của request mới.
  const requestId = useRef(0)

  const loadSessions = useCallback(async () => {
    const currentId = ++requestId.current

    setLoading(true)
    setError('')

    try {
      const result = await sessionManagementService.getAll({
        username: usernameFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      })

      if (currentId !== requestId.current) return

      setSessions(result.items ?? [])
      setTotalCount(result.totalCount ?? 0)
      setSummary(result.summary ?? EMPTY_SUMMARY)
    } catch (err: unknown) {
      if (currentId !== requestId.current) return

      setError(getErrorMessage(err))
      setSessions([])
      setTotalCount(0)
      setSummary(EMPTY_SUMMARY)
    } finally {
      if (currentId === requestId.current) {
        setLoading(false)
      }
    }
  }, [usernameFilter, page])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  // Tìm kiếm sau khi ngừng nhập 400 ms.
  useEffect(() => {
    const next = usernameInput.trim()

    if (next === usernameFilter) return

    const timer = window.setTimeout(() => {
      setSuccess('')
      setPage(1)
      setUsernameFilter(next)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [usernameInput, usernameFilter])

  // Nhấn Enter hoặc nút tìm kiếm để áp dụng ngay.
  const handleSearch = () => {
    setSuccess('')
    setPage(1)
    setUsernameFilter(usernameInput.trim())
  }

  const handleReset = () => {
    setSuccess('')
    setUsernameInput('')
    setPage(1)
    setUsernameFilter('')
  }

  const handleConfirmAction = async () => {
  if (!confirmAction || actionLoading) return

  setActionLoading(true)
  setError('')
  setSuccess('')

  try {
    if (confirmAction.type === 'single') {
      // Thu hồi một session trên một thiết bị.
      await sessionManagementService.revokeSession(
        confirmAction.sessionId,
      )

      setSuccess(
        `Đã thu hồi session của ${confirmAction.username}.`,
      )
    } else if (confirmAction.type === 'userAll') {
      // Thu hồi tất cả session của một tài khoản.
      const revokedCount =
        await sessionManagementService.revokeAllUserSessions(
          confirmAction.userId,
        )

      setSuccess(
        `Đã thu hồi ${revokedCount} session của tài khoản ${confirmAction.username}.`,
      )
    } else {
      // Thu hồi tất cả session của mọi tài khoản.
      const revokedCount =
        await sessionManagementService.revokeAllSessions()

      setSuccess(
        `Đã thu hồi ${revokedCount} session trên toàn hệ thống.`,
      )
    }

    setConfirmAction(null)

    await loadSessions()
  } catch (err: unknown) {
    setError(getErrorMessage(err))
  } finally {
    setActionLoading(false)
  }
}

  return (
    <div className="container-fluid px-0">
      {/* Tiêu đề và thao tác */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="mb-1">Quản lý session</h4>
          <p className="text-body-secondary mb-0">
            Xem các phiên đăng nhập và thu hồi khi cần.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <CButton
            color="secondary"
            variant="outline"
            disabled={loading || actionLoading}
            onClick={() => void loadSessions()}
          >
            {loading && <CSpinner size="sm" className="me-2" />}
            Làm mới
          </CButton>

          <CButton
            color="danger"
            disabled={
              loading || actionLoading || summary.activeCount === 0
            }
            onClick={() => setConfirmAction({ type: 'all' })}
          >
            Đăng xuất tất cả session
          </CButton>
        </div>
      </div>

      {/* Thông báo */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError('')}>
          {error}
        </CAlert>
      )}

      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </CAlert>
      )}

      <CCard className="overflow-hidden">
        {/* Bộ lọc và thống kê toàn bộ dữ liệu */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 px-4 py-3 border-bottom">
          <SessionFilters
            username={usernameInput}
            canReset={usernameInput !== '' || usernameFilter !== ''}
            onUsernameChange={setUsernameInput}
            onSearch={handleSearch}
            onReset={handleReset}
          />

          <div
            className="d-flex flex-wrap align-items-center small"
            style={{ columnGap: '1.25rem', rowGap: '.25rem' }}
            title="Thống kê trên toàn bộ dữ liệu"
          >
            <SummaryItem
              dotClass="bg-success"
              count={summary.activeCount}
              label="hoạt động"
            />

            <SummaryItem
              dotClass="bg-secondary"
              count={summary.expiredCount}
              label="hết hạn"
            />

            <SummaryItem
              dotClass="bg-danger"
              count={summary.revokedCount}
              label="đã thu hồi"
            />
          </div>
        </div>

        {/* Bảng chỉ hiển thị dữ liệu của trang hiện tại */}
        <SessionTable
        sessions={sessions}
        loading={loading}
        isFiltered={usernameFilter !== ''}
        onRevoke={(session) =>
          setConfirmAction({
            type: 'single',
            sessionId: session.id,
            username: session.username,
          })
        }
      />

        <SessionPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </CCard>

      <SessionConfirmModal
        action={confirmAction}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) setConfirmAction(null)
        }}
        onConfirm={() => void handleConfirmAction()}
      />
    </div>
  )
}

export default SessionManagementPage
