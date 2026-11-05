import React, { useEffect, useState } from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilChartLine } from '@coreui/icons'
import { getHttpErrorMessage } from 'src/api/authApi'
import { dashboardService } from 'src/services/dashboardService'
import { activityLogQueryService } from 'src/services/activityLogQueryService'
import { notificationService } from 'src/services/notificationService'
import type {
  ActivityLogListItem,
  ActivityLogPageResult,
} from 'src/types/activityLog'
import type { SystemNotificationDto } from 'src/types/notifications'
import type { DashboardSummaryDto } from 'src/types/dashboard'

import DashboardError from './components/DashboardError'
import DashboardHeader from './components/DashboardHeader'
import DashboardLoading from './components/DashboardLoading'
import DashboardPendingCard from './components/DashboardPendingCard'
import DashboardStats from './components/DashboardStats'
import DashboardSummaryCard from './components/DashboardSummaryCard'
import TaskPriorityChart from './components/TaskPriorityChart'
import TaskStatusChart from './components/TaskStatusChart'
import RecentActivityList from './components/RecentActivityList'
import RecentNotifications from './components/RecentNotifications'

const DEFAULT_ERROR = 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.'

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [activities, setActivities] = useState<ActivityLogListItem[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)

  const [notifications, setNotifications] = useState<SystemNotificationDto[]>([])
  const [notificationsTotal, setNotificationsTotal] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await dashboardService.getSummary()
        if (!ignore) setSummary(data)
      } catch (err) {
        if (ignore) return

        setSummary(null)
        setError(
          getHttpErrorMessage(err, '') ||
            (err instanceof Error && err.message) ||
            DEFAULT_ERROR,
        )
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void load()

    return () => {
      ignore = true
    }
  }, [reloadKey])

  useEffect(() => {
    let ignore = false

    const loadActivities = async () => {
      setActivitiesLoading(true)
      setActivitiesError(null)

      try {
        const result: ActivityLogPageResult<ActivityLogListItem> =
          await activityLogQueryService.getActivityLogs({
            page: 1,
            pageSize: 5,
            sortBy: 'CreatedAt',
            sortDirection: 'desc',
          })

        if (!ignore) setActivities(result?.items ?? [])
      } catch (err) {
        if (ignore) return

        setActivities([])
        setActivitiesError(
          getHttpErrorMessage(err, '') ||
            (err instanceof Error && err.message) ||
            'Không thể tải hoạt động gần đây.',
        )
      } finally {
        if (!ignore) setActivitiesLoading(false)
      }
    }

    const loadNotifications = async () => {
      setNotificationsLoading(true)
      setNotificationsError(null)

      try {
        const result = await notificationService.getSystemList('general', 1, 5)

        if (ignore) return

        setNotifications(result?.items ?? [])
        setNotificationsTotal(result?.total ?? 0)
      } catch (err) {
        if (ignore) return

        setNotifications([])
        setNotificationsTotal(0)
        setNotificationsError(
          getHttpErrorMessage(err, '') ||
            (err instanceof Error && err.message) ||
            'Không thể tải thông báo hệ thống.',
        )
      } finally {
        if (!ignore) setNotificationsLoading(false)
      }
    }

    void loadActivities()
    void loadNotifications()

    return () => {
      ignore = true
    }
  }, [reloadKey])

  const handleRetry = () => {
    setReloadKey((key) => key + 1)
  }

  return (
    <div className="pb-2">
      <DashboardHeader />

      {loading && <DashboardLoading />}

      {!loading && error && (
        <DashboardError message={error} onRetry={handleRetry} />
      )}

      {!loading && !error && summary && (
        <>
          <DashboardStats summary={summary} />

          <CRow className="g-4 mb-4">
            <CCol lg={6}>
              <TaskStatusChart data={summary.tasksByStatus ?? []} />
            </CCol>

            <CCol lg={6}>
              <TaskPriorityChart data={summary.tasksByPriority ?? []} />
            </CCol>
          </CRow>

          <CRow className="g-4 mb-4">
            <CCol xs={12}>
              <DashboardPendingCard
                title="Tiến độ dự án - 4 tuần gần đây"
                icon={cilChartLine}
              />
            </CCol>
          </CRow>

          <CRow className="g-4 mb-4 align-items-stretch">
            <CCol lg={6} className="d-flex">
              <RecentActivityList
                items={activities}
                loading={activitiesLoading}
                error={activitiesError}
                onRetry={handleRetry}
              />
            </CCol>

            <CCol lg={6} className="d-flex">
              <RecentNotifications
                items={notifications}
                total={notificationsTotal}
                loading={notificationsLoading}
                error={notificationsError}
                onRetry={handleRetry}
              />
            </CCol>
          </CRow>

          <DashboardSummaryCard summary={summary} />
        </>
      )}
    </div>
  )
}

export default Dashboard