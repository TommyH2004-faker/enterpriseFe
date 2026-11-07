import { aiChatConfig } from "src/api/Aichat.config"

interface Props {
  onPick: (question: string) => void
  disabled?: boolean
}

export default function ChatWelcome({ onPick, disabled }: Props) {
  return (
    <div className="aicw-welcome">
      <h2 className="aicw-welcome__title">Hỏi về công việc và dự án của bạn</h2>
      <p className="aicw-welcome__text">
        Trợ lý chỉ trả lời dựa trên dữ liệu bạn có quyền xem và luôn kèm nguồn để bạn kiểm tra lại.
      </p>
      <div className="aicw-welcome__list">
        {aiChatConfig.suggestions.map((q) => (
          <button
            key={q}
            type="button"
            className="aicw-welcome__item"
            disabled={disabled}
            onClick={() => onPick(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}