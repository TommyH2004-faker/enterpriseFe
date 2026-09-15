export const ROLE_MESSAGES = {
  // ============================================
  // PAGE TITLE & DESC
  // ============================================
  PAGE_TITLE: 'Quản lý vai trò',
  PAGE_DESC: 'Quản lý các vai trò và quyền truy cập trong hệ thống.',

  // ============================================
  // BUTTONS
  // ============================================
  BTN_ADD_ROLE: 'Thêm vai trò',
  BTN_EDIT: 'Chỉnh sửa',
  BTN_PERMISSIONS: 'Phân quyền',
  BTN_DELETE: 'Xóa',
  BTN_CREATE: 'Tạo vai trò',
  BTN_UPDATE: 'Cập nhật',
  BTN_CANCEL: 'Hủy',
  BTN_SAVE: 'Đang lưu...',
  BTN_DELETE_CONFIRM: 'Xóa vai trò',
  BTN_DELETE_LOADING: 'Đang xóa...',

  // ============================================
  // MODAL TITLES
  // ============================================
  MODAL_TITLE_CREATE: 'Thêm vai trò',
  MODAL_TITLE_UPDATE: 'Cập nhật vai trò',
  MODAL_TITLE_DELETE: 'Xác nhận xóa vai trò',

  // ============================================
  // FORM LABELS
  // ============================================
  LABEL_CODE: 'Mã vai trò',
  LABEL_NAME: 'Tên vai trò',
  LABEL_DESCRIPTION: 'Mô tả',

  // ============================================
  // FORM PLACEHOLDERS
  // ============================================
  PLACEHOLDER_SEARCH: 'Tìm kiếm theo mã, tên hoặc mô tả...',
  PLACEHOLDER_CODE: 'Ví dụ: PROJECT_MANAGER',
  PLACEHOLDER_NAME: 'Ví dụ: Project Manager',
  PLACEHOLDER_DESCRIPTION: 'Nhập mô tả cho vai trò...',

  // ============================================
  // FORM HELPERS
  // ============================================
  HELPER_CODE: 'Mã dùng để định danh vai trò trong hệ thống.',
  CODE_REQUIRED: 'Mã vai trò không được để trống.',
  CODE_MAX_LENGTH: 'Mã vai trò không được vượt quá 50 ký tự.',
  NAME_REQUIRED: 'Tên vai trò không được để trống.',
  NAME_MAX_LENGTH: 'Tên vai trò không được vượt quá 150 ký tự.',
  DESC_REQUIRED: 'Mô tả không được để trống.',
  DESC_MAX_LENGTH: 'Mô tả không được vượt quá 500 ký tự.',

  // ============================================
  // TABLE HEADERS
  // ============================================
  TABLE_HEADER_ID: '#',
  TABLE_HEADER_CODE: 'Mã vai trò',
  TABLE_HEADER_NAME: 'Tên vai trò',
  TABLE_HEADER_DESC: 'Mô tả',
  TABLE_HEADER_ACTIONS: 'Thao tác',

  // ============================================
  // STATISTICS
  // ============================================
  STAT_TOTAL_ROLES: 'Tổng số vai trò',
  STAT_TOTAL_COUNT: 'Tổng cộng: {count} vai trò',

  // ============================================
  // EMPTY STATE
  // ============================================
  EMPTY_NO_ROLES: 'Không có vai trò',
  EMPTY_NO_RESULTS: 'Không tìm thấy vai trò phù hợp với từ khóa tìm kiếm.',
  EMPTY_NO_DATA: 'Chưa có vai trò nào trong hệ thống.',

  // ============================================
  // PAGINATION
  // ============================================
  PAGINATION_SHOWING: 'Hiển thị {start} - {end} trong tổng số {total}',
  PAGINATION_PREV: 'Trước',
  PAGINATION_NEXT: 'Sau',

  // ============================================
  // DELETE MODAL
  // ============================================
  DELETE_CONFIRM_MSG: 'Bạn có chắc chắn muốn xóa vai trò này không?',
  DELETE_WARNING: 'Không thể xóa vai trò nếu vai trò đang được sử dụng hoặc đang được gán cho người dùng.',
  DELETE_LABEL_CODE: 'Mã:',
  DELETE_LABEL_NAME: 'Tên:',
  DELETE_LABEL_DESC: 'Mô tả:',

  // ============================================
  // TOAST MESSAGES
  // ============================================
  TOAST_CREATE_SUCCESS: 'Tạo vai trò thành công.',
  TOAST_UPDATE_SUCCESS: 'Cập nhật vai trò thành công.',
  TOAST_DELETE_SUCCESS: 'Xóa vai trò thành công.',
  TOAST_DELETE_ERROR: 'Không thể xóa vai trò.',
  TOAST_SAVE_ERROR: 'Không thể lưu vai trò.',
  TOAST_LOAD_ERROR: 'Không thể tải danh sách vai trò.',

  // ============================================
  // TOOLTIPS
  // ============================================
  TOOLTIP_EDIT: 'Chỉnh sửa',
  TOOLTIP_PERMISSIONS: 'Phân quyền',
  TOOLTIP_DELETE: 'Xóa',

  // ============================================
  // CHAR COUNTER
  // ============================================
  CHAR_COUNTER: '{current}/500',
} as const

export const ROLE_VALIDATION = {
  CODE_MIN: 1,
  CODE_MAX: 50,
  NAME_MIN: 1,
  NAME_MAX: 150,
  DESC_MIN: 1,
  DESC_MAX: 500,
} as const

export const ROLE_DEFAULTS = {
  PAGE_NUMBER: 1,
  PAGE_SIZE: 10,
  SORT_BY: 'DisplayName',
  SORT_DESCENDING: false,
} as const

export const ROLE_TABLE_CONFIG = {
  ID_WIDTH: 70,
  ACTIONS_WIDTH: 220,
  SORT_FIELDS: ['Code', 'DisplayName'] as const,
} as const