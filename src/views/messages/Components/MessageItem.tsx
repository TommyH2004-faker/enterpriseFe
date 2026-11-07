import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilActionUndo, cilPaperclip, cilSmile } from '@coreui/icons'
import {
  ChatService,
  Message,
  MessageReactionType,
  MessageType,
  ReplyPreview,
} from 'src/services/chatService'

import AttachmentView from './AttachmentView'
import { formatTime, groupReactions, reactionOptions } from '../utils/utils'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Tô sáng "@Tên" của những người được tag */
const renderContent = (content: string, names: string[]) => {
  const list = names.filter(Boolean).sort((a, b) => b.length - a.length)
  if (!list.length) return content
  const pattern = new RegExp(`(@(?:${list.map(escapeRegExp).join('|')}))`, 'g')
  return content
    .split(pattern)
    .map((part, i) =>
      i % 2 ? (
        <span key={i} className="msg-mention">
          {part}
        </span>
      ) : (
        part
      ),
    )
}

interface Props {
  message: Message
  isMine: boolean
  isFirstInGroup: boolean
  isLastInGroup: boolean
  showSender: boolean
  senderLabel: string
  avatarText: string
  currentUserId: string
  pickerOpen: boolean
  reacting: boolean
  service: ChatService
  nameOf: (userId: string) => string
  replyPreview: ReplyPreview | null
  onReply: () => void
  onJumpTo: (messageId: string) => void
  onTogglePicker: () => void
  onReact: (type: MessageReactionType) => void
}

const MessageItem: React.FC<Props> = ({
  message,
  isMine,
  isFirstInGroup,
  isLastInGroup,
  showSender,
  senderLabel,
  avatarText,
  currentUserId,
  pickerOpen,
  reacting,
  service,
  nameOf,
  replyPreview,
  onReply,
  onJumpTo,
  onTogglePicker,
  onReact,
}) => {
  const groups = groupReactions(message, currentUserId)
  const myType = (message.reactions ?? []).find((r) => r.userId === currentUserId)?.reactionType
  const mentionNames = (message.mentions ?? []).map((m) => m.fullName ?? nameOf(m.userId))
  const attachments = message.isDeleted ? [] : message.attachments ?? []

  if (message.messageType === MessageType.System) {
    return (
      <div data-message-id={message.id} className="msg-system-row">
        <span className="msg-system-pill">{message.content}</span>
      </div>
    )
  }

  return (
    <article
      data-message-id={message.id}
      className={[
        'msg',
        isMine ? 'mine' : '',
        isFirstInGroup ? 'first' : '',
        isLastInGroup ? 'last' : '',
        groups.length ? 'has-reactions' : '',
      ].join(' ')}
    >
      {showSender && <span className="msg-sender">{senderLabel}</span>}

      {!isMine && (
        <span className={`msg-avatar ${isLastInGroup ? '' : 'ghost'}`}>
          {isLastInGroup ? avatarText : ''}
        </span>
      )}

      <div className="msg-line">
        <div
          className={`msg-bubble ${message.isDeleted ? 'deleted' : ''}`}
          title={`${formatTime(message.sentAt)}${message.editedAt ? ' · đã chỉnh sửa' : ''}`}
        >
          {!message.isDeleted && replyPreview && (
            <button
              type="button"
              className="msg-reply-quote"
              onClick={() => onJumpTo(replyPreview.id)}
            >
              <strong>
                {replyPreview.senderName ||
                  (replyPreview.senderId ? nameOf(replyPreview.senderId) : 'Tin nhắn gốc')}
              </strong>
              <span className="msg-reply-quote-text">
                {replyPreview.isDeleted ? (
                  'Tin nhắn đã bị thu hồi'
                ) : replyPreview.content ? (
                  replyPreview.content
                ) : (
                  <>
                    <CIcon icon={cilPaperclip} size="sm" className="me-1" />
                    Tệp đính kèm
                  </>
                )}
              </span>
            </button>
          )}

          {attachments.length > 0 && (
            <div className="msg-attachments">
              {attachments.map((a) => (
                <AttachmentView key={a.id} attachment={a} service={service} />
              ))}
            </div>
          )}

          {message.isDeleted
            ? 'Tin nhắn đã bị thu hồi'
            : message.content
              ? renderContent(message.content, mentionNames)
              : null}

          {groups.length > 0 && (
            <div className="msg-reactions">
              {groups.map((g) => (
                <button
                  key={g.type}
                  type="button"
                  className={`reaction-summary ${g.reactedByMe ? 'mine' : ''}`}
                  title={g.reactedByMe ? 'Bỏ cảm xúc' : 'Thả cảm xúc'}
                  onClick={() => onReact(g.type)}
                >
                  {g.emoji}
                  {g.count > 1 && <span>{g.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {!message.isDeleted && (
          <div className={`msg-actions ${pickerOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="reaction-trigger-button"
              title="Thả cảm xúc"
              aria-label="Thả cảm xúc"
              onClick={onTogglePicker}
            >
              <CIcon icon={cilSmile} size="sm" />
            </button>
            <button
              type="button"
              className="reaction-trigger-button"
              title="Trả lời"
              aria-label="Trả lời"
              onClick={onReply}
            >
              <CIcon icon={cilActionUndo} size="sm" />
            </button>

            {pickerOpen && (
              <div className="reaction-picker">
                {reactionOptions.map((r) => (
                  <button
                    key={r.type}
                    type="button"
                    className={`reaction-option ${myType === r.type ? 'selected' : ''}`}
                    title={r.label}
                    aria-label={r.label}
                    disabled={reacting}
                    onClick={() => onReact(r.type)}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isLastInGroup && (
        <time className="msg-time">
          {formatTime(message.sentAt)}
          {message.editedAt ? ' · đã chỉnh sửa' : ''}
        </time>
      )}
    </article>
  )
}

export default MessageItem
