import { authStorage } from 'src/services/authStorage'
import {
  ConversationListItem,
  Message,
  MessageReactionType,
} from 'src/services/chatService'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export const getCurrentUserId = () => {
  const token = authStorage.getAccessToken()
  if (!token) return ''
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    return (
      payload.sub ||
      payload.nameid ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      ''
    )
  } catch {
    return ''
  }
}

export const initialOf = (value: string) =>
  value.trim().charAt(0).toUpperCase() || '?'

export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

export const notifyUnreadChanged = () =>
  window.dispatchEvent(new Event('chat:unread-changed'))

export const reactionOptions = [
  { type: MessageReactionType.Like, emoji: '👍', label: 'Like' },
  { type: MessageReactionType.Love, emoji: '❤️', label: 'Love' },
  { type: MessageReactionType.Laugh, emoji: '😂', label: 'Laugh' },
  { type: MessageReactionType.Wow, emoji: '😮', label: 'Wow' },
  { type: MessageReactionType.Sad, emoji: '😢', label: 'Sad' },
  { type: MessageReactionType.Angry, emoji: '😡', label: 'Angry' },
  { type: MessageReactionType.Celebrate, emoji: '🎉', label: 'Celebrate' },
  { type: MessageReactionType.Rocket, emoji: '🚀', label: 'Rocket' },
]

export const getReactionEmoji = (type: MessageReactionType) =>
  reactionOptions.find((item) => item.type === type)?.emoji || '👍'

export const sortConversations = (items: ConversationListItem[]) =>
  [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return (
      new Date(b.lastActivityAt || 0).getTime() -
      new Date(a.lastActivityAt || 0).getTime()
    )
  })

/** Gom reaction theo loại: 👍 👍 ❤️ => 👍2 ❤️1 */
export const groupReactions = (message: Message, currentUserId: string) => {
  const groups: {
    type: MessageReactionType
    emoji: string
    count: number
    reactedByMe: boolean
  }[] = []

  for (const r of message.reactions ?? []) {
    const mine = r.userId === currentUserId
    const existing = groups.find((g) => g.type === r.reactionType)
    if (existing) {
      existing.count += 1
      existing.reactedByMe ||= mine
    } else {
      groups.push({
        type: r.reactionType,
        emoji: getReactionEmoji(r.reactionType),
        count: 1,
        reactedByMe: mine,
      })
    }
  }
  return groups
}