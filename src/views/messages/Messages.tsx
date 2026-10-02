import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HubConnection, HubConnectionState } from '@microsoft/signalr'
import { CAlert, CButton, CFormInput, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilChatBubble, cilPlus, cilSearch, cilSend } from '@coreui/icons'
import { authStorage } from 'src/services/authStorage'
import { ChatService, ConversationDetail, ConversationListItem, EmployeeSearchItem, Message } from 'src/services/chatService'
import '../../scss/chat.scss'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const getCurrentUserId = () => {
  const token = authStorage.getAccessToken()
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub || payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || ''
  } catch { return '' }
}
const initialOf = (value: string) => value.trim().charAt(0).toUpperCase() || '?'
const formatTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
const notifyUnreadChanged = () => window.dispatchEvent(new Event('chat:unread-changed'))

const Messages: React.FC = () => {
  const service = useMemo(() => new ChatService(apiBaseUrl), [])
  const connectionRef = useRef<HubConnection | null>(null)
  const activeConversationIdRef = useRef<string | null>(null)
  const currentUserId = useMemo(getCurrentUserId, [])
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [active, setActive] = useState<ConversationDetail | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [query, setQuery] = useState('')
  const [text, setText] = useState('')
  const [peopleQuery, setPeopleQuery] = useState('')
  const [people, setPeople] = useState<EmployeeSearchItem[]>([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    activeConversationIdRef.current = active?.id ?? null
  }, [active?.id])

  const sortConversations = (items: ConversationListItem[]) => [...items].sort((left, right) => {
    if (left.isPinned !== right.isPinned) return left.isPinned ? -1 : 1
    return new Date(right.lastActivityAt || 0).getTime() - new Date(left.lastActivityAt || 0).getTime()
  })

  const upsertConversation = (conversation: ConversationListItem) => {
    if (!conversation?.id) return
    setConversations((current) => sortConversations([
      conversation,
      ...current.filter((item) => item.id !== conversation.id),
    ]))
  }

  const loadConversations = async () => {
    try { setError(null); setConversations(sortConversations(await service.getConversations(query || undefined))) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Không thể tải danh sách hội thoại.') }
  }
  const openConversation = async (item: Pick<ConversationListItem, 'id'>) => {
    try {
      if (!item?.id) throw new Error('Conversation không có id.')
      setLoading(true)
      const [detail, history] = await Promise.all([service.getConversation(item.id), service.getMessages(item.id)])
      const connection = connectionRef.current
      if (connection?.state === HubConnectionState.Connected) await connection.invoke('JoinConversation', item.id)
      setActive(detail); setMessages(history); activeConversationIdRef.current = detail.id
      const last = history[history.length - 1]
      if (last) await service.markAsRead(item.id, last.id)
      notifyUnreadChanged()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Không thể mở hội thoại.') }
    finally { setLoading(false) }
  }
  const addMessage = (message: Message) => {
    if (!message?.id || (message.conversationId && message.conversationId !== activeConversationIdRef.current)) return
    setMessages((current) => current.some((item) => item.id === message.id || (message.clientMessageId && item.clientMessageId === message.clientMessageId)) ? current : [...current, message])
  }
  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!active || !text.trim() || sending) return
    const content = text.trim(); const clientMessageId = crypto.randomUUID(); setText(''); setSending(true)
    try {
      const connection = connectionRef.current
      if (connection?.state === HubConnectionState.Connected) await connection.invoke('SendMessage', active.id, content, clientMessageId, null)
      else addMessage(await service.sendMessage(active.id, content, clientMessageId))
    } catch (requestError) { setText(content); setError(requestError instanceof Error ? requestError.message : 'Không thể gửi tin nhắn.') }
    finally { setSending(false) }
  }
  const startDirectChat = async (person: EmployeeSearchItem) => {
    if (!person?.userId) {
      setError('Không tìm thấy userId của nhân viên.')
      return
    }
    if (person.userId === currentUserId) {
      setError('Bạn không thể chat với chính mình.')
      return
    }
    try {
      const detail = await service.createDirect(person.userId)
      if (!detail?.id) throw new Error('API tạo cuộc trò chuyện không trả về conversation id.')
      await loadConversations()
      await openConversation(detail)
      setPeople([])
      setPeopleQuery('')
      setShowNewChat(false)
    }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Không thể tạo cuộc trò chuyện.') }
  }

  useEffect(() => {
    void loadConversations().finally(() => setLoading(false))
    const connection = service.createConnection(authStorage.getAccessToken() || '')
    connectionRef.current = connection

    const handleConversationEvent = (payload?: ConversationListItem | ConversationDetail) => {
      if (payload?.id && payload.lastActivityAt && typeof payload.unreadCount === 'number') upsertConversation(payload)
      else void loadConversations()
    }
    const getMessagePayload = (...args: unknown[]): Message | null => {
      const candidate = args.length > 1 ? args[1] : args[0]
      if (!candidate || typeof candidate !== 'object') return null
      const message = candidate as Message
      if (args.length > 1 && typeof args[0] === 'string' && !message.conversationId) {
        message.conversationId = args[0]
      }
      return message
    }
    const handleMessageReceived = (...args: unknown[]) => {
      const message = getMessagePayload(...args)
      if (!message) return
      addMessage(message)
      void loadConversations()
      notifyUnreadChanged()
    }
    const handleMessageEdited = (...args: unknown[]) => {
      const message = getMessagePayload(...args)
      if (!message || (message.conversationId && message.conversationId !== activeConversationIdRef.current)) return
      setMessages((current) => current.map((item) => item.id === message.id ? message : item))
    }
    const handleMessageDeleted = (...args: unknown[]) => {
      const message = getMessagePayload(...args)
      if (!message || (message.conversationId && message.conversationId !== activeConversationIdRef.current)) return
      setMessages((current) => current.map((item) => item.id === message.id ? message : item))
      void loadConversations()
    }
    const handleUnreadChanged = () => {
      void loadConversations()
      notifyUnreadChanged()
    }
    const handleReconnected = async () => {
      const conversationId = activeConversationIdRef.current
      if (conversationId && connection.state === HubConnectionState.Connected) {
        await connection.invoke('JoinConversation', conversationId)
      }
      await loadConversations()
    }

    connection.on('ConversationCreated', handleConversationEvent)
    connection.on('ConversationUpdated', handleConversationEvent)
    connection.on('MessageReceived', handleMessageReceived)
    connection.on('MessageEdited', handleMessageEdited)
    connection.on('MessageDeleted', handleMessageDeleted)
    connection.on('UnreadChanged', handleUnreadChanged)
    connection.onreconnected(handleReconnected)
    void connection.start().catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Không thể kết nối chat realtime.'))
    return () => {
      connection.off('ConversationCreated', handleConversationEvent)
      connection.off('ConversationUpdated', handleConversationEvent)
      connection.off('MessageReceived', handleMessageReceived)
      connection.off('MessageEdited', handleMessageEdited)
      connection.off('MessageDeleted', handleMessageDeleted)
      connection.off('UnreadChanged', handleUnreadChanged)
      void connection.stop()
      connectionRef.current = null
    }
  }, [service])
  useEffect(() => {
    if (!showNewChat || peopleQuery.trim().length < 2) { setPeople([]); return }
    const timer = window.setTimeout(() => { void service.searchEmployees(peopleQuery.trim()).then(setPeople).catch(() => setPeople([])) }, 250)
    return () => window.clearTimeout(timer)
  }, [peopleQuery, service, showNewChat])

  return <div className="chat-shell">
    <aside className="chat-conversations">
      <div className="chat-panel-heading"><div><span className="chat-eyebrow">Workspace</span><h1>Tin nhắn</h1></div><CButton color="primary" size="sm" title="Tạo cuộc trò chuyện" aria-label="Tạo cuộc trò chuyện" onClick={() => setShowNewChat((value) => !value)}><CIcon icon={cilPlus} /></CButton></div>
      <div className="chat-search"><CIcon icon={cilSearch} /><CFormInput value={query} placeholder="Tìm cuộc trò chuyện" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void loadConversations()} /></div>
      {showNewChat && <div className="new-chat-box"><CFormInput autoFocus value={peopleQuery} placeholder="Tìm nhân viên để nhắn..." onChange={(event) => setPeopleQuery(event.target.value)} />{people.map((person) => <button className="person-result" key={person.userId} onClick={() => void startDirectChat(person)}><span className="chat-avatar small">{initialOf(person.fullName)}</span><span><strong>{person.fullName}</strong><small>{person.departmentName || person.username}</small></span><CIcon icon={cilArrowRight} /></button>)}</div>}
      {loading && !conversations.length ? <div className="chat-loading"><CSpinner size="sm" /> Đang tải hội thoại...</div> : conversations.length ? conversations.map((item) => <button key={item.id} className={`conversation-row ${active?.id === item.id ? 'active' : ''}`} onClick={() => void openConversation(item)}><span className="chat-avatar">{initialOf(item.name || 'D')}</span><span className="conversation-copy"><strong>{item.name || 'Cuộc trò chuyện riêng'}</strong><small>{item.lastMessage?.isDeleted ? 'Tin nhắn đã bị thu hồi' : item.lastMessage?.content || 'Chưa có tin nhắn'}</small></span>{item.unreadCount > 0 && <span className="unread-count">{item.unreadCount > 99 ? '99+' : item.unreadCount}</span>}</button>) : <div className="chat-empty-list"><CIcon icon={cilChatBubble} size="xl" /><p>Chưa có cuộc trò chuyện</p><small>Tạo tin nhắn mới để bắt đầu.</small></div>}
    </aside>
    <main className="chat-thread">
      {error && <CAlert color="danger" className="m-3">{error}</CAlert>}
      {!active ? <div className="thread-placeholder"><CIcon icon={cilChatBubble} size="3xl" /><h2>Chọn một cuộc trò chuyện</h2><p>Tập trung trao đổi công việc với đội ngũ của bạn.</p></div> : <><header className="thread-header"><span className="chat-avatar">{initialOf(active.name || 'D')}</span><div><h2>{active.name || 'Cuộc trò chuyện riêng'}</h2><small>{active.memberCount || active.members.length} thành viên · đang hoạt động</small></div></header><section className="message-stream">{messages.map((message) => <article key={message.id} className={`message-bubble ${message.senderId === currentUserId ? 'mine' : ''}`}><div>{message.isDeleted ? 'Tin nhắn đã bị thu hồi' : message.content}</div><time>{formatTime(message.sentAt)}{message.editedAt ? ' · đã chỉnh sửa' : ''}</time></article>)}</section><form className="message-form" onSubmit={sendMessage}><CFormInput value={text} placeholder="Viết tin nhắn..." onChange={(event) => setText(event.target.value)} /><CButton color="primary" type="submit" disabled={!text.trim() || sending} title="Gửi tin nhắn" aria-label="Gửi tin nhắn"><CIcon icon={cilSend} /></CButton></form></>}
    </main>
  </div>
}

export default Messages
