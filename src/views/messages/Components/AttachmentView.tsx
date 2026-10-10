
import React, { useEffect, useState } from 'react'
import { ChatService, MessageAttachment } from 'src/services/chatService'

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface Props {
  attachment: MessageAttachment
  service: ChatService
}

const AttachmentView: React.FC<Props> = ({ attachment, service }) => {
  const isImage = attachment.contentType.startsWith('image/')

  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Tải ảnh đã gửi và tạo URL chỉ dùng trong component này.
  useEffect(() => {
    if (!isImage) return

    let cancelled = false
    let objectUrl: string | null = null

    setSrc(null)
    setFailed(false)

    service
      .downloadAttachment(attachment.id)
      .then((blob) => {
        if (cancelled) return

        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [attachment.id, isImage, service])

  // Đóng ảnh bằng phím Escape.
  useEffect(() => {
    if (!previewOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [previewOpen])

  const download = async () => {
    let temporaryUrl: string | null = null

    try {
      const blob = await service.downloadAttachment(attachment.id)
      temporaryUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = temporaryUrl
      a.download = attachment.originalFileName

      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error('Không thể tải tệp đính kèm:', error)
    } finally {
      if (temporaryUrl) {
        window.setTimeout(() => {
          URL.revokeObjectURL(temporaryUrl!)
        }, 10000)
      }
    }
  }

  if (isImage) {
    const ratio =
      attachment.width && attachment.height
        ? `${attachment.width} / ${attachment.height}`
        : undefined

    return (
      <>
        <button
          type="button"
          className="msg-image"
          style={ratio ? { aspectRatio: ratio } : undefined}
          onClick={() => {
            if (src) setPreviewOpen(true)
          }}
          title={`Xem ảnh: ${attachment.originalFileName}`}
          disabled={!src}
        >
          {src ? (
            <img src={src} alt={attachment.originalFileName} />
          ) : (
            <span className="msg-image-placeholder">
              {failed ? 'Không tải được ảnh' : 'Đang tải ảnh...'}
            </span>
          )}
        </button>

        {previewOpen && src && (
          <div
            className="chat-image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh"
            onClick={() => setPreviewOpen(false)}
          >
            <button
              type="button"
              className="chat-image-lightbox-close"
              aria-label="Đóng ảnh"
              title="Đóng"
              onClick={() => setPreviewOpen(false)}
            >
              ×
            </button>

            <div
              className="chat-image-lightbox-content"
              onClick={(event) => event.stopPropagation()}
            >
              <img src={src} alt={attachment.originalFileName} />

              <div className="chat-image-lightbox-caption">
                <span>{attachment.originalFileName}</span>

                <button
                  type="button"
                  onClick={() => void download()}
                >
                  Tải xuống
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <button
      type="button"
      className="msg-file"
      onClick={() => void download()}
    >
      <span className="msg-file-icon">📄</span>

      <span className="msg-file-copy">
        <strong>{attachment.originalFileName}</strong>
        <small>{formatSize(attachment.fileSize)}</small>
      </span>
    </button>
  )
}

export default AttachmentView

