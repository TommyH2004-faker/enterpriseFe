import { createElement, useEffect } from 'react'
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { authStorage } from 'src/services/authStorage'
import { NOTIFICATION_RECEIVED_EVENT, NOTIFICATION_RESYNC_EVENT, NotificationDto } from 'src/types/notifications'

import toast from 'react-hot-toast'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCommentSquare,
  cilTask,
  cilUserPlus,
} from '@coreui/icons'

// TODO: đúng đường dẫn MapHub<ChatHub>("...") trong Program.cs
const HUB_PATH = '/hubs/chat'

// Lấy origin từ VITE_API_BASE_URL (bỏ hậu tố /api) vì hub không nằm dưới /api
const HUB_URL = `${new URL(import.meta.env.VITE_API_BASE_URL, window.location.origin).origin}${HUB_PATH}`

export function useNotificationConnection() {
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => authStorage.getAccessToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

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

    // Nối lại sau khi mất mạng: bù thông báo đã lỡ
    connection.onreconnected(() => {
      window.dispatchEvent(new Event(NOTIFICATION_RESYNC_EVENT))
    })

    connection.start().catch(() => {
      // Không kết nối được: polling 60 giây trong chuông vẫn bù dữ liệu
    })

    return () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop()
      }
    }
  }, [])
}