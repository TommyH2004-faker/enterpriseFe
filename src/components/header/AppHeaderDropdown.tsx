// src/components/header/AppHeaderDropdown.tsx
import { useEffect, useState } from 'react'
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
import { cilAccountLogout, cilEnvelopeOpen, cilFile, cilTask, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { headerService, NotificationData } from 'src/services/headerService'
import profileService from 'src/services/profileService'
import type { UserProfile } from 'src/types/profile'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationData>({
    updates: 0,
    messages: 0,
    tasks: 0,
    comments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [projectCount, setProjectCount] = useState(0)

  // Thông tin hiển thị trên avatar header
  const [me, setMe] = useState<UserProfile | null>(null)

  // Tải hồ sơ lần đầu và lắng nghe khi trang Hồ sơ lưu thay đổi.
  useEffect(() => {
    let cancelled = false

    profileService
      .getMyProfile()
      .then((data) => {
        if (!cancelled) setMe(data.user)
      })
      .catch((error) => console.error('Failed to load profile:', error))

    const unsubscribe = profileService.subscribeProfileChanged(setMe)

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await headerService.getNotificationCount()
        setNotifications(data)
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadProjectCount = async () => {
      try {
        const count = await headerService.getProjectCount()
        setProjectCount(count)
      } catch (error) {
        console.error('Failed to load project count:', error)
      }
    }

    loadNotifications()
    loadProjectCount()

    const interval = setInterval(() => {
      loadNotifications()
      loadProjectCount()
    }, 30000)

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

  const avatarSrc = profileService.resolveFileUrl(me?.avatarUrl)
  const displayName = me?.fullName || me?.username || ''
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle className="py-0 pe-0" caret={false}>
        {avatarSrc ? (
          <CAvatar src={avatarSrc} size="md" />
        ) : (
          <CAvatar color="primary" textColor="white" size="md">
            {initial || <CIcon icon={cilUser} />}
          </CAvatar>
        )}
      </CDropdownToggle>

      <CDropdownMenu className="pt-0 dropdown-menu-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {displayName || 'Account'}
        </CDropdownHeader>

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
          onClick={() => handleNavigate('/profile', 'profile')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>

        <CDropdownItem
          onClick={() => handleNavigate('/projects', 'projects')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">
            {projectCount}
          </CBadge>
        </CDropdownItem>

        <CDropdownDivider />

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