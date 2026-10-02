import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { routes } from '../routes'

import { CButton, CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft } from '@coreui/icons'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const navigate = useNavigate()

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      routeName &&
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length ? true : false,
        })
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <div className="d-flex align-items-center gap-2">
      <CButton
        color="light"
        size="sm"
        className="border d-inline-flex align-items-center justify-content-center px-2"
        title="Quay lại trang trước"
        aria-label="Quay lại trang trước"
        onClick={() => navigate(-1)}
      >
        <CIcon icon={cilArrowLeft} />
      </CButton>
      <CBreadcrumb className="my-0">
      {/* Dùng onClick + navigate thay vì href để tránh full page reload */}
      <CBreadcrumbItem
        onClick={() => navigate('/dashboard')}
        style={{ cursor: 'pointer' }}
      >
        Home
      </CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => {
        return (
          <CBreadcrumbItem
            {...(breadcrumb.active
              ? { active: true }
              : {
                  onClick: () => navigate(breadcrumb.pathname),
                  style: { cursor: 'pointer' },
                })}
            key={index}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        )
      })}
      </CBreadcrumb>
    </div>
  )
}

export default React.memo(AppBreadcrumb)
