import React from 'react'
import { ConversationDetail } from 'src/services/chatService'
import { initialOf } from '../utils/utils'


const ChatHeader: React.FC<{ conversation: ConversationDetail }> = ({ conversation }) => (
  <header className="thread-header">
    <span className="chat-avatar online">{initialOf(conversation.name || 'D')}</span>
    <div>
      <h2>{conversation.name || 'Cuộc trò chuyện riêng'}</h2>
      <small>
        {conversation.memberCount || conversation.members.length} thành viên · đang hoạt động
      </small>
    </div>
  </header>
)

export default ChatHeader