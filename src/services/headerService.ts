
// src/services/headerService.ts

import axiosClient from 'src/api/axiosClient'
import { authStorage } from './authStorage'
import type { ApiResponse } from 'src/api/authApi'
import type { ConversationListItem } from './chatService'

export interface NotificationData {
  updates: number
  messages: number
  tasks: number
  comments: number
}

export const headerService = {
  /**
   * Lấy số tin nhắn chưa đọc
   */
  getNotificationCount: async (): Promise<NotificationData> => {
    const response = await axiosClient.get<
      ApiResponse<ConversationListItem[]> & {
        value?: ConversationListItem[]
      }
    >('/api/v1/conversations')

    const payload = response.data.data ?? response.data.value ?? []

    const messages = Array.isArray(payload)
      ? payload.reduce(
          (total, conversation) =>
            total + (conversation.unreadCount || 0),
          0,
        )
      : 0

    return {
      updates: 0,
      messages,
      tasks: 0,
      comments: 0,
    }
  },

/**
 * Lấy tổng số dự án
 */
getProjectCount: async (): Promise<number> => {
  const response = await axiosClient.get<{
    isSuccess: boolean
    statusCode: number
    message: string
    traceId: string
    data: number
    errors: string[]
  }>('/api/v1/projects/count')

  return response.data.data
},

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await authStorage.logout()
  },
}
