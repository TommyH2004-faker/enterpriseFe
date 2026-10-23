
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
} from '@coreui/react'

import profileService from 'src/services/profileService'
import type { MyProfile, UpdateMyProfileRequest } from 'src/types/profile'

import './ProfilePage.css'
import ProfileForm, {
  toProfileFormValues,
} from './components/ProfileForm'
import type { ProfileFormValues } from './components/ProfileForm'
import ProfileHeader from './components/ProfileHeader'
import EmployeeInfoCard from './components/EmployeeInfoCard'
import ChangePasswordForm from './components/ChangePasswordForm'

type ProfileTab = 'information' | 'security'
type ToastType = 'success' | 'danger' | 'warning' | 'info'

interface ToastMessage {
  id: number
  message: string
  color: ToastType
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024

export default function ProfilePage() {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [formValues, setFormValues] = useState<ProfileFormValues | null>(null)
  const [activeTab, setActiveTab] = useState<ProfileTab>('information')

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)

  // Avatar: chọn ảnh -> preview -> bấm Lưu ảnh mới upload.
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const objectUrlRef = useRef<string | null>(null)
  const toastIdRef = useRef(0)

  // ---------- Toast ----------

  const showToast = useCallback(
    (message: string, color: ToastType = 'success') => {
      const id = ++toastIdRef.current

      setToasts((previous) => [
        ...previous,
        { id, message, color },
      ])
    },
    [],
  )

  const removeToast = useCallback((id: number) => {
    setToasts((previous) =>
      previous.filter((toast) => toast.id !== id),
    )
  }, [])

      const renderToasts = () => (
        <CToaster
          className="profile-toast-container"
          placement="bottom-center"
        >
          {toasts.map((toast) => (
            <CToast
              key={toast.id}
              visible
              autohide
              delay={4000}
              onClose={() => removeToast(toast.id)}
              className={`profile-toast profile-toast-${toast.color}`}
            >
              <CToastBody>
                <div className="profile-toast-content">
                  <span
                    className={`profile-toast-icon ${
                      toast.color === 'success' ? 'success' : 'danger'
                    }`}
                    aria-hidden="true"
                  >
                    {toast.color === 'success' ? '✓' : '!'}
                  </span>

                  <span className="profile-toast-message">
                    {toast.message}
                  </span>
                </div>
              </CToastBody>
            </CToast>
          ))}
        </CToaster>
      )



  // ---------- Avatar preview ----------

  const revokePreviewUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  // ---------- Profile ----------

  const applyProfile = useCallback(
    (data: MyProfile) => {
      setProfile(data)
      setFormValues(toProfileFormValues(data.user))
      setAvatarFile(null)

      revokePreviewUrl()

      setAvatarPreview(
        profileService.resolveFileUrl(data.user.avatarUrl),
      )
    },
    [revokePreviewUrl],
  )

  const loadProfile = useCallback(async () => {
    setLoading(true)

    try {
      const data = await profileService.getMyProfile()

      if (!data?.user) {
        throw new Error('API không trả về thông tin user.')
      }

      applyProfile(data)
    } catch (error) {
      showToast(
        profileService.getErrorMessage(error),
        'danger',
      )
    } finally {
      setLoading(false)
    }
  }, [applyProfile, showToast])

  useEffect(() => {
    void loadProfile()

    return () => {
      revokePreviewUrl()
    }
  }, [loadProfile, revokePreviewUrl])

  // Tải lại hồ sơ sau khi lưu và thông báo cho header cập nhật.
  const refreshProfile = async () => {
    const data = await profileService.getMyProfile()

    if (!data?.user) {
      throw new Error('API không trả về thông tin user.')
    }

    applyProfile(data)
    profileService.notifyProfileChanged(data.user)
  }

  // ---------- Update personal information ----------

  const handleProfileSubmit = async (
    data: UpdateMyProfileRequest,
  ) => {
    if (savingProfile) return

    setSavingProfile(true)

    try {
      await profileService.updateMyProfile(data)
      await refreshProfile()

      showToast('Đã lưu thông tin cá nhân.', 'success')
    } catch (error) {
      console.error('[ProfilePage] Update profile failed:', error)

      showToast(
        profileService.getErrorMessage(error),
        'danger',
      )
    } finally {
      setSavingProfile(false)
    }
  }

