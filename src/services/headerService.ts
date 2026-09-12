// src/services/headerService.ts

import axiosClient from "src/api/axiosClient"
import { authStorage } from "./authStorage"

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
    const response = await axiosClient.get<NotificationData>(
      '/notifications/counts'
    )
    return response.data
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await authStorage.logout()
  },
}