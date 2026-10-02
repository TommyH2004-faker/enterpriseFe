import React from 'react'
import { CBadge, CButton, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilFile, cilFolderOpen, cilTrash } from '@coreui/icons'

import type { TaskAttachmentResponse } from 'src/types/TaskDetailType/attachment'
import { formatBytes, formatDate, getFileType } from './fileUtils'

interface FileTableProps {
  files: TaskAttachmentResponse[]
  loading: boolean
  onOpen: (file: TaskAttachmentResponse) => void | Promise<void>
  onDownload: (file: TaskAttachmentResponse) => void | Promise<void>
  onDelete: (file: TaskAttachmentResponse) => void
}

const FileTable: React.FC<FileTableProps> = ({ files, loading, onOpen, onDownload, onDelete }) => {
  if (loading) return <div className="text-center py-5"><CSpinner color="primary" /></div>

  if (files.length === 0) {
    return (
      <div className="text-center py-5 text-body-secondary bg-light rounded">
        <CIcon icon={cilFolderOpen} size="3xl" className="mb-2 opacity-50" />
        <div>Không tìm thấy tệp phù hợp.</div>
      </div>
    )
  }

  return (
    <CTable responsive hover align="middle" className="mb-0">
      <CTableHead color="light">
        <CTableRow>
          <CTableHeaderCell>Tệp</CTableHeaderCell>
          <CTableHeaderCell>Loại</CTableHeaderCell>
          <CTableHeaderCell>Kích thước</CTableHeaderCell>
          <CTableHeaderCell>Task ID</CTableHeaderCell>
          <CTableHeaderCell>Ngày tải lên</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Thao tác</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {files.map((file) => {
          const type = getFileType(file)
          return (
            <CTableRow key={file.id}>
              <CTableDataCell>
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <CIcon icon={cilFile} className="text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate" title={file.originalFileName}>{file.originalFileName}</div>
                    <div className="small text-body-secondary text-truncate" title={file.fileName}>{file.fileName}</div>
                  </div>
                </div>
              </CTableDataCell>
              <CTableDataCell><CBadge color={type.color}>{type.label}</CBadge></CTableDataCell>
              <CTableDataCell>{formatBytes(file.fileSize)}</CTableDataCell>
              <CTableDataCell><span className="font-monospace small">{file.taskId.slice(0, 8)}...</span></CTableDataCell>
              <CTableDataCell>{formatDate(file.uploadedAt)}</CTableDataCell>
              <CTableDataCell className="text-end text-nowrap">
                <CButton size="sm" color="light" className="border me-2" title="Mở tệp" onClick={() => onOpen(file)}><CIcon icon={cilFolderOpen} /></CButton>
                <CButton size="sm" color="light" className="border me-2" title="Tải xuống" onClick={() => onDownload(file)}><CIcon icon={cilCloudDownload} /></CButton>
                <CButton size="sm" color="danger" variant="outline" title="Xóa tệp" onClick={() => onDelete(file)}><CIcon icon={cilTrash} /></CButton>
              </CTableDataCell>
            </CTableRow>
          )
        })}
      </CTableBody>
    </CTable>
  )
}

export default FileTable
