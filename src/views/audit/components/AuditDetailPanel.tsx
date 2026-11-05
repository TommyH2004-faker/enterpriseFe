import type { ReactNode } from 'react'
import {
  CCol,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

import auditLogService from 'src/services/auditLogService'
import {
  formatDateTime,
  humanize,
  prettyJson,
} from 'src/views/activities/utils/logHelpers'
import { useAsync } from 'src/views/activities/hooks/useAsync'
import { ActionBadge } from 'src/views/activities/common/Badges'
import ToastAlert from 'src/components/ToastAlert'

interface Props {
  logId: string
  onClose: () => void
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="d-flex gap-2 py-2 small border-bottom">
      <span
        className="text-body-secondary flex-shrink-0"
        style={{ width: 140 }}
      >
        {label}
      </span>
      <span className="text-break">{children}</span>
    </div>
  )
}

function ValueBox({
  title,
  json,
}: {
  title: string
  json: string | null
}) {
  const text = prettyJson(json)

  return (
    <div
      className="bg-body-tertiary rounded p-3 h-100"
      style={{ minHeight: 150 }}
    >
      <div className="small fw-semibold mb-2">{title}</div>

      {text ? (
        <pre
          className="small mb-0"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {text}
        </pre>
      ) : (
        <div className="small text-body-secondary">
          Không có dữ liệu
        </div>
      )}
    </div>
  )
}

export default function AuditDetailPanel({ logId, onClose }: Props) {
  const {
    data: log,
    loading,
    error,
  } = useAsync(
    () => auditLogService.getAuditLogDetail(logId),
    [logId],
  )

  return (
    <CModal
      visible
      onClose={onClose}
      alignment="center"
      size="xl"
      scrollable
      backdrop="static"
      aria-labelledby="audit-detail-modal-title"
    >
      <CModalHeader>
        <CModalTitle id="audit-detail-modal-title">
          Chi tiết nhật ký kiểm toán
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {loading && (
          <div className="text-center py-5">
            <CSpinner />
            <div className="small text-body-secondary mt-2">
              Đang tải chi tiết nhật ký...
            </div>
          </div>
        )}

        <ToastAlert message={error} />

        {!loading && !error && log && (
          <>
            <div className="d-flex flex-wrap align-items-center gap-2 text-body-secondary mb-4">
              <ActionBadge action={log.action} />

              <span className="small">
                {formatDateTime(log.createdAt)}
              </span>

              <span className="small">·</span>

              <span className="small">
                {log.actorName || 'Không xác định'}
              </span>
            </div>

            <h6 className="fw-semibold mb-3">
              Thông tin chung
            </h6>

            <div className="mb-4">
              <InfoRow label="Hành động">
                {humanize(log.action)}
              </InfoRow>

              <InfoRow label="Module">
                {humanize(log.module)}
              </InfoRow>

              <InfoRow label="Đối tượng">
                {humanize(log.entityType)}
              </InfoRow>

              <InfoRow label="Entity ID">
                {log.entityId || '-'}
              </InfoRow>

              <InfoRow label="Người thực hiện">
                {log.actorName || 'Không xác định'}
                {log.actorCode ? ` (${log.actorCode})` : ''}
              </InfoRow>
                <InfoRow label="User Agent">
                  {log.userAgent || '-'}
                </InfoRow>
              
              <InfoRow label="IP Address">
                {log.ipAddress || '-'}
              </InfoRow>

             

             
            </div>

            <h6 className="fw-semibold mb-3">
              Dữ liệu thay đổi
            </h6>

            <CRow className="g-3 mb-4">
              <CCol xs={12} md={6}>
                <ValueBox
                  title="Old Values"
                  json={log.oldValues}
                />
              </CCol>

              <CCol xs={12} md={6}>
                <ValueBox
                  title="New Values"
                  json={log.newValues}
                />
              </CCol>
            </CRow>

            <h6 className="fw-semibold mb-2">Mô tả</h6>

            <p className="small mb-0 text-body-secondary text-break">
              {log.description || '-'}
            </p>
          </>
        )}
      </CModalBody>
    </CModal>
  )
}
