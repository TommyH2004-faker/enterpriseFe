import { CBadge } from '@coreui/react'
import { Link } from 'react-router-dom'

import { truncate } from './chatformat'
import { ChatSource } from 'src/types/Aichat'
import { aiChatConfig } from 'src/api/Aichat.config'

const TYPE_LABEL: Record<string, string> = {
  Task: 'Công việc',
  Project: 'Dự án',
  Comment: 'Bình luận',
  Document: 'Tài liệu',
}

const TYPE_COLOR: Record<string, string> = {
  Task: 'primary',
  Project: 'success',
  Comment: 'info',
  Document: 'warning',
}

interface Props {
  sources: ChatSource[]
  /** Gọi khi bấm vào link (để đóng khung chat trên màn hình nhỏ) */
  onNavigate?: () => void
}

export default function ChatSourceList({ sources, onNavigate }: Props) {
  if (sources.length === 0) return null

  return (
    <div className="aicw-sources" aria-label="Nguồn dữ liệu">
      <div className="aicw-sources__heading">Nguồn dữ liệu ({sources.length})</div>
      <ul className="aicw-sources__list">
        {sources.map((s, i) => {
          const href = aiChatConfig.sourceRoutes[s.sourceType]?.(s.sourceId)
          const title = s.title || s.description || s.sourceId
          const body = (
            <>
              <CBadge color={TYPE_COLOR[s.sourceType] ?? 'secondary'}>
                {TYPE_LABEL[s.sourceType] ?? s.sourceType}
              </CBadge>
              <span className="aicw-sources__title">{truncate(title, 80)}</span>
              {s.title && s.description && (
                <span className="aicw-sources__desc">{truncate(s.description, 110)}</span>
              )}
            </>
          )
          return (
            <li key={`${s.sourceType}-${s.sourceId}-${i}`}>
              {href ? (
                <Link to={href} className="aicw-sources__link" onClick={onNavigate}>
                  {body}
                </Link>
              ) : (
                <div className="aicw-sources__link aicw-sources__link--static">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}