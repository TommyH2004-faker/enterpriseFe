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
    },
    {
      component: CNavItem,
      name: 'Quyền',
      to: '/permissions',
    },
    {
      component: CNavItem,
      name: 'Quản lý  người dùng',
      to: '/users',
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
    name: 'Nhãn',
    to: '/labels',
    icon: <CIcon icon={cilTags} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Thẻ',
    to: '/tags',
    icon: <CIcon icon={cilTags} customClassName="nav-icon" />,
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
  },
  {
    component: CNavItem,
    name: 'Tìm kiếm',
    to: '/search',
    icon: <CIcon icon={cilSearch} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Thông báo',
    to: '/notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    badge: {
      color: 'danger',
      text: '3',
    },
  },
  {
    component: CNavItem,
    name: 'Báo cáo',
    to: '/reports',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Cài đặt',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav
