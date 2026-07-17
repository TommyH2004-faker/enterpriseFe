import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormCheck,
  CRow,
  CSpinner,
  CAlert,
  CCard,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilEnvelopeClosed, cilViewColumn } from '@coreui/icons'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const navigate = useNavigate()

  const validateEmail = (val: string) => {
    if (!val) return 'Email không được để trống'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email không hợp lệ'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) { setEmailError(emailErr); return }
    if (!password) { setError('Vui lòng nhập mật khẩu'); return }

    setLoading(true)
    setError('')
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e8eaed 100%)' }}>
      {/* Left Brand Section */}
      <div className="d-none d-lg-flex flex-column align-items-center justify-content-center bg-primary text-white" style={{ width: '45%', padding: '48px' }}>
        <div className="text-center">
          <div className="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-20 rounded-3 mb-4" style={{ width: '80px', height: '80px' }}>
            <CIcon icon={cilViewColumn} style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h1 className="text-white fw-bold mb-2" style={{ fontSize: '28px' }}>TaskFlow</h1>
          <p className="mb-5" style={{ opacity: 0.85, fontSize: '16px' }}>Nền tảng Quản lý Dự án & Công việc Doanh nghiệp</p>
          
          <div className="d-flex flex-column gap-3 text-start">
            {[
              { icon: '📊', title: 'Dashboard trực quan', desc: 'Theo dõi tiến độ dự án real-time' },
              { icon: '🗂️', title: 'Kanban Board', desc: 'Quản lý công việc theo luồng' },
              { icon: '👥', title: 'Cộng tác nhóm', desc: 'Phân công và theo dõi nhân viên' },
            ].map((item, idx) => (
              <div key={idx} className="d-flex align-items-start p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <span className="me-3" style={{ fontSize: '24px' }}>{item.icon}</span>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '14px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', opacity: 0.75 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <CCard className="shadow-sm border-0" style={{ width: '100%', maxWidth: '480px' }}>
          <CCardBody className="p-4 p-md-5">
            <div className="mb-5">
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '28px' }}>Đăng nhập</h2>
              <p className="text-muted mb-0">Nhập email và mật khẩu của bạn để tiếp tục</p>
            </div>

            {error && (
              <CAlert color="danger" className="mb-4 d-flex align-items-center" style={{ borderRadius: '6px' }}>
                <span className="me-2">⚠️</span> {error}
              </CAlert>
            )}

            <CForm onSubmit={handleSubmit}>
              {/* Email */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-dark" style={{ fontSize: '14px' }}>
                Email <span className="text-danger">*</span>
              </label>
              <div className="position-relative">
                <div className="position-absolute d-flex align-items-center" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: '#A8AEB7' }}>
                  <CIcon icon={cilEnvelopeClosed} />
                </div>
                <CFormInput
                  type="email"
                  placeholder="email@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  onBlur={() => setEmailError(validateEmail(email))}
                  invalid={!!emailError}
                  style={{ paddingLeft: '40px' }}
                  autoComplete="email"
                />
              </div>
              {emailError && <div className="text-danger small mt-1">{emailError}</div>}
            </div>

              {/* Password */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                  Mật khẩu <span className="text-danger">*</span>
                </label>
                <Link to="/forgot-password" className="text-decoration-none text-primary" style={{ fontSize: '13px' }}>
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="position-relative">
                <div className="position-absolute d-flex align-items-center" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: '#A8AEB7' }}>
                  <CIcon icon={cilLockLocked} />
                </div>
                <CFormInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="position-absolute border-0 bg-transparent text-muted d-flex align-items-center"
                  style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 1 }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

              {/* Remember Me */}
            <div className="mb-5">
              <CFormCheck
                id="remember"
                label="Ghi nhớ tôi"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
            </div>

              {/* Submit Button */}
              <CButton type="submit" color="primary" className="w-100 fw-semibold" style={{ padding: '12px', fontSize: '15px', borderRadius: '6px' }} disabled={loading}>
                {loading ? (<><CSpinner size="sm" className="me-2" />Đang đăng nhập...</>) : ('Đăng nhập')}
              </CButton>
            </CForm>

            <div className="text-center mt-4 text-muted" style={{ fontSize: '14px' }}>
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">Đăng ký ngay</Link>
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}

export default Login
