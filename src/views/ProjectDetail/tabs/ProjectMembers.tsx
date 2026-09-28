
// src/views/ProjectDetail/tabs/ProjectMembers.tsx

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CAvatar,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormCheck,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'

import {
  cilBriefcase,
  cilEnvelopeClosed,
  cilPlus,
  cilSearch,
  cilTrash,
  cilUser,
  cilUserFollow,
} from '@coreui/icons'

import toast from 'react-hot-toast'

import { useOutletContext } from 'react-router-dom'

import { ProjectDetail } from 'src/types/ProjectType/project'

import {
  projectService,
  ProjectMemberResponse,
} from 'src/services/projectService'

import { employeeService } from 'src/services/employeeService'

import { EmployeeResponse } from 'src/types/Employee'

interface ProjectDetailContext {
  project: ProjectDetail | null
}

const ProjectMembers: React.FC = () => {
  // ============================================================
  // Project
  // ============================================================

  const context =
    useOutletContext<ProjectDetailContext | null>()

  const project = context?.project

  // ============================================================
  // Members
  // ============================================================

  const [members, setMembers] = useState<
    ProjectMemberResponse[]
  >([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ============================================================
  // Add Member
  // ============================================================

  const [showAddModal, setShowAddModal] =
    useState(false)

  /**
   * EmployeeResponse:
   *
   * id     = EmployeeProfile.Id
   * userId = User.Id
   *
   * Khi add ProjectMember phải gửi userId.
   */
  const [projectEmployees, setProjectEmployees] =
    useState<EmployeeResponse[]>([])

  const [loadingEmployees, setLoadingEmployees] =
    useState(false)

  const [employeeSearch, setEmployeeSearch] =
    useState('')

  /**
   * IMPORTANT:
   * selectedUserIds lưu User.Id, KHÔNG phải EmployeeProfile.Id.
   */
  const [selectedUserIds, setSelectedUserIds] =
    useState<string[]>([])

  const [adding, setAdding] = useState(false)

  // ============================================================
  // Remove Member
  // ============================================================

  const [showRemoveModal, setShowRemoveModal] =
    useState(false)

  const [selectedMember, setSelectedMember] =
    useState<ProjectMemberResponse | null>(null)

  const [removing, setRemoving] = useState(false)

  // ============================================================
  // Load Members
  // ============================================================

  const loadProjectMembers = async () => {
    if (!project?.id) {
      setMembers([])
      return
    }

    try {
      setLoading(true)
      setError('')

      const result =
        await projectService.getProjectMembers(
          project.id,
        )

      setMembers(result)
    } catch (err: any) {
      console.error(
        'Không thể tải thành viên dự án:',
        err,
      )

      setMembers([])

      const errorMessage =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        'Không thể tải danh sách thành viên dự án.'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProjectMembers()
  }, [project?.id])

  // ============================================================
  // Helpers
  // ============================================================

  const getInitial = (name?: string) => {
    if (!name?.trim()) {
      return '?'
    }

    return name
      .trim()
      .charAt(0)
      .toUpperCase()
  }

  const getErrorMessage = (
    err: any,
    fallback: string,
  ) => {
    return (
      err?.response?.data?.errors?.[0]?.message ||
      err?.response?.data?.message ||
      fallback
    )
  }

  // ============================================================
  // Available Employees
  //
  // projectEmployees:
  //   Tất cả employee active.
  //
  // members:
  //   Thành viên hiện tại của project.
  //
  // availableEmployees:
  //   Employee active chưa phải member.
  //
  // IMPORTANT:
  // So sánh bằng User.Id.
  //
  // Employee:
  //   employee.id     = EmployeeProfile.Id
  //   employee.userId = User.Id
  //
  // ProjectMember:
  //   employeeId/userId = User.Id
  // ============================================================

  const availableEmployees = useMemo(() => {
    const existingMemberUserIds = new Set(
      members.map((member) => {
        /**
         * Một số response BE có thể trả userId.
         * Nếu response hiện tại dùng id làm User.Id
         * thì fallback về id.
         */
        const memberWithUserId =
          member as ProjectMemberResponse & {
            userId?: string
          }

        return (
          memberWithUserId.userId ??
          member.id
        )
      }),
    )

    return projectEmployees.filter(
      (employee) =>
        !existingMemberUserIds.has(
          employee.userId,
        ),
    )
  }, [
    projectEmployees,
    members,
  ])

  // ============================================================
  // Search Employees
  // ============================================================

  const filteredEmployees = useMemo(() => {
    const keyword =
      employeeSearch
        .trim()
        .toLowerCase()

    if (!keyword) {
      return availableEmployees
    }

    return availableEmployees.filter(
      (employee) => {
        const fullName =
          employee.fullName
            ?.toLowerCase() || ''

        const employeeCode =
          employee.employeeCode
            ?.toLowerCase() || ''

        const positionName =
          employee.positionName
            ?.toLowerCase() || ''

        const departmentName =
          employee.departmentName
            ?.toLowerCase() || ''

        return (
          fullName.includes(keyword) ||
          employeeCode.includes(keyword) ||
          positionName.includes(keyword) ||
          departmentName.includes(keyword)
        )
      },
    )
  }, [
    availableEmployees,
    employeeSearch,
  ])

  // ============================================================
  // Open Add Modal
  // ============================================================

  const openAddModal = async () => {
    if (!project?.id) {
      toast.error(
        'Không xác định được dự án.',
      )
      return
    }

    setShowAddModal(true)
    setSelectedUserIds([])
    setEmployeeSearch('')
    setProjectEmployees([])

    try {
      setLoadingEmployees(true)

      /**
       * Member có thể thuộc bất kỳ phòng ban nào.
       *
       * KHÔNG truyền:
       *
       * departmentId: project.departmentId
       */

      const employees =
        await employeeService.getEmployees({
          includeInactive: false,
        })

      const activeEmployees =
        employees.filter(
          (employee) =>
            employee.isActive,
        )

      setProjectEmployees(
        activeEmployees,
      )
    } catch (err: any) {
      console.error(
        'Không thể tải danh sách nhân viên:',
        err,
      )

      setProjectEmployees([])

      toast.error(
        getErrorMessage(
          err,
          'Không thể tải danh sách nhân viên.',
        ),
      )
    } finally {
      setLoadingEmployees(false)
    }
  }

  // ============================================================
  // Close Add Modal
  // ============================================================

  const closeAddModal = () => {
    if (adding) {
      return
    }

    setShowAddModal(false)
    setProjectEmployees([])
    setSelectedUserIds([])
    setEmployeeSearch('')
  }

  // ============================================================
  // Toggle Employee
  //
  // IMPORTANT:
  // userId ở đây phải là User.Id.
  // ============================================================

  const handleEmployeeChange = (
    userId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedUserIds(
        (current) => {
          if (
            current.includes(userId)
          ) {
            return current
          }

          return [
            ...current,
            userId,
          ]
        },
      )

      return
    }

    setSelectedUserIds(
      (current) =>
        current.filter(
          (id) =>
            id !== userId,
        ),
    )
  }

  // ============================================================
  // Select All Visible
  //
  // IMPORTANT:
  // Dùng employee.userId, KHÔNG dùng employee.id.
  // ============================================================

  const handleSelectAll = () => {
    const visibleUserIds =
      filteredEmployees.map(
        (employee) =>
          employee.userId,
      )

    setSelectedUserIds(
      (current) => {
        const merged = new Set([
          ...current,
          ...visibleUserIds,
        ])

        return Array.from(merged)
      },
    )
  }

  // ============================================================
  // Clear Selection
  // ============================================================

  const handleClearSelection = () => {
    setSelectedUserIds([])
  }

  // ============================================================
  // Add Members
  // ============================================================

  const handleAddMembers = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!project?.id) {
      toast.error(
        'Không xác định được dự án.',
      )
      return
    }

    if (selectedUserIds.length === 0) {
      toast.error(
        'Vui lòng chọn ít nhất một nhân viên.',
      )
      return
    }

    try {
      setAdding(true)

      let successCount = 0
      let failedCount = 0

      const failedDetails: Array<{
        userId: string
        employeeName: string
        status?: number
        responseData?: any
        message?: string
        errors?: any
      }> = []

      /**
       * Add tuần tự.
       *
       * selectedUserIds đã là User.Id.
       *
       * Request:
       *
       * POST /api/v1/projects/{projectId}/members
       *
       * {
       *   userId: User.Id
       * }
       */
      for (const userId of selectedUserIds) {
        try {
          await projectService.addProjectMember(
            project.id,
            userId,
          )

          successCount++
        } catch (err: any) {
          failedCount++

          const employee =
            projectEmployees.find(
              (item) =>
                item.userId === userId,
            )

          failedDetails.push({
            userId,
            employeeName:
              employee?.fullName ||
              'Nhân viên',
            status:
              err?.response?.status,
            responseData:
              err?.response?.data,
            message:
              err?.response?.data
                ?.message,
            errors:
              err?.response?.data
                ?.errors,
          })
        }
      }

      // ========================================================
      // Log lỗi
      // ========================================================

      if (failedCount > 0) {
        console.error(
          '❌ ADD PROJECT MEMBERS RESULT:',
          {
            projectId: project.id,
            selectedUserIds,
            successCount,
            failedCount,
            failedDetails,
          },
        )
      }

      // ========================================================
      // Reload members
      // ========================================================

      if (successCount > 0) {
        await loadProjectMembers()
      }

      // ========================================================
      // All success
      // ========================================================

      if (
        successCount > 0 &&
        failedCount === 0
      ) {
        toast.success(
          `Đã thêm ${successCount} thành viên vào dự án.`,
        )

        setShowAddModal(false)
        setProjectEmployees([])
        setSelectedUserIds([])
        setEmployeeSearch('')

        return
      }

      // ========================================================
      // Partial success
      // ========================================================

      if (
        successCount > 0 &&
        failedCount > 0
      ) {
        toast.success(
          `Đã thêm ${successCount} thành viên.`,
        )

        toast.error(
          `Không thể thêm ${failedCount} thành viên.`,
        )

        setShowAddModal(false)
        setProjectEmployees([])
        setSelectedUserIds([])
        setEmployeeSearch('')

        return
      }

      // ========================================================
      // All failed
      // ========================================================

      toast.error(
        'Không thể thêm các thành viên đã chọn.',
      )
    } finally {
      setAdding(false)
    }
  }

  // ============================================================
  // Open Remove Modal
  // ============================================================

  const openRemoveModal = (
    member: ProjectMemberResponse,
  ) => {
    setSelectedMember(member)
    setShowRemoveModal(true)
  }

  // ============================================================
  // Close Remove Modal
  // ============================================================

  const closeRemoveModal = () => {
    if (removing) {
      return
    }

    setShowRemoveModal(false)
    setSelectedMember(null)
  }

  // ============================================================
  // Remove Member
  // ============================================================

  const handleRemoveMember = async () => {
    if (!project?.id) {
      toast.error(
        'Không xác định được dự án.',
      )
      return
    }

    if (!selectedMember) {
      toast.error(
        'Không xác định được thành viên cần xóa.',
      )
      return
    }

    try {
      setRemoving(true)

      await projectService.removeProjectMember(
        project.id,
        selectedMember.id,
      )

      toast.success(
        'Đã xóa thành viên khỏi dự án.',
      )

      setShowRemoveModal(false)
      setSelectedMember(null)

      await loadProjectMembers()
    } catch (err: any) {
      console.error(
        'Không thể xóa thành viên:',
        err,
      )

      toast.error(
        getErrorMessage(
          err,
          'Không thể xóa thành viên khỏi dự án.',
        ),
      )
    } finally {
      setRemoving(false)
    }
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <>
      <CCard className="border-0 shadow-sm">
        <CCardBody className="p-4">

          {/* ==================================================
              Header
          ================================================== */}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-1 fw-bold">
                Thành viên dự án
              </h5>

              <div className="text-body-secondary">
                Danh sách người dùng đang tham gia dự án
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <CBadge
                color="info"
                className="px-3 py-2"
              >
                <CIcon
                  icon={cilUserFollow}
                  size="sm"
                  className="me-1"
                />

                {members.length} thành viên
              </CBadge>

              <CButton
                color="primary"
                size="sm"
                onClick={() => {
                  void openAddModal()
                }}
                disabled={!project?.id}
              >
                <CIcon
                  icon={cilPlus}
                  size="sm"
                  className="me-1"
                />

                Thêm thành viên
              </CButton>
            </div>
          </div>

          {/* ==================================================
              Project Manager
          ================================================== */}

          {project?.manager && (
            <div className="border rounded-3 p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <CAvatar
                    color="primary"
                    textColor="white"
                    size="lg"
                  >
                    {getInitial(
                      project.manager.fullName,
                    )}
                  </CAvatar>

                  <div>
                    <div className="fw-semibold">
                      {
                        project.manager
                          .fullName
                      }
                    </div>

                    <div className="small text-body-secondary d-flex align-items-center gap-1 mt-1">
                      <CIcon
                        icon={
                          cilEnvelopeClosed
                        }
                        size="sm"
                      />

                      {project.manager.email ||
                        '—'}
                    </div>
                  </div>
                </div>

                <CBadge
                  color="primary"
                  className="px-3 py-2"
                >
                  <CIcon
                    icon={cilBriefcase}
                    size="sm"
                    className="me-1"
                  />

                  Project Manager
                </CBadge>
              </div>
            </div>
          )}

          {/* ==================================================
              Loading
          ================================================== */}

          {loading && (
            <div className="text-center py-5">
              <CSpinner color="primary" />

              <div className="text-body-secondary small mt-3">
                Đang tải danh sách thành viên...
              </div>
            </div>
          )}

          {/* ==================================================
              Error
          ================================================== */}

          {!loading && error && (
            <div className="text-center py-5">
              <div className="text-danger mb-2">
                Không thể tải dữ liệu
              </div>

              <div className="text-body-secondary small">
                {error}
              </div>

              <CButton
                color="primary"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  void loadProjectMembers()
                }}
              >
                Thử lại
              </CButton>
            </div>
          )}

          {/* ==================================================
              Empty
          ================================================== */}

          {!loading &&
            !error &&
            members.length === 0 && (
              <div className="text-center py-5">
                <CAvatar
                  color="light"
                  textColor="secondary"
                  size="xl"
                  className="mb-3"
                >
                  <CIcon icon={cilUser} />
                </CAvatar>

                <div className="fw-semibold">
                  Chưa có thành viên
                </div>

                <div className="text-body-secondary small mt-1">
                  Dự án hiện chưa có thành viên nào.
                </div>

                <CButton
                  color="primary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    void openAddModal()
                  }}
                >
                  <CIcon
                    icon={cilPlus}
                    size="sm"
                    className="me-1"
                  />

                  Thêm thành viên
                </CButton>
              </div>
            )}

          {/* ==================================================
              Members Table
          ================================================== */}

          {!loading &&
            !error &&
            members.length > 0 && (
              <CTable
                align="middle"
                responsive
                hover
                className="mb-0"
              >
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell className="py-3">
                      Thành viên
                    </CTableHeaderCell>

                    <CTableHeaderCell className="py-3">
                      Phòng ban
                    </CTableHeaderCell>

                    <CTableHeaderCell className="py-3">
                      Email
                    </CTableHeaderCell>

                    <CTableHeaderCell className="py-3">
                      Vai trò hệ thống
                    </CTableHeaderCell>

                    <CTableHeaderCell className="py-3 text-end">
                      Thao tác
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {members.map(
                    (member) => (
                      <CTableRow
                        key={member.id}
                      >
                        {/* Member */}

                        <CTableDataCell className="py-3">
                          <div className="d-flex align-items-center gap-3">
                            <CAvatar
                              color="secondary"
                              textColor="white"
                              size="md"
                            >
                              {member.name ? (
                                getInitial(
                                  member.name,
                                )
                              ) : (
                                <CIcon
                                  icon={
                                    cilUser
                                  }
                                />
                              )}
                            </CAvatar>

                            <div>
                              <div className="fw-semibold">
                                {member.name ||
                                  'Chưa có tên'}
                              </div>

                              <div className="small text-body-secondary">
                                Thành viên dự án
                              </div>
                            </div>
                          </div>
                        </CTableDataCell>

                        {/* Department */}

                        <CTableDataCell className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <CIcon
                              icon={
                                cilBriefcase
                              }
                              size="sm"
                              className="text-body-secondary"
                            />

                            <span>
                              {member.department ||
                                '—'}
                            </span>
                          </div>
                        </CTableDataCell>

                        {/* Email */}

                        <CTableDataCell className="py-3">
                          <div className="d-flex align-items-center gap-2 text-body-secondary">
                            <CIcon
                              icon={
                                cilEnvelopeClosed
                              }
                              size="sm"
                            />

                            <span>
                              {member.email ||
                                '—'}
                            </span>
                          </div>
                        </CTableDataCell>

                        {/* Role */}

                        <CTableDataCell className="py-3">
                          {member.role ? (
                            <CBadge
                              color="light"
                              textColor="dark"
                              className="border px-3 py-2"
                            >
                              {member.role}
                            </CBadge>
                          ) : (
                            <span className="text-body-secondary">
                              —
                            </span>
                          )}
                        </CTableDataCell>

                        {/* Actions */}

                        <CTableDataCell className="py-3 text-end">
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            disabled={
                              removing &&
                              selectedMember?.id ===
                                member.id
                            }
                            onClick={() => {
                              openRemoveModal(
                                member,
                              )
                            }}
                            title="Xóa thành viên"
                          >
                            {removing &&
                            selectedMember?.id ===
                              member.id ? (
                              <CSpinner size="sm" />
                            ) : (
                              <CIcon
                                icon={
                                  cilTrash
                                }
                                size="sm"
                              />
                            )}
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ),
                  )}
                </CTableBody>
              </CTable>
            )}
        </CCardBody>
      </CCard>

      {/* ========================================================
          Add Member Modal
      ======================================================== */}

      <CModal
        visible={showAddModal}
        onClose={closeAddModal}
        alignment="center"
        size="lg"
      >
        <CForm
          onSubmit={handleAddMembers}
        >
          <CModalHeader>
            <CModalTitle>
              Thêm thành viên dự án
            </CModalTitle>
          </CModalHeader>

          <CModalBody>

            {/* Information */}

            <div className="mb-3">
              <div className="small text-body-secondary">
                Có thể thêm nhân viên thuộc bất kỳ phòng ban nào vào dự án.
              </div>
            </div>

            {/* Search */}

            {!loadingEmployees &&
              projectEmployees.length > 0 && (
                <div className="mb-3">
                  <div className="position-relative">
                    <CFormInput
                      type="text"
                      value={
                        employeeSearch
                      }
                      onChange={(
                        event,
                      ) => {
                        setEmployeeSearch(
                          event.target.value,
                        )
                      }}
                      placeholder="Tìm theo tên, mã nhân viên, chức vụ hoặc phòng ban..."
                      disabled={adding}
                      autoFocus
                      className="ps-5"
                    />

                    <CIcon
                      icon={cilSearch}
                      size="sm"
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-body-secondary"
                    />
                  </div>
                </div>
              )}

            {/* Selection summary */}

            {!loadingEmployees &&
              availableEmployees.length >
                0 && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="small text-body-secondary">
                    Đã chọn{' '}
                    <strong>
                      {
                        selectedUserIds.length
                      }
                    </strong>{' '}
                    /{' '}
                    {
                      availableEmployees.length
                    }{' '}
                    nhân viên
                  </div>

                  <div className="d-flex gap-2">
                    <CButton
                      type="button"
                      color="primary"
                      variant="ghost"
                      size="sm"
                      onClick={
                        handleSelectAll
                      }
                      disabled={
                        adding
                      }
                    >
                      Chọn tất cả
                    </CButton>

                    <CButton
                      type="button"
                      color="secondary"
                      variant="ghost"
                      size="sm"
                      onClick={
                        handleClearSelection
                      }
                      disabled={
                        adding ||
                        selectedUserIds.length ===
                          0
                      }
                    >
                      Bỏ chọn
                    </CButton>
                  </div>
                </div>
              )}

            {/* Employee list */}

            {loadingEmployees ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />

                <div className="text-body-secondary small mt-3">
                  Đang tải danh sách nhân viên...
                </div>
              </div>
            ) : availableEmployees.length ===
              0 ? (
              <div className="border rounded-3 text-center py-5">
                <CAvatar
                  color="light"
                  textColor="secondary"
                  size="xl"
                  className="mb-3"
                >
                  <CIcon icon={cilUser} />
                </CAvatar>

                <div className="fw-semibold">
                  Không có nhân viên để thêm
                </div>

                <div className="text-body-secondary small mt-1 px-3">
                  Tất cả nhân viên đang hoạt động đã là thành viên của dự án.
                </div>
              </div>
            ) : filteredEmployees.length ===
              0 ? (
              <div className="border rounded-3 text-center py-4">
                <div className="text-body-secondary">
                  Không tìm thấy nhân viên phù hợp.
                </div>
              </div>
            ) : (
              <div
                className="border rounded-3 overflow-auto"
                style={{
                  maxHeight: '360px',
                }}
              >
                {filteredEmployees.map(
                  (employee) => {
                    /**
                     * IMPORTANT:
                     *
                     * employee.id:
                     *   EmployeeProfile.Id
                     *
                     * employee.userId:
                     *   User.Id
                     *
                     * selectedUserIds:
                     *   User.Id
                     */

                    const checked =
                      selectedUserIds.includes(
                        employee.userId,
                      )

                    return (
                      <div
                        key={
                          employee.userId
                        }
                        className={`px-3 py-3 border-bottom ${
                          checked
                            ? 'bg-light'
                            : ''
                        }`}
                      >
                        <CFormCheck
                          id={`project-member-${employee.userId}`}
                          checked={
                            checked
                          }
                          disabled={
                            adding
                          }
                          onChange={(
                            event,
                          ) => {
                            handleEmployeeChange(
                              employee.userId,
                              event.target.checked,
                            )
                          }}
                          label={
                            <div className="ms-2">
                              <div className="fw-semibold">
                                {
                                  employee.fullName
                                }
                              </div>

                              <div className="small text-body-secondary mt-1">
                                {
                                  employee.employeeCode
                                }

                                {employee.positionName
                                  ? ` · ${employee.positionName}`
                                  : ''}

                                {employee.departmentName
                                  ? ` · ${employee.departmentName}`
                                  : ''}
                              </div>
                            </div>
                          }
                        />
                      </div>
                    )
                  },
                )}
              </div>
            )}
          </CModalBody>

          <CModalFooter>
            <CButton
              color="secondary"
              variant="outline"
              onClick={
                closeAddModal
              }
              disabled={adding}
            >
              Hủy
            </CButton>

            <CButton
              color="primary"
              type="submit"
              disabled={
                adding ||
                loadingEmployees ||
                selectedUserIds.length ===
                  0
              }
            >
              {adding ? (
                <>
                  <CSpinner
                    size="sm"
                    className="me-2"
                  />

                  Đang thêm...
                </>
              ) : (
                <>
                  <CIcon
                    icon={cilPlus}
                    size="sm"
                    className="me-1"
                  />

                  Thêm{' '}
                  {selectedUserIds.length >
                  0
                    ? `(${selectedUserIds.length})`
                    : ''}{' '}
                  thành viên
                </>
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* ========================================================
          Remove Member Confirmation Modal
      ======================================================== */}

      <CModal
        visible={showRemoveModal}
        onClose={
          closeRemoveModal
        }
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>
            Xóa thành viên
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div className="text-center py-2">
            <CAvatar
              color="danger"
              textColor="white"
              size="xl"
              className="mb-3"
            >
              <CIcon
                icon={cilTrash}
              />
            </CAvatar>

            <h6 className="fw-semibold mb-2">
              Xác nhận xóa thành viên?
            </h6>

            <div className="text-body-secondary">
              Bạn có chắc muốn xóa{' '}
              <strong>
                {selectedMember?.name ||
                  'thành viên này'}
              </strong>{' '}
              khỏi dự án?
            </div>

            <div className="small text-body-secondary mt-2">
              Thành viên sẽ không còn xuất hiện trong danh sách thành viên của dự án.
            </div>
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={
              closeRemoveModal
            }
            disabled={removing}
          >
            Hủy
          </CButton>

          <CButton
            color="danger"
            onClick={() => {
              void handleRemoveMember()
            }}
            disabled={removing}
          >
            {removing ? (
              <>
                <CSpinner
                  size="sm"
                  className="me-2"
                />

                Đang xóa...
              </>
            ) : (
              <>
                <CIcon
                  icon={cilTrash}
                  size="sm"
                  className="me-1"
                />

                Xóa thành viên
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProjectMembers
