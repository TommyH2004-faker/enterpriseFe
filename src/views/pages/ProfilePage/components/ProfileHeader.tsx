import { useRef } from 'react'
import { CButton, CCard, CCardBody, CSpinner } from '@coreui/react'
import type { MyProfile } from 'src/types/profile'

interface Props {
  profile: MyProfile
  avatarPreview: string | null
  hasPendingAvatar: boolean
  savingAvatar: boolean
  onAvatarSelected: (file: File) => void
  onAvatarSave: () => void
  onAvatarCancel: () => void
}

export default function ProfileHeader({
  profile,
  avatarPreview,
  hasPendingAvatar,
  savingAvatar,
  onAvatarSelected,
  onAvatarSave,
  onAvatarCancel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { user } = profile
  const displayName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    user.email ||
    'Người dùng'
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <CCard className="profile-avatar-card">
      <CCardBody>
        <button
          type="button"
          className="profile-avatar"
          onClick={() => inputRef.current?.click()}
          disabled={savingAvatar}
          aria-label="Chọn ảnh đại diện"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Ảnh đại diện" />
          ) : (
            <span className="profile-avatar-initial">{initial}</span>
          )}
          <span className="profile-avatar-overlay">Đổi ảnh</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onAvatarSelected(file)
            e.target.value = '' // cho phép chọn lại cùng 1 file
          }}
        />

        <h5 className="profile-name">{displayName}</h5>
        {user.email && <div className="text-body-secondary small">{user.email}</div>}

        {hasPendingAvatar ? (
          <div className="profile-avatar-actions">
            <CButton color="primary" size="sm" onClick={onAvatarSave} disabled={savingAvatar}>
              {savingAvatar && <CSpinner size="sm" className="me-2" />}
              Lưu ảnh
            </CButton>
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              onClick={onAvatarCancel}
              disabled={savingAvatar}
            >
              Hủy
            </CButton>
          </div>
        ) : (
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => inputRef.current?.click()}
          >
            Chọn ảnh mới
          </CButton>
        )}

        <div className="text-body-secondary small mt-2">JPG, PNG hoặc WebP, tối đa 5 MB</div>
      </CCardBody>
    </CCard>
  )
}