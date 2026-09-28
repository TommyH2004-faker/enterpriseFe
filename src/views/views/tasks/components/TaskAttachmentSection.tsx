import React, { useRef } from 'react'
import { CButton, CCard, CCardBody, CListGroup, CListGroupItem, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilPaperclip, cilTrash } from '@coreui/icons'

import type { TaskAttachment } from '../hooks/useTaskDetail'

interface Props {
  items: TaskAttachment[]
  uploading?: boolean
  onUpload: (file: File) => Promise<unknown> | void
  onDelete: (id: string) => Promise<unknown> | void
}

const formatSize = (bytes?: number | null) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const TaskAttachmentSection: React.FC<Props> = ({ items, uploading = false, onUpload, onDelete }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file?: File) => {
    if (!file) return
    await onUpload(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <CCard className="border-0 shadow-sm mb-3">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-semibold">
            <CIcon icon={cilPaperclip} className="me-2" />
            Tệp đính kèm
          </h6>
          <>
            <CButton
              color="primary"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <CSpinner size="sm" /> : <CIcon icon={cilCloudUpload} />}
              <span className="ms-1">Tải lên</span>
            </CButton>
            <input
              ref={inputRef}
              hidden
              type="file"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </>
        </div>

        {items.length === 0 ? (
          <div className="small text-body-secondary">Chưa có tệp đính kèm.</div>
        ) : (
          <CListGroup flush>
            {items.map((item) => (
              <CListGroupItem key={item.id} className="px-0 d-flex align-items-center justify-content-between gap-2">
                <div className="min-w-0">
                  {item.fileUrl ? (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-decoration-none">
                      {item.originalFileName || item.fileName || 'Tệp'}
                    </a>
                  ) : (
                    <span>{item.originalFileName || item.fileName || 'Tệp'}</span>
                  )}
                  <div className="small text-body-secondary">
                    {item.contentType || 'File'} {item.fileSize ? `• ${formatSize(item.fileSize)}` : ''}
                  </div>
                </div>
                <CButton color="danger" variant="ghost" size="sm" onClick={() => void onDelete(item.id)} disabled={uploading}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </CListGroupItem>
            ))}
          </CListGroup>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TaskAttachmentSection
