import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CBadge,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import AppHeaderNotifications from './header/AppHeaderNotifications'
import { headerService } from 'src/services/headerService'
import { useNotificationConnection } from 'src/hooks/useNotificationConnection'

const AppHeader = () => {
  useNotificationConnection()

  const navigate = useNavigate()
  const headerRef = useRef<HTMLDivElement>(null)
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [unreadMessages, setUnreadMessages] = useState(0)

  const dispatch = useDispatch()
  const sidebarShow = useSelector<{ sidebarShow: boolean }, boolean>((state) => state.sidebarShow)

  useEffect(() => {
    let disposed = false

    const loadUnreadMessages = async () => {
      try {
        const data = await headerService.getNotificationCount()
        if (!disposed) setUnreadMessages(data.messages)
      } catch {
        if (!disposed) setUnreadMessages(0)
      }
    }

    void loadUnreadMessages()
    const interval = window.setInterval(() => void loadUnreadMessages(), 30000)
    const handleChatUnreadChanged = () => void loadUnreadMessages()
    window.addEventListener('chat:unread-changed', handleChatUnreadChanged)

    return () => {
      disposed = true
      window.clearInterval(interval)
      window.removeEventListener('chat:unread-changed', handleChatUnreadChanged)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex align-items-center w-100 me-4">
          <div className="input-group" style={{ maxWidth: '400px', marginLeft: '1rem' }}>
            <span className="input-group-text bg-transparent border-end-0">
              <CIcon icon={cilMenu} size="sm" style={{ opacity: 0 }} />
            </span>
            <input type="text" className="form-control border-start-0" placeholder="Tìm kiếm công việc, dự án..." />
          </div>
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
          <AppHeaderNotifications />
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/messages" onClick={(event) => { event.preventDefault(); navigate('/messages') }}>
              <span className="position-relative d-inline-flex">
                <CIcon icon={cilEnvelopeOpen} size="lg" />
                {unreadMessages > 0 && (
                  <CBadge
                    color="danger"
                    shape="rounded-pill"
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '9px', minWidth: '17px', padding: '3px 5px' }}
                  >
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </CBadge>
                )}
              </span>
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader