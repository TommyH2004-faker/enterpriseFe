// src/views/project-detail/KanbanBoard.tsx (Hoặc đường dẫn tương ứng của bạn)

import React, { useEffect, useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { CAlert, CButton, CCard, CCardBody, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useKanban, matchesTaskFilter } from './hooks/useKanban'
import { KanbanHeader } from './components/KanbanHeader'

import { CreateTaskModal, TaskLabelOption } from './components/CreateTaskModal'
import { CreateBoardModal } from './components/CreateBoardModal'

import { KanbanColumnView } from './components/KanbanColumnView'
import { ProjectMemberResponse, projectService } from 'src/services/projectService'
import { TaskDetailModal } from '../TaskDetail/components/TaskDetailModal'
import labelService from 'src/services/labelService'

const KanbanBoard: React.FC = () => {
  const {
    projectId,
    project,
    boards,
    board,
    loading,
    boardLoading,
    error,
    search,
    priority,
    setSearch,
    setPriority,
    selectedTask,
    modalVisible,
    openTaskModal,
    closeTaskModal,
    updateTask,
    deleteTask,
    createBoardVisible,
    setCreateBoardVisible,
    createTaskVisible,
    targetColumnId,
    openCreateTaskModal,
    closeCreateTaskModal,
    loadBoard,
    onDragEnd,
    createBoard,
    createTask,
  } = useKanban()

  const [projectMembers, setProjectMembers] = useState<ProjectMemberResponse[]>([])
  
  // 1. THÊM STATE ĐỂ LƯU LABEL
  const [projectLabels, setProjectLabels] = useState<TaskLabelOption[]>([])

  useEffect(() => {
    if (!projectId) {
      setProjectMembers([])
      setProjectLabels([])
      return
    }

    const loadProjectData = async () => {
      // --- TẢI THÀNH VIÊN ---
      try {
        const members = await projectService.getProjectMembers(projectId)
        setProjectMembers(members)
      } catch (error) {
        console.error('Không thể tải thành viên dự án:', error)
        setProjectMembers([])
      }

      // --- TẢI LABELS VÀ BÓC TÁCH RESULT PATTERN ---
      try {
        // Giả sử bạn gọi API get labels qua projectService hoặc custom axios
        const response: any = await labelService.getProjectLabels(projectId)
        
        // Bóc tách an toàn: hỗ trợ cả trường hợp lấy trực tiếp mảng, hoặc bọc trong data.data
        const rawLabels = response?.data?.data || response?.data || response || []
        
        if (Array.isArray(rawLabels)) {
          const mappedLabels = rawLabels
            .filter((l: any) => l.isActive) // Chỉ lấy label đang hoạt động
            .map((l: any) => ({
              id: l.id,
              name: l.name,
            }))
          setProjectLabels(mappedLabels)
        }
      } catch (error) {
        console.error('Lỗi khi tải labels:', error)
        setProjectLabels([])
      }
    }

    loadProjectData()
  }, [projectId])

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="text-muted small mt-2">Đang tải bảng Kanban dự án...</div>
      </div>
    )
  }

  if (error || !project) {
    return <CAlert color="danger">{error || 'Không tìm thấy thông tin dự án.'}</CAlert>
  }

  return (
    <div className="pb-4">
      {/* Top Header and Filter Toolbar */}
      <KanbanHeader
        project={project}
        boards={boards}
        activeBoardId={board?.id}
        boardLoading={boardLoading}
        search={search}
        priority={priority}
        onSelectBoard={(boardId) => void loadBoard(boardId)}
        onOpenCreateBoard={() => setCreateBoardVisible(true)}
        onOpenCreateTask={() => openCreateTaskModal()}
        onSearchChange={setSearch}
        onPriorityChange={setPriority}
      />

      {/* Empty State when no board exists */}
      {!board && (
        <CCard className="border-0 shadow-sm bg-white p-5 text-center">
          <CCardBody>
            <h5 className="fw-bold text-dark">Dự án chưa có bảng Kanban</h5>
            <p className="text-muted mb-4">
              Tạo board đầu tiên để bắt đầu quản lý và kéo thả công việc của dự án này.
            </p>
            <CButton color="primary" onClick={() => setCreateBoardVisible(true)}>
              <CIcon icon={cilPlus} className="me-2" /> Tạo board đầu tiên
            </CButton>
          </CCardBody>
        </CCard>
      )}

      {/* 4-Column Drag and Drop Kanban Board */}
      {board && (
        <div className="overflow-auto pb-3">
          <DragDropContext onDragEnd={(result) => void onDragEnd(result)}>
            <div
              className="d-flex gap-3 align-items-start"
              style={{ minWidth: `${board.columns.length * 315}px` }}
            >
              {board.columns
                .sort((a, b) => a.position - b.position)
                .map((column) => {
                  const tasks = (column.tasks || []).filter((task) =>
                    matchesTaskFilter(task, search, priority),
                  )
                  return (
                    <KanbanColumnView
                      key={column.id}
                      column={column}
                      tasks={tasks}
                      onTaskClick={openTaskModal}
                      onAddTask={(columnId) => openCreateTaskModal(columnId)}
                    />
                  )
                })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Modals */}
      <TaskDetailModal
        visible={modalVisible}
        taskId={selectedTask?.id ?? null}
        projectId={projectId}
        columns={(board?.columns ?? []).map((column) => ({
          id: column.id,
          name: column.name,
        }))}
        members={projectMembers.map((member) => ({
          id: member.id,
          name: member.name,
        }))}
        initialAssigneeIds={
          (selectedTask as { assigneeIds?: string[] } | null)?.assigneeIds
        }
        onClose={closeTaskModal}
        onChanged={() => {
          if (board?.id) {
            void loadBoard(board.id)
          }
        }}
      />

      <CreateTaskModal
        visible={createTaskVisible}
        columns={board?.columns || []}
        defaultColumnId={targetColumnId}
        projectId={projectId}
        boardId={board?.id || ''}
        // 2. MAP LẠI MEMBERS CHO ĐÚNG ĐỊNH DẠNG MODAL CẦN {id, name, email}
        members={projectMembers.map((member: any) => ({
          id: member.id || member.employeeId,
          name: member.name || member.fullName,
          email: member.email || '',
        }))}
        // 3. TRUYỀN LABELS XUỐNG MODAL
        labels={projectLabels}
        onClose={closeCreateTaskModal}
        onSubmit={createTask}
      />

      <CreateBoardModal
        visible={createBoardVisible}
        onClose={() => setCreateBoardVisible(false)}
        onSubmit={createBoard}
      />
    </div>
  )
}

export default KanbanBoard