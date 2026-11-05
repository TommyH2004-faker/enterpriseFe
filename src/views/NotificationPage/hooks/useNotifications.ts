import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createElement } from 'react'
import toast from 'react-hot-toast'
import CIcon from '@coreui/icons-react'
import { cilVolumeOff } from '@coreui/icons'

import {
  NOTIFICATION_RECEIVED_EVENT,
  NOTIFICATION_RESYNC_EVENT,
  NotificationDto,
  NotificationKind,
  UnreadCount,
  kindOf
} from 'src/types/notifications'
import {
  isSoundEnabled,
  playNotificationSound,
  setSoundEnabled,
  unlockNotificationSound,
} from 'src/utils/notificationSound'
import { notificationService } from 'src/services/notificationService'

export function useNotifications() {
  const navigate = useNavigate()

  // Tab & Core State
  const [tab, setTab] = useState<NotificationKind>('general')
  const [items, setItems] = useState<NotificationDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState<UnreadCount>({ general: 0, mention: 0 })

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Sound & Action Loading
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled())
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const seenIds = useRef<Set<string>>(new Set())

  // Unlock audio on interaction
  useEffect(() => {
    const unlock = () => unlockNotificationSound()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // Load unread count
  const loadUnread = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount()
      setUnread(data)
    } catch (err) {
      console.error('Failed to load unread count:', err)
    }
  }, [])

  // Load notification items
  const loadNotifications = useCallback(
    async (kind: NotificationKind, p = page, size = pageSize) => {
      setLoading(true)
      try {
        const data = await notificationService.getList(kind, p, size)
        data.items.forEach((item) => seenIds.current.add(item.id))
        setItems(data.items)
        setTotal(data.total)
      } catch (err: any) {
        toast.error('Không thể tải danh sách thông báo. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize],
  )

  // Fetch when tab, page, or pageSize changes
  useEffect(() => {
    void loadNotifications(tab, page, pageSize)
  }, [tab, page, pageSize, loadNotifications])

  // Initial unread fetch
  useEffect(() => {
    void loadUnread()
  }, [loadUnread])

  // Realtime SignalR listener & reconnect sync
  useEffect(() => {
    const handleReceived = (e: Event) => {
      const n = (e as CustomEvent<NotificationDto>).detail
      if (!n?.id || seenIds.current.has(n.id)) return
      seenIds.current.add(n.id)

      playNotificationSound()

      const itemKind = kindOf(n)
      setUnread((prev) => ({
        ...prev,
        [itemKind]: (prev[itemKind] || 0) + 1,
      }))

      // If matches current tab, update list
      if (itemKind === tab) {
        setTotal((prev) => prev + 1)
        if (page === 1) {
          setItems((prev) => [{ ...n, isRead: false }, ...prev])
        }
      }
    }

    const handleResync = () => {
      void loadUnread()
      void loadNotifications(tab, page, pageSize)
    }

    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, handleReceived)
    window.addEventListener(NOTIFICATION_RESYNC_EVENT, handleResync)
    return () => {
      window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, handleReceived)
      window.removeEventListener(NOTIFICATION_RESYNC_EVENT, handleResync)
    }
  }, [tab, page, pageSize, loadNotifications, loadUnread])

  // Change tab handler
  const handleTabChange = (nextTab: NotificationKind) => {
    if (tab === nextTab) return
    setTab(nextTab)
    setPage(1)
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  // Handle clicking notification item (marks read & navigates)
  const handleItemClick = async (n: NotificationDto) => {
    if (!n.isRead) {
      // Optimistic update
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
      const kind = kindOf(n)
      setUnread((prev) => ({ ...prev, [kind]: Math.max(0, prev[kind] - 1) }))

      try {
        await notificationService.markAsRead(n.id)
      } catch (err) {
        console.error('Failed to mark read:', err)
        void loadUnread()
      }
    }

    // Contextual navigation
    if (n.taskId) {
      navigate(`/tasks/${n.taskId}`)
    } else if (n.conversationId) {
      const query = new URLSearchParams({ conversationId: n.conversationId })
      if (n.messageId) query.set('messageId', n.messageId)
      navigate(`/messages?${query.toString()}`)
    }
  }

  // Handle mark single as read button click
  const handleMarkSingle = async (e: React.MouseEvent, n: NotificationDto) => {
    e.stopPropagation()
    if (n.isRead || actionLoading === n.id) return

    setActionLoading(n.id)
    const kind = kindOf(n)
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
    setUnread((prev) => ({ ...prev, [kind]: Math.max(0, prev[kind] - 1) }))

    try {
      await notificationService.markAsRead(n.id)
      toast.success('Đã đánh dấu đã đọc')
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
      void loadUnread()
    } finally {
      setActionLoading(null)
    }
  }

  // Handle mark all as read
  const handleMarkAll = async () => {
    if (unread[tab] === 0 || actionLoading === 'all') return

    setActionLoading('all')
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })))
    setUnread((prev) => ({ ...prev, [tab]: 0 }))

    try {
      await notificationService.markAllAsRead(tab)
      toast.success(`Đã đánh dấu đã đọc toàn bộ mục ${tab === 'general' ? 'thông báo chung' : 'nhắc tên'}`)
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật tất cả')
      void loadUnread()
      void loadNotifications(tab, page, pageSize)
    } finally {
      setActionLoading(null)
    }
  }

  // Sound toggle
  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    if (next) {
      unlockNotificationSound()
      playNotificationSound()
      toast.success('Đã bật âm thanh thông báo')
    } else {
      toast('Đã tắt âm thanh thông báo', { icon: createElement(CIcon, { icon: cilVolumeOff }) })
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  // Reload manually
  const reload = () => {
    void loadUnread()
    void loadNotifications(tab, page, pageSize)
  }

  // Filter items in memory
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (statusFilter === 'unread' && item.isRead) return false
      if (statusFilter === 'read' && !item.isRead) return false

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false

      // Search keyword filter
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchTitle = (item.title || '').toLowerCase().includes(query)
        const matchContent = (item.content || '').toLowerCase().includes(query)
        const matchSender = (item.senderName || '').toLowerCase().includes(query)
        if (!matchTitle && !matchContent && !matchSender) return false
      }

      return true
    })
  }, [items, statusFilter, typeFilter, search])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItemIndex = (page - 1) * pageSize + 1
  const endItemIndex = Math.min(page * pageSize, total)
  const totalUnreadAll = unread.general + unread.mention
  const hasActiveFilters = Boolean(search || statusFilter !== 'all' || typeFilter !== 'all')

  return {
    tab,
    items,
    filteredItems,
    total,
    page,
    pageSize,
    loading,
    unread,
    totalUnreadAll,
    search,
    statusFilter,
    typeFilter,
    soundOn,
    actionLoading,
    totalPages,
    startItemIndex,
    endItemIndex,
    hasActiveFilters,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setPage,
    setPageSize,
    handleTabChange,
    handleItemClick,
    handleMarkSingle,
    handleMarkAll,
    toggleSound,
    clearFilters,
    reload,
  }
}
