// src/components/header/AppHeaderDropdown.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from '../../assets/images/avatars/8.jpg'
import { headerService, NotificationData } from 'src/services/headerService'


const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationData>({
    updates: 0,
    messages: 0,
    tasks: 0,
    comments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await headerService.getNotificationCount()
        setNotifications(data)
      } catch {
        // Fallback gracefully when notifications API endpoint is not yet implemented on backend
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNavigate = (path: string, action?: string) => {
    if (action) {
      console.log(`User clicked: ${action}`)
    }
    navigate(path)
  }

  const handleLogout = async () => {
    try {
      await headerService.logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <CDropdown variant="nav-item">
      {/* FIX: Loại bỏ placement từ CDropdownToggle */}
      <CDropdownToggle className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>

      {/* FIX: Dùng align thay vì placement */}
      <CDropdownMenu className="pt-0 dropdown-menu-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          Account
        </CDropdownHeader>

        <CDropdownItem
          onClick={() => handleNavigate('/updates', 'updates')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilBell} className="me-2" />
          Updates
          {!loading && notifications.updates > 0 && (
            <CBadge color="info" className="ms-2">
              {notifications.updates}
            </CBadge>
          )}
        </CDropdownItem>

        <CDropdownItem
          onClick={() => handleNavigate('/messages', 'messages')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          {!loading && notifications.messages > 0 && (
            <CBadge color="success" className="ms-2">
              {notifications.messages}
            </CBadge>
          )}
        </CDropdownItem>

        <CDropdownItem
          onClick={() => handleNavigate('/tasks', 'tasks')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilTask} className="me-2" />
          Tasks
          {!loading && notifications.tasks > 0 && (
            <CBadge color="danger" className="ms-2">
              {notifications.tasks}
            </CBadge>
          )}
        </CDropdownItem>

        <CDropdownItem
          onClick={() => handleNavigate('/comments', 'comments')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comments
          {!loading && notifications.comments > 0 && (
            <CBadge color="warning" className="ms-2">
              {notifications.comments}
            </CBadge>
          )}
        </CDropdownItem>

        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          Settings
        </CDropdownHeader>

        <CDropdownItem
          onClick={() => handleNavigate('/profile', 'profile')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>

        <CDropdownItem
          onClick={() => handleNavigate('/settings', 'settings')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>

        <CDropdownItem
          onClick={() => handleNavigate('/payments', 'payments')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">
            0
          </CBadge>
        </CDropdownItem>

        <CDropdownItem
          onClick={() => handleNavigate('/projects', 'projects')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">
            0
          </CBadge>
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem
          onClick={() => handleNavigate('/lock-account', 'lock')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          Lock Account
        </CDropdownItem>

        <CDropdownItem
          onClick={handleLogout}
          style={{ cursor: 'pointer', color: '#dc3545' }}
        >
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown