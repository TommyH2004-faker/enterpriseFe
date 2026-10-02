import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
} from '@coreui/react'


import { TaskAttachmentResponse } from 'src/types/TaskDetailType/attachment'
import axios from 'axios'
import axiosClient from 'src/api/axiosClient'

interface AttachmentSectionProps {
  taskId: string
  attachments: TaskAttachmentResponse[]
  saving: boolean
  onUpload: (file: File) => void
  onDelete: (id: string) => void
}

type PreviewType = 'pdf' | 'image'
type ToastColor = 'success' | 'danger' | 'warning' | 'info'

interface PreviewFile {
  file: TaskAttachmentResponse
  type: PreviewType
  viewerUrl: string
}

interface ToastItem {
  id: number
  message: string
  color: ToastColor
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const getExtension = (fileName: string): string => {
  const index = fileName.lastIndexOf('.')
  if (index === -1) return ''
  return fileName.substring(index + 1).toLowerCase()
}

const isPdf = (fileName: string): boolean => getExtension(fileName) === 'pdf'

// Không có svg: SVG có thể chứa script nên chỉ cho tải về
const isImage = (fileName: string): boolean =>
  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(getExtension(fileName))

const getFileLabel = (fileName: string): string => {
  const extension = getExtension(fileName)
  if (extension === 'pdf') return 'PDF'
  if (['doc', 'docx'].includes(extension)) return 'DOC'
  if (['xls', 'xlsx'].includes(extension)) return 'XLS'
  if (['ppt', 'pptx'].includes(extension)) return 'PPT'
  if (isImage(fileName)) return 'IMG'
  return 'FILE'
}

const getFileIconClass = (fileName: string): string => {
  const extension = getExtension(fileName)
  if (extension === 'pdf') return 'text-danger'
  if (['doc', 'docx'].includes(extension)) return 'text-primary'
  if (['xls', 'xlsx'].includes(extension)) return 'text-success'
  if (['ppt', 'pptx'].includes(extension)) return 'text-warning'
  if (isImage(fileName)) return 'text-info'
  return 'text-secondary'
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  taskId,
  attachments,
  saving,
  onUpload,
  onDelete,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [preview, setPreview] = useState<PreviewFile | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // Bỏ qua kết quả request cũ nếu user mở file khác / đóng modal
  const requestIdRef = useRef(0)
  // Giữ blob URL hiện tại để revoke khi không dùng nữa
  const blobUrlRef = useRef<string | null>(null)
  const toastIdRef = useRef(0)

  /* ======================================================
     TOAST
  ====================================================== */
  const showToast = useCallback(
    (message: string, color: ToastColor = 'info') => {
      toastIdRef.current += 1
      const id = toastIdRef.current

      setToasts((prev) => [...prev, { id, message, color }])
    },
    [],
  )

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  /* ======================================================
     BLOB URL CLEANUP
  ====================================================== */
  const revokeBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      revokeBlobUrl()
    }
  }, [])

  /* ======================================================
     DUPLICATE CHECK
  ====================================================== */
  const isDuplicateFile = (file: File): boolean => {
    return attachments.some(
      (attachment) =>
        attachment.originalFileName.toLowerCase() === file.name.toLowerCase() &&
        attachment.fileSize === file.size,
    )
  }

  /* ======================================================
     UPLOAD
  ====================================================== */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    // Reset để có thể chọn lại cùng một file
    event.target.value = ''

    if (!file) return

    if (isDuplicateFile(file)) {
      showToast(`File "${file.name}" đã tồn tại trong task này.`, 'warning')
      return
    }

    onUpload(file)
  }

  /* ======================================================
     FETCH FILE QUA API (có token)
  ====================================================== */
  const fetchBlob = async (file: TaskAttachmentResponse): Promise<Blob> => {
    // Nếu baseURL của axios đã có /api/v1 thì bỏ phần này khỏi đường dẫn
    const response = await axiosClient.get<Blob>(
      `/api/v1/tasks/${taskId}/attachments/${file.id}/content`,
      { responseType: 'blob' },
    )

    return response.data
  }

  /* ======================================================
     XEM TRƯỚC PDF / ẢNH
  ====================================================== */
  const loadPreview = async (file: TaskAttachmentResponse, type: PreviewType) => {
    requestIdRef.current += 1
    const currentRequestId = requestIdRef.current

    revokeBlobUrl()
    setPreviewLoading(true)
    setPreview({ file, type, viewerUrl: '' })

    try {
      const data = await fetchBlob(file)

      // User đã đóng modal hoặc mở file khác
      if (currentRequestId !== requestIdRef.current) return

      // Ép type PDF để iframe luôn render được
      const blob = type === 'pdf' ? new Blob([data], { type: 'application/pdf' }) : data

      const blobUrl = URL.createObjectURL(blob)
      blobUrlRef.current = blobUrl

      setPreview({ file, type, viewerUrl: blobUrl })
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) return

      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        const text = await error.response.data.text()
        console.error('Server error body:', text)
      } else {
        console.error('Load attachment failed:', error)
      }

      setPreview(null)
      showToast('Không thể xem trước tệp. Vui lòng thử lại hoặc tải về.', 'danger')
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setPreviewLoading(false)
      }
    }
  }

  /* ======================================================
     TẢI FILE VỀ (Word, Excel, PowerPoint, file khác)
  ====================================================== */
  const downloadFile = async (file: TaskAttachmentResponse) => {
    try {
      const data = await fetchBlob(file)
      const url = URL.createObjectURL(data)

      const link = document.createElement('a')
      link.href = url
      link.download = file.originalFileName
      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Download failed:', error)
      showToast('Không thể tải tệp về.', 'danger')
    }
  }

  /* ======================================================
     MỞ FILE
  ====================================================== */
  const handleOpenFile = (file: TaskAttachmentResponse) => {
    const fileName = file.originalFileName

    if (isPdf(fileName)) {
      void loadPreview(file, 'pdf')
      return
    }

    if (isImage(fileName)) {
      void loadPreview(file, 'image')
      return
    }

    void downloadFile(file)
  }

  /* ======================================================
     MỞ BLOB Ở TAB MỚI
     Không dùng noopener vì window.open sẽ luôn trả về null.
     Blob URL cùng origin nên an toàn.
  ====================================================== */
  const openPreviewInNewTab = () => {
    if (!preview?.viewerUrl) return

    const opened = window.open(preview.viewerUrl, '_blank')

    if (!opened) {
      showToast('Trình duyệt đã chặn cửa sổ mới. Vui lòng cho phép popup.', 'warning')
    }
  }

  /* ======================================================
     ĐÓNG PREVIEW
  ====================================================== */
  const handleClosePreview = () => {
    requestIdRef.current += 1 // huỷ request đang chạy
    setPreviewLoading(false)
    setPreview(null)
    revokeBlobUrl()
  }

  return (
    <section>
      {/* TOASTER */}
      <CToaster placement="top-end" style={{ zIndex: 2000 }}>
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            visible
            autohide
            delay={3500}
            color={toast.color}
            className="text-white align-items-center border-0"
            onClose={() => removeToast(toast.id)}
          >
            <div className="d-flex">
              <CToastBody>{toast.message}</CToastBody>
              <CToastClose className="me-2 m-auto" white />
            </div>
          </CToast>
        ))}
      </CToaster>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Đính kèm</h6>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.bmp"
          onChange={handleFileChange}
        />

        <CButton
          size="sm"
          color="secondary"
          variant="ghost"
          disabled={saving}
          onClick={() => inputRef.current?.click()}
        >
          + Thêm tệp
        </CButton>
      </div>

      {/* ATTACHMENT LIST */}
      <div className="d-flex flex-column gap-2">
        {attachments.length === 0 && (
          <div className="text-body-secondary small py-2">
            Chưa có tệp đính kèm.
          </div>
        )}

        {attachments.map((file) => {
          const extension = getExtension(file.originalFileName)
          const canPreview = isPdf(file.originalFileName) || isImage(file.originalFileName)

          return (
            <div
              key={file.id}
              className="d-flex align-items-center justify-content-between p-2 rounded-2 border border-light"
            >
              {/* LEFT */}
              <div
                className="d-flex align-items-center gap-3"
                style={{ flex: 1, minWidth: 0 }}
              >
                <div
                  className={`bg-body-secondary rounded-2 d-flex align-items-center justify-content-center fw-bold ${getFileIconClass(
                    file.originalFileName,
                  )}`}
                  style={{ width: 48, height: 48, minWidth: 48, fontSize: 11 }}
                >
                  {getFileLabel(file.originalFileName)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenFile(file)}
                    className="border-0 bg-transparent p-0 text-start fw-semibold text-dark text-decoration-none d-block"
                    style={{
                      maxWidth: '100%',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={`${canPreview ? 'Xem' : 'Tải'} ${file.originalFileName}`}
                  >
                    {file.originalFileName}
                  </button>

                  <div className="small text-body-secondary">
                    {formatBytes(file.fileSize)}
                    {extension && <>{' • '}{extension.toUpperCase()}</>}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="d-flex align-items-center gap-1 ms-3">
                <CButton
                  size="sm"
                  color="secondary"
                  variant="ghost"
                  disabled={saving}
                  onClick={() => handleOpenFile(file)}
                >
                  {canPreview ? 'Xem' : 'Tải về'}
                </CButton>

                <CButton
                  size="sm"
                  color="secondary"
                  variant="ghost"
                  disabled={saving}
                  onClick={() => onDelete(file.id)}
                >
                  Xóa
                </CButton>
              </div>
            </div>
          )
        })}
      </div>

      {/* PREVIEW MODAL */}
      <CModal
        visible={preview !== null}
        onClose={handleClosePreview}
        size="xl"
        alignment="center"
        fullscreen="xl"
      >
        <CModalHeader>
          <CModalTitle className="text-truncate">
            {preview?.file.originalFileName}
          </CModalTitle>
        </CModalHeader>

        <CModalBody
          className="p-0 position-relative"
          style={{ height: '80vh', background: '#525659' }}
        >
          {previewLoading && (
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white gap-2">
              <CSpinner color="light" />
              <span className="small">Đang tải tệp...</span>
            </div>
          )}

          {preview?.type === 'pdf' && !previewLoading && preview.viewerUrl && (
            <iframe
              src={preview.viewerUrl}
              title={preview.file.originalFileName}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', background: '#525659' }}
            />
          )}

          {preview?.type === 'image' && !previewLoading && preview.viewerUrl && (
            <div
              className="w-100 h-100 d-flex align-items-center justify-content-center p-4"
              style={{ overflow: 'auto' }}
            >
              <img
                src={preview.viewerUrl}
                alt={preview.file.originalFileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                onError={() => showToast('Không thể tải ảnh.', 'danger')}
              />
            </div>
          )}
        </CModalBody>

        <CModalFooter>
          {preview && (
            <>
              <CButton
                color="secondary"
                variant="ghost"
                disabled={!preview.viewerUrl}
                onClick={openPreviewInNewTab}
              >
                Mở tab mới
              </CButton>

              <CButton
                color="secondary"
                variant="ghost"
                onClick={() => void downloadFile(preview.file)}
              >
                Tải về
              </CButton>

              <CButton color="secondary" onClick={handleClosePreview}>
                Đóng
              </CButton>
            </>
          )}
        </CModalFooter>
      </CModal>
    </section>
  )
}