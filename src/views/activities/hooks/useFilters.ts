import { useState } from 'react'

/** `draft`: giá trị đang nhập. `applied`: chỉ cập nhật khi bấm "Lọc" -> dùng để gọi API. */
export function useFilters<T extends object>(initial: T) {
  const [draft, setDraft] = useState<T>(initial)
  const [applied, setApplied] = useState<T>(initial)

  const patch = (p: Partial<T>) => setDraft((d) => ({ ...d, ...p }))
  const apply = () => setApplied(draft)
  const reset = () => {
    setDraft(initial)
    setApplied(initial)
  }

  return { draft, applied, patch, apply, reset }
}
