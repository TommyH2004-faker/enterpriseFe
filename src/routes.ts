import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))


// Quản lý
const Departments = React.lazy(() => import('./views/departments/Departments.tsx'))
const Employees = React.lazy(() => import('./views/employees/Employees'))
const Projects = React.lazy(() => import('./views/projects/Projects.tsx'))
const Tasks = React.lazy(() => import('./views/tasks/Tasks'))
const TaskDetailPage = React.lazy(() => import('./views/tasks/TaskDetailPage'))
const ProjectDetail = React.lazy(() => import('./views/ProjectDetail/ProjectDetail.tsx'))
const Files = React.lazy(() => import('./views/files/Files'))
const Labels = React.lazy(() => import('./views/labels/Labels'))
const Tags = React.lazy(() => import('./views/tags/Tags'))

// Project Detail Tabs
const ProjectOverview = React.lazy(() => import('./views/ProjectDetail/tabs/ProjectOverview'))
const ProjectKanban = React.lazy(() => import('./views/ProjectDetail/tabs/ProjectKanban'))
const ProjectTasks = React.lazy(() => import('./views/ProjectDetail/tabs/ProjectTasks'))
const ProjectMembers = React.lazy(() => import('./views/ProjectDetail/tabs/ProjectMembers'))

const ProjectFiles = React.lazy(() => import('./views/ProjectDetail/tabs/ProjectFiles'))
const ProjectSettings = React.lazy(() => import('./views/ProjectDetail/components/settings/ProjectSettings'))

// Hệ thống
const Notifications = React.lazy(() => import('./views/notifications/Notifications'))
const Messages = React.lazy(() => import('./views/messages/Messages'))
const Reports = React.lazy(() => import('./views/reports/Reports'))
const Settings = React.lazy(() => import('./views/settings/Settings'))
const Activities = React.lazy(() => import('./views/activities/Activities'))
const AuditLog = React.lazy(() => import('./views/audit/AauditLog'))
const SearchResults = React.lazy(() => import('./views/search/SearchResults'))
const PositionRoleUser = React.lazy(() => import('./views/PositionPage/PositonRoleUser.tsx'))
const RoleUser = React.lazy(() => import('./views/RolePage/RolePage.tsx'))
const UserPage = React.lazy(() => import('./views/UserDetailPage/UserPage.tsx'))
const PermissionPage = React.lazy(() => import('./views/PermissionPage/PermissionPage.tsx'))
const ProfilePage = React.lazy(() => import('./views/pages/ProfilePage/ProfilePage.tsx'))
const SessionManagementPage = React.lazy(() => import('./views/pages/SessionManagement/SessionManagementPage.tsx'))
export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/departments', name: 'Phòng ban', element: Departments },
  { path: '/employees', name: 'Nhân viên', element: Employees },
  { path: '/files', name: 'Tệp', element: Files },
  { path: '/labels', name: 'Nhãn', element: Labels },
  { path: '/tags', name: 'Thẻ', element: Tags },
  { path: '/activities', name: 'Hoạt động', element: Activities },
  { path: '/audit', name: 'Nhật ký kiểm toán', element: AuditLog },
  { path: '/search', name: 'Tìm kiếm', element: SearchResults },
  { path: '/notifications', name: 'Thông báo', element: Notifications },
  { path: '/messages', name: 'Tin nhắn', element: Messages },
  { path: '/reports', name: 'Báo cáo', element: Reports },
  { path: '/sessions', name: 'Quản lý phiên', element: SessionManagementPage },
  { path: '/profile', name: 'Hồ sơ', element: ProfilePage },
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
    element: PermissionPage,
  },
  {
    path: '/users',
    name: 'Quản lý người dùng',
    element: UserPage,
  },
  {
    path: '/projects',
    name: 'Dự án',
    element: Projects,
  },
  {
    path: '/tasks',
    name: 'Công việc',
    element: Tasks,
  },
  {
    path: '/tasks/:taskId',
    name: 'Chi tiết công việc',
    element: TaskDetailPage,
  },
  {
    path: '/projects/:projectId',
    name: 'Chi tiết dự án',
    element: ProjectDetail,
    children: [
      {
        index: true,
        name: 'Tổng quan',
        element: ProjectOverview,
      },
      {
        path: 'kanban',
        name: 'Kanban',
        element: ProjectKanban,
      },
      {
        path: 'tasks',
        name: 'Công việc',
        element: ProjectTasks,
      },
      {
        path: 'members',
        name: 'Thành viên',
        element: ProjectMembers,
      },
      
      {
        path: 'files',
        name: 'Tệp',
        element: ProjectFiles,
      },
      {
        path: 'settings',
        name: 'Cài đặt',
        element: ProjectSettings,
      },
    ],
  },
]

export default routes
