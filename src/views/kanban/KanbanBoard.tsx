import React from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { CAlert, CButton, CCard, CCardBody, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useKanban, matchesTaskFilter } from './useKanban'
import { KanbanHeader } from './KanbanHeader'
import { KanbanColumnView } from './KanbanColumnView'
import { CreateTaskModal } from './CreateTaskModal'
import { CreateBoardModal } from './CreateBoardModal'
import TaskDetailModal from './TaskDetailModal'

const KanbanBoard: React.FC = () => {
  const {
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
        onClose={closeTaskModal}
        task={selectedTask}
        columns={board?.columns || []}
        projectMembers={project?.members || []}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />

      <CreateTaskModal
        visible={createTaskVisible}
        columns={board?.columns || []}
        defaultColumnId={targetColumnId}
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
