// src/types/project-member.ts

export interface ProjectMember {
  userId: string
  fullName: string
  email?: string
  role?: string
  joinedAt?: string
}
export interface ProjectBoard {
  id: string
  name: string
  description?: string | null
}


export interface ProjectMilestone {
  id: string
  name: string
  description?: string | null
  startDate?: string | null
  dueDate?: string | null
  status?: string | null
}