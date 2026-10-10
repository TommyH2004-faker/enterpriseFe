import React, { useEffect, useMemo, useRef, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilPaperclip, cilSend, cilX } from '@coreui/icons'
import { Message, MessageAttachment } from 'src/services/chatService'

import { formatSize } from './AttachmentView'
import { initialOf } from '../utils/utils'
import { CButton } from '@coreui/react'

export interface MentionMember {
  userId: string
  fullName: string
}

interface PendingFile {
  localId: string
  file: File
  progress: number
  attachment?: MessageAttachment
  error?: string
  previewUrl?: string
}

const MAX_FILES = 10
const MAX_SIZE = 20 * 1024 * 1024
const MAX_MENTIONS = 20

interface Props {
  chatid: string
  sending: boolean
  replyTo: Message | null
  members: MentionMember[]
  nameOf: (userId: string) => string
  onCancelReply: () => void
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<MessageAttachment>
  onSend: (payload: {
    content: string
    mentionedUserIds: string[]
    attachmentIds: string[]
  }) => Promise<boolean>
}

const MessageComposer: React.FC<Props> = ({
  chatid,
  sending,
  replyTo,
  members,
  nameOf,
  onCancelReply,
  onUpload,
  onSend,
}) => {
   console.log('[Mention] chatid:', chatid)
  console.log('[Mention] members:', members)
  const [text, setText] = useState('')
  const [pending, setPending] = useState<PendingFile[]>([])
  const [picked, setPicked] = useState<MentionMember[]>([])
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [dragging, setDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // THÊM ĐOẠN NÀY VÀO: 
  // Lắng nghe sự thay đổi của chatId, hễ chuyển người chat là xóa sạch dữ liệu nhập dở
  useEffect(() => {
    setText('')
    setPicked([])
    setMention(null)
    setPending(cur => {
      // Xóa các blob URL để tránh rò rỉ bộ nhớ trước khi làm rỗng mảng
      cur.forEach(p => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl)
      })
      return []
    })
  }, [chatid])
  useEffect(() => {
    if (replyTo) inputRef.current?.focus()
  }, [replyTo])

  /* ---------- file ---------- */

  const updatePending = (id: string, patch: Partial<PendingFile>) =>
    setPending((cur) => cur.map((p) => (p.localId === id ? { ...p, ...patch } : p)))

  const addFiles = (files: File[]) => {
    const room = Math.max(MAX_FILES - pending.length, 0)
    files.slice(0, room).forEach((file) => {
      const localId = crypto.randomUUID()
      const tooBig = file.size > MAX_SIZE

      setPending((cur) => [
        ...cur,
        {
          localId,
          file,
          progress: 0,
          error: tooBig ? 'Vượt quá 20 MB' : undefined,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        },
      ])
      if (tooBig) return

      onUpload(file, (progress) => updatePending(localId, { progress }))
        .then((attachment) => updatePending(localId, { attachment, progress: 100 }))
        .catch((e) =>
          updatePending(localId, {
            error: e instanceof Error ? e.message : 'Tải lên thất bại',
          }),
        )
    })
  }

  const removePending = (id: string) =>
    setPending((cur) => {
      const target = cur.find((p) => p.localId === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return cur.filter((p) => p.localId !== id)
    })

  const uploading = pending.some((p) => !p.attachment && !p.error)
  const ready = pending.filter((p) => p.attachment)
  const canSend = !sending && !uploading && (text.trim().length > 0 || ready.length > 0)

  /* ---------- tag người ---------- */

  const candidates = useMemo(() => {
    if (!mention) return []
    const q = mention.query.toLowerCase()
    return members.filter((m) => m.fullName.toLowerCase().includes(q)).slice(0, 6)
  }, [mention, members])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setText(value)

    const caret = e.target.selectionStart ?? value.length
    const match = /(^|\s)@([^\s@]*)$/.exec(value.slice(0, caret))

    if (match && members.length) {
      setMention({ start: caret - match[2].length - 1, query: match[2] })
      setActiveIdx(0)
    } else {
      setMention(null)
    }
  }

  const pickMention = (member: MentionMember) => {
    if (!mention) return
    const before = text.slice(0, mention.start)
    const after = text.slice(mention.start + 1 + mention.query.length)
    const insert = `@${member.fullName} `

    setText(before + insert + after)
    setPicked((cur) => (cur.some((x) => x.userId === member.userId) ? cur : [...cur, member]))
    setMention(null)

    const pos = (before + insert).length
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(pos, pos)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mention || !candidates.length) {
      if (e.key === 'Escape' && replyTo) onCancelReply()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % candidates.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i - 1 + candidates.length) % candidates.length)
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      pickMention(candidates[activeIdx])
    } else if (e.key === 'Escape') {
      setMention(null)
    }
  }

  /* ---------- gửi ---------- */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return

    const content = text.trim()
    const mentionedUserIds = picked
      .filter((m) => content.includes(`@${m.fullName}`))
      .slice(0, MAX_MENTIONS)
      .map((m) => m.userId)
    const attachmentIds = ready.map((p) => p.attachment!.id)
    const snapshot = { text, pending, picked }

    setText('')
    setPending([])
    setPicked([])
    setMention(null)

    const ok = await onSend({ content, mentionedUserIds, attachmentIds })

    if (ok) {
      snapshot.pending.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl))
    } else {
      setText(snapshot.text)
      setPending(snapshot.pending)
      setPicked(snapshot.picked)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files)
    if (files.length) {
      e.preventDefault()
      addFiles(files)
    }
  }

  return (
    <div
      className={`composer ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        addFiles(Array.from(e.dataTransfer.files))
      }}
    >
      {replyTo && (
        <div className="reply-bar">
          <div className="reply-bar-copy">
            <strong>Đang trả lời {nameOf(replyTo.senderId)}</strong>
            <small>
              {replyTo.isDeleted
                ? 'Tin nhắn đã bị thu hồi'
                : replyTo.content || '📎 Tệp đính kèm'}
            </small>
          </div>
          <button type="button" aria-label="Huỷ trả lời" onClick={onCancelReply}>
            <CIcon icon={cilX} />
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <div className="pending-files">
          {pending.map((p) => (
            <div
              key={p.localId}
              className={`pending-file ${p.error ? 'error' : ''}`}
              title={p.error ?? p.file.name}
            >
              {p.previewUrl ? <img src={p.previewUrl} alt="" /> : <span>📄</span>}
              <span className="pending-name">{p.file.name}</span>
              <small>
                {p.error ?? (p.attachment ? formatSize(p.file.size) : `${p.progress}%`)}
              </small>
              <button type="button" aria-label="Bỏ tệp" onClick={() => removePending(p.localId)}>
                <CIcon icon={cilX} />
              </button>
            </div>
          ))}
        </div>
      )}

      {mention && candidates.length > 0 && (
        <div className="mention-popup">
          {candidates.map((m, i) => (
            <CButton
              type="button"
              key={m.userId}
              className={i === activeIdx ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault() // giữ focus ở ô nhập
                pickMention(m)
              }}
            >
              <span className="chat-avatar small">{initialOf(m.fullName)}</span>
              {m.fullName}
            </CButton>
          ))}
        </div>
      )}

      <form className="message-form" onSubmit={submit}>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
        <button
          type="button"
          className="send-btn"
          title="Đính kèm tệp"
          aria-label="Đính kèm tệp"
          onClick={() => fileRef.current?.click()}
        >
          <CIcon icon={cilPaperclip} />
        </button>

        <input
          ref={inputRef}
          value={text}
          placeholder="Aa"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        <button
          type="submit"
          className="send-btn"
          disabled={!canSend}
          title="Gửi tin nhắn"
          aria-label="Gửi tin nhắn"
        >
          <CIcon icon={cilSend} />
        </button>
      </form>
    </div>
  )
}

export default MessageComposer