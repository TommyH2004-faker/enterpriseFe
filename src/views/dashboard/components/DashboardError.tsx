import { FC } from 'react'
import { CButton } from '@coreui/react'
import ToastAlert from 'src/components/ToastAlert'

interface Props {
  message: string
  onRetry: () => void
}

const DashboardError: FC<Props> = ({ message, onRetry }) => (
  <>
    <ToastAlert message={`Không thể tải dữ liệu Dashboard: ${message}`} />
    <CButton color="danger" variant="outline" onClick={onRetry}>
      Thử tải lại
    </CButton>
  </>
)

export default DashboardError