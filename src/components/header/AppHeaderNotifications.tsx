import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CBadge, CDropdown, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilVolumeHigh, cilVolumeOff } from '@coreui/icons'
import {
  NOTIFICATION_RECEIVED_EVENT,
  NOTIFICATION_RESYNC_EVENT,
  NotificationDto,
  NotificationKind,
  UnreadCount,
  kindOf
} from 'src/types/notifications'
import './AppHeaderNotifications.css'
import { isSoundEnabled, playNotificationSound, setSoundEnabled, unlockNotificationSound } from 'src/utils/notificationSound'
import { notificationService } from 'src/services/notificationService'

const PAGE_SIZE = 15
const POLL_MS = 60000
const LOAD_MORE_THRESHOLD = 60 // px còn lại tới đáy thì tải tiếp

const TABS: { kind: NotificationKind; label: string; empty: string; icon: typeof cilBell }[] = [
  { kind: 'general', label: 'Thông báo', empty: 'Chưa có thông báo nào', icon: cilBell },
  { kind: 'mention', label: 'Đề cập', empty: 'Chưa có ai nhắc đến bạn', icon: cilBell },
]

interface ListState {
  items: NotificationDto[]
  total: number
  page: number
  loaded: boolean
}

const emptyList = (): ListState => ({ items: [], total: 0, page: 0, loaded: false })

// Mới nhất lên đầu
const byNewest = (a: NotificationDto, b: NotificationDto) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

const timeAgo = (iso: string) => {
  const minutes = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

const badgeText = (n: number) => (n > 99 ? '99+' : n)

const initialOf = (n: NotificationDto) =>
  (n.senderName || n.title || '?').trim().charAt(0).toUpperCase()

const AppHeaderNotifications = () => {
  const navigate = useNavigate()
   
  const [tab, setTab] = useState<NotificationKind>('general')
  const [unread, setUnread] = useState<UnreadCount>({ general: 0, mention: 0 })
  const [lists, setLists] = useState<Record<NotificationKind, ListState>>({
    general: emptyList(),
    mention: emptyList(),
  })
  const [loading, setLoading] = useState(false)
   const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled)
  const seenIds = useRef<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
  const unlock = () => unlockNotificationSound()
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
  return () => {
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
}, [])
  const loadUnread = useCallback(async () => {
    try {
      setUnread(await notificationService.getUnreadCount())
    } catch {
      // giữ số cũ
    }
  }, [])

  const loadList = useCallback(async (kind: NotificationKind, page = 1) => {
    setLoading(true)
    try {
      const data = await notificationService.getList(kind, page, PAGE_SIZE)
      data.items.forEach((n) => seenIds.current.add(n.id))

      setLists((prev) => {
        const old = prev[kind]
        const merged =
          page === 1
            ? data.items
            : [...old.items, ...data.items.filter((n) => !old.items.some((x) => x.id === n.id))]
        return {
          ...prev,
          [kind]: { items: [...merged].sort(byNewest), total: data.total, page, loaded: true },
        }
      })
    } catch {
      // giữ danh sách cũ
    } finally {
      setLoading(false)
    }
  }, [])

  // Số chưa đọc: tải lần đầu, polling dự phòng, đồng bộ sau khi nối lại SignalR
  useEffect(() => {
    void loadUnread()
    const interval = window.setInterval(() => void loadUnread(), POLL_MS)
    const resync = () => void loadUnread()
    window.addEventListener(NOTIFICATION_RESYNC_EVENT, resync)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener(NOTIFICATION_RESYNC_EVENT, resync)
    }
  }, [loadUnread])

  // Realtime: thông báo mới chèn lên đầu
  useEffect(() => {
    const handler = (e: Event) => {
      const n = (e as CustomEvent<NotificationDto>).detail
      if (!n?.id || seenIds.current.has(n.id)) return
      seenIds.current.add(n.id)
        playNotificationSound() 
      const kind = kindOf(n)
      const item: NotificationDto = { ...n, isRead: false }

      setLists((prev) => ({
        ...prev,
        [kind]: {
          ...prev[kind],
          items: [item, ...prev[kind].items].sort(byNewest),
          total: prev[kind].total + 1,
        },
      }))
      setUnread((prev) => ({ ...prev, [kind]: prev[kind] + 1 }))
    }

    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, handler)
    return () => window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, handler)
  }, [])

  const handleShow = () => {
    void loadList(tab)
    void loadUnread()
  }

  const selectTab = (kind: NotificationKind) => {
    setTab(kind)
    scrollRef.current?.scrollTo({ top: 0 })
    void loadList(kind)
  }

  // Cuộn gần tới đáy thì tải trang kế tiếp
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || loading) return
    const state = lists[tab]
    if (state.items.length >= state.total) return

    if (el.scrollHeight - el.scrollTop - el.clientHeight < LOAD_MORE_THRESHOLD) {
      void loadList(tab, state.page + 1)
    }
  }

  const handleItemClick = async (n: NotificationDto) => {
    const kind = kindOf(n)

    if (!n.isRead) {
      setLists((prev) => ({
        ...prev,
        [kind]: {
          ...prev[kind],
          items: prev[kind].items.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
        },
      }))
      setUnread((prev) => ({ ...prev, [kind]: Math.max(0, prev[kind] - 1) }))

      try {
        await notificationService.markAsRead(n.id)
      } catch {
        void loadUnread()
      }
    }

    if (n.taskId) {
      navigate(`/tasks/${n.taskId}`)
    } else if (n.conversationId) {
      const query = new URLSearchParams({ conversationId: n.conversationId })
      if (n.messageId) query.set('messageId', n.messageId)
      navigate(`/messages?${query.toString()}`)
    }
  }

  const handleReadAll = async () => {
    setLists((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: prev[tab].items.map((x) => ({ ...x, isRead: true })) },
    }))
    setUnread((prev) => ({ ...prev, [tab]: 0 }))

    try {
      await notificationService.markAllAsRead(tab)
    } catch {
      void loadUnread()
    }
  }

  const total = unread.general + unread.mention
  const current = lists[tab]
  const hasMore = current.items.length < current.total
  const tabInfo = TABS.find((t) => t.kind === tab)!

  return (
    <CDropdown variant="nav-item" placement="bottom-end" autoClose="outside" onShow={handleShow}>
      <CDropdownToggle caret={false}>
        <span className="position-relative d-inline-flex">
          <CIcon icon={cilBell} size="lg" />
          {total > 0 && (
            <CBadge
              color="danger"
              shape="rounded-pill"
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: '9px', minWidth: '17px', padding: '3px 5px' }}
            >
              {badgeText(total)}
            </CBadge>
          )}
        </span>
      </CDropdownToggle>

      <CDropdownMenu className="noti-menu">
        <div className="noti-header">
  <h6>Thông báo</h6>
  <div className="d-flex align-items-center gap-1">
    <button
      type="button"
      className="noti-readall"
      title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
      onClick={() => {
        const next = !soundOn
        setSoundOn(next)
        setSoundEnabled(next)
        if (next) {
          unlockNotificationSound()
          playNotificationSound() // nghe thử ngay khi bật
        }
      }}
    >
      <CIcon icon={soundOn ? cilVolumeHigh : cilVolumeOff} />
    </button>
    <button
      type="button"
      className="noti-readall"
      disabled={unread[tab] === 0}
      onClick={() => void handleReadAll()}
    >
      Đánh dấu đã đọc
    </button>
  </div>
