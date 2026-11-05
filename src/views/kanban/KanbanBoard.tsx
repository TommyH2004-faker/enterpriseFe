// // src/views/project-detail/KanbanBoard.tsx (Hoặc đường dẫn tương ứng của bạn)

// import React, { useEffect, useState } from 'react'
// import { DragDropContext } from '@hello-pangea/dnd'
// import { CAlert, CButton, CCard, CCardBody, CSpinner } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilPlus } from '@coreui/icons'
// import { useKanban, matchesTaskFilter } from './hooks/useKanban'
// import { KanbanHeader } from './components/KanbanHeader'

// import { CreateTaskModal, TaskLabelOption } from './components/CreateTaskModal'
// import { CreateBoardModal } from './components/CreateBoardModal'

// import { KanbanColumnView } from './components/KanbanColumnView'
// import { ProjectMemberResponse, projectService } from 'src/services/projectService'
// import { TaskDetailModal } from '../TaskDetail/components/TaskDetailModal'
// import labelService from 'src/services/labelService'

// const KanbanBoard: React.FC = () => {
//   const {
//     projectId,
//     project,
//     boards,
//     board,
//     loading,
//     boardLoading,
//     error,
//     search,
//     priority,
//     setSearch,
//     setPriority,
//     selectedTask,
//     modalVisible,
//     openTaskModal,
//     closeTaskModal,
//     updateTask,
//     deleteTask,
//     createBoardVisible,
//     setCreateBoardVisible,
//     createTaskVisible,
//     targetColumnId,
//     openCreateTaskModal,
//     closeCreateTaskModal,
//     loadBoard,
//     onDragEnd,
//     createBoard,
//     createTask,
//   } = useKanban()

//   const [projectMembers, setProjectMembers] = useState<ProjectMemberResponse[]>([])
  
//   // 1. THÊM STATE ĐỂ LƯU LABEL
//   const [projectLabels, setProjectLabels] = useState<TaskLabelOption[]>([])

//   useEffect(() => {
//     if (!projectId) {
//       setProjectMembers([])
//       setProjectLabels([])
//       return
//     }

//     const loadProjectData = async () => {
//       // --- TẢI THÀNH VIÊN ---
//       try {
//         const members = await projectService.getProjectMembers(projectId)
//         setProjectMembers(members)
//       } catch (error) {
//         console.error('Không thể tải thành viên dự án:', error)
//         setProjectMembers([])
//       }

//       // --- TẢI LABELS CHO CREATE TASK MODAL ---
//       try {
//         const labels = await labelService.getProjectLabels(projectId)
//         const rawLabels = Array.isArray(labels)
//           ? labels
//           : (labels as any)?.data?.data || (labels as any)?.data || []
        
//         if (Array.isArray(rawLabels)) {
//           const mappedLabels = rawLabels
//             .filter((l: any) => l.isActive !== false) // Lấy các label đang hoạt động
//             .map((l: any) => ({
//               id: l.id,
//               name: l.name,
//               color: l.color || '#0d6efd',
//             }))
//           setProjectLabels(mappedLabels)
//         }
//       } catch (error) {
//         console.error('Lỗi khi tải labels:', error)
//         setProjectLabels([])
//       }
//     }

//     loadProjectData()
//   }, [projectId])

//   /** Tạo label mới cho dự án rồi reload danh sách */
//   const handleCreateLabel = async (name: string, color: string) => {
//     if (!projectId) return
//     try {
//       await labelService.createLabel(projectId, { name, color })
//       // Reload labels
//       const response: any = await labelService.getProjectLabels(projectId)
//       const rawLabels = response?.data?.data || response?.data || response || []
//       if (Array.isArray(rawLabels)) {
//         setProjectLabels(
//           rawLabels
//             .filter((l: any) => l.isActive)
//             .map((l: any) => ({ id: l.id, name: l.name, color: l.color || '#0d6efd' }))
//         )
//       }
//     } catch (err) {
//       console.error('Lỗi khi tạo label:', err)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <CSpinner color="primary" />
//         <div className="text-muted small mt-2">Đang tải bảng Kanban dự án...</div>
//       </div>
//     )
//   }

//   if (error || !project) {
//     return <CAlert color="danger">{error || 'Không tìm thấy thông tin dự án.'}</CAlert>
//   }

//   return (
//     <div className="pb-4">
//       {/* Top Header and Filter Toolbar */}
//       <KanbanHeader
//         project={project}
//         boards={boards}
//         activeBoardId={board?.id}
//         boardLoading={boardLoading}
//         search={search}
//         priority={priority}
//         onSelectBoard={(boardId) => void loadBoard(boardId)}
//         onOpenCreateBoard={() => setCreateBoardVisible(true)}
//         onOpenCreateTask={() => openCreateTaskModal()}
//         onSearchChange={setSearch}
//         onPriorityChange={setPriority}
//       />