  // ---------- Avatar ----------

  const handleAvatarSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp ảnh hợp lệ.', 'warning')
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      showToast(
        'Ảnh đại diện không được vượt quá 5 MB.',
        'warning',
      )
      return
    }

    revokePreviewUrl()

    const url = URL.createObjectURL(file)

    objectUrlRef.current = url
    setAvatarFile(file)
    setAvatarPreview(url)
  }

  const handleAvatarCancel = () => {
    revokePreviewUrl()
    setAvatarFile(null)

    setAvatarPreview(
      profileService.resolveFileUrl(profile?.user.avatarUrl),
    )
  }

  const handleAvatarSave = async () => {
    if (!avatarFile || savingAvatar) return

    setSavingAvatar(true)

    try {
      await profileService.uploadAvatar(avatarFile)
      await refreshProfile()

      showToast('Đã cập nhật ảnh đại diện.', 'success')
    } catch (error) {
      console.error('[ProfilePage] Upload avatar failed:', error)

      showToast(
        profileService.getErrorMessage(error),
        'danger',
      )
    } finally {
      setSavingAvatar(false)
    }
  }

  // ---------- Loading ----------

  if (loading) {
    return (
      <>
        <div className="profile-loading">
          <CSpinner color="primary" />
          <span>Đang tải hồ sơ...</span>
        </div>

        {renderToasts()}
      </>
    )
  }

  // ---------- Failed to load profile ----------

  if (!profile || !formValues) {
    return (
      <>
        <CContainer fluid className="profile-page">
          <p>Không thể tải hồ sơ. Vui lòng thử lại.</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void loadProfile()}
          >
            Thử tải lại
          </button>
        </CContainer>

        {renderToasts()}
      </>
    )
  }

  // ---------- Tabs ----------

  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab)
  }

  // ---------- Main render ----------

  return (
    <>
      {renderToasts()}

      <CContainer fluid className="profile-page">
        <div className="profile-page-heading">
          <h3>Hồ sơ của tôi</h3>
          <p className="text-body-secondary mb-0">
            Quản lý thông tin cá nhân và bảo mật tài khoản.
          </p>
        </div>

        <CRow className="g-4 align-items-start">
          <CCol xs={12} lg={4} xl={3}>
            <ProfileHeader
              profile={profile}
              avatarPreview={avatarPreview}
              hasPendingAvatar={!!avatarFile}
              savingAvatar={savingAvatar}
              onAvatarSelected={handleAvatarSelected}
              onAvatarSave={handleAvatarSave}
              onAvatarCancel={handleAvatarCancel}
            />
          </CCol>

          <CCol xs={12} lg={8} xl={9}>
            <CCard className="profile-main-card">
              <div className="profile-tabs">
                <CNav variant="underline">
                  <CNavItem>
                    <CNavLink
                      href="#profile-information"
                      active={activeTab === 'information'}
                      onClick={(event) => {
                        event.preventDefault()
                        switchTab('information')
                      }}
                    >
                      Thông tin cá nhân
                    </CNavLink>
                  </CNavItem>

                  <CNavItem>
                    <CNavLink
                      href="#profile-security"
                      active={activeTab === 'security'}
                      onClick={(event) => {
                        event.preventDefault()
                        switchTab('security')
                      }}
                    >
                      Bảo mật
                    </CNavLink>
                  </CNavItem>
                </CNav>
              </div>

              <CCardBody className="profile-tab-content">
                {activeTab === 'information' ? (
                  <>
                    <ProfileForm
                      values={formValues}
                      initialValues={toProfileFormValues(profile.user)}
                      saving={savingProfile}
                      onChange={setFormValues}
                      onSubmit={handleProfileSubmit}
                    />

                    <EmployeeInfoCard employee={profile.employee} />
                  </>
                ) : (
                  <ChangePasswordForm
                    onSuccess={(message) => {
                      showToast(message, 'success')
                    }}
                    onError={(message) => {
                      showToast(message, 'danger')
                    }}
                  />
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}
