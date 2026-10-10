import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HubConnection, HubConnectionState } from '@microsoft/signalr'
import { authStorage } from 'src/services/authStorage'
import {
  ChatService,
  ConversationDetail,
  ConversationListItem,
  CreateGroupRequest,
  EmployeeSearchItem,
  Message,
  MessageReactionType,
  SendMessagePayload,
} from 'src/services/chatService'
import {
  apiBaseUrl,
  getCurrentUserId,
  notifyUnreadChanged,
  sortConversations,
} from '../utils/utils'

const errorText = (e: unknown, fallback: string) =>
  e instanceof Error ? e.message : fallback

export const useChat = () => {
  const service = useMemo(() => new ChatService(apiBaseUrl), [])
  const currentUserId = useMemo(getCurrentUserId, [])
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const connectionRef = useRef<HubConnection | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const queryRef = useRef('')

  const [conversations, setConversations] = useState<
    ConversationListItem[]
  >([])

  const [active, setActive] =
    useState<ConversationDetail | null>(null)

  const [messages, setMessages] = useState<Message[]>([])

  const [query, setQuery] = useState('')

  const [loading, setLoading] = useState(true)

  const [sending, setSending] = useState(false)

  const [reactingId, setReactingId] =
    useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  /* =========================================================
     CONVERSATIONS
     ========================================================= */

  const loadConversations = useCallback(async () => {
    try {
      setError(null)

      const result = await service.getConversations(
        queryRef.current || undefined,
      )

      setConversations(sortConversations(result))
    } catch (e) {
      setError(
        errorText(
          e,
          'Không thể tải danh sách hội thoại.',
        ),
      )
    }
  }, [service])

  const upsertConversation = useCallback(
    (c: ConversationListItem) => {
      if (!c?.id) return

      setConversations((current) =>
        sortConversations([
          c,
          ...current.filter((item) => item.id !== c.id),
        ]),
      )
    },
    [],
  )

  /* =========================================================
     SEARCH + INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    queryRef.current = query

    const timer = window.setTimeout(
      () =>
        void loadConversations().finally(() =>
          setLoading(false),
        ),
      query ? 300 : 0,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [query, loadConversations])

  /* =========================================================
     OPEN CONVERSATION
     ========================================================= */

  const openConversation = async (
    item: Pick<ConversationListItem, 'id'>,
  ) => {
    try {
      if (!item?.id) {
        throw new Error('Conversation không có id.')
      }

      setLoading(true)

      const [detail, history] = await Promise.all([
        service.getConversation(item.id),
        service.getMessages(item.id),
      ])

      const connection = connectionRef.current

      if (
        connection?.state === HubConnectionState.Connected
      ) {
        await connection.invoke(
          'JoinConversation',
          item.id,
        )
      }

      activeIdRef.current = detail.id

      setActive(detail)
      setMessages(history)

      const last = history[history.length - 1]

      if (last) {
        await service.markAsRead(item.id, last.id)
      }

      notifyUnreadChanged()
    } catch (e) {
      setError(
        errorText(
          e,
          'Không thể mở hội thoại.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     DIRECT CHAT
     ========================================================= */

  const startDirectChat = async (
    person: EmployeeSearchItem,
  ) => {
    if (!person?.userId) {
      setError(
        'Không tìm thấy userId của nhân viên.',
      )
      return false
    }

    if (person.userId === currentUserId) {
      setError(
        'Bạn không thể chat với chính mình.',
      )
      return false
    }

    try {
      const detail =
        await service.createDirect(person.userId)

      if (!detail?.id) {
        throw new Error(
          'API tạo cuộc trò chuyện không trả về conversation id.',
        )
      }

      await loadConversations()
      await openConversation(detail)

      return true
    } catch (e) {
      setError(
        errorText(
          e,
          'Không thể tạo cuộc trò chuyện.',
        ),
      )

      return false
    }
  }

  /* =========================================================
     CREATE GROUP
     ========================================================= */

  const createGroup = async (
    request: CreateGroupRequest,
  ): Promise<string | null> => {
    try {
      const detail =
        await service.createGroup(request)

      if (!detail?.id) {
        return 'API tạo nhóm không trả về conversation id.'
      }

      await loadConversations()
      await openConversation(detail)

      return null
    } catch (e) {
      return errorText(
        e,
        'Không thể tạo nhóm.',
      )
    }
  }
  /* =========================================================
   HIDE CONVERSATION
   ========================================================= */

const deleteConversation = async (
  conversationId: string,
): Promise<string | null> => {
  try {
    setError(null)

    await service.deleteConversation(conversationId)

    setConversations((previous) =>
      previous.filter((item) => item.id !== conversationId),
    )

    if (activeIdRef.current === conversationId) {
      activeIdRef.current = null
      setActive(null)
      setMessages([])
      setReplyTo(null)
    }

    notifyUnreadChanged()

    return null
  } catch (error) {
    console.error('Không thể ẩn cuộc trò chuyện:', error)

    return errorText(
      error,
      'Không thể ẩn cuộc trò chuyện. Vui lòng thử lại.',
    )
  }
}
  /* =========================================================
     MESSAGES
     ========================================================= */

  const addMessage = useCallback(
    (message: Message) => {
      if (!message?.id) {
        return
      }

      if (
        message.conversationId &&
        message.conversationId !==
          activeIdRef.current
      ) {
        return
      }

      setMessages((current) => {
        const exists = current.some(
          (item) =>
            item.id === message.id ||
            (
              message.clientMessageId &&
              item.clientMessageId ===
                message.clientMessageId
            ),
        )

        if (exists) {
          return current
        }

        return [...current, message]
      })
    },
    [],
  )

  /* =========================================================
     SEND MESSAGE
     ========================================================= */

    const sendMessage = async (payload: Omit<SendMessagePayload, 'clientMessageId'>) => {
    const attachmentIds = payload.attachmentIds ?? []
    if (!active || sending || (!payload.content.trim() && !attachmentIds.length)) return false

    const body: SendMessagePayload = {
      content: payload.content,
      clientMessageId: crypto.randomUUID(),
      replyToMessageId: replyTo?.id ?? null,
      mentionedUserIds: payload.mentionedUserIds ?? [],
      attachmentIds,
    }

    setSending(true)
    try {
      const connection = connectionRef.current
      if (connection?.state === HubConnectionState.Connected) {
        await connection.invoke(
          'SendMessage',
          active.id,
          body.content,
          body.clientMessageId,
          body.replyToMessageId,
          body.mentionedUserIds,
          body.attachmentIds,
        )
      } else {
        addMessage(await service.sendMessage(active.id, body))
      }
      setReplyTo(null)
      return true
    } catch (e) {
      setError(errorText(e, 'Không thể gửi tin nhắn.'))
      return false
    } finally {
      setSending(false)
    }
  }

 
const uploadAttachment = (
  file: File,
  onProgress?: (percent: number) => void,
) => {


  if (!active?.id) {
    console.error('Không có conversation đang được chọn');
    console.groupEnd();
    return Promise.reject(
      new Error('Chưa chọn cuộc trò chuyện.'),
    );
  }

  if (!(file instanceof File)) {
    console.error('Đối số file không phải File object');
    console.groupEnd();
    return Promise.reject(
      new Error('File không hợp lệ.'),
    );
  }

  console.log('Gọi service.uploadAttachment:', active.id);

  return service
    .uploadAttachment(active.id, file, (percent) => {
      console.log('Upload progress:', percent);
      onProgress?.(percent);
    })
    .then((result) => {
      console.log('Upload response:', result);
      return result;
    })
    .catch((error) => {
      console.error('Upload error:', error);
      console.error('HTTP status:', error?.response?.status);
      console.error('Response data:', error?.response?.data);
      console.error('Request URL:', error?.config?.url);
      console.error('Request method:', error?.config?.method);
      throw error;
    })
    .finally(() => {
      console.groupEnd();
    });
};
  /* =========================================================
     REACTIONS
     ========================================================= */

  const toggleReaction = async (
    message: Message,
    type: MessageReactionType,
  ) => {
    if (
      !message?.id ||
      message.isDeleted ||
      reactingId === message.id
    ) {
      return
    }

    const mine = (
      message.reactions ?? []
    ).find(
      (reaction) =>
        reaction.userId === currentUserId,
    )

    try {
      setError(null)
      setReactingId(message.id)

      /*
       * QUAN TRỌNG:
       *
       * Không update messages ở đây.
       *
       * Backend sau khi xử lý reaction sẽ gửi:
       *
       * ReactionChanged
       *
       * cho tất cả active member.
       *
       * onReactionChanged() bên dưới
       * là nơi duy nhất update UI.
       */

      if (
        mine &&
        mine.reactionType === type
      ) {
        // Đã có đúng reaction này
        // => remove
        await service.removeReaction(
          message.id,
        )
      } else {
        // Chưa có reaction
        // hoặc đang có reaction khác
        // => add/change
        await service.addReaction(
          message.id,
          type,
        )
      }
    } catch (e) {
      setError(
        errorText(
          e,
          'Không thể cập nhật cảm xúc.',
        ),
      )
    } finally {
      setReactingId(null)
    }
  }

  /* =========================================================
     SIGNALR
     ========================================================= */

  useEffect(() => {
    const connection =
      service.createConnection(
        authStorage.getAccessToken() || '',
      )

    connectionRef.current =
      connection

    /* -------------------------------------------------------
       Conversation events
       ------------------------------------------------------- */

    const onConversation = (
      payload?:
        | ConversationListItem
        | ConversationDetail,
    ) => {
      if (
        payload?.id &&
        payload.lastActivityAt &&
        typeof payload.unreadCount ===
          'number'
      ) {
        upsertConversation(
          payload as ConversationListItem,
        )
      } else {
        void loadConversations()
      }
    }

    /* -------------------------------------------------------
       Message payload
       ------------------------------------------------------- */

    const getPayload = (
      ...args: unknown[]
    ): Message | null => {
      const candidate =
        args.length > 1
          ? args[1]
          : args[0]

      if (
        !candidate ||
        typeof candidate !== 'object'
      ) {
        return null
      }

      const message =
        candidate as Message

      if (
        args.length > 1 &&
        typeof args[0] === 'string' &&
        !message.conversationId
      ) {
        message.conversationId =
          args[0]
      }

      return message
    }

    /* -------------------------------------------------------
       Check active conversation
       ------------------------------------------------------- */

    const inActive = (
      message: Message,
    ) =>
      !message.conversationId ||
      message.conversationId ===
        activeIdRef.current

    /* -------------------------------------------------------
       Replace message
       ------------------------------------------------------- */

    const replace = (
      message: Message,
    ) => {
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? message
            : item,
        ),
      )
    }

    /* -------------------------------------------------------
       Message received
       ------------------------------------------------------- */

    const onReceived = (
      ...args: unknown[]
    ) => {
      const message =
        getPayload(...args)

      if (!message) {
        return
      }

      addMessage(message)

      void loadConversations()

      notifyUnreadChanged()
    }

    /* -------------------------------------------------------
       Message edited
       ------------------------------------------------------- */

    const onEdited = (
      ...args: unknown[]
    ) => {
      const message =
        getPayload(...args)

      if (
        message &&
        inActive(message)
      ) {
        replace(message)
      }
    }

    /* -------------------------------------------------------
       Message deleted
       ------------------------------------------------------- */

    const onDeleted = (
      ...args: unknown[]
    ) => {
      const message =
        getPayload(...args)

      if (
        !message ||
        !inActive(message)
      ) {
        return
      }

      replace(message)

      void loadConversations()
    }

    /* =======================================================
       REACTION CHANGED

       Đây là nơi DUY NHẤT update reaction UI.
       ======================================================= */

    const onReactionChanged = (
      payload: {
        conversationId: string
        messageId: string
        userId: string
        reactionType: number | null
        removed: boolean
        reactedAt: string
      },
    ) => {
      if (!payload?.messageId) {
        return
      }

      /*
       * Event của conversation khác
       * thì bỏ qua.
       */
      if (
        payload.conversationId &&
        payload.conversationId !==
          activeIdRef.current
      ) {
        return
      }

      setMessages((current) =>
        current.map((message) => {
          if (
            message.id !==
            payload.messageId
          ) {
            return message
          }

          const reactions =
            message.reactions ?? []

          /*
           * REMOVE
           *
           * Xóa reaction của đúng user.
           */
          if (
            payload.removed ||
            payload.reactionType == null
          ) {
            return {
              ...message,
              reactions:
                reactions.filter(
                  (reaction) =>
                    reaction.userId !==
                    payload.userId,
                ),
            }
          }

          /*
           * CHANGE / ADD
           *
           * Tìm reaction của user.
           */
          const existing =
            reactions.find(
              (reaction) =>
                reaction.userId ===
                payload.userId,
            )

          /*
           * User đã có reaction
           *
           * => UPDATE
           *
           * Không push thêm.
           */
          if (existing) {
            return {
              ...message,
              reactions:
                reactions.map(
                  (reaction) =>
                    reaction.userId ===
                    payload.userId
                      ? {
                          ...reaction,
                          reactionType:
                            payload.reactionType!,
                          reactedAt:
                            payload.reactedAt,
                        }
                      : reaction,
                ),
            }
          }

          /*
           * User chưa có reaction
           *
           * => ADD
           */
          return {
            ...message,
            reactions: [
              ...reactions,
              {
                userId:
                  payload.userId,
                reactionType:
                  payload.reactionType!,
                reactedAt:
                  payload.reactedAt,
              },
            ],
          }
        }),
      )
    }

    /* -------------------------------------------------------
       Unread
       ------------------------------------------------------- */

    const onUnread = () => {
      void loadConversations()
      notifyUnreadChanged()
    }
    
    /* -------------------------------------------------------
       Reconnected
       ------------------------------------------------------- */

    const onReconnected =
      async () => {
        const id =
          activeIdRef.current

        if (
          id &&
          connection.state ===
            HubConnectionState.Connected
        ) {
          try {
            await connection.invoke(
              'JoinConversation',
              id,
            )
          } catch (e) {
            console.error(
              'JoinConversation sau reconnect thất bại:',
              e,
            )
          }
        }

        await loadConversations()
      }

    /* =======================================================
       REGISTER SIGNALR EVENTS
       ======================================================= */

    connection.on(
      'ConversationCreated',
      onConversation,
    )

    connection.on(
      'ConversationUpdated',
      onConversation,
    )

    connection.on(
      'ReactionChanged',
      onReactionChanged,
    )

    connection.on(
      'MessageReceived',
      onReceived,
    )

    connection.on(
      'MessageEdited',
      onEdited,
    )

    connection.on(
      'MessageDeleted',
      onDeleted,
    )

    connection.on(
      'UnreadChanged',
      onUnread,
    )

    connection.onreconnected(
      onReconnected,
    )

    /* =======================================================
       START CONNECTION
       ======================================================= */

    void connection
      .start()
      .catch((e) => {
        setError(
          errorText(
            e,
            'Không thể kết nối chat realtime.',
          ),
        )
      })

    /* =======================================================
       CLEANUP
       ======================================================= */

    return () => {
      connection.off(
        'ConversationCreated',
        onConversation,
      )

      connection.off(
        'ConversationUpdated',
        onConversation,
      )

      connection.off(
        'ReactionChanged',
        onReactionChanged,
      )

      connection.off(
        'MessageReceived',
        onReceived,
      )

      connection.off(
        'MessageEdited',
        onEdited,
      )

      connection.off(
        'MessageDeleted',
        onDeleted,
      )

      connection.off(
        'UnreadChanged',
        onUnread,
      )

      /*
       * Quan trọng:
       * Hủy callback reconnect.
       */
      connection.onreconnected(
        onReconnected,
      )

      void connection.stop()

      connectionRef.current = null
    }
  }, [
    service,
    addMessage,
    loadConversations,
    upsertConversation,
  ])

  /* =========================================================
     RETURN
     ========================================================= */

  
return {
  service,
  currentUserId,

  conversations,
  active,
  messages,

  query,
  setQuery,

  loading,
  sending,
  reactingId,
  error,

  // Hội thoại
  loadConversations,
  openConversation,
  startDirectChat,
  createGroup,
  deleteConversation,

  // Tin nhắn
  sendMessage,
  replyTo,
  setReplyTo,
  uploadAttachment,

  // Reaction
  toggleReaction,
}
}