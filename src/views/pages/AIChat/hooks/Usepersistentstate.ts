import { useEffect, useState } from 'react'

/** useState có lưu vào localStorage (JSON). Lỗi storage được bỏ qua. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* bỏ qua */
    }
  }, [key, value])

  return [value, setValue] as const
}