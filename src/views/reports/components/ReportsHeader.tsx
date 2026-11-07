import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilFile,
  cilPrint,
  cilReload,
} from '@coreui/icons'

interface ReportsHeaderProps {
  loading: boolean
  exporting: boolean
  onRefresh: () => void
  onPrint: () => void
  onExportExcel: () => void
  onExportPdf: () => void
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  loading,
  exporting,
  onRefresh,
  onPrint,
  onExportExcel,
  onExportPdf,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h1 className="h3 fw-bold mb-1 text-dark">Báo cáo</h1>
        <div className="text-muted">
          Tiến độ dự án, hiệu suất nhân viên, theo phòng ban và xuất báo cáo
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <CButton
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={onRefresh}
          title="Làm mới dữ liệu"
        >
          <CIcon icon={cilReload} className="me-2" />
          Làm mới
        </CButton>

        <CButton
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={onPrint}
        >
          <CIcon icon={cilPrint} className="me-2" />
          In
        </CButton>

        <CButton
          color="primary"
          variant="outline"
          disabled={loading || exporting}
          onClick={onExportExcel}
        >
          {exporting ? (
            <CSpinner size="sm" className="me-2" />
          ) : (
            <CIcon icon={cilCloudDownload} className="me-2" />
          )}
          Export Excel
        </CButton>

        <CButton
          color="danger"
          variant="outline"
          disabled={loading}
          onClick={onExportPdf}
        >
          <CIcon icon={cilFile} className="me-2" />
          Export PDF
        </CButton>
      </div>
    </div>
  )
}

export default ReportsHeader
