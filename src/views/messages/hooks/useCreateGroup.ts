import { useEffect, useMemo, useState } from 'react'
import {
  ChatService,
  ConversationType,
  CreateGroupRequest,
  DepartmentItem,
  EmployeeSearchItem,
} from 'src/services/chatService'

export type GroupMode = 'members' | 'department'

export const useCreateGroup = (
  service: ChatService,
  currentUserId: string,
  open: boolean,
) => {
  const [mode, setModeState] = useState<GroupMode>('members')
  const [name, setNameState] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EmployeeSearchItem[]>([])
  const [departments, setDepartments] = useState<DepartmentItem[]>([])
  const [departmentId, setDepartmentIdState] = useState('')
  const [selected, setSelected] = useState<Record<string, EmployeeSearchItem>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withoutMe = (items: EmployeeSearchItem[]) =>
    items.filter((p) => p.userId !== currentUserId)

  const reset = () => {
    setModeState('members')
    setNameState('')
    setNameTouched(false)
    setQuery('')
    setResults([])
    setDepartmentIdState('')
    setSelected({})
    setError(null)
  }

  // Đóng modal => dọn state
  useEffect(() => {
    if (!open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Tải phòng ban khi mở tab "Theo phòng ban" lần đầu
  useEffect(() => {
    if (!open || mode !== 'department' || departments.length) return
    service
      .getDepartments()
      .then(setDepartments)
      .catch(() => setError('Không thể tải danh sách phòng ban.'))
  }, [open, mode, departments.length, service])

  // Tab chọn thành viên: tìm theo tên (debounce)
  useEffect(() => {
    if (!open || mode !== 'members') return
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = window.setTimeout(() => {
      service
        .searchEmployees(query.trim())
        .then((items) => setResults(withoutMe(items)))
        .catch(() => setResults([]))
    }, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mode, open, service])

  const setMode = (next: GroupMode) => {
    if (next === mode) return
    setModeState(next)
    setSelected({})
    setResults([])
    setQuery('')
    setDepartmentIdState('')
    setError(null)
  }

  const setName = (value: string) => {
    setNameState(value)
    setNameTouched(true)
  }

  // Chọn phòng ban => tải toàn bộ nhân viên và chọn sẵn
  const setDepartmentId = async (id: string) => {
    setDepartmentIdState(id)
    setSelected({})
    setResults([])
    setError(null)
    if (!id) return

    const department = departments.find((d) => d.id === id)
    if (!nameTouched && department) setNameState(department.name)

    try {
      setLoading(true)
      const items = withoutMe(await service.searchEmployees(undefined, id))
      setResults(items)
      setSelected(Object.fromEntries(items.map((p) => [p.userId, p])))
    } catch {
      setError('Không thể tải nhân viên của phòng ban.')
    } finally {
      setLoading(false)
    }
  }

  const toggle = (person: EmployeeSearchItem) =>
    setSelected((cur) => {
      const next = { ...cur }
      if (next[person.userId]) delete next[person.userId]
      else next[person.userId] = person
      return next
    })

  const selectedList = useMemo(() => Object.values(selected), [selected])

  const allChecked =
    results.length > 0 && results.every((p) => selected[p.userId])

  const toggleAll = () =>
    setSelected(
      allChecked ? {} : Object.fromEntries(results.map((p) => [p.userId, p])),
    )

  // Backend yêu cầu Name; nhóm cần >= 2 thành viên (ngoài bạn)
  const canSubmit =
    name.trim().length > 0 &&
    selectedList.length >= 2 &&
    (mode === 'members' || !!departmentId)

  const buildRequest = (): CreateGroupRequest => ({
    name: name.trim(),
    type: mode === 'department' ? ConversationType.Department : ConversationType.Group,
    departmentId: mode === 'department' ? departmentId : null,
    projectId: null,
    memberUserIds: selectedList.map((p) => p.userId),
  })

  return {
    mode, setMode,
    name, setName,
    query, setQuery,
    results,
    departments,
    departmentId, setDepartmentId,
    selectedList, selected,
    loading, error, setError,
    allChecked, toggle, toggleAll,
    canSubmit, buildRequest,
  }
}