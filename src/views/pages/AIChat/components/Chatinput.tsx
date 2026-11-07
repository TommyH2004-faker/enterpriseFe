import CIcon from '@coreui/icons-react'
import { cilSend } from '@coreui/icons'
import { CButton } from '@coreui/react'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { aiChatConfig } from 'src/api/Aichat.config'


interface Props {
  disabled?: boolean
  /** true khi khung chat đang mở và hiển thị: tự focus vào ô nhập */
  active: boolean
  onSend: (text: string) => void
}

export default function ChatInput({ disabled, active, onSend }: Props) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (active) ref.current?.focus()
  }, [active])

  // Tự giãn chiều cao theo nội dung (tối đa 120px)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  const canSend = !disabled && value.trim().length > 0

  const submit = () => {
    if (!canSend) return
    onSend(value)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Bỏ qua khi đang gõ tiếng Việt bằng bộ gõ (Telex/VNI) để Enter không gửi nhầm
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="aicw-input">
      <div className="aicw-input__row">
        <textarea
          ref={ref}
          className="form-control aicw-input__field"
          rows={1}
          value={value}
          maxLength={aiChatConfig.maxMessageLength}
          placeholder="Nhập câu hỏi…"
          aria-label="Câu hỏi"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <CButton color="primary" disabled={!canSend} onClick={submit} aria-label="Gửi câu hỏi">
          <CIcon icon={cilSend} />
        </CButton>
      </div>
      <div className="aicw-input__hint">
        <span>Enter để gửi, Shift + Enter xuống dòng</span>
        {value.length > aiChatConfig.maxMessageLength * 0.8 && (
          <span>
            {value.length}/{aiChatConfig.maxMessageLength}
          </span>
        )}
      </div>
    </div>
  )
}