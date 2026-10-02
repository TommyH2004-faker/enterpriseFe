
```tsx
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { AxiosInstance } from "axios";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";

/*
API REST:

GET    /api/v1/conversations
GET    /api/v1/conversations/{conversationId}
GET    /api/v1/conversations/{conversationId}/messages
POST   /api/v1/conversations/direct
POST   /api/v1/conversations/group
POST   /api/v1/conversations/{conversationId}/messages
PUT    /api/v1/conversations/messages/{messageId}
DELETE /api/v1/conversations/messages/{messageId}
POST   /api/v1/conversations/{conversationId}/read
POST   /api/v1/conversations/{conversationId}/members
DELETE /api/v1/conversations/{conversationId}/members/{userId}
PUT    /api/v1/conversations/{conversationId}/members/{userId}/role
POST   /api/v1/conversations/{conversationId}/transfer-ownership
PUT    /api/v1/conversations/{conversationId}
POST   /api/v1/conversations/{conversationId}/archive
POST   /api/v1/conversations/{conversationId}/unarchive
PUT    /api/v1/conversations/{conversationId}/preferences
GET    /api/v1/employees?search=&departmentId=

SignalR:

Hub: /hubs/chat

JoinConversation
LeaveConversation
SendMessage
MarkAsRead
Typing
StopTyping

Events:

MessageReceived
MessageEdited
MessageDeleted
ConversationUpdated
UnreadChanged
Typing
*/

// =========================
// ENUMS
// =========================

export enum ConversationType {
  Direct = 1,
  Group = 2,
  Project = 3,
  Department = 4,
}

export enum ConversationMemberRole {
  Owner = 1,
  Administrator = 2,
  Member = 3,
}

export enum MessageType {
  Text = 1,
  Image = 2,
  File = 3,
  Video = 4,
  Audio = 5,
  System = 6,
}

// =========================
// RESPONSE WRAPPER
// =========================

export interface ApiResult<T> {
  isSuccess: boolean;
  isFailure: boolean;
  value: T;
  error?: {
    code: string;
    description: string;
    type?: number;
  };
}

async function unwrap<T>(
  request: Promise<{ data: ApiResult<T> }>
): Promise<T> {
  const response = await request;
  const result = response.data;

  if (!result.isSuccess) {
    throw new Error(
      result.error?.description || "Request failed"
    );
  }

  return result.value;
}

// =========================
// ENTITIES / DTOs
// =========================

export interface ConversationListItem {
  id: string;
  name: string;
  conversationType: ConversationType;
  projectId?: string;
  departmentId?: string;
  avatarUrl?: string;
  lastActivityAt: string;
  isPinned: boolean;
  isMuted: boolean;
  memberCount: number;
  unreadCount: number;
  lastMessage?: LastMessage;
}

export interface LastMessage {
  id: string;
  senderId: string;
  content?: string;
  sentAt: string;
  isDeleted: boolean;
}

export interface ConversationDetail {
  id: string;
  name: string;
  conversationType: ConversationType;
  projectId?: string;
  departmentId?: string;
  description?: string;
  avatarUrl?: string;
  lastActivityAt: string;
  members: ConversationMember[];
}

export interface ConversationMember {
  userId: string;
  role: ConversationMemberRole;
  isActive: boolean;
  joinedAt: string;
  isMuted: boolean;
  isPinned: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content?: string;
  messageType: MessageType;
  clientMessageId?: string;
  replyToMessageId?: string;
  sentAt: string;
  editedAt?: string;
  isDeleted: boolean;
  replyTo?: ReplyPreview;
}

export interface ReplyPreview {
  id: string;
  senderId: string;
  content?: string;
  isDeleted: boolean;
}

export interface EmployeeSearchItem {
  userId: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  departmentId?: string;
  departmentName?: string;
}

export interface CreateGroupDto {
  name: string;
  type: ConversationType;
  projectId?: string;
  departmentId?: string;
  memberUserIds: string[];
}

export interface UpdateConversationDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export interface SendMessageDto {
  content: string;
  clientMessageId?: string;
  replyToMessageId?: string;
}

// =========================
// CHAT SERVICE
// =========================

export class ChatService {
  constructor(
    private readonly http: AxiosInstance,
    private readonly apiBaseUrl: string
  ) {}

  async getConversations(search?: string) {
    return unwrap<ConversationListItem[]>(
      this.http.get("/api/v1/conversations", {
        params: { search },
      })
    );
  }

  async getConversation(conversationId: string) {
    return unwrap<ConversationDetail>(
      this.http.get(
        `/api/v1/conversations/${conversationId}`
      )
    );
  }

  async getMessages(
    conversationId: string,
    before?: string,
    limit = 30
  ) {
    return unwrap<Message[]>(
      this.http.get(
        `/api/v1/conversations/${conversationId}/messages`,
        {
          params: {
            before,
            limit,
          },
        }
      )
    );
  }

  async searchEmployees(
    search?: string,
    departmentId?: string
  ) {
    return unwrap<EmployeeSearchItem[]>(
      this.http.get("/api/v1/employees", {
        params: {
          search,
          departmentId,
        },
      })
    );
  }

  async createDirect(targetUserId: string) {
    return unwrap<ConversationDetail>(
      this.http.post("/api/v1/conversations/direct", {
        targetUserId,
      })
    );
  }

  async createGroup(dto: CreateGroupDto) {
    return unwrap<ConversationDetail>(
      this.http.post("/api/v1/conversations/group", dto)
    );
  }

  async sendMessage(
    conversationId: string,
    dto: SendMessageDto
  ) {
    return unwrap<Message>(
      this.http.post(
        `/api/v1/conversations/${conversationId}/messages`,
        dto
      )
    );
  }

  async editMessage(messageId: string, content: string) {
    return unwrap<Message>(
      this.http.put(
        `/api/v1/conversations/messages/${messageId}`,
        { content }
      )
    );
  }

  async deleteMessage(messageId: string) {
    await this.http.delete(
      `/api/v1/conversations/messages/${messageId}`
    );
  }

  async markAsRead(
    conversationId: string,
    lastMessageId: string
  ) {
    await this.http.post(
      `/api/v1/conversations/${conversationId}/read`,
      { lastMessageId }
    );
  }

  async addMembers(
    conversationId: string,
    userIds: string[]
  ) {
    return unwrap<ConversationDetail>(
      this.http.post(
        `/api/v1/conversations/${conversationId}/members`,
        { userIds }
      )
    );
  }

  async removeMember(
    conversationId: string,
    userId: string
  ) {
    await this.http.delete(
      `/api/v1/conversations/${conversationId}/members/${userId}`
    );
  }

  async changeMemberRole(
    conversationId: string,
    userId: string,
    role: ConversationMemberRole
  ) {
    await this.http.put(
      `/api/v1/conversations/${conversationId}/members/${userId}/role`,
      { role }
    );
  }

  async transferOwnership(
    conversationId: string,
    newOwnerUserId: string
  ) {
    await this.http.post(
      `/api/v1/conversations/${conversationId}/transfer-ownership`,
      { newOwnerUserId }
    );
  }

  async updateConversation(
    conversationId: string,
    dto: UpdateConversationDto
  ) {
    return unwrap<ConversationDetail>(
      this.http.put(
        `/api/v1/conversations/${conversationId}`,
        dto
      )
    );
  }

  async archive(conversationId: string) {
    await this.http.post(
      `/api/v1/conversations/${conversationId}/archive`
    );
  }

  async unarchive(conversationId: string) {
    await this.http.post(
      `/api/v1/conversations/${conversationId}/unarchive`
    );
  }

  async updatePreferences(
    conversationId: string,
    muted?: boolean,
    pinned?: boolean
  ) {
    await this.http.put(
      `/api/v1/conversations/${conversationId}/preferences`,
      {
        muted,
        pinned,
      }
    );
  }

  createSignalRConnection(accessToken: string) {
    return new HubConnectionBuilder()
      .withUrl(`${this.apiBaseUrl}/hubs/chat`, {
        accessTokenFactory: () => accessToken,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();
  }
}

// =========================
// PAGE PROPS
// =========================

interface ChatPageProps {
  api: AxiosInstance;
  accessToken: string;
  apiBaseUrl: string;
  currentUserId: string;
}

// =========================
// CHAT PAGE
// =========================

export default function ChatPage({
  api,
  accessToken,
  apiBaseUrl,
  currentUserId,
}: ChatPageProps) {
  const serviceRef = useRef(
    new ChatService(api, apiBaseUrl)
  );

  const connectionRef = useRef<HubConnection | null>(null);

  const [conversations, setConversations] = useState<
    ConversationListItem[]
  >([]);

  const [activeConversation, setActiveConversation] =
    useState<ConversationDetail | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUserId, setTypingUserId] =
    useState<string | null>(null);

  const service = serviceRef.current;

  async function loadConversations() {
    try {
      setLoading(true);
      setError(null);

      const data = await service.getConversations(search);
      setConversations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách hội thoại"
      );
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(
    conversationId: string
  ) {
    try {
      setLoading(true);
      setError(null);

      const [detail, history] = await Promise.all([
        service.getConversation(conversationId),
        service.getMessages(conversationId),
      ]);

      const connection = connectionRef.current;

      if (
        connection &&
        connection.state === HubConnectionState.Connected
      ) {
        await connection.invoke(
          "JoinConversation",
          conversationId
        );
      }

      setActiveConversation(detail);
      setMessages(history);

      const lastMessage = history.at(-1);

      if (lastMessage) {
        await service.markAsRead(
          conversationId,
          lastMessage.id
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể mở hội thoại"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !activeConversation ||
      !messageText.trim()
    ) {
      return;
    }

    const content = messageText.trim();
    const clientMessageId = crypto.randomUUID();

    setMessageText("");

    try {
      const connection = connectionRef.current;

      if (
        connection &&
        connection.state === HubConnectionState.Connected
      ) {
        await connection.invoke(
          "SendMessage",
          activeConversation.id,
          content,
          clientMessageId,
          null
        );
      } else {
        const message = await service.sendMessage(
          activeConversation.id,
          {
            content,
            clientMessageId,
          }
        );

        setMessages((current) => [
          ...current,
          message,
        ]);
      }
    } catch (err) {
      setMessageText(content);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể gửi tin nhắn"
      );
    }
  }

  async function handleTyping() {
    const connection = connectionRef.current;

    if (
      !connection ||
      !activeConversation ||
      connection.state !== HubConnectionState.Connected
    ) {
      return;
    }

    await connection.invoke(
      "Typing",
      activeConversation.id
    );
  }

  async function handleStopTyping() {
    const connection = connectionRef.current;

    if (
      !connection ||
      !activeConversation ||
      connection.state !== HubConnectionState.Connected
    ) {
      return;
    }

    await connection.invoke(
      "StopTyping",
      activeConversation.id
    );
  }

  useEffect(() => {
    loadConversations();

    const connection =
      service.createSignalRConnection(accessToken);

    connectionRef.current = connection;

    connection.on("MessageReceived", (message: Message) => {
      if (
        message &&
        message.senderId !== currentUserId
      ) {
        setMessages((current) => {
          if (current.some((item) => item.id === message.id)) {
            return current;
          }

          return [...current, message];
        });
      }
    });

    connection.on("MessageEdited", (message: Message) => {
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? message
            : item
        )
      );
    });

    connection.on("MessageDeleted", (message: Message) => {
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? message
            : item
        )
      );
    });

    connection.on(
      "ConversationUpdated",
      () => {
        loadConversations();
      }
    );

    connection.on(
      "UnreadChanged",
      () => {
        loadConversations();
      }
    );

    connection.on("Typing", (payload: {
      userId: string;
      isTyping: boolean;
    }) => {
      setTypingUserId(
        payload.isTyping ? payload.userId : null
      );
    });

    connection
      .start()
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể kết nối chat realtime"
        );
      });

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [accessToken]);

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Chat</h2>

          <input
            value={search}
            placeholder="Tìm hội thoại..."
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadConversations();
              }
            }}
          />
        </div>

        {loading && <p>Đang tải...</p>}
        {error && <p className="chat-error">{error}</p>}

        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={
                activeConversation?.id === conversation.id
                  ? "conversation-item active"
                  : "conversation-item"
              }
              onClick={() =>
                openConversation(conversation.id)
              }
            >
              <div>
                <strong>
                  {conversation.name || "Direct chat"}
                </strong>

                {conversation.lastMessage && (
                  <p>
                    {conversation.lastMessage.isDeleted
                      ? "Tin nhắn đã bị thu hồi"
                      : conversation.lastMessage.content}
                  </p>
                )}
              </div>

              {conversation.unreadCount > 0 && (
                <span className="unread-badge">
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        {!activeConversation ? (
          <div className="chat-empty">
            Chọn một cuộc hội thoại
          </div>
        ) : (
          <>
            <header className="chat-header">
              <h2>
                {activeConversation.name ||
                  "Direct conversation"}
              </h2>

              <span>
                {activeConversation.members.length} thành viên
              </span>
            </header>

            <section className="message-list">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.senderId === currentUserId
                      ? "message own"
                      : "message"
                  }
                >
                  <div className="message-content">
                    {message.isDeleted
                      ? "Tin nhắn đã bị thu hồi"
                      : message.content}
                  </div>

                  <time>
                    {new Date(
                      message.sentAt
                    ).toLocaleString()}
                  </time>

                  {message.editedAt && (
                    <small>Đã chỉnh sửa</small>
                  )}
                </article>
              ))}

              {typingUserId && (
                <div className="typing-indicator">
                  Đang nhập...
                </div>
              )}
            </section>

            <form
              className="message-composer"
              onSubmit={handleSendMessage}
            >
              <input
                value={messageText}
                placeholder="Nhập tin nhắn..."
                onChange={(event) => {
                  setMessageText(event.target.value);
                  handleTyping();
                }}
                onBlur={handleStopTyping}
              />

              <button type="submit">
                Gửi
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}