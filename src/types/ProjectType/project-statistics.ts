// src/types/project-statistics.ts

export interface ProjectStatistics {
  projectId?: string
  projectName?: string

  status?: string

  startDate?: string | null
  endDate?: string | null
  createdDate?: string | null

  totalTasks?: number
  taskCount?: number

  completedTasks?: number
  completedTaskCount?: number

  totalMembers?: number
  memberCount?: number

  activeMembers?: number
  activeMemberCount?: number

  totalMilestones?: number
  milestoneCount?: number

  completedMilestones?: number

  totalKanbanBoards?: number
}
