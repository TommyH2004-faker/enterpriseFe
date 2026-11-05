// src/views/projects/hooks/useProjectActions.ts

import { useState } from 'react'

import { projectService } from 'src/services/projectService'

export const useProjectActions = () => {
  const [loading, setLoading] =
    useState(false)

  const run = async (
    action: () => Promise<void>,
  ) => {
    try {
      setLoading(true)

      await action()

      return {
        success: true,
        error: null,
      }
    } catch (err: any) {
      const responseMessage = err?.response?.data?.message
      const responseDescription = err?.response?.data?.error?.description
      return {
        success: false,
        error:
          responseMessage ||
          responseDescription ||
          err?.message ||
          'Thao tác thất bại.',
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,

    start: (id: string) =>
      run(() => projectService.start(id)),

    hold: (id: string) =>
      run(() => projectService.hold(id)),

    resume: (id: string) =>
      run(() => projectService.resume(id)),

    complete: (id: string) =>
      run(() =>
        projectService.complete(id),
      ),

    cancel: (id: string) =>
      run(() =>
        projectService.cancel(id),
      ),

    reopen: (id: string) =>
      run(() =>
        projectService.reopen(id),
      ),

    deleteProject: (id: string) =>
      run(() =>
        projectService.deleteProject(id),
      ),
  }
}