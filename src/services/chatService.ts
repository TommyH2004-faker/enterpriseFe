
import { HubConnectionBuilder } from '@microsoft/signalr'
import axios from 'axios'
import type { ApiResponse } from 'src/api/authApi'
import axiosClient from 'src/api/axiosClient'

export enum ConversationType { Direct = 1, Group = 2, Project = 3, Department = 4 }
export enum MessageType { Text = 1, Image = 2, File = 3, Video = 4, Audio = 5, System = 6 }

export enum ConversationMemberRole {
  Owner = 1,
  Administrator = 2,
  Member = 3,
}

export enum MessageReactionType {
  Like = 1,
  Love = 2,
  Laugh = 3,
  Wow = 4,
  Sad = 5,
  Angry = 6,
  Celebrate = 7,
  Rocket = 8,
}

export interface MessageReaction {
  userId: string
  reactionType: MessageReactionType
  reactedAt: string
}

export interface UserPresence {
  userId: string
  isOnline: boolean
  lastSeenAt?: string | null
}

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
  otherUserId?: string | null
  otherUserLastLoginAt?: string | null
}

export interface ConversationMember {
  userId: string
  fullName?: string
  role?: ConversationMemberRole
  isActive: boolean
  joinedAt?: string
  isMuted?: boolean
  isPinned?: boolean
  lastLoginAt?: string | null
}

export type ConversationScope = 'active' | 'archived' | 'dissolved'

export interface ConversationDetail extends ConversationListItem {
  description?: string
  /** Tôi đã lưu trữ (ẩn) hội thoại này */
  isHidden?: boolean
  /** Nhóm đã bị giải tán */
  isArchived?: boolean
  members: ConversationMember[]
  otherUserId?: string | null
  otherUserLastLoginAt?: string | null
}
export interface MessageAttachment {
  id: string
  originalFileName: string
  contentType: string
  fileSize: number
  width?: number | null
  height?: number | null
}

export interface MentionItem {
  userId: string
  fullName?: string
}

export interface ReplyPreview {
  id: string
  senderId: string
  senderName?: string | null
  content?: string | null
  isDeleted: boolean
}

export interface SendMessagePayload {
  content: string
  clientMessageId: string
  replyToMessageId?: string | null
  mentionedUserIds?: string[]
  attachmentIds?: string[]
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
  reactions?: MessageReaction[]

  senderName?: string | null
  replyToMessageId?: string | null
  replyTo?: ReplyPreview | null
  attachments?: MessageAttachment[]
  mentions?: MentionItem[]
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

export interface DepartmentItem {
  id: string
  name: string
}

export interface CreateGroupRequest {
  name: string
  type: ConversationType
  projectId?: string | null
  departmentId?: string | null
  memberUserIds: string[]
}

/** Backend trả enum dạng chuỗi ("Owner", "Group"...) hoặc số; chuẩn hóa về số. */
const toEnum = <T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown,
  fallback: number,
): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const asNumber = Number(value)
    if (!Number.isNaN(asNumber)) return asNumber
    const key = Object.keys(enumObj).find((k) => k.toLowerCase() === value.toLowerCase())
    if (key && typeof enumObj[key] === 'number') return enumObj[key] as number
    if (value.toLowerCase() === 'admin') return ConversationMemberRole.Administrator
  }
  return fallback
}

const normalizeListItem = <T extends ConversationListItem>(c: T): T => ({
  ...c,
  conversationType: toEnum(ConversationType, c.conversationType, ConversationType.Direct),
})

const normalizeDetail = (c: ConversationDetail | null): ConversationDetail | null =>
  c
    ? {
        ...normalizeListItem(c),
        members: (c.members ?? []).map((m) => ({
          ...m,
          role: toEnum(ConversationMemberRole, m.role, ConversationMemberRole.Member),
        })),
      }
    : c

export class ChatService {
  constructor(private readonly apiBaseUrl: string) {}

  async getConversations(search?: string, scope: ConversationScope = 'active'): Promise<ConversationListItem[]> {
    const response = await axiosClient.get<ApiResponse<ConversationListItem[]>>('/api/v1/conversations', { params: { search, scope } })
    return (response.data.data ?? []).map(normalizeListItem)
  }

  async getConversation(id: string): Promise<ConversationDetail> {
    const response = await axiosClient.get<ApiResponse<ConversationDetail>>(`/api/v1/conversations/${id}`)
    return normalizeDetail(response.data.data ?? null) as ConversationDetail
  }

  async getMessages(id: string, before?: string, limit = 30): Promise<Message[]> {
    const response = await axiosClient.get<ApiResponse<Message[] | MessagePage>>(`/api/v1/conversations/${id}/messages`, { params: { before, limit } })
    const result = response.data.data
    if (Array.isArray(result)) return result
    return result?.items ?? result?.data ?? []
  }

  /** search và departmentId đều tuỳ chọn */
  async searchEmployees(search?: string, departmentId?: string): Promise<EmployeeSearchItem[]> {
    const response = await axiosClient.get<ApiResponse<EmployeeSearchItem[]>>('/api/v1/employees/search', {
      params: { search, departmentId },
    })
    return response.data.data ?? []
  }

  async getDepartments(): Promise<DepartmentItem[]> {
    const response = await axiosClient.get<
      ApiResponse<{
        items: DepartmentItem[]
        pageNumber: number
        pageSize: number
        totalCount: number
        totalPages: number
        hasPreviousPage: boolean
        hasNextPage: boolean
      }>
    >('/api/v1/departments/get-all')

    return response.data.data?.items ?? []
  }


  async createDirect(targetUserId: string): Promise<ConversationDetail> {
    const response = await axiosClient.post<ApiResponse<ConversationDetail>>(
      '/api/v1/conversations/direct',
      { targetUserId },
    )
    return normalizeDetail(response.data.data ?? null) as ConversationDetail
  }

  /** GIẢ ĐỊNH route: POST /api/v1/conversations/group */
  async createGroup(request: CreateGroupRequest): Promise<ConversationDetail> {
    const response = await axiosClient.post<ApiResponse<ConversationDetail>>(
      '/api/v1/conversations/group',
      request,
    )
    return normalizeDetail(response.data.data ?? null) as ConversationDetail
  }

    async sendMessage(conversationId: string, payload: SendMessagePayload): Promise<Message> {
    const response = await axiosClient.post<ApiResponse<Message>>(
      `/api/v1/conversations/${conversationId}/messages`,
      payload,
    )
    return response.data.data ?? null
  }

  // async uploadAttachment(
  //   conversationId: string,
  //   file: File,
  //   onProgress?: (percent: number) => void,
  // ): Promise<MessageAttachment> {
  //   const form = new FormData()
  //   form.append('file', file)
  //   const response = await axiosClient.post<ApiResponse<MessageAttachment>>(
  //     `/api/v1/conversations/${conversationId}/attachments`,
  //     form,
  //     {
  //       onUploadProgress: (e) => {
  //         if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total))
  //       },
  //     },
  //   )
  //   return response.data.data
  // }

async uploadAttachment(
  conversationId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MessageAttachment> {
  
  const form = new FormData();
  form.append('file', file);

  for (const [key, value] of form.entries()) {
  }

  const url =
    `/api/v1/conversations/${conversationId}/attachments`;



  try {
    const response =
      await axiosClient.post<ApiResponse<MessageAttachment>>(
        url,
        form,
        {
          onUploadProgress: (e) => {
            if (e.total) {
              const percent = Math.round(
                (e.loaded * 100) / e.total,
              );

            }
          },
        },
      );


    return response.data.data;
  } catch (error: unknown) {

    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      console.error(
        'Full response body:',
        JSON.stringify(responseData ?? null, null, 2),
      );

      console.error('Axios request:', error.config);
    } else {
      console.error('Unexpected error:', error);
    }

    throw error;
  } finally {
    console.groupEnd();
  }
}
  // Phải tải qua axios (có token), không dùng thẳng <img src>
  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const response = await axiosClient.get(`/api/v1/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    })
    return response.data
  }

  async addReaction(messageId: string, reactionType: MessageReactionType): Promise<void> {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/api/v1/messages/${messageId}/reactions`,
      { reactionType },
    )
    return response.data.data ?? null
  }
  async deleteConversation(conversationId: string): Promise<void> {
    await axiosClient.delete(
      `/api/v1/conversations/${conversationId}`,
    )
  }

  /** Bỏ lưu trữ: đưa hội thoại về danh sách chính */
  async unhideConversation(conversationId: string): Promise<void> {
    await axiosClient.post(`/api/v1/conversations/${conversationId}/unhide`)
  }

  /** Khôi phục nhóm đã giải tán (Owner) */
  async unarchiveConversation(conversationId: string): Promise<void> {
    await axiosClient.post(`/api/v1/conversations/${conversationId}/unarchive`)
  }

  async removeMember(conversationId: string, userId: string): Promise<void> {
    await axiosClient.delete(`/api/v1/conversations/${conversationId}/members/${userId}`)
  }

  async addMembers(conversationId: string, userIds: string[]): Promise<ConversationDetail> {
    const response = await axiosClient.post<ApiResponse<ConversationDetail>>(
      `/api/v1/conversations/${conversationId}/members`,
      { userIds },
    )
    return normalizeDetail(response.data.data ?? null) as ConversationDetail
  }

  async changeMemberRole(
    conversationId: string,
    userId: string,
    role: ConversationMemberRole,
  ): Promise<void> {
    await axiosClient.put(`/api/v1/conversations/${conversationId}/members/${userId}/role`, { role })
  }

  async transferOwnership(conversationId: string, newOwnerUserId: string): Promise<void> {
    await axiosClient.post(`/api/v1/conversations/${conversationId}/transfer-ownership`, {
      newOwnerUserId,
    })
  }

  async updateConversation(
    conversationId: string,
    payload: { name?: string | null; description?: string | null; avatarUrl?: string | null },
  ): Promise<ConversationDetail> {
    const response = await axiosClient.put<ApiResponse<ConversationDetail>>(
      `/api/v1/conversations/${conversationId}`,
      payload,
    )
    return normalizeDetail(response.data.data ?? null) as ConversationDetail
  }

  async archiveConversation(conversationId: string): Promise<void> {
    await axiosClient.post(`/api/v1/conversations/${conversationId}/archive`)
  }
  async removeReaction(messageId: string): Promise<void> {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/v1/messages/${messageId}/reactions`,
    )
    return response.data.data ?? null
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