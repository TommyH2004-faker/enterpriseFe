import { ConversationMemberRole, ConversationType } from 'src/services/chatService'

export interface GroupPermissions {
  /** Thêm thành viên mới */
  canAddMembers: boolean
  /** Xóa targetRole ra khỏi nhóm. Truyền targetRole = undefined khi không có target */
  canRemove: (targetRole?: ConversationMemberRole) => boolean
  /** Đổi tên, mô tả, avatar */
  canRename: boolean
  /** Đổi vai trò của targetRole sang Admin/Member */
  canChangeRole: (targetRole?: ConversationMemberRole) => boolean
  /** Chuyển quyền Owner */
  canTransferOwner: boolean
  /** Lưu trữ (giải tán) nhóm */
  canArchive: boolean
  /** Rời nhóm (mọi người đều được rời) */
  canLeave: boolean
}

export function getGroupPermissions(
  conversationType: ConversationType,
  myRole: ConversationMemberRole,
): GroupPermissions {
  const isDirect = conversationType === ConversationType.Direct
  const isGroup = !isDirect
  const isOwner = myRole === ConversationMemberRole.Owner
  const isAdmin = myRole === ConversationMemberRole.Administrator

  const managerAllowed = isGroup && (isOwner || isAdmin)
  const ownerOnly = isGroup && isOwner

  return {
    canAddMembers: managerAllowed,

    canRemove: (targetRole?: ConversationMemberRole) => {
      if (!isGroup) return false
      if (targetRole === ConversationMemberRole.Owner) return false
      if (isOwner) return true
      if (isAdmin && targetRole === ConversationMemberRole.Member) return true
      return false
    },

    canRename: managerAllowed,

    canChangeRole: (targetRole?: ConversationMemberRole) => {
      if (!ownerOnly) return false
      if (targetRole === ConversationMemberRole.Owner) return false
      return true
    },

    canTransferOwner: ownerOnly,
    canArchive: ownerOnly,
    canLeave: !isDirect,
  }
}

/** Chuẩn hóa role: Backend có thể trả số hoặc chuỗi */
export function normalizeRole(raw: unknown): ConversationMemberRole {
  if (typeof raw === 'number') return raw as ConversationMemberRole
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase()
    if (lower === 'owner') return ConversationMemberRole.Owner
    if (lower === 'administrator' || lower === 'admin') return ConversationMemberRole.Administrator
    if (lower === 'member') return ConversationMemberRole.Member
    const num = parseInt(raw, 10)
    if (!isNaN(num)) return num as ConversationMemberRole
  }
  return ConversationMemberRole.Member
}

export const ROLE_LABEL: Record<ConversationMemberRole, string> = {
  [ConversationMemberRole.Owner]: 'Người tạo',
  [ConversationMemberRole.Administrator]: 'Admin',
  [ConversationMemberRole.Member]: 'Member',
}

