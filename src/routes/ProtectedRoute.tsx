import React from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { authStorage } from '../services/authStorage'

const ProtectedRoute: React.FC = () => {
  const location = useLocation()

  if (!authStorage.isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute