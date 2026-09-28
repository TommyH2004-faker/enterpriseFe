// src/views/project-detail/tabs/ProjectFiles.tsx

import React, { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFolder, cilCloudUpload, cilTrash, cilCloudDownload, cilPlus } from '@coreui/icons'

interface ProjectFileItem {
  id: string
  name: string
  size: string
  type: string
  typeColor: string
  uploadedBy: string
  uploadedAt: string
}

const INITIAL_PROJECT_FILES: ProjectFileItem[] = [
  {
    id: 'pf-1',
    name: 'Tài_liệu_kiến_trúc_hệ_thống_v1.pdf',
    size: '3.2 MB',
    type: 'PDF',
    typeColor: 'danger',
    uploadedBy: 'Nguyễn Văn A',
    uploadedAt: '2026-03-10',
  },
  {
    id: 'pf-2',
    name: 'DB_Schema_Diagram_Design.png',
    size: '1.8 MB',
    type: 'Image',
    typeColor: 'info',
    uploadedBy: 'Trần Thị B',
    uploadedAt: '2026-03-12',
  },
]

const ProjectFiles: React.FC = () => {
  const [files, setFiles] = useState<ProjectFileItem[]>(INITIAL_PROJECT_FILES)
  const [showModal, setShowModal] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleUpload = () => {
    if (!fileName.trim()) return

    const newF: ProjectFileItem = {
      id: `pf-${Date.now()}`,
      name: fileName.trim(),
      size: '1.5 MB',
      type: fileName.endsWith('.pdf') ? 'PDF' : fileName.endsWith('.png') ? 'Image' : 'Docs',
      typeColor: 'primary',
      uploadedBy: 'Người dùng hiện tại',
      uploadedAt: new Date().toISOString().substring(0, 10),
    }

    setFiles([newF, ...files])
    setFileName('')
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div>
      <CCard className="shadow-sm border-0">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-1 fw-bold">Tệp tài liệu dự án</h5>
              <div className="text-body-secondary small">
                Tải lên và quản lý các tệp đính kèm, tài liệu liên quan đến dự án này.
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <CBadge color="primary" className="px-3 py-2 fs-6">
                {files.length} Tệp
              </CBadge>
              <CButton color="primary" size="sm" onClick={() => setShowModal(true)}>
                <CIcon icon={cilCloudUpload} className="me-1" /> Tải lên Tệp mới
              </CButton>
            </div>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-5 text-body-secondary rounded bg-light">
              <CIcon icon={cilFolder} size="3xl" className="mb-3 text-secondary" />
              <div>Chưa có tệp tài liệu nào được tải lên cho dự án này.</div>
            </div>
          ) : (
            <CTable align="middle" responsive hover className="mb-0 border">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Tên File</CTableHeaderCell>
                  <CTableHeaderCell>Loại</CTableHeaderCell>
                  <CTableHeaderCell>Kích thước</CTableHeaderCell>
                  <CTableHeaderCell>Người tải</CTableHeaderCell>
                  <CTableHeaderCell>Ngày cập nhật</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Thao tác</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {files.map((f) => (
                  <CTableRow key={f.id}>
                    <CTableDataCell className="fw-semibold">
                      <CIcon icon={cilFolder} className="me-2 text-warning" />
                      {f.name}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={f.typeColor}>{f.type}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small">{f.size}</CTableDataCell>
                    <CTableDataCell className="small">{f.uploadedBy}</CTableDataCell>
                    <CTableDataCell className="small">{f.uploadedAt}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton size="sm" color="light" className="me-1" title="Tải xuống">
                        <CIcon icon={cilCloudDownload} size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="ghost"
                        onClick={() => handleDelete(f.id)}
                        title="Xóa"
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Upload File */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Tải lên Tệp mới vào Dự án</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên Tệp tài liệu</label>
            <CFormInput
              placeholder="VD: Tai_lieu_thiet_ke_API.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <div className="p-4 text-center border rounded bg-light border-dashed">
            <CIcon icon={cilCloudUpload} size="3xl" className="text-primary mb-2" />
            <div>Kéo & thả file đính kèm vào đây hoặc chọn từ thiết bị</div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="light" onClick={() => setShowModal(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleUpload} disabled={!fileName.trim()}>
            Tải lên
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ProjectFiles
