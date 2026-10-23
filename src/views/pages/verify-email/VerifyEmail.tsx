import React, { useEffect, useState } from 'react'
import { CAlert, CButton, CCard, CCardBody, CSpinner } from '@coreui/react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi, getErrorMessage, getHttpErrorMessage } from '../../../api/authApi'

type VerificationState = 'loading' | 'error'

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<VerificationState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const email = searchParams.get('email')
    const code = searchParams.get('code')

    if (!email || !code) {
      navigate('/login?activated=error', { replace: true })
      return
    }

    let cancelled = false

    const verify = async () => {
      try {
        const result = await authApi.verifyEmail({ email, code })

        if (cancelled) return

        if (result.isSuccess) {
          navigate('/login?activated=success', { replace: true })
          return
        }

        setErrorMessage(getErrorMessage(result.errors, 'Kích hoạt thất bại.'))
        setState('error')
      } catch (error) {
        if (cancelled) return

        setErrorMessage(getHttpErrorMessage(error, 'Kích hoạt thất bại.'))
        setState('error')
      }
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <CCard className="shadow-sm border-0" style={{ width: '100%', maxWidth: '480px' }}>
        <CCardBody className="p-4 p-md-5 text-center">
          {state === 'loading' ? (
            <>
              <CSpinner color="primary" className="mb-4" />
              <h2 className="fw-bold text-dark mb-2">Đang kích hoạt tài khoản</h2>
              <p className="text-muted mb-0">Vui lòng chờ trong giây lát.</p>
            </>
          ) : (
            <>
              <CAlert color="danger" className="text-start mb-4" role="alert">
                <div className="fw-semibold">Kích hoạt thất bại</div>
                <div>{errorMessage}</div>
              </CAlert>
              <Link to="/login" className="text-decoration-none">
              <CButton color="primary">
                Quay lại đăng nhập
              </CButton>
            </Link>
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default VerifyEmail