import { useState } from 'react'
import { aiChatConfig } from 'src/api/Aichat.config'

interface Props {
  onPick: (question: string) => void
  disabled?: boolean
}

export default function ChatWelcome({ onPick, disabled }: Props) {
  const groups = aiChatConfig.suggestionGroups || []
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || 'personal')

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0]

  return (
    <div className="aicw-welcome">
      <div className="aicw-welcome__header">
        <h2 className="aicw-welcome__title">Trợ lý AI Doanh nghiệp</h2>
        <p className="aicw-welcome__text">
          Hỗ trợ tra cứu công việc, tiến độ dự án và giải đáp nghiệp vụ theo phân quyền tài khoản của bạn.
        </p>
      </div>

      {groups.length > 0 && (
        <div className="aicw-welcome__tabs" role="tablist">
          {groups.map((group) => {
            const isActive = group.id === selectedGroupId
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`aicw-welcome__tab ${isActive ? 'is-active' : ''}`}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <span className="aicw-welcome__tab-icon">{group.icon}</span>
                <span className="aicw-welcome__tab-title">{group.title}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="aicw-welcome__list" role="tabpanel">
        {activeGroup?.items.map((q) => (
          <button
            key={q}
            type="button"
            className="aicw-welcome__item"
            disabled={disabled}
            onClick={() => onPick(q)}
          >
            <span className="aicw-welcome__item-bullet">›</span>
            <span className="aicw-welcome__item-text">{q}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
