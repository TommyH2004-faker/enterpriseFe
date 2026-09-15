import { useState } from 'react'
import { Position, CreatePositionDTO, UpdatePositionDTO } from 'src/types/position'

export interface PositionFormState {
  code: string
  name: string
  description: string
  isActive: boolean
}

const INITIAL_FORM_STATE: PositionFormState = {
  code: '',
  name: '',
  description: '',
  isActive: true,
}

export const usePositionForm = (
  onSubmitSuccess: () => void,
  createPosition: (data: CreatePositionDTO) => Promise<Position>,
  updatePosition: (id: string, data: UpdatePositionDTO) => Promise<void>
) => {
  const [showModal, setShowModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [form, setForm] = useState<PositionFormState>(INITIAL_FORM_STATE)
  const [formError, setFormError] = useState<string | null>(null)

  const openCreateModal = () => {
    setEditingPosition(null)
    setForm(INITIAL_FORM_STATE)
    setFormError(null)
    setShowModal(true)
  }

  const openEditModal = (position: Position) => {
    setEditingPosition(position)
    setForm({
      code: position.code,
      name: position.name,
      description: position.description || '',
      isActive: position.isActive,
    })
    setFormError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPosition(null)
    setFormError(null)
  }

  const handleSubmit = async () => {
    setFormError(null)

    if (!form.code.trim()) {
      setFormError('Vui lòng nhập mã chức vụ.')
      return
    }

    if (!form.name.trim()) {
      setFormError('Vui lòng nhập tên chức vụ.')
      return
    }

    try {
      if (editingPosition) {
        const data: UpdatePositionDTO = {
          id: editingPosition.id,
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim(),
          isActive: form.isActive,
        }
        console.log('UPDATE POSITION ID:', editingPosition.id)
        console.log('UPDATE POSITION DATA:', data)
        await updatePosition(editingPosition.id, data)
        console.log('UPDATE POSITION SUCCESS')
      } else {
        const data: CreatePositionDTO = {
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim(),
        }
        await createPosition(data)
      }

      closeModal()
      onSubmitSuccess()
    } catch {
      // usePosition đã xử lý error
    }
  }

  return {
    showModal,
    setShowModal,
    editingPosition,
    form,
    setForm,
    formError,
    setFormError,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
  }
}