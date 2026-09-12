import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { authStorage } from 'src/services/authStorage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation()

  const isAuthenticated =
    authStorage.isAuthenticated()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  if (authStorage.mustChangePassword() && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (!authStorage.mustChangePassword() && location.pathname === '/change-password') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute