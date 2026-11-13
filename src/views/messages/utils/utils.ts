import { authStorage } from 'src/services/authStorage'
import {
  ConversationListItem,
  Message,
  MessageReactionType,
} from 'src/services/chatService'

import { API_ORIGIN } from 'src/config/env'

export const apiBaseUrl = API_ORIGIN

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

export const initialOf = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

export const formatConversationTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  if (isYesterday) {
    return 'Hôm qua'
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    const days = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']
    return days[date.getDay()]
  }

  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

export const formatLastSeen = (dateStr?: string | null): string => {
  if (!dateStr) return 'Ngoại tuyến'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Ngoại tuyến'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return 'Vừa mới truy cập'

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) {
    return 'Vừa mới truy cập'
  }
  if (diffMin < 60) {
    return `Hoạt động ${diffMin} phút trước`
  }
  if (diffHour < 24) {
    return `Hoạt động ${diffHour} giờ trước`
  }
  if (diffDay === 1) {
    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    return `Hoạt động hôm qua lúc ${timeStr}`
  }
  if (diffDay < 7) {
    return `Hoạt động ${diffDay} ngày trước`
  }

  const dateFormatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  return `Hoạt động ngày ${dateFormatted}`
}

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