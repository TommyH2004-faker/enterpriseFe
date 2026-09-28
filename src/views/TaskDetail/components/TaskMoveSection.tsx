import React, { useEffect, useState } from 'react'
export interface TaskMoveColumn { id: string; name: string }

interface TaskMoveSectionProps { columns: TaskMoveColumn[]; currentColumnId: string; currentPosition: number; saving: boolean; onMove: (columnId: string, position: number) => void }

export const TaskMoveSection: React.FC<TaskMoveSectionProps> = ({ columns, currentColumnId, currentPosition, saving, onMove }) => {
  const [columnId, setColumnId] = useState(currentColumnId)
  useEffect(() => { setColumnId(currentColumnId) }, [currentColumnId])

  return (
    <div>
      <label className="text-uppercase text-muted fw-bold small mb-1 d-block" style={{ fontSize: '11px' }}>
        Cột quy trình (Status)
      </label>
      <select
        value={columnId}
        onChange={(e) => {
          setColumnId(e.target.value);
          onMove(e.target.value, currentPosition);
        }}
        disabled={saving}
        className="form-select bg-white border-0 shadow-sm fw-semibold text-dark"
      >
        {columns.map((col) => (
          <option key={col.id} value={col.id}>{col.name}</option>
        ))}
      </select>
    </div>
  )
}