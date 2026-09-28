
// src/views/projects/hooks/useProjectForm.ts

import { useEffect, useState } from 'react'
import {
  CreateProjectRequest,
  ProjectDetail,
  ProjectPriority,
  ProjectPriorityLabel,
  UpdateProjectRequest,
} from 'src/types/ProjectType/project'

interface UseProjectFormProps {
  project?: ProjectDetail | null
}

// UI: string
// API/DB: number
const priorityMap: Record<
  ProjectPriorityLabel,
  ProjectPriority
> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
}

const priorityLabelMap: Record<
  ProjectPriority,
  ProjectPriorityLabel
> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}

export const useProjectForm = ({
  project,
}: UseProjectFormProps = {}) => {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Thành viên dự án
  const [memberIds, setMemberIds] = useState<string[]>([])

  const [departmentId, setDepartmentId] =
    useState('')

  const [managerId, setManagerId] =
    useState('')

  const [startDate, setStartDate] =
    useState('')

  const [endDate, setEndDate] =
    useState('')

  // UI vẫn dùng string
  const [priority, setPriority] =
    useState<ProjectPriorityLabel>('Medium')

  const [errors, setErrors] =
    useState<Record<string, string>>({})

  useEffect(() => {
    // =========================
    // CREATE MODE
    // =========================
    if (!project) {
      setCode('')
      setName('')
      setDescription('')

      setMemberIds([])

      setDepartmentId('')
      setManagerId('')
      setStartDate('')
      setEndDate('')
      setPriority('Medium')
      setErrors({})

      return
    }

    // =========================
    // EDIT MODE
    // =========================
    setCode(project.code || '')
    setName(project.name || '')
    setDescription(project.description || '')

    setDepartmentId(
      project.departmentId ||
        project.department?.id ||
        '',
    )

    setManagerId(
      project.managerId ||
        project.manager?.id ||
        '',
    )

   setMemberIds(
    project.memebers?.map((m) => m.userId) || [],
  )

    setStartDate(
      project.startDate
        ? project.startDate.substring(0, 10)
        : '',
    )

    setEndDate(
      project.endDate
        ? project.endDate.substring(0, 10)
        : '',
    )

    // Backend trả number -> UI chuyển thành string
    setPriority(
      project.priority
        ? priorityLabelMap[project.priority]
        : 'Medium',
    )

    setErrors({})
  }, [project])

  const validate = (
    isCreate: boolean,
  ) => {
    const nextErrors: Record<string, string> = {}

    if (isCreate && !code.trim()) {
      nextErrors.code =
        'Mã dự án không được để trống.'
    }

    if (!name.trim()) {
      nextErrors.name =
        'Tên dự án không được để trống.'
    }

    if (isCreate && !departmentId) {
      nextErrors.departmentId =
        'Vui lòng chọn phòng ban.'
    }

    if (isCreate && !managerId) {
      nextErrors.managerId =
        'Vui lòng chọn quản lý dự án.'
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      nextErrors.endDate =
        'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  // =========================
  // CREATE PROJECT
  // =========================
  // UI string -> API number
  const buildCreateRequest =
    (): CreateProjectRequest => {
      const request: CreateProjectRequest = {
        code: code.trim(),

        name: name.trim(),

        description:
          description.trim() || undefined,

        departmentId,

        managerId,

        // Thành viên được chọn trong phòng ban
        memberIds,

        startDate:
          startDate || null,

        endDate:
          endDate || null,

        priority: priorityMap[priority],
      }

      console.log(
        '========== BUILD CREATE PROJECT REQUEST ==========',
      )

      console.log(
        JSON.stringify(request, null, 2),
      )

      console.log(
        'priority:',
        request.priority,
        'type:',
        typeof request.priority,
      )

      console.log(
        'memberIds:',
        request.memberIds,
      )

      console.log(
        '==================================================',
      )

      return request
    }

  // =========================
  // UPDATE PROJECT
  // =========================
  // UI string -> API number
  const buildUpdateRequest =
    (): UpdateProjectRequest => ({
      name: name.trim(),

      description:
        description.trim() || undefined,

      startDate:
        startDate || null,

      endDate:
        endDate || null,

      priority: priorityMap[priority],
    })

  return {
    code,
    setCode,

    name,
    setName,

    description,
    setDescription,

    // Project members
    memberIds,
    setMemberIds,

    departmentId,
    setDepartmentId,

    managerId,
    setManagerId,

    startDate,
    setStartDate,

    endDate,
    setEndDate,

    priority,
    setPriority,

    errors,

    validate,

    buildCreateRequest,
    buildUpdateRequest,
  }
}
