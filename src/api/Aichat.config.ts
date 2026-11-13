/**
 * Cấu hình tập trung cho widget AI Chat.
 */

export interface SuggestionGroup {
  id: 'personal' | 'project' | 'report' | 'guide'
  title: string
  icon: string
  items: string[]
}

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
  /** Nhóm câu hỏi gợi ý thông minh phân theo vai trò và nhu cầu thực tế */
  suggestionGroups: [
    {
      id: 'personal',
      title: 'Công việc cá nhân',
      icon: '📋',
      items: [
        'Hôm nay tôi có những công việc nào cần ưu tiên xử lý?',
        'Tôi có task nào đang bị quá hạn hoặc sắp đến hạn không?',
        'Liệt kê các công việc của tôi đang ở trạng thái In Progress',
      ],
    },
    {
      id: 'project',
      title: 'Tiến độ dự án',
      icon: '📊',
      items: [
        'Tổng quan tiến độ các dự án tôi đang quản lý hiện ra sao?',
        'Những công việc nào trong dự án đang chờ Review hoặc bị nghẽn?',
        'Tình hình phân bổ tải công việc của các thành viên trong dự án thế nào?',
      ],
    },
    {
      id: 'report',
      title: 'Quản trị & Báo cáo',
      icon: '🏢',
      items: [
        'Phòng ban của tôi hiện đang tham gia bao nhiêu dự án?',
        'Tỷ lệ hoàn thành công việc của các dự án trong tháng này đạt bao nhiêu %?',
        'Có bao nhiêu dự án đang ở trạng thái Hoạt động và Tạm dừng?',
      ],
    },
    {
      id: 'guide',
      title: 'Hướng dẫn hệ thống',
      icon: '💡',
      items: [
        'Hệ thống EnterpriseTaskManagement có những phân hệ và tính năng chính nào?',
        'Làm thế nào để tạo mới một dự án và thiết lập bảng Kanban?',
        'Vòng đời của một dự án gồm những trạng thái nào và chuyển đổi ra sao?',
      ],
    },
  ] as SuggestionGroup[],
  /** Gợi ý mặc định (tương thích ngược) */
  suggestions: [
    'Hôm nay tôi có những công việc nào cần ưu tiên xử lý?',
    'Tôi có task nào đang bị quá hạn hoặc sắp đến hạn không?',
    'Tổng quan tiến độ các dự án tôi đang quản lý hiện ra sao?',
    'Hệ thống EnterpriseTaskManagement có những phân hệ và tính năng chính nào?',
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
