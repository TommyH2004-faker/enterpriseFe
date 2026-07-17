import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  CButton,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilPlus,
  cilCommentSquare,
  cilPaperclip,
  cilCalendar,
  cilOptions,
} from '@coreui/icons'
import TaskDetailModal from './TaskDetailModal'
import { Task, Column } from '../../types'

interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const initialData: BoardData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Design Dashboard UI', description: 'Create mockups and...', priority: 'Khẩn cấp', assignee: 'Nguyễn Văn A', dueDate: '30/12', comments: 3, attachments: 2, labels: [{ text: 'Design', color: 'info' }] },
    'task-2': { id: 'task-2', content: 'Setup React TS', description: 'Install Vite + TS.', priority: 'Trung bình', assignee: 'Lê Văn C', dueDate: '15/11', comments: 0, attachments: 0, labels: [{ text: 'Frontend', color: 'primary' }] },
    'task-3': { id: 'task-3', content: 'Database Schema', description: 'User, Project schema.', priority: 'Cao', assignee: 'Trần Thị B', dueDate: '20/11', comments: 5, attachments: 1, labels: [{ text: 'Backend', color: 'dark' }] },
    'task-4': { id: 'task-4', content: 'API Đăng nhập', description: 'JWT Auth.', priority: 'Khẩn cấp', assignee: 'Trần Thị B', dueDate: '10/11', isOverdue: true, comments: 2, attachments: 0, labels: [{ text: 'Security', color: 'danger' }] },
    'task-5': { id: 'task-5', content: 'Drag & Drop', description: 'hello-pangea/dnd.', priority: 'Thấp', assignee: 'Nguyễn Văn A', dueDate: '25/11', comments: 1, attachments: 0, labels: [{ text: 'Frontend', color: 'primary' }] },
  },
  columns: {
    'col-1': {
      id: 'col-1',
      title: 'Chưa bắt đầu',
      taskIds: ['task-1', 'task-2'],
      color: '#E8EAED',
      headerBg: '#F8F9FA'
    },
    'col-2': {
      id: 'col-2',
      title: 'Đang làm',
      taskIds: ['task-3', 'task-5'],
      color: '#321FDB',
      headerBg: '#EAF4FF'
    },
    'col-3': {
      id: 'col-3',
      title: 'Đang review',
      taskIds: ['task-4'],
      color: '#FFC107',
      headerBg: '#FFF4E5'
    },
    'col-4': {
      id: 'col-4',
      title: 'Hoàn thành',
      taskIds: [],
      color: '#2ED8B6',
      headerBg: '#E8F8F5'
    },
  },
  columnOrder: ['col-1', 'col-2', 'col-3', 'col-4'],
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Khẩn cấp': return '#8A1515' // Dark Red
    case 'Cao': return '#E55353'      // Red
    case 'Trung bình': return '#FFC107'// Orange
    case 'Thấp': return '#54A3FF'      // Blue
    default: return '#6C757D'
  }
}

