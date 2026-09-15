import { useMemo } from 'react'
import { Position } from 'src/types/position'

export interface PositionStats {
  totalPositions: number
  activePositions: number
  inactivePositions: number
  totalEmployees: number
}

export const usePositionStatistics = (positions: Position[]): PositionStats => {
  return useMemo(() => {
    return {
      totalPositions: positions.length,
      activePositions: positions.filter((p) => p.isActive).length,
      inactivePositions: positions.filter((p) => !p.isActive).length,
      totalEmployees: positions.reduce(
        (total, position) => total + (position.employeeCount || 0),
        0
      ),
    }
  }, [positions])
}