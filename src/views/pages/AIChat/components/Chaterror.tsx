import { CAlert } from '@coreui/react'

interface Props {
  message: string
  onDismiss: () => void
}

export default function ChatError({ message, onDismiss }: Props) {
  return (
    <CAlert color="danger" dismissible onClose={onDismiss} className="aicw-error mb-0">
      {message}
    </CAlert>
  )
}