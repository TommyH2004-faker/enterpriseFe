import { CButton, CFormInput } from '@coreui/react'

interface SessionFiltersProps {
  username: string
  canReset: boolean
  onUsernameChange: (value: string) => void
  onSearch: () => void
  onReset: () => void
}

const SessionFilters = ({
  username,
  canReset,
  onUsernameChange,
  onSearch,
  onReset,
}: SessionFiltersProps) => {
  return (
    <div
      className="d-flex align-items-center gap-2 flex-grow-1"
      style={{ maxWidth: 420 }}
    >
      <CFormInput
        type="search"
        value={username}
        placeholder="Tìm theo username"
        aria-label="Tìm theo username"
        autoComplete="off"
        onChange={(event) => onUsernameChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSearch()
        }}
      />

      {canReset && (
        <CButton
          color="link"
          className="text-body-secondary text-nowrap px-2"
          onClick={onReset}
        >
          Xóa lọc
        </CButton>
      )}
    </div>
  )
}

export default SessionFilters