import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilTask,
  cilBuilding,
  cilPeople,
  cilBriefcase,
  cilBell,
  cilChartPie,
  cilFolder,
  cilTags,
  cilHistory,
  cilSearch,
  cilShieldAlt,
  cilSettings,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Quản lý',
  },
  {
    component: CNavItem,
    name: 'Phòng ban',
    to: '/departments',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Nhân viên',
    to: '/employees',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Dự án',
    to: '/projects',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Công việc',
    to: '/tasks',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  },
  // Position By Department
  {
    component: CNavItem,
    name: 'Quản lý chức vụ phòng ban',
    to: '/positionuser',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    permission: 'POSITION.VIEW',
  },
 {
  component: CNavGroup,
  name: 'Quản lý phân quyền',
  icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  items: [
    {
      component: CNavItem,
      name: 'Vai trò',
      to: '/roles',
      permission: 'ROLE.VIEW',
    },
    {
      component: CNavItem,
      name: 'Quyền',
      to: '/permissions',
      permission: 'PERMISSION.VIEW',
    },
    {
      component: CNavItem,
      name: 'Quản lý người dùng',
      to: '/users',
      permission: 'USER.VIEW',
    }
  ],
},
  {
    component: CNavTitle,
    name: 'Hệ thống',
  },
  {
    component: CNavItem,
    name: 'Tệp',
    to: '/files',
    icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Quản lý phiên',
    to: '/sessions',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" />,
    roles: ['SUPER_ADMIN', 'ADMINS'],
  },
  {
    component: CNavItem,
    name: 'Hoạt động',
    to: '/activities',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Nhật ký kiểm toán',
    to: '/audit',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    permission: 'AUDIT_LOG.VIEW',
  },
 
  {
    component: CNavItem,
    name: 'Thông báo',
    to: '/notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Báo cáo',
    to: '/reports',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    permission: 'REPORT.VIEW',
  },
]

export default _nav
