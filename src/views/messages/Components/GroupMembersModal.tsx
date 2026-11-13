import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilAccountLogout,
  cilCheck,
  cilPencil,
  cilSearch,
  cilTrash,
  cilWarning,
  cilX,
} from '@coreui/icons'
import {
  ChatService,
  ConversationDetail,
  ConversationMember,
  ConversationMemberRole,
  DepartmentItem,
  EmployeeSearchItem,
} from 'src/services/chatService'
import { getGroupPermissions, normalizeRole } from '../utils/groupPermissions'
import { formatLastSeen, initialOf } from '../utils/utils'

export type GroupModalView = 'info' | 'add' | 'kick' | 'dissolve'

interface Props {
  visible: boolean
  initialView?: 'info' | 'add'
  conversation: ConversationDetail
  currentUserId: string
  service: ChatService
  isUserOnline?: (userId?: string | null) => boolean
  getUserLastSeen?: (userId?: string | null, fallback?: string | null) => string | null
  onClose: () => void
  onRemoveMember: (userId: string) => Promise<string | null>
  onAddMembers: (userIds: string[]) => Promise<string | null>
  onChangeRole: (userId: string, role: ConversationMemberRole) => Promise<string | null>
  onTransferOwnership: (newOwnerUserId: string) => Promise<string | null>
  onUpdateInfo: (payload: { name?: string | null; description?: string | null }) => Promise<string | null>
  onArchiveGroup: () => Promise<string | null>
}

const MAX_GROUP_MEMBERS = 200

