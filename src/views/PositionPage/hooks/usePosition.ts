import { useEffect, useState } from 'react'
import positionService from 'src/services/positionService'
import {
  CreatePositionDTO,
  Position,
  UpdatePositionDTO,
} from 'src/types/position'

export const usePosition = () => {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPositions = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await positionService.getAll()
      setPositions(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể tải danh sách chức vụ',
      )
    } finally {
      setLoading(false)
    }
  }

  // const createPosition = async (data: CreatePositionDTO) => {
  //   try {
  //     setLoading(true)
  //     setError(null)

  //     const position = await positionService.create(data)
  //     setPositions((prev) => [...prev, position])

  //     return position
  //   } catch (error) {
  //     setError(
  //       error instanceof Error
  //         ? error.message
  //         : 'Không thể tạo chức vụ',
  //     )
  //     throw error
  //   } finally {
  //     setLoading(false)
  //   }
  // }
 const createPosition = async (data: CreatePositionDTO) => {
  try {
    setLoading(true)
    setError(null)

    await positionService.create(data)

    // Backend chỉ trả ID => lấy lại danh sách để có Position đầy đủ
    await fetchPositions()
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Không thể tạo chức vụ',
    )

    throw error
  } finally {
    setLoading(false)
  }
}
    const updatePosition = async (
    id: string,
    data: UpdatePositionDTO,
    ) => {
    try {
        setLoading(true)
        setError(null)

        await positionService.update(id, data)

        console.log('Updated position successfully:', id)

        await fetchPositions()
    } catch (error) {
        setError(
        error instanceof Error
            ? error.message
            : 'Không thể cập nhật chức vụ',
        )
        throw error
    }
    }

  const deletePosition = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      await positionService.delete(id)

      setPositions((prev) =>
        prev.filter((item) => item.id !== id),
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa chức vụ',
      )
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
  }, [])

  return {
    positions,
    loading,
    error,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
  }
}