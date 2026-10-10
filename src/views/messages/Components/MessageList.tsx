import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChatService,
  Message,
  MessageReactionType,
  ReplyPreview,
} from 'src/services/chatService'

import MessageItem from './MessageItem'
import { initialOf } from '../utils/utils'

interface Props {
  messages: Message[]
  currentUserId: string
  avatarText: string
  isGroup: boolean
  reactingId: string | null
  service: ChatService
  nameOf: (userId: string) => string
  onReact: (message: Message, type: MessageReactionType) => void
  onReply: (message: Message) => void
}

const MessageList: React.FC<Props> = ({
  messages,
  currentUserId,
  avatarText,
  isGroup,
  reactingId,
  service,
  nameOf,
  onReact,
  onReply,
}) => {
  const streamRef = useRef<HTMLElement>(null)
  const [pickerId, setPickerId] = useState<string | null>(null)
  const byId = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages])

  // Chỉ cuộn khung tin nhắn, không cuộn cả trang
  useEffect(() => {
    const el = streamRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (!pickerId) return
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.msg-actions')) setPickerId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [pickerId])

  const previewFor = (m: Message): ReplyPreview | null => {
    if (m.replyTo) return m.replyTo
    if (!m.replyToMessageId) return null
    const original = byId.get(m.replyToMessageId)
    return original
      ? {
          id: original.id,
          senderId: original.senderId,
          senderName: original.senderName,
          content: original.content,
          isDeleted: original.isDeleted,
        }
      : { id: m.replyToMessageId, senderId: '', content: null, isDeleted: false }
  }

  const jumpTo = (id: string) => {
    const stream = streamRef.current
    const el = stream?.querySelector<HTMLElement>(`[data-message-id="${id}"]`)
    if (!stream || !el) return
    stream.scrollTo({
      top: el.offsetTop - stream.clientHeight / 2 + el.clientHeight / 2,
      behavior: 'smooth',
    })
    el.classList.add('flash')
    window.setTimeout(() => el.classList.remove('flash'), 1500)
  }

  return (
    <section className="message-stream" ref={streamRef}>
      {messages.map((m, i) => {
        const prev = messages[i - 1]
        const next = messages[i + 1]
        const isMine = m.senderId === currentUserId
        const isFirst = !prev || prev.senderId !== m.senderId
        const senderLabel = m.senderName || nameOf(m.senderId)

        return (
          <MessageItem
            key={m.id}
            message={m}
            isMine={isMine}
            isFirstInGroup={isFirst}
            isLastInGroup={!next || next.senderId !== m.senderId}
            showSender={isGroup && !isMine && isFirst}
            senderLabel={senderLabel}
            avatarText={isGroup ? initialOf(senderLabel) : avatarText}
            currentUserId={currentUserId}
            pickerOpen={pickerId === m.id}
            reacting={reactingId === m.id}
            service={service}
            nameOf={nameOf}
            replyPreview={previewFor(m)}
            onReply={() => onReply(m)}
            onJumpTo={jumpTo}
            onTogglePicker={() => setPickerId((c) => (c === m.id ? null : m.id))}
            onReact={(type) => {
              setPickerId(null)
              onReact(m, type)
            }}
          />
        )
      })}
    </section>
  )
}

export default MessageList