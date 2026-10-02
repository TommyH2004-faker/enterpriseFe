import { ApiResponse } from "src/api/authApi"
import axiosClient from "src/api/axiosClient"
import { TaskActivityResponse } from "src/types/TaskDetailType/activity"

const BASE_URL = '/api/v1'

export const activityService = {
  async getTaskActivities(
    taskId: string,
  ): Promise<TaskActivityResponse[]> {
    const response = await axiosClient.get<ApiResponse<TaskActivityResponse[]>>(
      `${BASE_URL}/tasks/${taskId}/activities`,
    )
    return response.data.data ?? []
  },
}

export default activityService
