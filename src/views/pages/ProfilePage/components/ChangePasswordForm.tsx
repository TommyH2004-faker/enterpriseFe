import { useId, useState, type FormEvent } from 'react'
import {
  CButton,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CSpinner,
} from '@coreui/react'
import { cilCheckCircle, cilLowVision } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import profileService from 'src/services/profileService'

interface ChangePasswordFormProps {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const MIN_LENGTH = 8

/* Ô mật khẩu có nút hiện / ẩn */
interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  invalid?: boolean
  feedback?: string
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  invalid,
  feedback,
}: PasswordFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <CFormLabel htmlFor={id}>{label}</CFormLabel>

      <CInputGroup className={invalid ? 'has-validation' : undefined}>
        <CFormInput
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          invalid={invalid}
        />
        <CButton
          type="button"
          color="secondary"
          variant="outline"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={visible}
          title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          <CIcon icon={visible ? cilLowVision : cilCheckCircle} />
        </CButton>
        {invalid && feedback && <CFormFeedback invalid>{feedback}</CFormFeedback>}
      </CInputGroup>
    </div>
  )
}

export default function ChangePasswordForm({ onSuccess, onError }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const lengthOk = newPassword.length >= MIN_LENGTH
  const differentOk = newPassword.length > 0 && newPassword !== currentPassword
  const matchOk = confirmPassword.length > 0 && newPassword === confirmPassword

  const confirmMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const canSubmit = !!currentPassword && lengthOk && differentOk && matchOk && !saving

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onError('')

    if (!canSubmit) return

    setSaving(true)

    try {
      await profileService.changePassword({ currentPassword, newPassword })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      onSuccess('Đổi mật khẩu thành công.')
    } catch (error) {
      onError(profileService.getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="profile-section-title">
        <h6>Đổi mật khẩu</h6>
        <p className="text-body-secondary mb-0">
          Nhập mật khẩu hiện tại để xác minh trước khi đặt mật khẩu mới.
        </p>
      </div>

      <form className="password-form" onSubmit={handleSubmit} noValidate>
        <PasswordField
          label="Mật khẩu hiện tại"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        <PasswordField
          label="Mật khẩu mới"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
        />

        <PasswordField
          label="Xác nhận mật khẩu mới"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          invalid={confirmMismatch}
          feedback="Mật khẩu xác nhận chưa khớp."
        />

        <ul className="password-rules" aria-label="Yêu cầu mật khẩu">
          <li className={lengthOk ? 'is-ok' : undefined}>
            <CIcon icon={cilCheckCircle} size="sm" />
            Có ít nhất {MIN_LENGTH} ký tự
          </li>
          <li className={differentOk ? 'is-ok' : undefined}>
            <CIcon icon={cilCheckCircle} size="sm" />
            Khác mật khẩu hiện tại
          </li>
          <li className={matchOk ? 'is-ok' : undefined}>
            <CIcon icon={cilCheckCircle} size="sm" />
            Khớp với ô xác nhận
          </li>
        </ul>

        <div className="password-actions">
          <CButton color="primary" type="submit" className="profile-save-btn" disabled={!canSubmit}>
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Đang cập nhật
              </>
            ) : (
              'Cập nhật mật khẩu'
            )}
          </CButton>
        </div>
      </form>
    </section>
  )
}