import React, { Suspense, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { useSelector } from 'react-redux'

import {
  CSpinner,
  useColorModes,
} from '@coreui/react'

import './scss/style.scss'

import DefaultLayout from './layout/DefaultLayout'
import ProtectedRoute from './routes/ProtectedRoute'



const Login = React.lazy(
  () => import('./views/pages/login/Login'),
)

const Register = React.lazy(
  () => import('./views/pages/register/Register'),
)

const ForgotPassword = React.lazy(
  () =>
    import(
      './views/pages/forgot-password/ForgotPassword'
    ),
)

const VerifyEmail = React.lazy(
  () => import('./views/pages/verify-email/VerifyEmail'),
)

const ChangePassword = React.lazy(
  () => import('./views/pages/change-password/ChangePassword'),
)

const Page404 = React.lazy(
  () => import('./views/pages/page404/Page404'),
)

const Page403 = React.lazy(
  () => import('./views/pages/page403/Page403'),
)

const Page500 = React.lazy(
  () => import('./views/pages/page500/Page500'),
)

type RootState = {
  theme: string
}

const App = () => {
  const {
    isColorModeSet,
    setColorMode,
  } = useColorModes(
    'coreui-free-react-admin-template-theme',
  )

  const storedTheme = useSelector(
    (state: RootState) => state.theme,
  )

  useEffect(() => {
    const urlParams = new URLSearchParams(
      window.location.href.split('?')[1],
    )

    const theme =
      urlParams.get('theme') &&
      urlParams
        .get('theme')
        ?.match(/^[A-Za-z0-9\s]+/)?.[0]

    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
    <Toaster
      position="bottom-center"
      containerStyle={{
        bottom: '32px',
        left: '50%',
        right: 'auto',
        width: 'calc(100vw - 32px)',
        maxWidth: '520px',
        transform: 'translateX(-50%)',
      }}
      toastOptions={{
        duration: 3000,
        style: {
          width: '100%',
          maxWidth: '520px',
          boxSizing: 'border-box',
          padding: '16px 20px',
          fontSize: '17px',
          fontWeight: 500,
          lineHeight: 1.5,
          justifyContent: 'center',
          textAlign: 'center',
          borderRadius: '10px',
        },
      }}
    />

      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner
              color="primary"
              variant="grow"
            />
          </div>
        }
      >
        <Routes>
          {/* ========================================
              AUTHENTICATION
              ======================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
        
          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />
          <Route
            path="/auth/verify-email"
            element={<VerifyEmail />}
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* ========================================
              ERROR PAGES
              ======================================== */}

          <Route
            path="/404"
            element={<Page404 />}
          />

          <Route
            path="/403"
            element={<Page403 />}
          />

          <Route
            path="/500"
            element={<Page500 />}
          />

          {/* ========================================
              APPLICATION
              DefaultLayout xử lý tất cả route app
              ======================================== */}

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App