</div>

        <div className="noti-tabs">
          {TABS.map(({ kind, label }) => (
            <button
              type="button"
              key={kind}
              className={`noti-tab ${tab === kind ? 'active' : ''}`}
              onClick={() => selectTab(kind)}
            >
              {label}
              {unread[kind] > 0 && <span className="noti-tab-count">{badgeText(unread[kind])}</span>}
            </button>
          ))}
        </div>

        <div className="noti-scroll" ref={scrollRef} onScroll={handleScroll}>
          {loading && current.items.length === 0 && <div className="noti-state">Đang tải...</div>}

          {!loading && current.loaded && current.items.length === 0 && (
            <div className="noti-state">
              <span className="noti-state-icon"><CIcon icon={tabInfo.icon} /></span>
              {tabInfo.empty}
            </div>
          )}

          {current.items.map((n) => (
            <button
              type="button"
              key={n.id}
              className={`noti-item ${n.isRead ? '' : 'unread'}`}
              onClick={() => void handleItemClick(n)}
            >
              <div className="noti-avatar">
                {initialOf(n)}
                {kindOf(n) === 'mention' && <span className="noti-avatar-type"><CIcon icon={cilBell} size="sm" /></span>}
              </div>

              <div className="noti-body">
                <span className="noti-title" title={n.title}>
                  {n.title}
                </span>
                <div className="noti-content">{n.content}</div>
                <div className="noti-time">{timeAgo(n.createdAt)}</div>
              </div>

              {!n.isRead && <span className="noti-dot" />}
            </button>
          ))}

          {current.items.length > 0 && loading && <div className="noti-more">Đang tải thêm...</div>}
          {current.items.length > 0 && !hasMore && !loading && current.items.length > PAGE_SIZE && (
            <div className="noti-more">Đã hiển thị tất cả</div>
          )}
        </div>

        <div className="border-top p-2 text-center bg-body-tertiary">
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none fw-semibold text-primary w-100"
            onClick={() => navigate('/notifications')}
          >
            Xem tất cả thông báo &rarr;
          </button>
        </div>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderNotifications