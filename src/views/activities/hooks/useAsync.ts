import { useEffect, useState } from 'react'
import { getErrorMessage } from '../utils/logHelpers'


/** Gọi hàm async mỗi khi `deps` đổi; tự bỏ qua kết quả cũ (tránh race condition). */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setData(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fn()
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, tick])

  return { data, loading, error, reload: () => setTick((t) => t + 1) }
}
