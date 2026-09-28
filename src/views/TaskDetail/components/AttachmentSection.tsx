import React, { useRef } from 'react'
import { CButton } from '@coreui/react'
import { TaskAttachmentResponse } from 'src/types/TaskDetailType/attachment'

interface AttachmentSectionProps { attachments: TaskAttachmentResponse[]; saving: boolean; onUpload: (file: File) => void; onDelete: (id: string) => void }
const formatBytes = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({ attachments, saving, onUpload, onDelete }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Đính kèm</h6>
        <input ref={inputRef} type="file" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); e.target.value = ''; }} />
        <CButton size="sm" color="secondary" variant="ghost" disabled={saving} onClick={() => inputRef.current?.click()}>+ Thêm tệp</CButton>
      </div>

      <div className="d-flex flex-column gap-2">
        {attachments.map((file) => (
          <div key={file.id} className="d-flex align-items-center justify-content-between p-2 rounded-2 hover-bg-light border border-light">
            <div className="d-flex align-items-center gap-3 min-w-0">
              <div className="bg-body-secondary rounded-2 d-flex align-items-center justify-content-center fw-bold text-muted" style={{ width: 40, height: 40 }}>FILE</div>
              <div>
                <a href={file.fileUrl} target="_blank" rel="noreferrer" className="fw-semibold text-dark text-decoration-none d-block text-truncate" style={{maxWidth: '300px'}}>{file.originalFileName}</a>
                <span className="small text-body-secondary">{formatBytes(file.fileSize)}</span>
              </div>
            </div>
            <CButton size="sm" color="secondary" variant="ghost" onClick={() => onDelete(file.id)}>Xóa</CButton>
          </div>
        ))}
      </div>
    </section>
  )
}