const KanbanBoard: React.FC = () => {
  const [data, setData] = useState<BoardData>(initialData)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const start = data.columns[source.droppableId]
    const finish = data.columns[destination.droppableId]

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      }

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      })
      return
    }

    const startTaskIds = Array.from(start.taskIds)
    startTaskIds.splice(source.index, 1)
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    }

    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    }

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    })
  }

  const openTaskDetail = (taskId: string) => {
    setSelectedTask(data.tasks[taskId])
    setModalVisible(true)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-0 text-dark fw-bold">Dự án: Website e-Commerce</h2>
        </div>
        <div>
          <CButton color="primary">
            <CIcon icon={cilPlus} className="me-2" />
            Thêm công việc
          </CButton>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4 flex-wrap bg-white p-3 rounded shadow-sm border-0">
        <CFormSelect style={{ width: '200px' }}>
          <option>Mức ưu tiên: Tất cả</option>
          <option>Khẩn cấp</option>
          <option>Cao</option>
          <option>Trung bình</option>
          <option>Thấp</option>
        </CFormSelect>
        <CFormSelect style={{ width: '200px' }}>
          <option>Người thực hiện: Tất cả</option>
          <option>Nguyễn Văn A</option>
          <option>Trần Thị B</option>
        </CFormSelect>
        <CInputGroup style={{ width: '300px' }}>
          <CInputGroupText className="bg-white"><CIcon icon={cilSearch} /></CInputGroupText>
          <CFormInput placeholder="Tìm kiếm công việc..." />
        </CInputGroup>
        <div className="ms-auto btn-group bg-light p-1 rounded">
          <button className="btn btn-sm btn-white shadow-sm fw-medium px-3">Board</button>
          <button className="btn btn-sm text-muted px-3">List</button>
        </div>
      </div>

      <div className="kanban-board overflow-auto pb-4" style={{ height: 'calc(100vh - 250px)' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="d-flex align-items-start h-100 gap-4" style={{ minWidth: '1200px' }}>
            {data.columnOrder.map(columnId => {
              const column = data.columns[columnId]
              const tasks = column.taskIds.map(taskId => data.tasks[taskId])
              const isOverLimit = tasks.length > 10

              return (
                <div key={column.id} className="kanban-column d-flex flex-column rounded-3" style={{ width: '280px', backgroundColor: isOverLimit ? '#FFEEEE' : column.headerBg, minHeight: '100%', flexShrink: 0 }}>
                  <div className="p-3 border-bottom border-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 fw-bold d-flex align-items-center" style={{ fontSize: '18px' }}>
                        <span className="me-2 rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: column.color }}></span>
                        {column.title}
                      </h6>
                      <CIcon icon={cilOptions} className="text-muted cursor-pointer" />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted fw-medium">{tasks.length} cards</span>
                      <span className={`small fw-medium ${isOverLimit ? 'text-danger' : 'text-muted'}`}>Max 10</span>
                    </div>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-grow-1 p-2 kanban-dropzone"
                        style={{
                          backgroundColor: snapshot.isDraggingOver ? 'rgba(50, 31, 219, 0.05)' : 'transparent',
                          border: snapshot.isDraggingOver ? '2px dashed #321FDB' : '2px solid transparent',
                          transition: 'all 0.2s ease',
                          minHeight: '150px'
                        }}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="card mb-3 border bg-white rounded kanban-card"
                                style={{
                                  boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                                  opacity: snapshot.isDragging ? 0.9 : 1,
                                  transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
                                  transition: 'box-shadow 0.2s, transform 0.2s',
                                  ...provided.draggableProps.style,
                                }}
                                onClick={() => openTaskDetail(task.id)}
                              >
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between mb-2 align-items-center">
                                    <span className="small text-muted fw-bold">#{task.id}</span>
                                    <span className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: getPriorityColor(task.priority) }} title={`Ưu tiên: ${task.priority}`}></span>
                                  </div>
                                  
                                  <h6 className="card-title text-dark fw-bold mb-1" style={{ fontSize: '14px', lineHeight: '1.4' }}>{task.content}</h6>
                                  <p className="card-text text-muted mb-3 fst-italic text-truncate" style={{ fontSize: '12px' }}>{task.description}</p>
                                  
                                  <div className="d-flex gap-1 flex-wrap mb-3">
                                    {task.labels && task.labels.map((label, idx) => (
                                      <CBadge color={label.color} shape="rounded-pill" key={idx} style={{ fontSize: '11px', padding: '2px 8px' }}>{label.text}</CBadge>
                                    ))}
                                  </div>
                                  
                                  <div className="d-flex justify-content-between align-items-end mt-auto pt-2 border-top">
                                    <div className="d-flex align-items-center gap-2">
                                      <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '10px' }} title={task.assignee}>
                                        {task.assignee.charAt(0)}
                                      </div>
                                      <span className="text-dark small fw-medium text-truncate" style={{ maxWidth: '80px' }}>{task.assignee}</span>
                                    </div>

                                    <div className="d-flex gap-2 text-muted" style={{ fontSize: '12px' }}>
                                      {task.attachments > 0 && (
                                        <div className="d-flex align-items-center" title="Đính kèm">
                                          <CIcon icon={cilPaperclip} size="sm" className="me-1" />
                                          <span>{task.attachments}</span>
                                        </div>
                                      )}
                                      {task.comments > 0 && (
                                        <div className="d-flex align-items-center" title="Bình luận">
                                          <CIcon icon={cilCommentSquare} size="sm" className="me-1" />
                                          <span>{task.comments}</span>
                                        </div>
                                      )}
                                      <div className={`d-flex align-items-center ${task.isOverdue ? 'text-danger fw-bold' : ''}`} title="Ngày đến hạn">
                                        <CIcon icon={cilCalendar} size="sm" className="me-1" />
                                        <span>{task.dueDate}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        <div className="mt-2 text-center">
                          <CButton color="light" size="sm" className="w-50 text-muted fw-semibold bg-white border shadow-sm">
                            <CIcon icon={cilPlus} className="me-1" /> Thêm công việc
                          </CButton>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      <TaskDetailModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        task={selectedTask} 
      />
    </>
  )
}

export default KanbanBoard
