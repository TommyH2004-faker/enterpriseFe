import React from "react";
import { CFormSelect, CPagination, CPaginationItem } from "@coreui/react";
import { PaginationData } from "../../types/Department";
interface Props {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
const DepartmentPagination: React.FC<Props> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
}) => (
  <div className="d-flex flex-wrap justify-content-between align-items-center px-4 py-3 border-top bg-white gap-3">
    <div className="d-flex align-items-center gap-2 text-muted small">
      <span>Hiển thị</span>
      <CFormSelect
        size="sm"
        style={{ width: "75px" }}
        value={pagination.pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </CFormSelect>
      <span>
        của {pagination.totalCount} phòng ban (Trang {pagination.pageNumber}/
        {pagination.totalPages})
      </span>
    </div>
    <CPagination size="sm" className="mb-0">
      <CPaginationItem
        disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.pageNumber - 1)}
      >
        Previous
      </CPaginationItem>
      {Array.from(
        { length: Math.min(pagination.totalPages, 5) },
        (_, index) => pagination.pageNumber - 2 + index,
      )
        .filter((page) => page > 0 && page <= pagination.totalPages)
        .map((page) => (
          <CPaginationItem
            key={page}
            active={page === pagination.pageNumber}
            onClick={() => onPageChange(page)}
          >
            {page}
          </CPaginationItem>
        ))}
      <CPaginationItem
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.pageNumber + 1)}
      >
        Next
      </CPaginationItem>
    </CPagination>
  </div>
);
export default DepartmentPagination;
