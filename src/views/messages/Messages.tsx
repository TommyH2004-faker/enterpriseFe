import React, { useCallback, useMemo, useState } from 'react'
import { CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChatBubble } from '@coreui/icons'
import {
  ConversationListItem,
  ConversationType,
  EmployeeSearchItem,
} from 'src/services/chatService'

import '../../scss/chat.scss'
import { useChat } from './hooks/useChat'
import { useEmployeeSearch } from './hooks/useEmployeeSearch'
import MessageComposer, { MentionMember } from './Components/MessageComposer'
import ConversationList from './Components/ConversationList'
import NewChatBox from './Components/NewChatBox'
import ChatHeader from './Components/ChatHeader'
import MessageList from './Components/MessageList'
import { initialOf } from './utils/utils'
import CreateGroupModal from './Components/CreateGroupModal'
import ConfirmDeleteModal from './Components/ConfirmDeleteModal'

const Messages: React.FC = () => {
  const chat = useChat()
  const [showNewChat, setShowNewChat] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ConversationListItem | null>(null)
  const [peopleQuery, setPeopleQuery] = useState('')
  const { people, clear } = useEmployeeSearch(chat.service, peopleQuery, showNewChat)

  const active = chat.active
  console.log('[Chat active]', active)
console.log('[Active members]', active?.members)
console.log('[Current user]', chat.currentUserId)
  const isDirect = active?.conversationType === ConversationType.Direct

  const members = useMemo(
    () => (active?.members ?? []).filter((m) => m.isActive && !!m.fullName),
    [active],
  )

  const nameMap = useMemo(
    () => Object.fromEntries(members.map((m) => [m.userId, m.fullName as string])),
    [members],
  )

  const nameOf = useCallback(
    (userId: string) => {
      if (userId === chat.currentUserId) return 'Bạn'
      return nameMap[userId] ?? (isDirect ? active?.name : undefined) ?? 'Thành viên'
    },
    [nameMap, chat.currentUserId, isDirect, active?.name],
  )

  // Chat riêng không cần tag
  const mentionable: MentionMember[] = useMemo(
    () =>
      isDirect
        ? []
        : members
            .filter((m) => m.userId !== chat.currentUserId)
            .map((m) => ({ userId: m.userId, fullName: m.fullName as string })),
    [isDirect, members, chat.currentUserId],
  )

  const pickPerson = async (person: EmployeeSearchItem) => {
    if (await chat.startDirectChat(person)) {
      clear()
      setPeopleQuery('')
      setShowNewChat(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return null
    const message = await chat.deleteConversation(deleteTarget.id)
    if (!message) setDeleteTarget(null)
    return message
  }

  return (
    <div className="chat-shell">
      <ConversationList
        conversations={chat.conversations}
        activeId={active?.id}
        loading={chat.loading}
        query={chat.query}
        onQueryChange={chat.setQuery}
        onSelect={chat.openConversation}
        onToggleNewChat={() => setShowNewChat((v) => !v)}
        onCreateGroup={() => setShowGroupModal(true)}
        onDelete={setDeleteTarget}
      >
        {showNewChat && (
          <NewChatBox
            query={peopleQuery}
            people={people}
            onQueryChange={setPeopleQuery}
            onPick={pickPerson}
          />
        )}
      </ConversationList>

      <main className="chat-thread">
        {chat.error && (
          <CAlert color="danger" className="m-3">
            {chat.error}
          </CAlert>
        )}

        {!active ? (
          <div className="thread-placeholder">
            <CIcon icon={cilChatBubble} size="3xl" />
            <h2>Chọn một cuộc trò chuyện</h2>
            <p>Tập trung trao đổi công việc với đội ngũ của bạn.</p>
          </div>
        ) : (
          <>
            <ChatHeader conversation={active} />
            <MessageList
              messages={chat.messages}
              currentUserId={chat.currentUserId}
              avatarText={initialOf(active.name || 'D')}
              isGroup={!isDirect}
              reactingId={chat.reactingId}
              service={chat.service}
              nameOf={nameOf}
              onReact={chat.toggleReaction}
              onReply={chat.setReplyTo}
            />
            <MessageComposer
              chatid={active.id}
              sending={chat.sending}
              replyTo={chat.replyTo}
              members={mentionable}
              nameOf={nameOf}
              onCancelReply={() => chat.setReplyTo(null)}
              onUpload={chat.uploadAttachment}
              onSend={chat.sendMessage}
            />
          </>
        )}
      </main>

      <CreateGroupModal
        visible={showGroupModal}
        service={chat.service}
        currentUserId={chat.currentUserId}
        onClose={() => setShowGroupModal(false)}
        onSubmit={chat.createGroup}
      />

      <ConfirmDeleteModal
        visible={!!deleteTarget}
        name={deleteTarget?.name || 'cuộc trò chuyện này'}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default Messages