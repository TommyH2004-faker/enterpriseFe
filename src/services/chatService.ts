import { HubConnectionBuilder } from '@microsoft/signalr'
import type { ApiResponse } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'

export enum ConversationType { Direct = 1, Group = 2, Project = 3, Department = 4 }
export enum MessageType { Text = 1, Image = 2, File = 3, Video = 4, Audio = 5, System = 6 }

export interface ConversationListItem {
  id: string
  name: string
  conversationType: ConversationType
  avatarUrl?: string | null
  lastActivityAt: string
  isPinned: boolean
  isMuted: boolean
  memberCount: number
  unreadCount: number
  lastMessage?: { id?: string; content?: string | null; sentAt: string; isDeleted: boolean } | null
}

export interface ConversationDetail extends ConversationListItem {
  description?: string
  members: Array<{ userId: string; isActive: boolean }>
}

export interface Message {
  id: string
  conversationId?: string
  senderId: string
  content?: string
  messageType: MessageType
  clientMessageId?: string
  sentAt: string
  editedAt?: string
  isDeleted: boolean
}

interface MessagePage {
  items?: Message[]
  data?: Message[]
}

export interface EmployeeSearchItem {
  userId: string
  fullName: string
  username: string
  avatarUrl?: string
  departmentName?: string
}

const unwrap = <T>(response: ApiResponse<T> & { value?: T }): T => {
  if (!response.isSuccess || (response.data === null && response.value === undefined)) {
    const firstError = response.errors?.[0]
    const message = typeof firstError === 'string'
      ? firstError
      : firstError?.description || response.message || 'Yêu cầu chat thất bại.'
    throw new Error(message)
  }

  const payload = response.data ?? response.value
  if (payload === undefined) {
    throw new Error(response.message || 'API không trả về dữ liệu.')
  }
  return payload
}

export class ChatService {
  constructor(private readonly apiBaseUrl: string) {}

  async getConversations(search?: string): Promise<ConversationListItem[]> {
    const response = await axiosClient.get<ApiResponse<ConversationListItem[]>>('/api/v1/conversations', { params: { search } })
    return unwrap(response.data) ?? []
  }

  async getConversation(id: string): Promise<ConversationDetail> {
    const response = await axiosClient.get<ApiResponse<ConversationDetail>>(`/api/v1/conversations/${id}`)
    return unwrap(response.data)
  }

  async getMessages(id: string, before?: string, limit = 30): Promise<Message[]> {
    const response = await axiosClient.get<ApiResponse<Message[] | MessagePage>>(`/api/v1/conversations/${id}/messages`, { params: { before, limit } })
    const result = unwrap(response.data)
    if (Array.isArray(result)) return result
    return result?.items ?? result?.data ?? []
  }

  async searchEmployees(search: string): Promise<EmployeeSearchItem[]> {
    const response = await axiosClient.get<ApiResponse<EmployeeSearchItem[]>>('/api/v1/employees/search', {
      params: { search },
    })
    return unwrap(response.data) ?? []
  }

async createDirect(targetUserId: string): Promise<ConversationDetail> {
  console.log('========== CREATE DIRECT CHAT ==========')
  console.log('targetUserId:', targetUserId)
  console.log('targetUserId type:', typeof targetUserId)

  const response = await axiosClient.post<ApiResponse<ConversationDetail>>(
    '/api/v1/conversations/direct',
    { targetUserId }
  )

  console.log('CREATE DIRECT RESPONSE:', response.data)

  return unwrap(response.data)
}

  async sendMessage(conversationId: string, content: string, clientMessageId: string): Promise<Message> {
    const response = await axiosClient.post<ApiResponse<Message>>(`/api/v1/conversations/${conversationId}/messages`, { content, clientMessageId })
    return unwrap(response.data)
  }

  async markAsRead(conversationId: string, lastMessageId: string) {
    await axiosClient.post(`/api/v1/conversations/${conversationId}/read`, { lastMessageId })
  }

  createConnection(accessToken: string) {
    return new HubConnectionBuilder()
      .withUrl(`${this.apiBaseUrl}/hubs/chat`, { accessTokenFactory: () => accessToken, withCredentials: true })
      .withAutomaticReconnect()
      .build()
  }
}
