import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilChatBubble, cilUserX, cilX } from '@coreui/icons'
import {
  ConversationListItem,
  ConversationMemberRole,
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
import { normalizeRole } from './utils/groupPermissions'
import CreateGroupModal from './Components/CreateGroupModal'
import GroupMembersModal from './Components/GroupMembersModal'
import ToastAlert from 'src/components/ToastAlert'

const Messages: React.FC = () => {
  const chat = useChat()
  const [showNewChat, setShowNewChat] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [membersModalInitialView, setMembersModalInitialView] = useState<'info' | 'add'>('info')
  const [peopleQuery, setPeopleQuery] = useState('')
  const { people, clear } = useEmployeeSearch(chat.service, peopleQuery, showNewChat)

  const active = chat.active
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

  // Toast tự tắt sau 6 giây
  useEffect(() => {
    if (!chat.notice) return
    const timer = window.setTimeout(() => chat.setNotice(null), 6000)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.notice?.id])

  const myMember = (active?.members ?? []).find(
    (m) =>
      chat.currentUserId &&
      m.userId.toLowerCase() === chat.currentUserId.toLowerCase(),
  )
  const iAmOwner = normalizeRole(myMember?.role) === ConversationMemberRole.Owner

  const handleSelectConversation = (item: ConversationListItem) => {
    chat.setRemovedBannerGroupName(null)
    void chat.openConversation(item)
  }

  return (
    <div className="chat-shell">
      <ConversationList
        conversations={chat.conversations}
        activeId={active?.id}
        loading={chat.loading}
        query={chat.query}
        scope={chat.scope}
        isUserOnline={chat.isUserOnline}
        getUserLastSeen={chat.getUserLastSeen}
        onScopeChange={chat.setScope}
        onQueryChange={chat.setQuery}
        onSelect={handleSelectConversation}
        onToggleNewChat={() => setShowNewChat((v) => !v)}
        onCreateGroup={() => setShowGroupModal(true)}
        onArchive={(item) => void chat.deleteConversation(item.id)}
        onUnarchive={(item) => void chat.unhideConversation(item.id)}
        onRestoreGroup={(item) => void chat.restoreDissolvedGroup(item.id)}
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
        <ToastAlert message={chat.error} />

        {/* KHUNG 4 - VÙNG 3: Thanh thông báo vàng nhạt đầu khung chat khi vừa bị xóa khỏi nhóm */}
        {chat.removedBannerGroupName && (
          <div className="removed-from-group-banner" role="alert">
            <CIcon icon={cilUserX} className="removed-banner-icon" />
            <span>Bạn đã bị xóa khỏi nhóm {chat.removedBannerGroupName}</span>
            <button
              type="button"
              className="removed-banner-close"
              aria-label="Đóng thông báo"
              onClick={() => chat.setRemovedBannerGroupName(null)}
            >
              <CIcon icon={cilX} size="sm" />
            </button>
          </div>
        )}

        {!active ? (
          <div className="thread-placeholder">
            <CIcon icon={cilChatBubble} size="3xl" />
            <h2>Chọn một cuộc trò chuyện</h2>
            <p>Tập trung trao đổi công việc với đội ngũ của bạn.</p>
          </div>
        ) : (
          <>
            <ChatHeader
              conversation={active}
              currentUserId={chat.currentUserId}
              isUserOnline={chat.isUserOnline}
              getUserLastSeen={chat.getUserLastSeen}
              onOpenInfo={() => {
                setMembersModalInitialView('info')
                setShowMembersModal(true)
              }}
              onOpenAddMembers={() => {
                setMembersModalInitialView('add')
                setShowMembersModal(true)
              }}
            />
            {active.isArchived && (
              <div className="state-banner">
                <span>Nhóm đã bị giải tán. Không thể gửi thêm tin nhắn.</span>
                {iAmOwner && (
                  <button type="button" onClick={() => void chat.restoreDissolvedGroup(active.id)}>
                    Khôi phục nhóm
                  </button>
                )}
              </div>
            )}
            {active.isHidden && !active.isArchived && (
              <div className="state-banner">
                <span>Cuộc trò chuyện đã được lưu trữ. Có tin nhắn mới, nó sẽ tự hiện lại.</span>
                <button type="button" onClick={() => void chat.unhideConversation(active.id)}>
                  Bỏ lưu trữ
                </button>
              </div>
            )}
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
            {!active.isArchived && (
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
            )}
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

      {active && !isDirect && (
        <GroupMembersModal
          visible={showMembersModal}
          initialView={membersModalInitialView}
          conversation={active}
          currentUserId={chat.currentUserId}
          service={chat.service}
          isUserOnline={chat.isUserOnline}
          getUserLastSeen={chat.getUserLastSeen}
          onClose={() => setShowMembersModal(false)}
          onRemoveMember={chat.removeMember}
          onAddMembers={chat.addMembers}
          onChangeRole={chat.changeMemberRole}
          onTransferOwnership={chat.transferOwnership}
          onUpdateInfo={chat.updateConversationInfo}
          onArchiveGroup={chat.archiveConversation}
        />
      )}
      {chat.notice && (
        <div className="chat-toast" role="status">
          <span>{chat.notice.text}</span>
          {chat.notice.undoId && (
            <button type="button" onClick={() => void chat.unhideConversation(chat.notice!.undoId!)}>
              Hoàn tác
            </button>
          )}
        </div>
      )}
    </div>
  )
}
export default Messages
