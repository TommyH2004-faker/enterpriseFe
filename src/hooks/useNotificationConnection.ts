import { createElement, useEffect } from 'react'
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { authStorage } from 'src/services/authStorage'
import { CHAT_HUB_URL } from 'src/config/env'
import { NOTIFICATION_RECEIVED_EVENT, NOTIFICATION_RESYNC_EVENT, NotificationDto } from 'src/types/notifications'

import toast from 'react-hot-toast'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCommentSquare,
  cilTask,
  cilUserPlus,
} from '@coreui/icons'

export const PROJECT_REALTIME_CHANGED_EVENT = 'project:realtime-changed'
export const PROJECT_VIEWERS_CHANGED_EVENT = 'project:viewers-changed'
export const PROJECTS_LIST_CHANGED_EVENT = 'projects:list-changed'

export interface ProjectRealtimePayload {
  projectId: string
  eventType: string
  boardId?: string | null
  taskId?: string | null
  actorUserId?: string | null
  actorName?: string | null
  occurredAtUtc: string
}

export interface ProjectViewerDto {
  userId: string
  fullName: string
}

let sharedConnection: HubConnection | null = null
const activeProjectRooms = new Map<string, number>()
let projectsListSubscribers = 0

async function ensureConnected(conn: HubConnection): Promise<boolean> {
  if (conn.state === HubConnectionState.Connected) return true
  if (conn.state === HubConnectionState.Disconnected) {
    try {
      await conn.start()
      return true
    } catch {
      return false
    }
  }
  // Đang Connecting / Reconnecting: chờ ngắn tối đa 3 giây
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 200))
    if (conn.state === HubConnectionState.Connected) return true
  }
  return false
}

export async function subscribeProjectRoom(projectId: string): Promise<ProjectViewerDto[]> {
  if (!projectId) return []
  const count = activeProjectRooms.get(projectId) ?? 0
  activeProjectRooms.set(projectId, count + 1)

  if (!sharedConnection) return []
  const ok = await ensureConnected(sharedConnection)
  if (!ok) return []

  try {
    const viewers = await sharedConnection.invoke<ProjectViewerDto[]>('JoinProject', projectId)
    return Array.isArray(viewers) ? viewers : []
  } catch {
    return []
  }
}

export async function unsubscribeProjectRoom(projectId: string): Promise<void> {
  if (!projectId) return
  const count = activeProjectRooms.get(projectId) ?? 0
  if (count <= 1) {
    activeProjectRooms.delete(projectId)
    if (sharedConnection?.state === HubConnectionState.Connected) {
      try {
        await sharedConnection.invoke('LeaveProject', projectId)
      } catch {
        // Ignore disconnect race
      }
    }
  } else {
    activeProjectRooms.set(projectId, count - 1)
  }
}

export async function subscribeProjectsListRoom(): Promise<void> {
  projectsListSubscribers += 1
  if (projectsListSubscribers === 1 && sharedConnection) {
    const ok = await ensureConnected(sharedConnection)
    if (ok) {
      try {
        await sharedConnection.invoke('JoinProjectsList')
      } catch {
        // Ignore
      }
    }
  }
}

export async function unsubscribeProjectsListRoom(): Promise<void> {
  projectsListSubscribers = Math.max(0, projectsListSubscribers - 1)
  if (projectsListSubscribers === 0 && sharedConnection?.state === HubConnectionState.Connected) {
    try {
      await sharedConnection.invoke('LeaveProjectsList')
    } catch {
      // Ignore
    }
  }
}

export function useNotificationConnection() {
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        accessTokenFactory: () => authStorage.getAccessToken() ?? '',
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    sharedConnection = connection

    connection.on('NotificationReceived', (n: NotificationDto) => {
      window.dispatchEvent(new CustomEvent(NOTIFICATION_RECEIVED_EVENT, { detail: n }))

      const notificationIcon =
        n.type === 'Assignment'
          ? cilUserPlus
          : n.type === 'Mention'
            ? cilBell
            : n.type === 'Comment'
              ? cilCommentSquare
              : cilTask

      toast(`${n.title || 'Thông báo mới'}: ${n.content || ''}`, {
        icon: createElement(CIcon, { icon: notificationIcon }),
        duration: 5000,
        position: 'top-right',
      })
    })

    // Đồng bộ Realtime khi người khác sửa Project / Kanban / Task
    connection.on('ProjectRealtimeChanged', (payload: ProjectRealtimePayload) => {
      window.dispatchEvent(new CustomEvent(PROJECT_REALTIME_CHANGED_EVENT, { detail: payload }))
    })

    // Đồng bộ danh sách người đang cùng xem bảng dự án
    connection.on(
      'ProjectViewersChanged',
      (data: { projectId: string; viewers: ProjectViewerDto[] }) => {
        window.dispatchEvent(new CustomEvent(PROJECT_VIEWERS_CHANGED_EVENT, { detail: data }))
      },
    )

    // Đồng bộ trang danh sách dự án (/projects)
    connection.on('ProjectsListChanged', (data: unknown) => {
      window.dispatchEvent(new CustomEvent(PROJECTS_LIST_CHANGED_EVENT, { detail: data }))
    })

    const rejoinRooms = async () => {
      for (const projectId of activeProjectRooms.keys()) {
        try {
          const viewers = await connection.invoke<ProjectViewerDto[]>('JoinProject', projectId)
          if (Array.isArray(viewers)) {
            window.dispatchEvent(
              new CustomEvent(PROJECT_VIEWERS_CHANGED_EVENT, { detail: { projectId, viewers } }),
            )
          }
        } catch {
          // Ignore
        }
      }
      if (projectsListSubscribers > 0) {
        try {
          await connection.invoke('JoinProjectsList')
        } catch {
          // Ignore
        }
      }
    }

    // Nối lại sau khi mất mạng: bù thông báo đã lỡ & tự động vào lại các phòng Project đang mở
    connection.onreconnected(() => {
      window.dispatchEvent(new Event(NOTIFICATION_RESYNC_EVENT))
      void rejoinRooms()
    })

    connection
      .start()
      .then(() => rejoinRooms())
      .catch(() => {
        // Không kết nối được: polling 60 giây trong chuông vẫn bù dữ liệu
      })

    return () => {
      if (sharedConnection === connection) {
        sharedConnection = null
      }
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop()
      }
    }
  }, [])
}
