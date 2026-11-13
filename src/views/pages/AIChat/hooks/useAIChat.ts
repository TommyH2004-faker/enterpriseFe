import { useCallback, useEffect, useRef, useState } from 'react'
import { usePersistentState } from './Usepersistentstate'
import { aiChatConfig } from 'src/api/Aichat.config'
import { ChatMessage, Conversation } from 'src/types/Aichat'
import { aiChatApi, DEFAULT_TITLE, toAIChatError } from 'src/api/Aichatapi'


interface Options {
  /** Chỉ gọi API sau khi người dùng mở widget lần đầu */
  enabled: boolean
  /** Gọi khi có câu trả lời mới (để báo chấm đỏ nếu widget đang đóng) */
  onAnswer?: () => void
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text

/**
 * Toàn bộ logic AI Chat. Không phụ thuộc router nên widget gắn ở layout
 * vẫn giữ nguyên state khi người dùng chuyển trang.
 */
export function useAIChat({ enabled, onAnswer }: Options) {
  const [activeId, setActiveId] = usePersistentState<string | null>(
    aiChatConfig.storageKeys.activeConversation,
    null,
  )
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeRef = useRef(activeId)
  activeRef.current = activeId
  const onAnswerRef = useRef(onAnswer)
  onAnswerRef.current = onAnswer
  const listLoadedRef = useRef(false)
  // Hội thoại vừa tạo trong lúc gửi: không tải lại tin nhắn để khỏi mất tin đang hiển thị
  const skipLoadRef = useRef<string | null>(null)

  const loadConversations = useCallback(async () => {
    setLoadingList(true)
    try {
      setConversations(await aiChatApi.getConversations())
    } catch (e) {
      setError(toAIChatError(e).message)
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    if (enabled && !listLoadedRef.current) {
      listLoadedRef.current = true
      void loadConversations()
    }
  }, [enabled, loadConversations])

  useEffect(() => {
    if (!enabled) return
    setError(null)
    if (!activeId) {
      setMessages([])
      return
    }
    if (skipLoadRef.current === activeId) {
      skipLoadRef.current = null
      return
    }
    let cancelled = false
    setMessages([])
    setLoadingMessages(true)
    aiChatApi
      .getMessages(activeId)
      .then((list) => {
        if (!cancelled) setMessages(list)
      })
      .catch((e) => {
        if (cancelled) return
        // Hội thoại đã lưu không còn hợp lệ (bị xóa hoặc thuộc tài khoản khác)
        const err = toAIChatError(e)
        if (err.status === 404 || err.status === 403) setActiveId(null)
        else setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, activeId, setActiveId])

  const selectConversation = useCallback((id: string) => setActiveId(id), [setActiveId])

  const startNewChat = useCallback(() => {
    setActiveId(null)
    setMessages([])
    setError(null)
  }, [setActiveId])

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || sending) return

      setError(null)
      const tempId = `tmp-${crypto.randomUUID()}`
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          role: 'user',
          content,
          sources: [],
          createdAt: new Date().toISOString(),
          status: 'sending',
        },
      ])
      setSending(true)

      let convId = activeRef.current
      try {
        if (!convId) {
          const created = await aiChatApi.createConversation()
          convId = created.id
          skipLoadRef.current = created.id
          activeRef.current = created.id
          setConversations((prev) => [created, ...prev])
          setActiveId(created.id)
        }

        const result = await aiChatApi.sendMessage(convId, content)

        if (activeRef.current === convId) {
          setMessages((prev) => [
            ...prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' as const } : m)),
            {
              id: result.messageId,
              role: 'assistant',
              content: result.answer,
              sources: result.sources,
              answerType: result.answerType,
              createdAt: result.createdAt,
              status: 'sent',
            },
          ])
        }

        const sentId = convId
        setConversations((prev) => {
          const current = prev.find((c) => c.id === sentId)
          if (!current) return prev
          const title = current.title === DEFAULT_TITLE ? truncate(content, 48) : current.title
          return [
            { ...current, title, lastMessageAt: result.createdAt },
            ...prev.filter((c) => c.id !== sentId),
          ]
        })
        onAnswerRef.current?.()
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' as const } : m)),
        )
        setError(toAIChatError(e).message)
      } finally {
        setSending(false)
      }
    },
    [sending, setActiveId],
  )

  const retryMessage = useCallback(
    (messageId: string) => {
      const failed = messages.find((m) => m.id === messageId)
      if (!failed) return
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      void sendMessage(failed.content)
    },
    [messages, sendMessage],
  )

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await aiChatApi.deleteConversation(id)
        setConversations((prev) => prev.filter((c) => c.id !== id))
        if (activeRef.current === id) startNewChat()
      } catch (e) {
        setError(toAIChatError(e).message)
      }
    },
    [startNewChat],
  )

  const activeTitle = conversations.find((c) => c.id === activeId)?.title

  return {
    activeId,
    activeTitle,
    conversations,
    messages,
    loadingList,
    loadingMessages,
    sending,
    error,
    dismissError: () => setError(null),
    selectConversation,
    startNewChat,
    sendMessage,
    retryMessage,
    deleteConversation,
  }
}

export type AIChatController = ReturnType<typeof useAIChat>