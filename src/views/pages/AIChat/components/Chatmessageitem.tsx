
import CIcon from '@coreui/icons-react'
import { cilReload, cilSpeech, cilUser } from '@coreui/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import ChatSourceList from './Chatsourcelist'
import { formatMessageTime } from './chatformat'
import { ChatMessage } from 'src/types/Aichat'

interface Props {
  message: ChatMessage
  onRetry?: (messageId: string) => void
  onNavigateSource?: () => void
}

export default function ChatMessageItem({
  message,
  onRetry,
  onNavigateSource,
}: Props) {
  const isUser = message.role === 'user'
  const failed = message.status === 'failed'

  return (
    <div className={`aicw-msg aicw-msg--${message.role}`}>
      <div className="aicw-msg__avatar" aria-hidden="true">
        <CIcon icon={isUser ? cilUser : cilSpeech} size="sm" />
      </div>

      <div className="aicw-msg__body">
        <div className={`aicw-msg__bubble${failed ? ' is-failed' : ''}`}>
          {isUser ? (
            <p className="aicw-msg__text">{message.content}</p>
          ) : (
            <div className="aicw-md">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node: _node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noreferrer noopener"
                    />
                  ),
                  table: ({ node: _node, ...props }) => (
                    <div className="aicw-md__table">
                      <table {...props} />
                    </div>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <ChatSourceList
            sources={message.sources}
            onNavigate={onNavigateSource}
          />
        )}

        <div className="aicw-msg__meta">
          {message.status === 'sending' && <span>Đang gửi…</span>}

          {failed && (
            <>
              <span className="aicw-msg__failed">Chưa gửi được</span>

              {onRetry && (
                <button
                  type="button"
                  className="aicw-msg__retry"
                  onClick={() => onRetry(message.id)}
                >
                  <CIcon icon={cilReload} size="sm" />
                  Gửi lại
                </button>
              )}
            </>
          )}

          {!failed && message.status !== 'sending' && (
            <span>{formatMessageTime(message.createdAt)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
