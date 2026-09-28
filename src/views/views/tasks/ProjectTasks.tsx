import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CFormInput,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilTask } from '@coreui/icons'
import { useParams } from 'react-router-dom'

import taskService from 'src/services/taskService'
import type { TaskDetailResponse } from 'src/types/taskDetail'
import TaskDetailModal from './TaskDetailModal'

const priorityLabel: Record<number, string> = {
  1: 'Thấp',
  2: 'Trung bình',
  3: 'Cao',
  4: 'Khẩn cấp',
}

const ProjectTasks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [tasks, setTasks] = useState<TaskDetailResponse[]>([])
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const items = await taskService.getTasks({
        projectId,
        pageNumber: 1,
        pageSize: 100,
      })
      setTasks(items ?? [])
    } catch (err) {
      const axiosError = err as {
        response?: { data?: { message?: string } }
        message?: string
      }
      setError(
        axiosError?.response?.data?.message ||
          axiosError?.message ||
          'Không thể tải danh sách công việc.',
      )
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesSearch =
        !keyword ||
        `${task.title} ${task.description || ''}`.toLowerCase().includes(keyword)

      const matchesPriority = !priority || task.priority === Number(priority)

      return matchesSearch && matchesPriority
    })
  }, [tasks, search, priority])

  return (
    <>
      <CCard className="border-0 shadow-sm">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
            <div>
              <h5 className="mb-1">
                <CIcon icon={cilTask} className="me-2" />
                Công việc của dự án
              </h5>
              <div className="small text-body-secondary">Project ID: {projectId}</div>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <div className="position-relative">
                <CIcon
                  icon={cilSearch}
                  className="position-absolute top-50 translate-middle-y ms-2 text-body-secondary"
                />
                <CFormInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm công việc..."
                  className="ps-5"
                />
              </div>

              <CFormSelect value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Tất cả ưu tiên</option>
                <option value="1">Thấp</option>
                <option value="2">Trung bình</option>
                <option value="3">Cao</option>
                <option value="4">Khẩn cấp</option>
              </CFormSelect>
            </div>
          </div>

          {error && <CAlert color="danger">{error}</CAlert>}

          {loading ? (
            <div className="d-flex justify-content-center py-5"><CSpinner /></div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-body-secondary py-5">Không có công việc phù hợp.</div>
          ) : (
            <CTable hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Công việc</CTableHeaderCell>
                  <CTableHeaderCell>Ưu tiên</CTableHeaderCell>
                  <CTableHeaderCell>Tiến độ</CTableHeaderCell>
                  <CTableHeaderCell>Deadline</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredTasks.map((task) => (
                  <CTableRow key={task.id}>
                    <CTableDataCell>
                      <div className="fw-semibold">{task.title}</div>
                      {task.description && (
                        <div className="small text-body-secondary text-truncate" style={{ maxWidth: 420 }}>
                          {task.description}
                        </div>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="light" textColor="dark">
                        {priorityLabel[task.priority] || `Priority ${task.priority}`}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{task.progress ?? 0}%</CTableDataCell>
                    <CTableDataCell>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        Chi tiết
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <TaskDetailModal
        visible={Boolean(selectedTaskId)}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onChanged={() => void loadTasks()}
      />
    </>
  )
}

export default ProjectTasks
