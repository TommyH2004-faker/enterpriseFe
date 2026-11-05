import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import {
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormCheck,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CSpinner,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import {
  cilLockLocked,
  cilUser,
  cilViewColumn,
} from '@coreui/icons'

import { authApi, getErrorMessage, getHttpErrorMessage } from 'src/api/authApi'
import { authStorage } from 'src/services/authStorage'
import toast from 'react-hot-toast'
import ToastAlert from 'src/components/ToastAlert'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activationStatus = searchParams.get('activated')

  // ============================================================
  // FORM STATE
  // ============================================================

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  // ============================================================
  // UI STATE
  // ============================================================

  const [loading, setLoading] = useState(false)

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateUsername = (value: string): string => {
    if (!value.trim()) {
      return 'Tên đăng nhập không được để trống'
    }

    return ''
  }

  const validatePassword = (value: string): string => {
    if (!value) {
      return 'Mật khẩu không được để trống'
    }

    return ''
  }

  // ============================================================
  // SUBMIT LOGIN
  // ============================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const usernameValidation =
      validateUsername(username)

    const passwordValidation =
      validatePassword(password)

    setUsernameError(usernameValidation)
    setPasswordError(passwordValidation)

    // Stop submit nếu validation fail
    if (
      usernameValidation ||
      passwordValidation
    ) {
      return
    }

    try {
      setLoading(true)

      const result = await authApi.login({
        username: username.trim(),
        password,
      })

      // ========================================================
      // LOGIN FAILED
      // ========================================================

      if (!result.isSuccess || !result.data) {
        toast.error(getErrorMessage(result.errors, result.message || 'Đăng nhập thất bại.'))

        return
      }

      // ========================================================
      // LOGIN SUCCESS
      // ========================================================

      authStorage.saveAuth(
        result.data.accessToken,
        result.data.accessTokenExpiresAt,
        result.data.antiCsrfToken,
        result.data.roles,
        result.data.permissions,
        result.data.mustChangePassword,
        remember,
      )

      navigate(result.data.mustChangePassword ? '/change-password' : '/dashboard', {
        replace: true,
      })
    } catch (err: any) {
      console.error('Login error:', err)

      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'

      toast.error(getHttpErrorMessage(err, message))
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="min-vh-100 d-flex"
      style={{
        background:
          'linear-gradient(135deg, #f8f9fa 0%, #e8eaed 100%)',
      }}
    >
      {/* ======================================================
          LEFT BRAND
          ====================================================== */}

      <div
        className="d-none d-lg-flex flex-column align-items-center justify-content-center bg-primary text-white"
        style={{
          width: '45%',
          padding: '48px',
        }}
      >
        <div className="text-center">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-20 rounded-3 mb-4"
            style={{
              width: '80px',
              height: '80px',
            }}
          >
            <CIcon
              icon={cilViewColumn}
              style={{
                width: '40px',
                height: '40px',
                color: '#e21313',
              }}
            />
          </div>

          <h1 className="text-white fw-bold mb-2">
            TaskFlow
          </h1>

          <p
            className="mb-5"
            style={{
              opacity: 0.85,
            }}
          >
            Nền tảng Quản lý Dự án & Công việc
          </p>

          {/* Dashboard */}
          <div
            className="d-flex align-items-start p-3 rounded-3 mb-3 text-start"
            style={{
              background:
                'rgba(255,255,255,0.12)',
            }}
          >
            <span className="me-3 fs-4">
              📊
            </span>

            <div>
              <div className="fw-semibold">
                Dashboard trực quan
              </div>

              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.75,
                }}
              >
                Theo dõi tiến độ dự án real-time
              </div>
            </div>
          </div>

          {/* Kanban */}
          <div
            className="d-flex align-items-start p-3 rounded-3 mb-3 text-start"
            style={{
              background:
                'rgba(255,255,255,0.12)',
            }}
          >
            <span className="me-3 fs-4">
              <CIcon icon={cilViewColumn} />
            </span>

            <div>
              <div className="fw-semibold">
                Kanban Board
              </div>

              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.75,
                }}
              >
                Quản lý công việc theo luồng
              </div>
            </div>
          </div>

          {/* Team */}
          <div
            className="d-flex align-items-start p-3 rounded-3 text-start"
            style={{
              background:
                'rgba(240, 236, 236, 0.12)',
            }}
          >
            <span className="me-3 fs-4">
              👥
            </span>

            <div>
              <div className="fw-semibold">
                Cộng tác nhóm
              </div>

              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.75,
                }}
              >
                Phân công và theo dõi nhân viên
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          RIGHT LOGIN
          ====================================================== */}

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <CCard
          className="shadow-sm border-0"
          style={{
            width: '100%',
            maxWidth: '480px',
          }}
        >
          <CCardBody className="p-4 p-md-5">
            {/* Header */}
            <div className="mb-5">
              <h2 className="fw-bold text-dark mb-1">
                Đăng nhập
              </h2>

              <p className="text-muted mb-0">
                Nhập tên đăng nhập và mật khẩu để tiếp tục
              </p>
            </div>

            {activationStatus === 'success' && (
              <ToastAlert
                message="Kích hoạt tài khoản thành công. Vui lòng đăng nhập để tiếp tục."
                type="success"
              />
            )}
            {activationStatus === 'error' && (
              <ToastAlert message="Kích hoạt thất bại. Vui lòng kiểm tra lại liên kết hoặc thử lại sau." />
            )}


            <CForm
              onSubmit={handleSubmit}
              noValidate
            >
              {/* ==================================================
                  USERNAME
                  ================================================== */}

              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="form-label fw-semibold"
                >
                  Tên đăng nhập{' '}
                  <span className="text-danger">
                    *
                  </span>
                </label>

                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>

                  <CFormInput
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(event) => {
                      setUsername(
                        event.target.value,
                      )

                      setUsernameError('')
                    }}
                    onBlur={() =>
                      setUsernameError(
                        validateUsername(username),
                      )
                    }
                    invalid={!!usernameError}
                    autoComplete="username"
                    disabled={loading}
                  />
                </CInputGroup>

                {usernameError && (
                  <div className="text-danger small mt-1">
                    {usernameError}
                  </div>
                )}
              </div>

              {/* ==================================================
                  PASSWORD
                  ================================================== */}

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label
                    htmlFor="password"
                    className="form-label fw-semibold mb-0"
                  >
                    Mật khẩu{' '}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-decoration-none text-primary"
                    style={{
                      fontSize: '13px',
                    }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <CInputGroup>
                  <CInputGroupText>
                    <CIcon
                      icon={cilLockLocked}
                    />
                  </CInputGroupText>

                  <CFormInput
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value,
                      )

                      setPasswordError('')
                    }}
                    onBlur={() =>
                      setPasswordError(
                        validatePassword(password),
                      )
                    }
                    invalid={!!passwordError}
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  {/* SHOW / HIDE PASSWORD */}
                  <CButton
                    type="button"
                    color="dark"
                    variant="outline"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    disabled={loading}
                    title={
                      showPassword
                        ? 'Ẩn mật khẩu'
                        : 'Hiển thị mật khẩu'
                    }
                    aria-label={
                      showPassword
                        ? 'Ẩn mật khẩu'
                        : 'Hiển thị mật khẩu'
                    }
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEye : faEyeSlash}
                      style={{ width: '18px', height: '18px' }}
                    />
                  </CButton>
                </CInputGroup>

                {passwordError && (
                  <div className="text-danger small mt-1">
                    {passwordError}
                  </div>
                )}
              </div>

              {/* ==================================================
                  REMEMBER ME
                  ================================================== */}

              <div className="mb-5">
                <CFormCheck
                  id="remember"
                  label="Ghi nhớ tôi"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(
                      event.target.checked,
                    )
                  }
                  disabled={loading}
                />
              </div>

              {/* ==================================================
                  SUBMIT
                  ================================================== */}

              <CButton
                type="submit"
                color="primary"
                className="w-100 fw-semibold"
                style={{
                  padding: '12px',
                  fontSize: '15px',
                  borderRadius: '6px',
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CSpinner
                      size="sm"
                      className="me-2"
                    />

                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </CButton>
            </CForm>

            {/* Register */}
            <div className="text-center mt-4 text-muted">
              Chưa có tài khoản?{' '}

              <Link
                to="/register"
                className="text-primary fw-semibold text-decoration-none"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}

export default Login