import { DateTimeString, Guid } from "../task"


export interface TaskActivityResponse {
  id: Guid
  employeeId: Guid
  activityType: number
  entityId: Guid
  title: string
  description: string
  correlationId: Guid
  createdAt: DateTimeString
}

export enum ActivityType {
  Project = 1,
  Task = 2,
  Comment = 3,
  Attachment = 4,
  Checklist = 5,
  Milestone = 6,
  Member = 7,
  Message = 8,
}