const GroupMembersModal: React.FC<Props> = ({
  visible,
  initialView = 'info',
  conversation,
  currentUserId,
  service,
  isUserOnline,
  getUserLastSeen,
  onClose,
  onRemoveMember,
  onAddMembers,
  onChangeRole,
  onTransferOwnership,
  onUpdateInfo,
  onArchiveGroup,
}) => {
  const [modalView, setModalView] = useState<GroupModalView>('info')

  // Edit group name & description state
  const [editingInfo, setEditingInfo] = useState(false)
  const [groupNameInput, setGroupNameInput] = useState(conversation.name || '')
  const [groupDescInput, setGroupDescInput] = useState(conversation.description || '')
  const [savingInfo, setSavingInfo] = useState(false)

  // Action error & loading state
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  // Add members state (Khung 3)
  const [addSearchTerm, setAddSearchTerm] = useState('')
  const [departments, setDepartments] = useState<DepartmentItem[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [allEmployees, setAllEmployees] = useState<EmployeeSearchItem[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeSearchItem[]>([])
  const [submittingAdd, setSubmittingAdd] = useState(false)

  // Confirm remove member state (Khung 4 - Vùng 1)
  const [kickTarget, setKickTarget] = useState<ConversationMember | null>(null)
  const [submittingKick, setSubmittingKick] = useState(false)

  // Confirm dissolve group state (Khung 4 - Vùng 2)
  const [submittingDissolve, setSubmittingDissolve] = useState(false)

  const fetchEmployeesAndDepartments = useCallback(
    async (search?: string, deptId?: string) => {
      try {
        setLoadingEmployees(true)
        const list = await service.searchEmployees(
          search?.trim() ? search.trim() : undefined,
          deptId || undefined,
        )
        setAllEmployees(list)
      } catch {
        setAllEmployees([])
      } finally {
        setLoadingEmployees(false)
      }
    },
    [service],
  )

  // Initialize state when modal opens
  useEffect(() => {
    if (visible) {
      setEditingInfo(false)
      setGroupNameInput(conversation.name || '')
      setGroupDescInput(conversation.description || '')
      setActionError(null)
      setKickTarget(null)
      setAddSearchTerm('')
      setSelectedDeptId('')
      setSelectedEmployees([])
      setModalView(initialView)
      if (initialView === 'add') {
        void fetchEmployeesAndDepartments()
        service
          .getDepartments()
          .then(setDepartments)
          .catch(() => {})
      }
    }
  }, [visible, initialView, conversation.id, fetchEmployeesAndDepartments, service])

  // Keep name/description inputs updated when conversation info changes
  useEffect(() => {
    if (!editingInfo) {
      setGroupNameInput(conversation.name || '')
      setGroupDescInput(conversation.description || '')
    }
  }, [conversation.name, conversation.description, editingInfo])

  // Debounced server-side search when in 'add' view
  useEffect(() => {
    if (!visible || modalView !== 'add') return
    const timer = window.setTimeout(() => {
      void fetchEmployeesAndDepartments(addSearchTerm, selectedDeptId)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [visible, modalView, addSearchTerm, selectedDeptId, fetchEmployeesAndDepartments])

  // Active members sorted: Owner (1) -> Admin (2) -> Member (3)
  const activeMembers = useMemo(() => {
    const list = (conversation.members ?? []).filter((m) => m.isActive)
    return [...list].sort((a, b) => {
      const roleA = normalizeRole(a.role)
      const roleB = normalizeRole(b.role)
      if (roleA !== roleB) return roleA - roleB
      return (a.fullName || '').localeCompare(b.fullName || '', 'vi')
    })
  }, [conversation.members])

  // Current viewer's role
  const myMember = useMemo(
    () =>
      activeMembers.find(
        (m) => currentUserId && m.userId.toLowerCase() === currentUserId.toLowerCase(),
      ),
    [activeMembers, currentUserId],
  )
  const myRole = normalizeRole(myMember?.role ?? ConversationMemberRole.Member)
  const perm = getGroupPermissions(conversation.conversationType, myRole)
  const isOwner = myRole === ConversationMemberRole.Owner
  const isAdmin = myRole === ConversationMemberRole.Administrator
  const canEditGroup = perm.canRename

  const existingMemberIdSet = useMemo(
    () => new Set(activeMembers.map((m) => m.userId.toLowerCase())),
    [activeMembers],
  )

  const renderRoleBadge = (rawRole?: ConversationMemberRole) => {
    const role = normalizeRole(rawRole)
    if (role === ConversationMemberRole.Owner) {
      return <span className="role-pill role-owner">Người tạo</span>
    }
    if (role === ConversationMemberRole.Administrator) {
      return <span className="role-pill role-admin">Admin</span>
    }
    return <span className="role-pill role-member">Member</span>
  }

  const handleSaveGroupInfo = async () => {
    const trimmedName = groupNameInput.trim()
    if (!trimmedName) {
      setActionError('Tên nhóm không được để trống.')
      return
    }
    setSavingInfo(true)
    setActionError(null)
    const err = await onUpdateInfo({
      name: trimmedName,
      description: groupDescInput.trim() || null,
    })
    setSavingInfo(false)
    if (err) {
      setActionError(err)
    } else {
      setEditingInfo(false)
    }
  }

  const handleRoleChange = async (member: ConversationMember, newRole: ConversationMemberRole) => {
    setBusyUserId(member.userId)
    setActionError(null)
    const err = await onChangeRole(member.userId, newRole)
    setBusyUserId(null)
    if (err) setActionError(err)
  }

  const handleTransferOwner = async (member: ConversationMember) => {
    setBusyUserId(member.userId)
    setActionError(null)
    const err = await onTransferOwnership(member.userId)
    setBusyUserId(null)
    if (err) setActionError(err)
  }

  const handleLeaveGroup = async () => {
    setBusyUserId(currentUserId)
    setActionError(null)
    const err = await onRemoveMember(currentUserId)
    setBusyUserId(null)
    if (err) {
      setActionError(err)
    } else {
      onClose()
    }
  }

  const handleOpenKickModal = (member: ConversationMember) => {
    setActionError(null)
    setKickTarget(member)
    setModalView('kick')
  }

  const handleConfirmKick = async () => {
    if (!kickTarget) return
    setSubmittingKick(true)
    setActionError(null)
    const err = await onRemoveMember(kickTarget.userId)
    setSubmittingKick(false)
    if (err) {
      setActionError(err)
    } else {
      setKickTarget(null)
      setModalView('info')
    }
  }

  const handleConfirmDissolve = async () => {
    setSubmittingDissolve(true)
    setActionError(null)
    const err = await onArchiveGroup()
    setSubmittingDissolve(false)
    if (err) {
      setActionError(err)
    } else {
      setModalView('info')
      onClose()
    }
  }

  // Candidates filtered: not already in group, matching name or department
  const filteredCandidates = useMemo(() => {
    const q = addSearchTerm.trim().toLowerCase()
    return allEmployees.filter((emp) => {
      if (!emp.userId) return false
      if (existingMemberIdSet.has(emp.userId.toLowerCase())) return false
      if (currentUserId && emp.userId.toLowerCase() === currentUserId.toLowerCase()) return false
      if (!q) return true
      const matchName = (emp.fullName || '').toLowerCase().includes(q)
      const matchDept = (emp.departmentName || '').toLowerCase().includes(q)
      const matchUser = (emp.username || '').toLowerCase().includes(q)
      return matchName || matchDept || matchUser
    })
  }, [allEmployees, existingMemberIdSet, addSearchTerm, currentUserId])

  const toggleSelectEmployee = (emp: EmployeeSearchItem) => {
    setSelectedEmployees((prev) => {
      const exists = prev.some((x) => x.userId === emp.userId)
      if (exists) return prev.filter((x) => x.userId !== emp.userId)
      if (activeMembers.length + prev.length >= MAX_GROUP_MEMBERS) return prev
      return [...prev, emp]
    })
  }

  const handleCancelAdd = () => {
    if (submittingAdd) return
    setActionError(null)
    onClose()
  }

  const handleConfirmAddMembers = async () => {
    if (!selectedEmployees.length || submittingAdd) return
    setSubmittingAdd(true)
    setActionError(null)
    const err = await onAddMembers(selectedEmployees.map((e) => e.userId))
    setSubmittingAdd(false)
    if (err) {
      setActionError(err)
    } else {
      setSelectedEmployees([])
      onClose()
    }
  }

  const defaultDescription =
    conversation.description ||
    `Trao đổi tiến độ và tài liệu ${conversation.name || 'nhóm'}.`

  const isConfirmModal = modalView === 'kick' || modalView === 'dissolve'

  const handleModalDismiss = () => {
    if (submittingAdd || submittingKick || submittingDissolve) return
    onClose()
  }

  return (
    <CModal
      visible={visible}
      onClose={handleModalDismiss}
      alignment="center"
      size={isConfirmModal ? 'sm' : undefined}
      className={`flat-chat-modal ${
        modalView === 'info'
          ? 'group-info-modal'
          : modalView === 'add'
            ? 'add-members-modal'
            : 'confirm-small-modal'
      }`}
    >
      {/* =========================================================
          KHUNG 2: HỘP THOẠI "Thông tin nhóm" (3 biến thể theo vai trò)
          ========================================================= */}
      {modalView === 'info' && (
        <>
          <CModalHeader closeButton>
            <CModalTitle>Thông tin nhóm</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {actionError && (
              <div className="flat-error-banner mb-3">
                <span>{actionError}</span>
                <button type="button" aria-label="Đóng lỗi" onClick={() => setActionError(null)}>
                  <CIcon icon={cilX} size="sm" />
                </button>
              </div>
            )}

            <div className="group-info-header">
              <div className="group-large-avatar">
                {initialOf(conversation.name || 'DA')}
              </div>

              {!editingInfo ? (
                <>
                  <div className="group-title-line">
                    <h3 className="group-info-name">{conversation.name || 'Nhóm chat'}</h3>
                    {canEditGroup && (
                      <button
                        type="button"
                        className="edit-group-pencil-btn"
                        title="Sửa tên và mô tả nhóm"
                        aria-label="Sửa tên nhóm"
                        onClick={() => {
                          setGroupNameInput(conversation.name || '')
                          setGroupDescInput(conversation.description || '')
                          setEditingInfo(true)
                        }}
                      >
                        <CIcon icon={cilPencil} size="sm" />
                      </button>
                    )}
                  </div>
                  <p className="group-info-desc">{defaultDescription}</p>
                  <div className="group-info-count">{activeMembers.length} thành viên</div>
                </>
              ) : (
                <div className="group-edit-form">
                  <input
                    type="text"
                    className="flat-input"
                    value={groupNameInput}
                    placeholder="Tên nhóm"
                    onChange={(e) => setGroupNameInput(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flat-input"
                    value={groupDescInput}
                    placeholder="Mô tả nhóm"
                    onChange={(e) => setGroupDescInput(e.target.value)}
                  />
                  <div className="group-edit-actions">
                    <button
                      type="button"
                      className="flat-btn flat-btn-outline flat-btn-sm"
                      disabled={savingInfo}
                      onClick={() => setEditingInfo(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="flat-btn flat-btn-primary flat-btn-sm"
                      disabled={savingInfo}
                      onClick={handleSaveGroupInfo}
                    >
                      {savingInfo ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="group-member-list">
              {activeMembers.map((member) => {
                const isMe =
                  !!currentUserId &&
                  member.userId.toLowerCase() === currentUserId.toLowerCase()
                const memberRole = normalizeRole(member.role)
                const isBusy = busyUserId === member.userId

                const isOnline = isUserOnline ? isUserOnline(member.userId) : false
                const lastSeen = getUserLastSeen ? getUserLastSeen(member.userId, member.lastLoginAt) : member.lastLoginAt

                return (
                  <div key={member.userId} className="group-member-row">
                    <div className="member-row-left">
                      <span className="member-circle-avatar" style={{ position: 'relative' }}>
                        {initialOf(member.fullName || 'U')}
                        {isOnline && (
                          <span
                            className="avatar-online-dot"
                            style={{ width: 10, height: 10, right: -1, bottom: -1 }}
                            title="Đang hoạt động"
                          />
                        )}
                      </span>
                      <span className="member-row-name">
                        <span className="member-name-text">{member.fullName || 'Thành viên'}</span>
                        {isMe && <span className="member-self-tag"> (Bạn)</span>}
                        <small
                          className="member-presence-status"
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            color: isOnline ? '#10b981' : '#9ca3af',
                            marginTop: '1px',
                          }}
                        >
                          {isOnline ? 'Đang hoạt động' : formatLastSeen(lastSeen)}
                        </small>
                      </span>
                      {renderRoleBadge(memberRole)}
                    </div>

                    {!isMe && (
                      <div className="member-row-actions">
                        {/* Biến thể 1: Người xem là Owner */}
                        {isOwner && memberRole === ConversationMemberRole.Administrator && (
                          <>
                            <button
                              type="button"
                              className="member-text-btn"
                              disabled={isBusy}
                              onClick={() =>
                                handleRoleChange(member, ConversationMemberRole.Member)
                              }
                            >
                              Hạ Member
                            </button>
                            <button
                              type="button"
                              className="member-text-btn"
                              disabled={isBusy}
                              onClick={() => handleTransferOwner(member)}
                            >
                              Chuyển Người tạo
                            </button>
                            <button
                              type="button"
                              className="member-text-btn danger"
                              disabled={isBusy}
                              onClick={() => handleOpenKickModal(member)}
                            >
                              Xóa khỏi nhóm
                            </button>
                          </>
                        )}

                        {isOwner && memberRole === ConversationMemberRole.Member && (
                          <>
                            <button
                              type="button"
                              className="member-text-btn"
                              disabled={isBusy}
                              onClick={() =>
                                handleRoleChange(member, ConversationMemberRole.Administrator)
                              }
                            >
                              Lên Admin
                            </button>
                            <button
                              type="button"
                              className="member-text-btn"
                              disabled={isBusy}
                              onClick={() => handleTransferOwner(member)}
                            >
                              Chuyển Người tạo
                            </button>
                            <button
                              type="button"
                              className="member-text-btn danger"
                              disabled={isBusy}
                              onClick={() => handleOpenKickModal(member)}
                            >
                              Xóa khỏi nhóm
                            </button>
                          </>
                        )}

                        {/* Biến thể 2: Người xem là Admin (chỉ hàng Member mới có "Xóa khỏi nhóm") */}
                        {isAdmin && memberRole === ConversationMemberRole.Member && (
                          <button
                            type="button"
                            className="member-text-btn danger"
                            disabled={isBusy}
                            onClick={() => handleOpenKickModal(member)}
                          >
                            Xóa khỏi nhóm
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CModalBody>

          <CModalFooter className="group-info-footer">
            <button
              type="button"
              className="flat-btn flat-btn-outline"
              disabled={busyUserId === currentUserId}
              onClick={handleLeaveGroup}
            >
              <CIcon icon={cilAccountLogout} size="sm" className="me-1" />
              Rời nhóm
            </button>

            {isOwner && (
              <button
                type="button"
                className="flat-btn flat-btn-danger-text"
                onClick={() => {
                  setActionError(null)
                  setModalView('dissolve')
                }}
              >
                <CIcon icon={cilTrash} size="sm" className="me-1" />
                Giải tán nhóm
              </button>
            )}
          </CModalFooter>
        </>
      )}

      {/* =========================================================
          KHUNG 3: HỘP THOẠI "Thêm thành viên"
          ========================================================= */}
      {modalView === 'add' && (
        <>
          <CModalHeader closeButton>
            <CModalTitle>Thêm thành viên</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {actionError && (
              <div className="flat-error-banner mb-3">
                <span>{actionError}</span>
                <button type="button" aria-label="Đóng lỗi" onClick={() => setActionError(null)}>
                  <CIcon icon={cilX} size="sm" />
                </button>
              </div>
            )}

            <div className="add-members-filters mb-3">
              <div className="flat-search-box">
                <CIcon icon={cilSearch} className="flat-search-icon" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Tìm theo tên hoặc phòng ban"
                  value={addSearchTerm}
                  onChange={(e) => setAddSearchTerm(e.target.value)}
                />
                {addSearchTerm && (
                  <button
                    type="button"
                    className="flat-search-clear"
                    aria-label="Xóa từ khóa"
                    onClick={() => setAddSearchTerm('')}
                  >
                    <CIcon icon={cilX} size="sm" />
                  </button>
                )}
              </div>

              {departments.length > 0 && (
                <select
                  className="flat-dept-select"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedEmployees.length > 0 && (
              <div className="selected-employee-chips mb-3">
                {selectedEmployees.map((emp) => (
                  <button
                    key={emp.userId}
                    type="button"
                    className="selected-employee-chip"
                    onClick={() => toggleSelectEmployee(emp)}
                  >
                    <span>{emp.fullName}</span>
                    <CIcon icon={cilX} size="sm" className="chip-close-icon" />
                  </button>
                ))}
              </div>
            )}

            <div className="employee-candidate-list">
              {loadingEmployees ? (
                <div className="candidate-empty">
                  <CSpinner size="sm" /> Đang tải danh sách nhân viên...
                </div>
              ) : filteredCandidates.length > 0 ? (
                filteredCandidates.map((emp) => {
                  const checked = selectedEmployees.some((x) => x.userId === emp.userId)
                  return (
                    <div
                      key={emp.userId}
                      className={`employee-candidate-row ${checked ? 'checked' : ''}`}
                      onClick={() => toggleSelectEmployee(emp)}
                    >
                      <span className="member-circle-avatar">
                        {initialOf(emp.fullName || 'U')}
                      </span>
                      <div className="candidate-copy">
                        <div className="candidate-name">{emp.fullName}</div>
                        <div className="candidate-dept">
                          {emp.departmentName || emp.username || 'Nhân viên'}
                        </div>
                      </div>
                      <span className={`candidate-check ${checked ? 'checked' : ''}`}>
                        {checked && <CIcon icon={cilCheck} size="sm" />}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="candidate-empty">
                  Không tìm thấy nhân viên phù hợp (hoặc tất cả đã ở trong nhóm).
                </div>
              )}
            </div>
          </CModalBody>

          <CModalFooter className="add-members-footer">
            <div className="selected-counter-text">
              Đã chọn {selectedEmployees.length} · Tối đa {MAX_GROUP_MEMBERS} thành viên
            </div>
            <div className="add-members-footer-btns">
              <button
                type="button"
                className="flat-btn flat-btn-outline"
                disabled={submittingAdd}
                onClick={handleCancelAdd}
              >
                Hủy
              </button>
              <button
                type="button"
                className="flat-btn flat-btn-primary"
                disabled={selectedEmployees.length === 0 || submittingAdd}
                onClick={handleConfirmAddMembers}
              >
                {submittingAdd
                  ? 'Đang thêm...'
                  : `Thêm ${selectedEmployees.length} người`}
              </button>
            </div>
          </CModalFooter>
        </>
      )}

      {/* =========================================================
          KHUNG 4 - VÙNG 1: HỘP THOẠI XÁC NHẬN "Xóa khỏi nhóm?"
          ========================================================= */}
      {modalView === 'kick' && (
        <>
          <CModalHeader closeButton>
            <CModalTitle>Xóa khỏi nhóm?</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {actionError && (
              <div className="flat-error-banner mb-3">
                <span>{actionError}</span>
                <button type="button" aria-label="Đóng lỗi" onClick={() => setActionError(null)}>
                  <CIcon icon={cilX} size="sm" />
                </button>
              </div>
            )}
            <p className="confirm-modal-text">
              {kickTarget?.fullName} sẽ không còn xem được tin nhắn mới của nhóm{' '}
              {conversation.name}.
            </p>
          </CModalBody>
          <CModalFooter className="confirm-modal-footer">
            <button
              type="button"
              className="flat-btn flat-btn-outline"
              disabled={submittingKick}
              onClick={() => {
                setKickTarget(null)
                setModalView('info')
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              className="flat-btn flat-btn-danger"
              disabled={submittingKick}
              onClick={handleConfirmKick}
            >
              {submittingKick ? 'Đang xóa...' : 'Xóa khỏi nhóm'}
            </button>
          </CModalFooter>
        </>
      )}

      {/* =========================================================
          KHUNG 4 - VÙNG 2: HỘP THOẠI XÁC NHẬN "Giải tán nhóm?"
          ========================================================= */}
      {modalView === 'dissolve' && (
        <>
          <CModalHeader closeButton>
            <CModalTitle>
              <CIcon icon={cilWarning} className="me-2 text-danger" />
              Giải tán nhóm?
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            {actionError && (
              <div className="flat-error-banner mb-3">
                <span>{actionError}</span>
                <button type="button" aria-label="Đóng lỗi" onClick={() => setActionError(null)}>
                  <CIcon icon={cilX} size="sm" />
                </button>
              </div>
            )}
            <p className="confirm-modal-text">
              Nhóm sẽ biến mất khỏi danh sách của mọi thành viên.
            </p>
          </CModalBody>
          <CModalFooter className="confirm-modal-footer">
            <button
              type="button"
              className="flat-btn flat-btn-outline"
              disabled={submittingDissolve}
              onClick={() => setModalView('info')}
            >
              Hủy
            </button>
            <button
              type="button"
              className="flat-btn flat-btn-danger"
              disabled={submittingDissolve}
              onClick={handleConfirmDissolve}
            >
              {submittingDissolve ? 'Đang xử lý...' : 'Giải tán nhóm'}
            </button>
          </CModalFooter>
        </>
      )}
    </CModal>
  )
}

export default GroupMembersModal
