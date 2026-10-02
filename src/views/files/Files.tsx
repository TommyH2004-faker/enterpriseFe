import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
} from '@coreui/react'
import toast from 'react-hot-toast'

import attachmentService from 'src/services/attachmentService'
import type { TaskAttachmentResponse } from 'src/types/TaskDetailType/attachment'
import FileFilters from './components/FileFilters'
import FilePagination from './components/FilePagination'
import FileTable from './components/FileTable'
import { formatBytes } from './components/fileUtils'

type SortBy = 'UploadedAt' | 'OriginalFileName' | 'FileSize'

const Files: React.FC = () => {
  const [files, setFiles] = useState<TaskAttachmentResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [contentType, setContentType] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('UploadedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true)
      const result = await attachmentService.getAllAttachments({
        page,
        pageSize,
        keyword,
        contentType,
        sortBy,
        sortDirection,
      })
      setFiles(result.items ?? [])
      setTotalCount(result.totalCount ?? 0)
      setTotalPages(Math.max(result.totalPages ?? 1, 1))
    } catch (error: any) {
      setFiles([])
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách tệp.')
    } finally {
      setLoading(false)
    }
  }, [contentType, keyword, page, pageSize, sortBy, sortDirection])

  useEffect(() => {
    void loadFiles()
  }, [loadFiles])

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.fileSize, 0),
    [files],
  )

  const confirmDelete = (file: TaskAttachmentResponse) => {
    toast.custom((toastItem) => (
      <div className="bg-white border rounded shadow p-3 d-flex align-items-center gap-3">
        <span className="small">Xóa <strong>{file.originalFileName}</strong>?</span>
        <CButton size="sm" color="danger" onClick={() => {
          toast.dismiss(toastItem.id)
          void (async () => {
            try {
              await attachmentService.deleteAttachment(file.id)
              toast.success('Đã xóa tệp.')
              await loadFiles()
            } catch (error: any) {
              toast.error(error?.response?.data?.message || 'Không thể xóa tệp.')
            }
          })()
        }}>
          Xóa
        </CButton>
        <CButton size="sm" color="light" className="border" onClick={() => toast.dismiss(toastItem.id)}>
          Hủy
        </CButton>
      </div>
    ), { duration: 5000 })
  }

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setPage(1)
    setter(value)
  }

  const openFile = async (file: TaskAttachmentResponse) => {
    try {
      const data = await attachmentService.getAttachmentContent(file.taskId, file.id)
      const blobUrl = URL.createObjectURL(new Blob([data], { type: file.contentType }))
      window.open(blobUrl, '_blank')
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (error) {
      console.error('Open attachment failed:', error)
      toast.error('Không thể mở tệp. Vui lòng thử lại.')
    }
  }

  const downloadFile = async (file: TaskAttachmentResponse) => {
    try {
      const data = await attachmentService.getAttachmentContent(file.taskId, file.id)
      const blobUrl = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = file.originalFileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000)
    } catch (error) {
      console.error('Download attachment failed:', error)
      toast.error('Không thể tải tệp. Vui lòng thử lại.')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <h4 className="mb-1 fw-bold">Tệp trong hệ thống</h4>
          <div className="text-body-secondary">Tra cứu và quản lý các tệp đính kèm đã được tải lên.</div>
        </div>
        <div className="text-end">
          <div className="fs-4 fw-bold text-primary">{totalCount}</div>
          <div className="small text-body-secondary">tệp trong hệ thống</div>
        </div>
      </div>

      <FileFilters
        keyword={keyword}
        contentType={contentType}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onKeywordChange={(value) => updateFilter(setKeyword, value)}
        onContentTypeChange={(value) => updateFilter(setContentType, value)}
        onSortByChange={(value) => { setPage(1); setSortBy(value) }}
        onSortDirectionChange={(value) => { setPage(1); setSortDirection(value) }}
      />

      <CCard className="border-0 shadow-sm">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-1 fw-bold">Danh sách tệp</h6>
              <span className="small text-body-secondary">{files.length} tệp trên trang này · {formatBytes(totalSize)}</span>
            </div>
          </div>

          <FileTable files={files} loading={loading} onOpen={openFile} onDownload={downloadFile} onDelete={confirmDelete} />
          {!loading && <FilePagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={setPage} />}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Files
