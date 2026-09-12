import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CFormCheck,
  CRow,
  CSpinner,
  CProgress,
  CCard,
  CCardBody,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { authApi, getErrorMessage, getHttpErrorMessage } from '../../../api/authApi'

type Step = 1 | 2 | 3

interface FormData {
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  password: string
  confirmPassword: string
  agreed: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>

const getPasswordStrength = (pw: string): { label: string; score: number; color: string } => {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Yếu', score: 20, color: 'danger' }
  if (score === 2) return { label: 'Trung bình', score: 40, color: 'warning' }
  if (score === 3) return { label: 'Khá', score: 60, color: 'info' }
  if (score === 4) return { label: 'Tốt', score: 80, color: 'primary' }
  return { label: 'Mạnh', score: 100, color: 'success' }
}

const Register: React.FC = () => {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    username: '', email: '', firstName: '', lastName: '', gender: '',
    password: '', confirmPassword: '', agreed: false,
  })

  const update = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateStep1 = () => {
    const errs: FormErrors = {}
    if (!formData.username.trim()) errs.username = 'Tên đăng nhập không được để trống'
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Email không hợp lệ'
    if (!formData.firstName.trim()) errs.firstName = 'Tên không được để trống'
    if (!formData.lastName.trim()) errs.lastName = 'Họ không được để trống'
    if (!formData.gender) errs.gender = 'Vui lòng chọn giới tính'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: FormErrors = {}
    if (formData.password.length < 8) errs.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp'
    if (!formData.agreed) errs.agreed = 'Vui lòng đồng ý với điều khoản'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const result = await authApi.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: Number(formData.gender),
      })
      if (!result.isSuccess) {
        toast.error(getErrorMessage(result.errors, result.message || 'Đăng ký thất bại'))
        return
      }
      toast.success('Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.')
      setStep(3)
    } catch (error: any) {
      toast.error(getHttpErrorMessage(error, 'Không thể kết nối đến máy chủ'))
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(formData.password)

  const StepIndicator = () => (
    <div className="d-flex align-items-center justify-content-center mb-5 gap-2">
      {([1, 2, 3] as Step[]).map((s) => (
        <React.Fragment key={s}>
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: '36px', height: '36px', fontSize: '14px',
                background: step >= s ? '#321FDB' : '#E8EAED',
                color: step >= s ? 'white' : '#A8AEB7',
                transition: 'all 0.2s ease',
              }}
            >
              {step > s ? '✓' : s}
            </div>
            <span className="ms-2 fw-medium" style={{ fontSize: '13px', color: step >= s ? '#321FDB' : '#A8AEB7' }}>
              {s === 1 ? 'Thông tin' : s === 2 ? 'Mật khẩu' : 'Hoàn tất'}
            </span>
          </div>
          {s < 3 && <div style={{ width: '40px', height: '2px', background: step > s ? '#321FDB' : '#E8EAED', transition: 'all 0.2s ease' }} />}
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e8eaed 100%)' }}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={10} md={8} lg={6} xl={5}>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark" style={{ fontSize: '24px' }}>Tạo tài khoản mới</h2>
              <p className="text-muted">Điền thông tin để bắt đầu sử dụng TaskFlow</p>
            </div>

            <CCard className="shadow-sm border-0">
              <CCardBody className="p-4">
              <StepIndicator />

              {/* Step 1: Information */}
              {step === 1 && (
                <CForm>
                  <CRow className="g-3">
                    <CCol xs={12}>
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Tên đăng nhập <span className="text-danger">*</span></label>
                      <CFormInput
                        placeholder="nguyen.van.a"
                        value={formData.username}
                        onChange={e => update('username', e.target.value)}
                        invalid={!!errors.username}
                      />
                      {errors.username && <div className="text-danger small mt-1">{errors.username}</div>}
                    </CCol>
                    <CCol xs={12}>
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Email <span className="text-danger">*</span></label>
                      <CFormInput
                        type="email"
                        placeholder="email@company.com"
                        value={formData.email}
                        onChange={e => update('email', e.target.value)}
                        invalid={!!errors.email}
                      />
                      {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                    </CCol>
                    <CCol xs={12} sm={6}>
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Họ <span className="text-danger">*</span></label>
                      <CFormInput
                        placeholder="Nguyễn"
                        value={formData.lastName}
                        onChange={e => update('lastName', e.target.value)}
                        invalid={!!errors.lastName}
                      />
                      {errors.lastName && <div className="text-danger small mt-1">{errors.lastName}</div>}
                    </CCol>
                    <CCol xs={12} sm={6}>
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Tên <span className="text-danger">*</span></label>
                      <CFormInput
                        placeholder="Văn A"
                        value={formData.firstName}
                        onChange={e => update('firstName', e.target.value)}
                        invalid={!!errors.firstName}
                      />
                      {errors.firstName && <div className="text-danger small mt-1">{errors.firstName}</div>}
                    </CCol>
                    <CCol xs={12}>
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Giới tính <span className="text-danger">*</span></label>
                      <CFormSelect value={formData.gender} onChange={e => update('gender', e.target.value)} invalid={!!errors.gender}>
                        <option value="">Chọn giới tính</option>
                        <option value="0">Nam</option>
                        <option value="1">Nữ</option>
                        <option value="2">Khác</option>
                      </CFormSelect>
                      {errors.gender && <div className="text-danger small mt-1">{errors.gender}</div>}
                    </CCol>
                  </CRow>

                  <div className="d-flex gap-2 mt-4">
                    <Link to="/login" className="btn btn-light flex-grow-1 fw-medium">Hủy</Link>
                    <CButton color="primary" className="flex-grow-1 fw-semibold" onClick={handleNext}>
                      Tiếp tục →
                    </CButton>
                  </div>
                </CForm>
              )}

              {/* Step 2: Password */}
              {step === 2 && (
                <CForm>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>
                      Mật khẩu <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tối thiểu 8 ký tự"
                        value={formData.password}
                        onChange={e => update('password', e.target.value)}
                        invalid={!!errors.password}
                        style={{ paddingRight: '40px' }}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="position-absolute border-0 bg-transparent text-muted"
                        style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}>
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          style={{ width: '18px', height: '18px' }}
                        />
                      </button>
                    </div>
                    {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                    
                    {formData.password && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted" style={{ fontSize: '12px' }}>Độ mạnh:</span>
                          <span className={`text-${strength.color} fw-semibold`} style={{ fontSize: '12px' }}>{strength.label}</span>
                        </div>
                        <CProgress value={strength.score} color={strength.color} style={{ height: '4px' }} />
                        <div className="mt-2" style={{ fontSize: '11px', color: '#A8AEB7' }}>
                          ✓ 8+ ký tự &nbsp; ✓ Chữ hoa/thường &nbsp; ✓ Số &nbsp; ✓ Ký tự đặc biệt
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>
                      Xác nhận mật khẩu <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <CFormInput
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={e => update('confirmPassword', e.target.value)}
                        invalid={!!errors.confirmPassword}
                        style={{ paddingRight: '40px' }}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="position-absolute border-0 bg-transparent text-muted"
                        style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        title={showConfirm ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                        aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}>
                        <FontAwesomeIcon
                          icon={showConfirm ? faEye : faEyeSlash}
                          style={{ width: '18px', height: '18px' }}
                        />
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword}</div>}
                  </div>

                  <div className="mb-4">
                    <CFormCheck
                      id="agreed"
                      checked={formData.agreed}
                      onChange={e => update('agreed', e.target.checked)}
                      label={
                        <span style={{ fontSize: '13px' }}>
                          Tôi đồng ý với{' '}
                          <a href="#" className="text-primary">Điều khoản dịch vụ</a> và{' '}
                          <a href="#" className="text-primary">Chính sách bảo mật</a>
                        </span>
                      }
                    />
                    {errors.agreed && <div className="text-danger small mt-1">{errors.agreed}</div>}
                  </div>

                  <div className="d-flex gap-2">
                    <CButton color="light" className="flex-grow-1 fw-medium" onClick={() => setStep(1)}>← Quay lại</CButton>
                    <CButton color="primary" className="flex-grow-1 fw-semibold" onClick={handleSubmit} disabled={loading}>
                      {loading ? <><CSpinner size="sm" className="me-2" />Đang tạo...</> : 'Tạo tài khoản'}
                    </CButton>
                  </div>
                </CForm>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <div className="text-center py-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #2ED8B6, #321FDB)' }}>
                    <span style={{ fontSize: '36px' }}>✓</span>
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Tài khoản đã tạo thành công!</h4>
                  <p className="text-muted mb-4">
                    Chào mừng <strong>{formData.lastName} {formData.firstName}</strong> đến với TaskFlow.<br />
                    Vui lòng kiểm tra email để xác thực tài khoản.
                  </p>
                  <CButton color="primary" className="w-100 fw-semibold" style={{ padding: '12px', borderRadius: '6px' }} onClick={() => navigate('/login')}>
                    Đến trang Đăng nhập
                  </CButton>
                </div>
              )}
              </CCardBody>
            </CCard>

            {step !== 3 && (
              <div className="text-center mt-3 text-muted" style={{ fontSize: '13px' }}>
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary fw-semibold text-decoration-none">Đăng nhập</Link>
              </div>
            )}
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
