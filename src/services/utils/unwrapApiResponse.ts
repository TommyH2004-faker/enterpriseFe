export function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('API response không hợp lệ.')
  }

  const response = payload as {
    value?: unknown
    data?: unknown
  }

  if (Array.isArray(response.value)) {
    return response.value as T[]
  }

  if (Array.isArray(response.data)) {
    return response.data as T[]
  }

  throw new Error('API không trả về mảng dữ liệu.')
}