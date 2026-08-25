import React, { Suspense, useEffect } from 'react'
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

const Page404 = React.lazy(
  () => import('./views/pages/page404/Page404'),
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
    const urlParams =
      new URLSearchParams(
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
              TRANG MẶC ĐỊNH
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

          {/* ========================================
              AUTHENTICATION
              Không dùng DefaultLayout
              ======================================== */}

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

          {/* ========================================
              ERROR PAGES
              ======================================== */}

          <Route
            path="/404"
            element={<Page404 />}
          />

          <Route
            path="/500"
            element={<Page500 />}
          />

          {/* ========================================
              APPLICATION
              Tất cả route phía trong sẽ dùng
              DefaultLayout
              ======================================== */}

          <Route
            path="/*"
            element={<DefaultLayout />}
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App