import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CSpinner,
  CAlert,
  CCard,
  CCardBody,
} from '@coreui/react'

type Step = 1 | 2 | 3

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (step === 2) {
      setCountdown(60)
      setCanResend(false)
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step])

  const handleSend = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vui lòng nhập email hợp lệ')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(2) }, 1500)
  }

  const handleResend = () => {
    if (!canResend) return
    setCountdown(60)
    setCanResend(false)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleReset = () => {
    if (!newPassword || newPassword.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự'); return }
    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(3) }, 1500)
  }

  const StepIndicator = () => (
    <div className="d-flex align-items-center justify-content-center mb-4 gap-2">
      {([1, 2, 3] as Step[]).map((s) => (
        <React.Fragment key={s}>
          <div className="d-flex align-items-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '13px', background: step >= s ? '#321FDB' : '#E8EAED', color: step >= s ? 'white' : '#A8AEB7', transition: 'all 0.2s ease' }}>
              {step > s ? '✓' : s}
            </div>
          </div>
          {s < 3 && <div style={{ width: '30px', height: '2px', background: step > s ? '#321FDB' : '#E8EAED' }} />}
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e8eaed 100%)' }}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={8} md={6} lg={5} xl={4}>
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: '56px', height: '56px' }}>
                <span style={{ fontSize: '24px' }}>🔑</span>
              </div>
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '22px' }}>
                {step === 1 ? 'Quên mật khẩu' : step === 2 ? 'Kiểm tra email' : 'Đặt lại thành công'}
              </h2>
              <p className="text-muted" style={{ fontSize: '13px' }}>
                {step === 1 ? 'Nhập email để nhận link đặt lại mật khẩu' 
                : step === 2 ? `Link đặt lại đã được gửi đến ${email}`
                : 'Mật khẩu của bạn đã được cập nhật thành công'}
              </p>
            </div>

            <CCard className="shadow-sm border-0">
              <CCardBody className="p-4">
              <StepIndicator />

              {error && (
                <CAlert color="danger" className="mb-3 py-2 px-3" style={{ borderRadius: '6px', fontSize: '13px' }}>
                  ⚠️ {error}
                </CAlert>
              )}

              {/* Step 1: Request Reset */}
              {step === 1 && (
                <CForm>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Email <span className="text-danger">*</span></label>
                    <CFormInput
                      type="email"
                      placeholder="email@company.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                  </div>
                  <CButton color="primary" className="w-100 fw-semibold" style={{ padding: '12px', borderRadius: '6px' }} onClick={handleSend} disabled={loading}>
                    {loading ? <><CSpinner size="sm" className="me-2" />Đang gửi...</> : 'Gửi link đặt lại'}
                  </CButton>
                </CForm>
              )}

              {/* Step 2: Check Email */}
              {step === 2 && (
                <div>
                  <div className="text-center py-3 mb-4 bg-success bg-opacity-10 rounded-3">
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>📧</div>
                    <p className="text-dark fw-medium mb-1" style={{ fontSize: '14px' }}>Email đã được gửi!</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Kiểm tra hộp thư đến (hoặc thư spam)</p>
                  </div>
                  <div className="text-center mb-4">
                    {canResend ? (
                      <CButton color="primary" variant="outline" size="sm" onClick={handleResend}>
                        Gửi lại email
                      </CButton>
                    ) : (
                      <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                        Gửi lại sau <strong className="text-primary">{countdown}s</strong>
                      </p>
                    )}
                  </div>
                  {/* For demo: go to step 3 */}
                  <CButton color="light" className="w-100 fw-medium mb-3" onClick={() => setStep(3)}>
                    Đặt lại mật khẩu (Demo)
                  </CButton>
                </div>
              )}

              {/* Step 3: Reset Password */}
              {step === 3 && (
                <CForm>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Mật khẩu mới <span className="text-danger">*</span></label>
                    <div className="position-relative">
                      <CFormInput
                        type={showNew ? 'text' : 'password'}
                        placeholder="Tối thiểu 8 ký tự"
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setError('') }}
                        style={{ paddingRight: '40px' }}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="position-absolute border-0 bg-transparent text-muted" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                        {showNew ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                    <div className="position-relative">
                      <CFormInput
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                        style={{ paddingRight: '40px' }}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="position-absolute border-0 bg-transparent text-muted" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <CButton color="primary" className="w-100 fw-semibold" style={{ padding: '12px', borderRadius: '6px' }} onClick={handleReset} disabled={loading}>
                    {loading ? <><CSpinner size="sm" className="me-2" />Đang cập nhật...</> : 'Đặt lại mật khẩu'}
                  </CButton>
                </CForm>
              )}
              </CCardBody>
            </CCard>

            <div className="text-center mt-3">
              <Link to="/login" className="text-muted text-decoration-none d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '13px' }}>
                ← Quay lại đăng nhập
              </Link>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ForgotPassword
