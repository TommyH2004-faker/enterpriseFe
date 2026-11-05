import { ProjectStatus, ProjectSummary } from 'src/types/ProjectType/project'

export type ProjectPermission =
  | 'edit'
  | 'settings'
  | 'delete'
  | 'members'
  | 'createTask'
  | 'createBoard'

const ACTION_ALIASES: Record<ProjectPermission, string[]> = {
  edit: ['edit', 'update', 'updateProject'],
  settings: ['settings', 'manageSettings', 'update', 'updateProject'],
  delete: ['delete', 'remove', 'deleteProject'],
  members: ['members', 'manageMembers', 'addMember', 'addProjectMember'],
  createTask: ['createTask', 'createTasks', 'createProjectTask'],
  createBoard: ['createBoard', 'createBoards'],
}

const STATUS_MESSAGES: Partial<Record<ProjectStatus, string>> = {
  OnHold: 'Dự án đang tạm dừng, không thể thao tác ghi.',
  Completed: 'Dự án đã hoàn thành, không thể thao tác ghi.',
  Cancelled: 'Dự án đã bị hủy, không thể thao tác ghi.',
}

const normalize = (action: string) => action.trim().toLowerCase()

export const useProjectPermissions = () => {
  const can = (project: ProjectSummary, permission: ProjectPermission) => {
    const allowedActions = project.allowedActions ?? []
    const allowed = new Set(allowedActions.map(normalize))
    return ACTION_ALIASES[permission].some((action) => allowed.has(normalize(action)))
  }

  const getDeniedMessage = (project: ProjectSummary) =>
    STATUS_MESSAGES[project.status] ??
    'Thao tác này không được phép với trạng thái hiện tại của dự án.'

  return { can, getDeniedMessage }
}
