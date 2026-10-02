// src/services/headerService.ts

import axiosClient from "src/api/axiosClient"
import { authStorage } from "./authStorage"
import type { ApiResponse } from "src/api/authApi"
import type { ConversationListItem } from "./chatService"

export interface NotificationData {
  updates: number
  messages: number
  tasks: number
  comments: number
}

export const headerService = {
  /**
   * Lấy số thống kê cho header
   */
  getNotificationCount: async (): Promise<NotificationData> => {
    const response = await axiosClient.get<
      ApiResponse<ConversationListItem[]> & { value?: ConversationListItem[] }
    >('/api/v1/conversations')

    const payload = response.data.data ?? response.data.value ?? []
    const messages = Array.isArray(payload)
      ? payload.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0)
      : 0

    return {
      updates: 0,
      messages,
      tasks: 0,
      comments: 0,
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await authStorage.logout()
  },
}