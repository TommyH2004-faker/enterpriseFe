import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight } from '@coreui/icons'
import { EmployeeSearchItem } from 'src/services/chatService'
import { initialOf } from '../utils/utils'


interface Props {
  query: string
  people: EmployeeSearchItem[]
  onQueryChange: (value: string) => void
  onPick: (person: EmployeeSearchItem) => void
}

const NewChatBox: React.FC<Props> = ({ query, people, onQueryChange, onPick }) => (
  <div className="new-chat-box">
    <input
      autoFocus
      value={query}
      placeholder="Tìm nhân viên để nhắn..."
      onChange={(e) => onQueryChange(e.target.value)}
    />
    {people.map((p) => (
      <button className="person-result" key={p.userId} onClick={() => onPick(p)}>
        <span className="chat-avatar small">{initialOf(p.fullName)}</span>
        <span>
          <strong>{p.fullName}</strong>
          <small>{p.departmentName || p.username}</small>
        </span>
        <CIcon icon={cilArrowRight} />
      </button>
    ))}
  </div>
)

export default NewChatBox