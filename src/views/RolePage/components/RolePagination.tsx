import React, { useMemo } from 'react'
import {
  CCardBody,
  CCol,
  CPagination,
  CPaginationItem,
  CRow,
} from '@coreui/react'
import type { RoleListResponse } from 'src/types/role'
import { ROLE_MESSAGES } from '../contants/RoleConstants'


interface RolePaginationProps {
  pagination: RoleListResponse
  pageNumber: number
  pageSize: number
  totalRoles: number
  onPageChange: (page: number) => void
}

/**
 * Component hiển thị pagination controls
 */
const RolePagination: React.FC<RolePaginationProps> = ({
  pagination,
  pageNumber,
  pageSize,
  totalRoles,
  onPageChange,
}) => {
  // =========================================================
  // VISIBLE PAGES
  // =========================================================

  const visiblePages = useMemo(() => {
    const pages: number[] = []
    const totalPages = pagination.totalPages

    const start = Math.max(1, pageNumber - 2)
    const end = Math.min(totalPages, pageNumber + 2)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }, [pageNumber, pagination.totalPages])

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <CCardBody className="border-top py-3">
      <CRow className="align-items-center">
        <CCol md={6} className="mb-3 mb-md-0">
          <span className="text-body-secondary small">
            {ROLE_MESSAGES.PAGINATION_SHOWING
              .replace(
                '{start}',
                ((pageNumber - 1) * pageSize + 1).toString()
              )
              .replace(
                '{end}',
                Math.min(pageNumber * pageSize, totalRoles).toString()
              )
              .replace('{total}', totalRoles.toString())}
          </span>
        </CCol>

        <CCol md={6} className="d-flex justify-content-md-end">
          <CPagination
            aria-label="Role pagination"
            className="mb-0"
          >
            <CPaginationItem
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                onPageChange(Math.max(1, pageNumber - 1))
              }
            >
              {ROLE_MESSAGES.PAGINATION_PREV}
            </CPaginationItem>

            {visiblePages.map((page) => (
              <CPaginationItem
                key={page}
                active={page === pageNumber}
                onClick={() => onPageChange(page)}
              >
                {page}
              </CPaginationItem>
            ))}

            <CPaginationItem
              disabled={!pagination.hasNextPage}
              onClick={() =>
                onPageChange(
                  Math.min(
                    pagination.totalPages,
                    pageNumber + 1
                  )
                )
              }
            >
              {ROLE_MESSAGES.PAGINATION_NEXT}
            </CPaginationItem>
          </CPagination>
        </CCol>
      </CRow>
    </CCardBody>
  )
}

export default RolePagination