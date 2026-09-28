import axiosClient from "src/api/axiosClient"
import { TaskActivityResponse } from "src/types/TaskDetailType/activity"
import { unwrapArray } from "./utils/unwrapApiResponse"

const BASE_URL = '/api/v1'

export const activityService = {
async getTaskActivities(
  taskId: string,
): Promise<TaskActivityResponse[]> {
  const response = await axiosClient.get(
    `${BASE_URL}/tasks/${taskId}/activities`,
  )

  return unwrapArray<TaskActivityResponse>(
    response.data,
  )
}
}

export default activityService
