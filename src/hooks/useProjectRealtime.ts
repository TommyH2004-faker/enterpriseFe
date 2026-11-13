import { useEffect, useRef, useState } from 'react'
import {
  PROJECT_REALTIME_CHANGED_EVENT,
  PROJECT_VIEWERS_CHANGED_EVENT,
  PROJECTS_LIST_CHANGED_EVENT,
  ProjectRealtimePayload,
  ProjectViewerDto,
  subscribeProjectRoom,
  subscribeProjectsListRoom,
  unsubscribeProjectRoom,
  unsubscribeProjectsListRoom,
} from './useNotificationConnection'

interface UseProjectRealtimeOptions {
  projectId?: string | null
  isBusy?: boolean
  onProjectChanged?: (payload: ProjectRealtimePayload) => void
}

/**
 * Hook kết nối phòng Realtime của một Project / Kanban Board:
 * - Tự động JoinProject khi mở trang & LeaveProject khi rời trang
 * - Trả về danh sách đồng nghiệp đang cùng mở bảng trực tuyến (viewers)
 * - Nếu người dùng đang giữ chuột kéo thẻ (isBusy = true), hàng đợi sẽ chờ thả chuột xong mới đồng bộ
 */
export function useProjectRealtime({
  projectId,
  isBusy = false,
  onProjectChanged,
}: UseProjectRealtimeOptions) {
  const [viewers, setViewers] = useState<ProjectViewerDto[]>([])
  const pendingEventRef = useRef<ProjectRealtimePayload | null>(null)
  const isBusyRef = useRef(isBusy)
  const onChangedRef = useRef(onProjectChanged)
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    onChangedRef.current = onProjectChanged
  }, [onProjectChanged])

  useEffect(() => {
    isBusyRef.current = isBusy
    if (!isBusy && pendingEventRef.current) {
      const queued = pendingEventRef.current
      pendingEventRef.current = null
      onChangedRef.current?.(queued)
    }
  }, [isBusy])

  useEffect(() => {
    if (!projectId) {
      setViewers([])
      return
    }

    let cancelled = false

    void subscribeProjectRoom(projectId).then((initialViewers) => {
      if (!cancelled && initialViewers.length > 0) {
        setViewers(initialViewers)
      }
    })

    const handleRealtimeChange = (e: Event) => {
      const detail = (e as CustomEvent<ProjectRealtimePayload>).detail
      if (!detail || detail.projectId?.toLowerCase() !== projectId.toLowerCase()) {
        return
      }

      if (isBusyRef.current) {
        pendingEventRef.current = detail
        return
      }

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = window.setTimeout(() => {
        onChangedRef.current?.(detail)
      }, 150)
    }

    const handleViewersChange = (e: Event) => {
      const detail = (e as CustomEvent<{ projectId: string; viewers: ProjectViewerDto[] }>).detail
      if (!detail || detail.projectId?.toLowerCase() !== projectId.toLowerCase()) {
        return
      }
      setViewers(detail.viewers ?? [])
    }

    const handleConcurrencyConflict = () => {
      onChangedRef.current?.({
        projectId,
        eventType: 'ConcurrencyConflict',
        occurredAtUtc: new Date().toISOString(),
      })
    }

    window.addEventListener(PROJECT_REALTIME_CHANGED_EVENT, handleRealtimeChange)
    window.addEventListener(PROJECT_VIEWERS_CHANGED_EVENT, handleViewersChange)
    window.addEventListener('app:concurrency-conflict', handleConcurrencyConflict)

    return () => {
      cancelled = true
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
      window.removeEventListener(PROJECT_REALTIME_CHANGED_EVENT, handleRealtimeChange)
      window.removeEventListener(PROJECT_VIEWERS_CHANGED_EVENT, handleViewersChange)
      window.removeEventListener('app:concurrency-conflict', handleConcurrencyConflict)
      void unsubscribeProjectRoom(projectId)
    }
  }, [projectId])

  return { viewers }
}

/**
 * Hook tự động cập nhật trang Danh sách Dự án (/projects) khi có thay đổi từ người dùng khác.
 */
export function useProjectsListRealtime(onChanged: () => void) {
  const onChangedRef = useRef(onChanged)
  useEffect(() => {
    onChangedRef.current = onChanged
  }, [onChanged])

  useEffect(() => {
    let timer: number | null = null
    void subscribeProjectsListRoom()

    const handler = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        onChangedRef.current()
      }, 200)
    }

    window.addEventListener(PROJECTS_LIST_CHANGED_EVENT, handler)
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener(PROJECTS_LIST_CHANGED_EVENT, handler)
      void unsubscribeProjectsListRoom()
    }
  }, [])
}

