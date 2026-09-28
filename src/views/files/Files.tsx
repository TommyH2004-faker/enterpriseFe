// src/views/files/Files.tsx

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
import { cilCloudUpload, cilFolder, cilTrash, cilShare, cilCloudDownload, cilPlus } from '@coreui/icons'

interface FileItem {
  id: string
  name: string
  size: string
  uploadedBy: string
  uploadedAt: string
  type: string
  typeColor: string
}

const INITIAL_FILES: FileItem[] = [
  {
    id: 'f-1',
    name: 'Tai_lieu_yeu_cau_du_an_v2.pdf',
    size: '2.4 MB',
    uploadedBy: 'Nguyễn Văn A',
    uploadedAt: '2026-03-15',
    type: 'PDF',
    typeColor: 'danger',
  },
  {
    id: 'f-2',
    name: 'thiet_ke_figma_wireframe.png',
    size: '18.2 MB',
    uploadedBy: 'Trần Thị B',
    uploadedAt: '2026-03-18',
    type: 'Image',
    typeColor: 'info',
  },
  {
    id: 'f-3',
    name: 'bang_luong_phu_cap_du_an.xlsx',
    size: '830 KB',
    uploadedBy: 'Phạm Thị D',
    uploadedAt: '2026-03-20',
    type: 'Excel',
    typeColor: 'success',
  },
]

const Files: React.FC = () => {
  const [fileList, setFileList] = useState<FileItem[]>(INITIAL_FILES)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('')

  const handleUploadFile = () => {
    if (!selectedFileName.trim()) return

    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: selectedFileName.trim(),
      size: '1.2 MB',
      uploadedBy: 'Người dùng hiện tại',
      uploadedAt: new Date().toISOString().substring(0, 10),
      type: selectedFileName.endsWith('.pdf') ? 'PDF' : selectedFileName.endsWith('.png') ? 'Image' : 'Docs',
      typeColor: 'primary',
    }

    setFileList([newFile, ...fileList])
    setSelectedFileName('')
    setShowUploadModal(false)
  }

  const handleDeleteFile = (id: string) => {
    setFileList((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="mb-1 fw-bold">Quản lý Tệp Dự án (Files)</h4>
          <div className="text-body-secondary">
            Tải lên, quản lý tài liệu, tệp đính kèm và chia sẻ quyền truy cập trong hệ thống.
          </div>
        </div>
        <CButton color="primary" onClick={() => setShowUploadModal(true)}>
          <CIcon icon={cilCloudUpload} className="me-1" /> Tải lên Tệp mới
        </CButton>
      </div>

      {/* Stats Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <CCard className="border-0 shadow-sm">
            <CCardBody className="py-3">
              <div className="text-body-secondary small">Tổng số File</div>
              <div className="fs-4 fw-bold text-primary">{fileList.length}</div>
            </CCardBody>
          </CCard>
        </div>
        <div className="col-sm-6 col-lg-3">
          <CCard className="border-0 shadow-sm">
            <CCardBody className="py-3">
              <div className="text-body-secondary small">Dung lượng sử dụng</div>
              <div className="fs-4 fw-bold text-info">21.4 MB</div>
            </CCardBody>
          </CCard>
        </div>
        <div className="col-sm-6 col-lg-3">
          <CCard className="border-0 shadow-sm">
            <CCardBody className="py-3">
              <div className="text-body-secondary small">Thư mục dự án</div>
              <div className="fs-4 fw-bold text-success">4</div>
            </CCardBody>
          </CCard>
        </div>
        <div className="col-sm-6 col-lg-3">
          <CCard className="border-0 shadow-sm">
            <CCardBody className="py-3">
              <div className="text-body-secondary small">Tệp chia sẻ</div>
              <div className="fs-4 fw-bold text-warning">2</div>
            </CCardBody>
          </CCard>
        </div>
      </div>

      {/* Files List Table */}
      <CCard className="shadow-sm border-0">
        <CCardBody>
          <div className="fw-semibold mb-3">Danh sách Tệp tài liệu</div>
          {fileList.length === 0 ? (
            <div className="text-center py-5 text-body-secondary bg-light rounded">
              Chưa có tệp nào được tải lên.
            </div>
          ) : (
            <CTable align="middle" responsive hover className="mb-0 border">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Tên File</CTableHeaderCell>
                  <CTableHeaderCell>Loại</CTableHeaderCell>
                  <CTableHeaderCell>Kích thước</CTableHeaderCell>
                  <CTableHeaderCell>Người tải lên</CTableHeaderCell>
                  <CTableHeaderCell>Ngày cập nhật</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {fileList.map((file) => (
                  <CTableRow key={file.id}>
                    <CTableDataCell className="fw-semibold">
                      <CIcon icon={cilFolder} className="me-2 text-warning" />
                      {file.name}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={file.typeColor}>{file.type}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{file.size}</CTableDataCell>
                    <CTableDataCell>{file.uploadedBy}</CTableDataCell>
                    <CTableDataCell>{file.uploadedAt}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton size="sm" color="light" className="me-1" title="Tải xuống">
                        <CIcon icon={cilCloudDownload} size="sm" />
                      </CButton>
                      <CButton size="sm" color="light" className="me-1" title="Chia sẻ">
                        <CIcon icon={cilShare} size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="ghost"
                        onClick={() => handleDeleteFile(file.id)}
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

      {/* Upload File Modal */}
      <CModal visible={showUploadModal} onClose={() => setShowUploadModal(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Tải lên Tệp mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên Tệp / Chọn Tệp tài liệu</label>
            <CFormInput
              placeholder="VD: Tai_lieu_thiet_ke_v1.pdf"
              value={selectedFileName}
              onChange={(e) => setSelectedFileName(e.target.value)}
            />
          </div>
          <div className="p-4 text-center border rounded bg-light border-dashed">
            <CIcon icon={cilCloudUpload} size="3xl" className="text-primary mb-2" />
            <div>Kéo và thả tệp vào đây hoặc bấm để chọn tệp từ máy tính</div>
            <div className="small text-body-secondary mt-1">Hỗ trợ PDF, PNG, JPG, DOCX, XLSX (tối đa 25MB)</div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="light" onClick={() => setShowUploadModal(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleUploadFile} disabled={!selectedFileName.trim()}>
            Tải lên
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Files