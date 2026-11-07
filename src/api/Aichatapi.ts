import type { AxiosResponse } from 'axios'
import { isAxiosError } from 'axios'

import axiosClient from './axiosClient'
import { aiChatConfig } from './Aichat.config'
import { AIChatApiResponse, ChatMessage, ChatSource, Conversation, SendMessageResult } from 'src/types/Aichat'

const base = aiChatConfig.apiPrefix
export const DEFAULT_TITLE = 'Cuộc trò chuyện mới'

/* ---------- Lỗi ---------- */

export class AIChatError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AIChatError'
    this.status = status
  }
}

type ErrorList = AIChatApiResponse<unknown>['errors'] | undefined

function firstErrorText(errors: ErrorList): string | undefined {
  const first = errors?.[0]
  if (typeof first === 'string') return first
  return first?.description || first?.code
}

/** Chuyển mọi lỗi (axios, wrapper isSuccess=false, lỗi lạ) thành AIChatError có thông báo tiếng Việt. */
export function toAIChatError(error: unknown): AIChatError {
  if (error instanceof AIChatError) return error

  if (isAxiosError<{ message?: string; errors?: ErrorList }>(error)) {
    const status = error.response?.status
    const data = error.response?.data
    if (error.code === 'ECONNABORTED') {
      return new AIChatError('AI phản hồi quá lâu. Hãy thử lại sau ít phút.', status)
    }
    if (!error.response) {
      return new AIChatError('Không kết nối được tới máy chủ. Kiểm tra mạng hoặc Backend.', status)
    }
    if (status === 429) {
      return new AIChatError('Bạn gửi quá nhiều yêu cầu. Hãy chờ một chút rồi thử lại.', status)
    }
    const text = firstErrorText(data?.errors) || data?.message
    if (text) return new AIChatError(text, status)
    if (status === 404) return new AIChatError('Không tìm thấy dữ liệu yêu cầu.', status)
    return new AIChatError('Máy chủ gặp lỗi. Hãy thử lại sau.', status)
  }

  return new AIChatError(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.')
}

/* ---------- Chuẩn hóa dữ liệu (chịu được camelCase/PascalCase) ---------- */

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null

function pick(o: Obj, ...keys: string[]): unknown {
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== null) return o[k]
  }
  return undefined
}

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : v === undefined || v === null ? fallback : String(v)

/** Backend bọc trong ApiResponse<T>; nếu trả thẳng thì dùng luôn. */
function unwrap<T>(body: unknown): T {
  if (isObj(body) && 'isSuccess' in body) {
    const res = body as unknown as AIChatApiResponse<T>
    if (!res.isSuccess) {
      throw new AIChatError(
        firstErrorText(res.errors) || res.message || 'Yêu cầu không thành công.',
        res.statusCode,
      )
    }
    return res.data as T
  }
  return body as T
}

function toList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (isObj(data)) {
    const items = pick(data, 'items', 'Items', 'data', 'Data')
    if (Array.isArray(items)) return items
  }
  return []
}

export function normalizeSources(raw: unknown): ChatSource[] {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  return value.filter(isObj).map((s) => ({
    sourceType: str(pick(s, 'sourceType', 'SourceType', 'type', 'Type'), 'Unknown'),
    sourceId: str(pick(s, 'sourceId', 'SourceId', 'id', 'Id')),
    title: str(pick(s, 'title', 'Title', 'name', 'Name')) || undefined,
    description: str(pick(s, 'description', 'Description', 'snippet', 'Snippet')) || undefined,
  }))
}

export function normalizeMessage(raw: unknown): ChatMessage {
  const o = isObj(raw) ? raw : {}
  const role = str(pick(o, 'role', 'Role')).toLowerCase()
  return {
    id: str(pick(o, 'id', 'Id', 'messageId', 'MessageId'), crypto.randomUUID()),
    role: role === 'user' ? 'user' : 'assistant',
    content: str(pick(o, 'content', 'Content', 'message', 'Message', 'answer', 'Answer', 'text')),
    sources: normalizeSources(pick(o, 'sources', 'Sources')),
    answerType: str(pick(o, 'answerType', 'AnswerType')) || undefined,
    createdAt: str(pick(o, 'createdAt', 'CreatedAt'), new Date().toISOString()),
    status: 'sent',
  }
}

export function normalizeConversation(raw: unknown): Conversation {
  const o = isObj(raw) ? raw : {}
  return {
    id: str(pick(o, 'id', 'Id', 'conversationId', 'ConversationId')),
    title: str(pick(o, 'title', 'Title')).trim() || DEFAULT_TITLE,
    lastMessageAt: str(pick(o, 'lastMessageAt', 'LastMessageAt')) || null,
    createdAt: str(pick(o, 'createdAt', 'CreatedAt')) || null,
  }
}

/* ---------- API ---------- */

/** Chạy request, bóc ApiResponse và chuyển mọi lỗi thành AIChatError. */
async function call<T>(request: () => Promise<AxiosResponse<unknown>>): Promise<T> {
  try {
    const response = await request()
    return unwrap<T>(response.data)
  } catch (e) {
    throw toAIChatError(e)
  }
}

export const aiChatApi = {
  createConversation: async (title?: string): Promise<Conversation> =>
    normalizeConversation(
      await call<unknown>(() => axiosClient.post(`${base}/conversations`, title ? { title } : {})),
    ),

  getConversations: async (): Promise<Conversation[]> =>
    toList(await call<unknown>(() => axiosClient.get(`${base}/conversations`))).map(
      normalizeConversation,
    ),

  getMessages: async (conversationId: string): Promise<ChatMessage[]> =>
    toList(
      await call<unknown>(() => axiosClient.get(`${base}/conversations/${conversationId}/messages`)),
    ).map(normalizeMessage),

  sendMessage: async (conversationId: string, message: string): Promise<SendMessageResult> => {
    const o = await call<unknown>(() =>
      axiosClient.post(
        `${base}/conversations/${conversationId}/messages`,
        { message, includeSources: true },
        { timeout: aiChatConfig.requestTimeoutMs },
      ),
    )
    const r = isObj(o) ? o : {}
    return {
      conversationId: str(pick(r, 'conversationId', 'ConversationId'), conversationId),
      messageId: str(pick(r, 'messageId', 'MessageId'), crypto.randomUUID()),
      answer: str(pick(r, 'answer', 'Answer')),
      answerType: str(pick(r, 'answerType', 'AnswerType')) || undefined,
      sources: normalizeSources(pick(r, 'sources', 'Sources')),
      createdAt: str(pick(r, 'createdAt', 'CreatedAt'), new Date().toISOString()),
    }
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await call<unknown>(() => axiosClient.delete(`${base}/conversations/${conversationId}`))
  },
}