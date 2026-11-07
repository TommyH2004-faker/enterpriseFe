/**
 * Cấu hình tập trung cho widget AI Chat.
 */
export const aiChatConfig = {
  /** Tên hiển thị trên header */
  title: 'Trợ lý AI',
  /**
   * Đường dẫn API, tính từ baseURL của axiosClient (VITE_API_BASE_URL).
   * authApi gọi '/auth/...' nên giả định baseURL đã gồm '/api/v1'.
   * Nếu baseURL KHÔNG gồm '/api/v1' thì đổi thành '/api/v1/ai-chat'.
   */
  apiPrefix: '/ai-chat',
  /** Giới hạn độ dài câu hỏi (nên khớp validator ở Backend) */
  maxMessageLength: 2000,
  /** axiosClient mặc định timeout 10s, quá ngắn cho một lượt hỏi AI nên ghi đè ở đây */
  requestTimeoutMs: 90_000,
  /** Khóa localStorage để nhớ trạng thái widget */
  storageKeys: {
    open: 'aiChat:open',
    activeConversation: 'aiChat:activeConversationId',
  },
  /** Gợi ý ở màn hình chào */
  suggestions: [
    'Công việc của tôi gồm những gì?',
    'Tôi có bao nhiêu task quá hạn?',
    'Có bao nhiêu task đang ở trạng thái review?',
    'Tiến độ các dự án của tôi thế nào?',
    'Tìm các task liên quan đến SignalR',
  ],
  /** Đường dẫn mở nguồn dữ liệu trong app. Trả về undefined nếu không có trang chi tiết. */
  sourceRoutes: {
    Task: (id: string) => `/tasks/${id}`,
    Project: (id: string) => `/projects/${id}`,
  } as Record<string, ((id: string) => string) | undefined>,
}

/** Gọi khi đăng xuất (ví dụ trong authStorage.clearAuth) để không lộ hội thoại sang tài khoản khác. */
export function clearAIChatStorage(): void {
  try {
    Object.values(aiChatConfig.storageKeys).forEach((k) => localStorage.removeItem(k))
  } catch {
    /* bỏ qua */
  }
}