import React, { useState } from 'react'
import { CAlert, CButton, CCard, CCardBody, CForm, CFormInput, CInputGroup, CInputGroupText, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { cilLockLocked } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi, getErrorMessage, getHttpErrorMessage } from '../../../api/authApi'
import { authStorage } from '../../../services/authStorage'

const ChangePassword: React.FC = () => {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      setLoading(true)
      const result = await authApi.changePassword({ currentPassword, newPassword })

      if (!result.isSuccess) {
        setError(getErrorMessage(result.errors, result.message || 'Đổi mật khẩu thất bại.'))
        return
      }

      authStorage.completePasswordChange()
      toast.success('Đổi mật khẩu thành công.')
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(getHttpErrorMessage(requestError, 'Không thể đổi mật khẩu. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <CCard className="shadow-sm border-0" style={{ width: '100%', maxWidth: '480px' }}>
        <CCardBody className="p-4 p-md-5">
          <h2 className="fw-bold text-dark mb-2">Đổi mật khẩu</h2>
          <p className="text-muted mb-4">
            Đây là lần đăng nhập đầu tiên. Vui lòng tạo mật khẩu mới để tiếp tục.
          </p>

          {error && <CAlert color="danger" role="alert">{error}</CAlert>}

          <CForm onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="current-password" className="form-label fw-semibold">Mật khẩu hiện tại</label>
              <CInputGroup>
                <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                <CFormInput
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <CButton
                  type="button"
                  color="dark"
                  variant="outline"
                  onClick={() => setShowCurrentPassword((previous) => !previous)}
                  title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  <FontAwesomeIcon
                    icon={showCurrentPassword ? faEye : faEyeSlash}
                    style={{ width: '18px', height: '18px' }}
                  />
                </CButton>
              </CInputGroup>
            </div>

            <div className="mb-3">
              <label htmlFor="new-password" className="form-label fw-semibold">Mật khẩu mới</label>
              <CInputGroup>
                <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                <CFormInput
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <CButton
                  type="button"
                  color="dark"
                  variant="outline"
                  onClick={() => setShowNewPassword((previous) => !previous)}
                  title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  <FontAwesomeIcon
                    icon={showNewPassword ? faEye : faEyeSlash}
                    style={{ width: '18px', height: '18px' }}
                  />
                </CButton>
              </CInputGroup>
            </div>

            <div className="mb-4">
              <label htmlFor="confirm-password" className="form-label fw-semibold">Xác nhận mật khẩu mới</label>
              <CInputGroup>
                <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                <CFormInput
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <CButton
                  type="button"
                  color="dark"
                  variant="outline"
                  onClick={() => setShowConfirmPassword((previous) => !previous)}
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEye : faEyeSlash}
                    style={{ width: '18px', height: '18px' }}
                  />
                </CButton>
              </CInputGroup>
            </div>

            <CButton type="submit" color="primary" className="w-100" disabled={loading}>
              {loading ? <CSpinner size="sm" /> : 'Đổi mật khẩu và tiếp tục'}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ChangePassword