/**
 * Cấu hình tập trung duy nhất cho toàn bộ API & SignalR Realtime Hub của Frontend.
 * Khi deploy lên website chính thức có domain thật, chỉ cần đổi duy nhất biến:
 *   VITE_API_BASE_URL=https://api.yourdomain.com
 * trong file .env.production (hoặc biến môi trường lúc build).
 */

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim()

/** Base URL cho Axios / REST API (đã chuẩn hóa bỏ dấu '/' dư ở cuối) */
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

/** Origin gốc của Backend (bỏ hậu tố /api hoặc /api/v1 nếu có) để kết nối SignalR Hub */
export const API_ORIGIN = (() => {
  const withoutApiSuffix = API_BASE_URL.replace(/\/api(\/v\d+)?$/i, '')
  try {
    return new URL(withoutApiSuffix, window.location.origin).origin
  } catch {
    return withoutApiSuffix
  }
})()

/** Đường dẫn kết nối SignalR Hub dùng chung cho Chat, Notification và Project/Kanban Realtime */
export const CHAT_HUB_URL = `${API_ORIGIN}/hubs/chat`

