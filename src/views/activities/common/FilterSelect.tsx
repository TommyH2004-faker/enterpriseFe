import { CFormSelect } from '@coreui/react'
import { SelectOption } from 'src/types/common'

interface Props {
  value: string
  placeholder: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export default function FilterSelect({ value, placeholder, options, onChange }: Props) {
  return (
    <CFormSelect
      style={{ width: 'auto', minWidth: 160 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={[{ value: '', label: placeholder }, ...options]}
    />
  )
}
