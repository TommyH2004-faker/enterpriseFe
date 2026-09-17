// src/types/project-progress.ts

import { ProjectPriority, ProjectStatus } from "./project"
import { ProjectBoard, ProjectMember, ProjectMilestone } from "./project-member"

export interface ProjectProgress {
  projectId?: string
  projectName?: string

  overallProgress?: number
  progress?: number

  totalTasks?: number
  totalTaskCount?: number

  completedTasks?: number
  completedTaskCount?: number

  inProgressTasks?: number
  todoTasks?: number

  totalMilestones?: number
  completedMilestones?: number

  overdueTaskCount?: number
}
