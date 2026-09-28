import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import { routes } from '../routes'

const Page404 = React.lazy(() => import('../views/pages/page404/Page404'))

/**
 * Render route tree recursively.
 *
 * Supports:
 * - Normal routes
 * - Index routes (route.index = true)
 * - Nested routes with <Outlet />
 * - Lazy-loaded components
 */
const renderRoutes = (routeList: any[]) => {
  return routeList.map((route, idx) => {
    if (!route.element) {
      return null
    }

    const Element = route.element

    if (route.index) {
      return <Route key={idx} index element={<Element />} />
    }

    return (
      <Route key={route.path || idx} path={route.path} element={<Element />}>
        {route.children && renderRoutes(route.children)}
      </Route>
    )
  })
}

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {renderRoutes(routes)}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
