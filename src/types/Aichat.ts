export type ChatRole = 'user' | 'assistant'

/** Màn hình đang hiển thị trong khung chat */
export type ChatView = 'chat' | 'history'

export interface ChatSource {
  sourceType: string
  sourceId: string
  title?: string
  description?: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  sources: ChatSource[]
  answerType?: string
  createdAt: string
  /** Chỉ dùng ở phía client cho tin nhắn vừa gửi */
  status?: 'sending' | 'sent' | 'failed'
}

export interface Conversation {
  id: string
  title: string
  lastMessageAt?: string | null
  createdAt?: string | null
}

export interface SendMessageResult {
  conversationId: string
  messageId: string
  answer: string
  answerType?: string
  sources: ChatSource[]
  createdAt: string
}

/** Giống ApiResponse<T> của authApi; khai báo lại để module AI Chat độc lập. */
export interface AIChatApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  data: T | null
  errors: Array<string | { code?: string; description?: string }>
}