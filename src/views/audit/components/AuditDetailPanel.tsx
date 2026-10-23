import { ReactNode } from 'react'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'

import auditLogService from 'src/services/auditLogService'
import { formatDateTime, humanize, prettyJson } from 'src/views/activities/utils/logHelpers'
import { useAsync } from 'src/views/activities/hooks/useAsync'
import { ActionBadge } from 'src/views/activities/common/Badges'


interface Props {
  logId: string
  onClose: () => void
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="d-flex gap-2 py-1 small">
      <span className="text-body-secondary flex-shrink-0" style={{ width: 110 }}>
        {label}
      </span>
      <span className="text-break">{children}</span>
    </div>
  )
}

function ValueBox({ title, json }: { title: string; json: string | null }) {
  const text = prettyJson(json)
  return (
    <div className="bg-body-tertiary rounded p-2 h-100" style={{ minHeight: 150 }}>
      <div className="small fw-semibold mb-2">{title}</div>
      {text ? (
        <pre className="small mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </pre>
      ) : (
        <div className="small text-body-secondary">Không có dữ liệu</div>
      )}
    </div>
  )
}

export default function AuditDetailPanel({ logId, onClose }: Props) {
  const { data: log, loading, error } = useAsync(() => auditLogService.getAuditLogDetail(logId), [logId])

  return (
    <CCard className="flex-shrink-0" style={{ width: 340 }}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Chi tiết nhật ký kiểm toán</strong>
        <CButton color="link" className="p-0 text-body-secondary" onClick={onClose} aria-label="Đóng">
          <CIcon icon={cilX} />
        </CButton>
      </CCardHeader>

      <CCardBody>
        {loading && (
          <div className="text-center py-5">
            <CSpinner size="sm" />
          </div>
        )}
        {error && <CAlert color="danger">{error}</CAlert>}

        {!loading && log && (
          <>
            <div className="d-flex align-items-center gap-2 small text-body-secondary mb-3">
              <ActionBadge action={log.action} />
              <span>
                {formatDateTime(log.createdAt)} · {log.actorName}
              </span>
            </div>

            <h6 className="fw-semibold">Thông tin chung</h6>
            <div className="border-bottom pb-2 mb-3">
              <InfoRow label="Hành động">{humanize(log.action)}</InfoRow>
              <InfoRow label="Module">{humanize(log.module)}</InfoRow>
              <InfoRow label="Đối tượng">{humanize(log.entityType)}</InfoRow>
              <InfoRow label="Entity Id">{log.entityId}</InfoRow>
              <InfoRow label="Người thực hiện">
                {log.actorName}
                {log.actorCode ? ` (${log.actorCode})` : ''}
              </InfoRow>
              {log.affectedUserId && (
                <InfoRow label="Người bị tác động">{log.affectedUserName ?? log.affectedUserId}</InfoRow>
              )}
              <InfoRow label="IP Address">{log.ipAddress ?? '-'}</InfoRow>
              <InfoRow label="User Agent">{log.userAgent ?? '-'}</InfoRow>
              <InfoRow label="Correlation Id">{log.correlationId}</InfoRow>
            </div>

            <h6 className="fw-semibold">Dữ liệu thay đổi</h6>
            <CRow className="g-2 mb-3">
              <CCol xs={6}>
                <ValueBox title="Old Values" json={log.oldValues} />
              </CCol>
              <CCol xs={6}>
                <ValueBox title="New Values" json={log.newValues} />
              </CCol>
            </CRow>

            <h6 className="fw-semibold">Mô tả</h6>
            <p className="small text-body-secondary mb-0">{log.description}</p>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
