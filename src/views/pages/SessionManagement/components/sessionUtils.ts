import type { SessionManagementItem } from 'src/types/sessionManagement'

export type SessionState = 'active' | 'expired' | 'revoked'

export const getSessionState = (
  session: SessionManagementItem,
): SessionState => {
  if (session.isRevoked) return 'revoked'
  if (!session.isActive) return 'expired'
  return 'active'
}

const toTime = (value: string | null | undefined): number | null => {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

export const formatDate = (value: string | null | undefined): string => {
  const time = toTime(value)
  if (time === null) return '—'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(time))
}

/** "5 phút trước", "2 giờ trước"... Quá 7 ngày thì hiện ngày giờ. */
export const formatRelativePast = (
  value: string | null | undefined,
): string => {
  const time = toTime(value)
  if (time === null) return '—'

  const minutes = Math.floor((Date.now() - time) / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`

  return formatDate(value)
}

/** "còn 3 giờ" – trả về null nếu đã hết hạn hoặc không có dữ liệu. */
export const formatRemaining = (
  value: string | null | undefined,
): string | null => {
  const time = toTime(value)
  if (time === null) return null

  const minutes = Math.floor((time - Date.now()) / 60000)
  if (minutes <= 0) return null
  if (minutes < 60) return `còn ${minutes} phút`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `còn ${hours} giờ`

  return `còn ${Math.floor(hours / 24)} ngày`
}

/** Rút gọn User-Agent thành "Chrome trên Windows". */
export const parseUserAgent = (ua: string | null | undefined): string => {
  if (!ua) return 'Không xác định'

  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : null

  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad|iPod/.test(ua)
        ? 'iOS'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : null

  if (browser && os) return `${browser} trên ${os}`
  return browser ?? os ?? 'Không xác định'
}