import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CCol,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

import TaskDetailHeader from './components/TaskDetailHeader'
import TaskDescriptionSection from './components/TaskDescriptionSection'
import TaskChecklistSection from './components/TaskChecklistSection'
import TaskAttachmentSection from './components/TaskAttachmentSection'
import TaskCommentSection from './components/TaskCommentSection'
import TaskActivitySection from './components/TaskActivitySection'
import TaskSidebar from './components/TaskSidebar'
import { useTaskDetail } from './hooks/useTaskDetail'

interface Props {
  visible: boolean
  taskId: string | null
  columns?: Array<{ id: string; name: string }>
  onClose: () => void
  onChanged?: () => void
}

const TaskDetailModal: React.FC<Props> = ({
  visible,
  taskId,
  columns = [],
  onClose,
  onChanged,
}) => {
  const detail = useTaskDetail(taskId || undefined, visible)
  const [draftPriority, setDraftPriority] = useState(1)
  const [draftStartDate, setDraftStartDate] = useState<string | null>(null)
  const [draftDueDate, setDraftDueDate] = useState<string | null>(null)

  useEffect(() => {
    if (!detail.task) return
    setDraftPriority(detail.task.priority)
    setDraftStartDate(detail.task.startDate ?? null)
    setDraftDueDate(detail.task.dueDate ?? null)
  }, [detail.task])

  const currentTask = useMemo(() => {
    if (!detail.task) return null
    return {
      ...detail.task,
      priority: draftPriority,
      startDate: draftStartDate,
      dueDate: draftDueDate,
    }
  }, [detail.task, draftPriority, draftStartDate, draftDueDate])

  const saveBasicInfo = async () => {
    if (!currentTask) return

    const success = await detail.updateTask({
      title: currentTask.title,
      description: currentTask.description || '',
      priority: draftPriority,
      startDate: draftStartDate,
      dueDate: draftDueDate,
    })

    if (success) onChanged?.()
  }

  if (!visible) return null

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      scrollable
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Chi tiết công việc</CModalTitle>
      </CModalHeader>

      {detail.loading && !detail.task ? (
        <CModalBody className="d-flex justify-content-center py-5">
          <CSpinner />
        </CModalBody>
      ) : detail.error ? (
        <CModalBody>
          <CAlert color="danger">{detail.error}</CAlert>
        </CModalBody>
      ) : !currentTask ? (
        <CModalBody>
          <CAlert color="warning">Không tìm thấy công việc.</CAlert>
        </CModalBody>
      ) : (
        <>
          <TaskDetailHeader
            task={currentTask}
            columns={columns}
            saving={detail.saving}
            onClose={onClose}
            onSave={() => void saveBasicInfo()}
            onMove={(columnId) => {
              void detail.moveTask(columnId, currentTask.position ?? 0).then((success) => {
                if (success) onChanged?.()
              })
            }}
            onPriorityChange={setDraftPriority}
          />

          <CModalBody className="bg-light">
            <CRow className="g-3">
              <CCol lg={8}>
                <TaskDescriptionSection
                  description={currentTask.description}
                  saving={detail.saving}
                  onSave={async (description) => {
                    const success = await detail.updateTask({
                      title: currentTask.title,
                      description,
                      priority: draftPriority,
                      startDate: draftStartDate,
                      dueDate: draftDueDate,
                    })
                    if (success) onChanged?.()
                  }}
                />

                <TaskChecklistSection
                  items={detail.checklists}
                  saving={detail.saving}
                  onToggle={detail.completeChecklist}
                />

                <TaskAttachmentSection
                  items={detail.attachments}
                  uploading={detail.saving}
                  onUpload={detail.uploadAttachment}
                  onDelete={detail.deleteAttachment}
                />

                <TaskCommentSection
                  comments={detail.comments}
                  saving={detail.saving}
                  onCreate={detail.createComment}
                  onDelete={detail.deleteComment}
                />

                <TaskActivitySection activities={detail.activities} />
              </CCol>

              <CCol lg={4}>
                <TaskSidebar
                  task={currentTask}
                  onDateChange={(field, value) => {
                    if (field === 'startDate') setDraftStartDate(value || null)
                    else setDraftDueDate(value || null)
                  }}
                />
              </CCol>
            </CRow>
          </CModalBody>
        </>
      )}
    </CModal>
  )
}

export default TaskDetailModal
