import React, { useMemo, useState } from 'react'
import { CButton, CDropdown, CDropdownMenu, CDropdownToggle, CFormCheck, CFormInput } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilUserPlus, cilX } from '@coreui/icons'

export interface TaskAssigneeOption {
  id: string
  name: string
  email?: string
}

interface TaskAssigneesSectionProps {
  members: TaskAssigneeOption[]
  selectedIds: string[]
  initialized: boolean
  saving: boolean
  onChange: (ids: string[]) => void
  onSave: () => void
}

export const TaskAssigneesSection: React.FC<TaskAssigneesSectionProps> = ({
  members,
  selectedIds,
  initialized,
  saving,
  onChange,
  onSave,
}) => {
  const [search, setSearch] = useState('')

  const selectedSet = useMemo(
    () => new Set(selectedIds.map((id) => id.toLowerCase())),
    [selectedIds],
  )

  const toggle = (id: string, checked: boolean) => {
    const next = new Set(selectedSet)
    if (checked) {
      next.add(id.toLowerCase())
    } else {
      next.delete(id.toLowerCase())
    }
    // Match back original IDs from members or selectedIds
    const updated = Array.from(next).map((lowId) => {
      const foundMember = members.find((m) => m.id.toLowerCase() === lowId)
      if (foundMember) return foundMember.id
      const foundSelected = selectedIds.find((sid) => sid.toLowerCase() === lowId)
      return foundSelected || lowId
    })
    onChange(updated)
  }

  const removeAssignee = (idToRemove: string) => {
    const next = selectedIds.filter(
      (id) => id.toLowerCase() !== idToRemove.toLowerCase(),
    )
    onChange(next)
  }

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members
    const term = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term),
    )
  }, [members, search])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label
          className="text-uppercase text-muted fw-bold small d-block mb-0"
          style={{ fontSize: '11px' }}
        >
          Người thực hiện (Assignee)
        </label>
        {selectedIds.length > 0 && (
          <CButton
            color="primary"
            variant="ghost"
            size="sm"
            className="py-0 px-1 text-decoration-none fw-semibold"
            disabled={saving}
            onClick={onSave}
          >
            Lưu
          </CButton>
        )}
      </div>

      <div className="bg-white p-2 rounded-3 border shadow-none">
        {/* Danh sách người thực hiện đã gán */}
        {selectedIds.length > 0 ? (
          <div
            className="d-flex flex-column gap-1 mb-2"
            style={{ maxHeight: 100, overflowY: 'auto' }}
          >
            {selectedIds.map((id) => {
              const member = members.find(
                (item) => item.id.toLowerCase() === id.toLowerCase(),
              )
              const displayName = member?.name || `Thành viên (${id.slice(0, 8)})`
              const initial = displayName.trim().charAt(0).toUpperCase()

              return (
                <div
                  key={id}
                  className="d-flex align-items-center justify-content-between px-2 py-1 bg-light rounded-2 border border-light"
                >
                  <div className="d-flex align-items-center gap-2 min-w-0">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{ width: 24, height: 24, fontSize: '11px' }}
                    >
                      {initial}
                    </div>
                    <span className="small fw-semibold text-dark text-truncate">
                      {displayName}
                    </span>
                  </div>
                  <CIcon
                    icon={cilX}
                    size="sm"
                    className="text-muted hover-text-danger cursor-pointer ms-2 flex-shrink-0"
                    onClick={() => removeAssignee(id)}
                    title={`Bỏ gán ${displayName}`}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="small text-muted fst-italic mb-2 px-1">
            Chưa có người thực hiện nào.
          </div>
        )}

        {/* Nút dropdown thêm thành viên */}
        <CDropdown placement="bottom-start" className="w-100">
          <CDropdownToggle
            color="light"
            size="sm"
            caret={false}
            className="border w-100 text-start text-secondary d-flex align-items-center justify-content-between py-1 px-2 shadow-none"
          >
            <span className="d-flex align-items-center gap-2 small fw-semibold">
              <CIcon icon={cilUserPlus} size="sm" className="text-primary" />
              {selectedIds.length === 0
                ? 'Gán người thực hiện...'
                : '+ Thêm / Đổi người thực hiện'}
            </span>
            <span className="small text-muted">▼</span>
          </CDropdownToggle>
          <CDropdownMenu
            className="p-3 shadow border-0"
            style={{ width: 280, maxHeight: 320, overflowY: 'auto' }}
          >
            <div className="fw-bold mb-2 small text-dark">Danh sách thành viên</div>
            {members.length > 5 && (
              <CFormInput
                size="sm"
                placeholder="Tìm thành viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2 bg-light border-0"
              />
            )}
            {filteredMembers.length === 0 ? (
              <div className="small text-muted py-2 text-center">
                Không tìm thấy thành viên.
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isChecked = selectedSet.has(member.id.toLowerCase())
                const initial = (member.name || 'U').trim().charAt(0).toUpperCase()
                return (
                  <div
                    key={member.id}
                    className="d-flex align-items-center justify-content-between py-1 px-1 rounded hover-bg-light cursor-pointer"
                    onClick={() => toggle(member.id, !isChecked)}
                  >
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <div
                        className="rounded-circle bg-secondary bg-opacity-25 text-primary d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: 22, height: 22, fontSize: '10px' }}
                      >
                        {initial}
                      </div>
                      <span className="small text-dark text-truncate fw-medium">
                        {member.name}
                      </span>
                    </div>
                    <CFormCheck
                      id={`assignee-check-${member.id}`}
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggle(member.id, e.target.checked)
                      }}
                      className="m-0 cursor-pointer"
                    />
                  </div>
                )
              })
            )}
          </CDropdownMenu>
        </CDropdown>
      </div>
    </div>
  )
}