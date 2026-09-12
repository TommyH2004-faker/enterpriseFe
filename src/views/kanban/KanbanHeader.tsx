import React from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CFormInput,
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPlus, cilSearch, cilTask } from '@coreui/icons'
import { KanbanBoardSummary, ProjectDetail } from '../../types/Project'

interface KanbanHeaderProps {
  project: ProjectDetail | null
  boards: KanbanBoardSummary[]
  activeBoardId?: string
  boardLoading: boolean
  search: string
  priority: string
  onSelectBoard: (boardId: string) => void
  onOpenCreateBoard: () => void
  onOpenCreateTask: () => void
  onSearchChange: (value: string) => void
  onPriorityChange: (value: string) => void
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  project,
  boards,
  activeBoardId,
  boardLoading,
  search,
  priority,
  onSelectBoard,
  onOpenCreateBoard,
  onOpenCreateTask,
  onSearchChange,
  onPriorityChange,
}) => {
  if (!project) return null

  return (
    <>
      {/* Top Title & Actions */}
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <Link
            to={`/projects/${project.id}`}
            className="text-decoration-none small text-muted d-inline-flex align-items-center mb-2"
          >
            <CIcon icon={cilArrowLeft} className="me-1" /> Chi tiết dự án
          </Link>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-light text-secondary border px-2 py-1 fw-semibold">
              {project.code}
            </span>
            <h1 className="h3 fw-bold text-dark mb-0">{project.name}</h1>
          </div>
          <p className="text-muted mb-0 small">
            Bảng Kanban quy trình quản lý công việc của dự án
          </p>
        </div>

        <div className="d-flex gap-2">
          <CButton
            color="primary"
            className="d-flex align-items-center shadow-sm px-3 py-2 fw-semibold"
            onClick={onOpenCreateTask}
          >
            <CIcon icon={cilPlus} className="me-2" /> Thêm công việc
          </CButton>
        </div>
      </div>

      {/* Toolbar: Board switcher, Search, Filter */}
      <CCard className="border-0 shadow-sm mb-4 bg-white">
        <CCardBody className="p-3 d-flex gap-3 flex-wrap align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {boards.length > 0 && (
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-medium">Bảng:</span>
                <CFormSelect
                  className="w-auto bg-light fw-medium"
                  value={activeBoardId || ''}
                  onChange={(event) => onSelectBoard(event.target.value)}
                >
                  {boards.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            )}

            <CButton
              color="light"
              variant="outline"
              className="border text-secondary small d-flex align-items-center"
              onClick={onOpenCreateBoard}
            >
              <CIcon icon={cilPlus} className="me-1" /> Tạo board mới
            </CButton>
          </div>

          <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end" style={{ maxWidth: 500 }}>
            {/* Search Input */}
            <div className="input-group" style={{ maxWidth: 280 }}>
              <span className="input-group-text bg-light border-end-0">
                <CIcon icon={cilSearch} className="text-muted" />
              </span>
              <CFormInput
                className="bg-light border-start-0 ps-0"
                placeholder="Tìm việc theo tên..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>

            {/* Priority Filter */}
            <CFormSelect
              className="w-auto bg-light"
              value={priority}
              onChange={(event) => onPriorityChange(event.target.value)}
            >
              <option value="">Tất cả mức ưu tiên</option>
              <option value="Critical">Khẩn cấp</option>
              <option value="High">Cao</option>
              <option value="Medium">Trung bình</option>
              <option value="Low">Thấp</option>
            </CFormSelect>

            {boardLoading && <CSpinner size="sm" color="primary" />}
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}
