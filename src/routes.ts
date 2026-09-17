import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Tasks = React.lazy(() => import('./views/tasks/Tasks'))

// Quản lý
const Departments = React.lazy(() => import('./views/departments/Departments.tsx'))
const Employees = React.lazy(() => import('./views/employees/Employees'))
const Projects = React.lazy(() => import('./views/projects/Projects.tsx'))
const ProjectDetail = React.lazy(() => import('./views/ProjectDetail/ProjectDetail.tsx'))
const KanbanBoard = React.lazy(() => import('./views/kanban/KanbanBoard.tsx'))
const Files = React.lazy(() => import('./views/files/Files'))
const Labels = React.lazy(() => import('./views/labels/Labels'))
const Tags = React.lazy(() => import('./views/tags/Tags'))

// Hệ thống
const Notifications = React.lazy(() => import('./views/notifications/Notifications'))
const Reports = React.lazy(() => import('./views/reports/Reports'))
const Settings = React.lazy(() => import('./views/settings/Settings'))
const Activities = React.lazy(() => import('./views/activities/Activities'))
const AuditLog = React.lazy(() => import('./views/audit/AuditLog'))
const SearchResults = React.lazy(() => import('./views/search/SearchResults'))
const PositionRoleUser = React.lazy(() => import('./views/PositionPage/PositonRoleUser.tsx'))
const RoleUser = React.lazy(() => import('./views/RolePage/RolePage.tsx'))
const UserPage = React.lazy(() => import('./views/UserDetailPage/UserPage.tsx'))
const SettingPage = React.lazy(() => import('./views/ProjectDetail/components/ProjectSettings.tsx'))
const PermissionPage = React.lazy(() => import('./views/PermissionPage/PermissionPage.tsx'))

export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/tasks', name: 'Công việc', element: Tasks },
  { path: '/departments', name: 'Phòng ban', element: Departments },
  { path: '/employees', name: 'Nhân viên', element: Employees },
  { path: '/files', name: 'Tệp', element: Files },
  { path: '/labels', name: 'Nhãn', element: Labels },
  { path: '/tags', name: 'Thẻ', element: Tags },
  { path: '/activities', name: 'Hoạt động', element: Activities },
  { path: '/audit', name: 'Nhật ký kiểm toán', element: AuditLog },
  { path: '/search', name: 'Tìm kiếm', element: SearchResults },
  { path: '/notifications', name: 'Thông báo', element: Notifications },
  { path: '/reports', name: 'Báo cáo', element: Reports },
    {
    path: '/positionuser',
    name: 'Vai trò người dùng',
    element: PositionRoleUser,
  },
  {
    path: '/roles',
    name: 'Vai trò',
    element: RoleUser,
  },
  { 
    path: '/permissions', 
    name: 'Quyền', 
    element: PermissionPage
  },
  {
    path: '/users',
    name: 'Quản lý người dùng',
    element: UserPage,
  },
  //  { path: '/projects/:projectId', name: 'Chi tiết dự án', element: ProjectDetail },
  // { path: '/projects/:projectId/kanban', name: 'Kanban dự án', element: KanbanBoard },
{
  path: '/projects',
  name: 'Dự án',
  element: Projects,
},

{
  path: '/projects/:projectId',
  name: 'Chi tiết dự án',
  element: ProjectDetail,
  children: [
    
    {
      path: 'settings',
      name: 'Cài đặt',
      element: SettingPage,
    },
    
  ],
},
 

 
]

export default routes