//       {/* Empty State when no board exists */}
//       {!board && (
//         <CCard className="border-0 shadow-sm bg-white p-5 text-center">
//           <CCardBody>
//             <h5 className="fw-bold text-dark">Dự án chưa có bảng Kanban</h5>
//             <p className="text-muted mb-4">
//               Tạo board đầu tiên để bắt đầu quản lý và kéo thả công việc của dự án này.
//             </p>
//             <CButton color="primary" onClick={() => setCreateBoardVisible(true)}>
//               <CIcon icon={cilPlus} className="me-2" /> Tạo board đầu tiên
//             </CButton>
//           </CCardBody>
//         </CCard>
//       )}

//       {/* 4-Column Drag and Drop Kanban Board */}
//       {board && (
//         <div className="overflow-auto pb-3">
//           <DragDropContext onDragEnd={(result) => void onDragEnd(result)}>
//             <div
//               className="d-flex gap-3 align-items-start"
//               style={{ minWidth: `${board.columns.length * 315}px` }}
//             >
//               {/* {board.columns
//                 .sort((a, b) => a.position - b.position)
//                 .map((column) => {
                  
//                   const tasks = (column.tasks || []).filter((task) =>
//                     matchesTaskFilter(task, search, priority),
//                   )
//                   return (
//                     <KanbanColumnView
//                       key={column.id}
//                       column={column}
//                       tasks={tasks}
//                       members={projectMembers}
//                       onTaskClick={openTaskModal}
//                       onAddTask={(columnId) => openCreateTaskModal(columnId)}
//                     />
//                   )
//                 })} */}
//                 {board.columns
//   .sort((a, b) => a.position - b.position)
//   .map((column) => {
//     console.log(
//       'FILTER DEBUG:',
//       {
//         selectedPriority: priority,
//         selectedPriorityNumber: Number(priority),
//         column: column.name,
//         tasks: column.tasks?.map((task) => ({
//           title: task.title,
//           priority: task.priority,
//           priorityType: typeof task.priority,
//         })),
//       }
//     )

//     const tasks = (column.tasks || []).filter((task) =>
//       matchesTaskFilter(task, search, priority),
//     )

//     return (
//       <KanbanColumnView
//         key={column.id}
//         column={column}
//         tasks={tasks}
//         members={projectMembers}
//         onTaskClick={openTaskModal}
//         onAddTask={(columnId) => openCreateTaskModal(columnId)}
//       />
//     )
//   })}
//             </div>
//           </DragDropContext>
//         </div>
//       )}

//       {/* Modals */}
//       <TaskDetailModal
//         visible={modalVisible}
//         taskId={selectedTask?.id ?? null}
//         projectId={projectId}
//         columns={(board?.columns ?? []).map((column) => ({
//           id: column.id,
//           name: column.name,
//         }))}
//         members={projectMembers.map((member: any) => ({
//           id: member.id || member.employeeId,
//           name: member.name || member.fullName,
//         }))}
//         initialAssigneeIds={
//           selectedTask?.assignees?.map((a: any) => a.id) ??
//           (selectedTask as any)?.assigneeIds ??
//           []
//         }
//         onClose={closeTaskModal}
//         onChanged={() => {
//           if (board?.id) {
//             void loadBoard(board.id)
//           }
//         }}
//       />

//       <CreateTaskModal
//         visible={createTaskVisible}
//         columns={board?.columns || []}
//         defaultColumnId={targetColumnId}
//         projectId={projectId}
//         boardId={board?.id || ''}
//         // 2. MAP LẠI MEMBERS CHO ĐÚNG ĐỊNH DẠNG MODAL CẦN {id, name, email}
//         members={projectMembers.map((member: any) => ({
//           id: member.id || member.employeeId,
//           name: member.name || member.fullName,
//           email: member.email || '',
//         }))}
//         // 3. TRUYỀN LABELS XUỐNG MODAL
//         labels={projectLabels}
//         onCreateLabel={handleCreateLabel}
//         onClose={closeCreateTaskModal}
//         onSubmit={createTask}
//       />

//       <CreateBoardModal
//         visible={createBoardVisible}
//         onClose={() => setCreateBoardVisible(false)}
//         onSubmit={createBoard}
//       />
//     </div>
//   )
// }

// export default KanbanBoard
// src/views/project-detail/KanbanBoard.tsx

import React, { useEffect, useState } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import {
  CButton,
  CCard,
  CCardBody,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import toast from 'react-hot-toast'
import { useKanban, matchesTaskFilter } from './hooks/useKanban'
import { KanbanHeader } from './components/KanbanHeader'

import { CreateTaskModal, TaskLabelOption } from './components/CreateTaskModal'
import { CreateBoardModal } from './components/CreateBoardModal'

import { KanbanColumnView } from './components/KanbanColumnView'

import { ProjectMemberResponse, projectService } from 'src/services/projectService'
import ToastAlert from 'src/components/ToastAlert'
import { TaskDetailModal } from '../TaskDetail/components/TaskDetailModal'
import labelService from 'src/services/labelService'
import { KanbanTask } from 'src/types/KanbanType/kanban'
import TaskDeleteZone, { TASK_DELETE_ZONE_ID } from './components/Taskdeletezone'

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
  const [projectLabels, setProjectLabels] = useState<TaskLabelOption[]>([])

  // --- Xoá task bằng kéo thả ---
  const [isDragging, setIsDragging] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null)
  const [deleting, setDeleting] = useState(false)

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

      // --- TẢI LABELS CHO CREATE TASK MODAL ---
      try {
        const labels = await labelService.getProjectLabels(projectId)
        const rawLabels = Array.isArray(labels)
          ? labels
          : (labels as any)?.data?.data || (labels as any)?.data || []

        if (Array.isArray(rawLabels)) {
          const mappedLabels = rawLabels
            .filter((l: any) => l.isActive !== false)
            .map((l: any) => ({
              id: l.id,
              name: l.name,
              color: l.color || '#0d6efd',
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

  /** Tạo label mới cho dự án rồi reload danh sách */
  const handleCreateLabel = async (name: string, color: string) => {
    if (!projectId) return
    try {
      await labelService.createLabel(projectId, { name, color })
      const response: any = await labelService.getProjectLabels(projectId)
      const rawLabels = response?.data?.data || response?.data || response || []
      if (Array.isArray(rawLabels)) {
        setProjectLabels(
          rawLabels
            .filter((l: any) => l.isActive)
            .map((l: any) => ({ id: l.id, name: l.name, color: l.color || '#0d6efd' })),
        )
      }
    } catch (err) {
      console.error('Lỗi khi tạo label:', err)
    }
  }

  /**
   * Thả vào vùng xoá thì chỉ mở hộp xác nhận, KHÔNG gọi onDragEnd của hook
   * (hook sẽ coi vùng xoá là một cột không tồn tại).
   */
  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false)

    if (result.destination?.droppableId === TASK_DELETE_ZONE_ID) {
      const task = (board?.columns ?? [])
        .flatMap((column) => column.tasks || [])
        .find((t) => t.id === result.draggableId)

      if (task) setTaskToDelete(task)
      return
    }

    void onDragEnd(result)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      setDeleting(true)
      await deleteTask(taskToDelete.id)
      toast.success('Đã xoá công việc')
      setTaskToDelete(null)

      if (board?.id) await loadBoard(board.id)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xoá công việc.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="text-muted small mt-2">Đang tải bảng Kanban dự án...</div>
      </div>
    )
  }

  if (error || !project) {
    return <ToastAlert message={error || 'Không tìm thấy thông tin dự án.'} />
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

      {/* Kanban Board */}
      {board && (
        <div className="overflow-auto pb-3">
          <DragDropContext
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <div
              className="d-flex gap-3 align-items-start"
              style={{ minWidth: `${board.columns.length * 315}px` }}
            >
              {[...board.columns]
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
                      members={projectMembers}
                      onTaskClick={openTaskModal}
                      onAddTask={(columnId) => openCreateTaskModal(columnId)}
                    />
                  )
                })}
            </div>

            {/* Vùng thả xoá: phải nằm BÊN TRONG DragDropContext */}
            <TaskDeleteZone visible={isDragging} />
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
        members={projectMembers.map((member: any) => ({
          id: member.id || member.employeeId,
          name: member.name || member.fullName,
        }))}
        initialAssigneeIds={
          selectedTask?.assignees?.map((a: any) => a.id) ??
          (selectedTask as any)?.assigneeIds ??
          []
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
        members={projectMembers.map((member: any) => ({
          id: member.id || member.employeeId,
          name: member.name || member.fullName,
          email: member.email || '',
        }))}
        labels={projectLabels}
        onCreateLabel={handleCreateLabel}
        onClose={closeCreateTaskModal}
        onSubmit={createTask}
      />

      <CreateBoardModal
        visible={createBoardVisible}
        onClose={() => setCreateBoardVisible(false)}
        onSubmit={createBoard}
      />

      {/* Xác nhận xoá task */}
      <CModal
        visible={!!taskToDelete}
        onClose={() => !deleting && setTaskToDelete(null)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Xoá công việc</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn chắc chắn muốn xoá <strong>{taskToDelete?.title}</strong>? Hành động này không thể hoàn tác.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            disabled={deleting}
            onClick={() => setTaskToDelete(null)}
          >
            Huỷ
          </CButton>
          <CButton color="danger" disabled={deleting} onClick={() => void confirmDeleteTask()}>
            {deleting ? <CSpinner size="sm" /> : 'Xoá'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default KanbanBoard