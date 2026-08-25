import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  CAlert,
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

import {
  cilLockLocked,
  cilUser,
  cilLowVision,
  cilWarning,
  cilViewColumn,
} from '@coreui/icons'

import { authApi } from 'src/api/authApi'
import { authStorage } from 'src/services/authStorage'

const Login: React.FC = () => {
  const navigate = useNavigate()

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
  const [error, setError] = useState('')

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
    setError('')

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
        setError(
          result.errors?.[0] ||
            result.message ||
            'Đăng nhập thất bại.',
        )

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
        remember,
      )

      // Chuyển sang Dashboard sau khi login thành công
      navigate('/dashboard', {
        replace: true,
      })
    } catch (err: any) {
      console.error('Login error:', err)

      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'

      setError(message)
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
                color: 'white',
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
              🗂️
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
                'rgba(255,255,255,0.12)',
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

            {/* Error */}
            {error && (
              <CAlert
                color="danger"
                className="mb-4 d-flex align-items-center"
              >
                <CIcon
                  icon={cilWarning}
                  className="me-2"
                />

                <span>{error}</span>
              </CAlert>
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
                      setError('')
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
                      setError('')
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
                    color="light"
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
                    <CIcon icon={cilLowVision} />
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