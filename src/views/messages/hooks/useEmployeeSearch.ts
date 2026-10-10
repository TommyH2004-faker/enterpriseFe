import { useEffect, useState } from 'react'
import { ChatService, EmployeeSearchItem } from 'src/services/chatService'

export const useEmployeeSearch = (
  service: ChatService,
  query: string,
  enabled: boolean,
) => {
  const [people, setPeople] = useState<EmployeeSearchItem[]>([])

  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setPeople([])
      return
    }
    const timer = window.setTimeout(() => {
      void service
        .searchEmployees(query.trim())
        .then(setPeople)
        .catch(() => setPeople([]))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query, service, enabled])

  return { people, clear: () => setPeople([]) }
}