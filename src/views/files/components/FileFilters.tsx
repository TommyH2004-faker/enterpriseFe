import React from 'react'
import { CCard, CCardBody, CFormInput, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

type SortBy = 'UploadedAt' | 'OriginalFileName' | 'FileSize'

interface FileFiltersProps {
  keyword: string
  contentType: string
  sortBy: SortBy
  sortDirection: 'asc' | 'desc'
  onKeywordChange: (value: string) => void
  onContentTypeChange: (value: string) => void
  onSortByChange: (value: SortBy) => void
  onSortDirectionChange: (value: 'asc' | 'desc') => void
}

const FileFilters: React.FC<FileFiltersProps> = ({
  keyword,
  contentType,
  sortBy,
  sortDirection,
  onKeywordChange,
  onContentTypeChange,
  onSortByChange,
  onSortDirectionChange,
}) => (
  <CCard className="border-0 shadow-sm mb-3">
    <CCardBody>
      <div className="row g-3 align-items-end">
        <div className="col-lg-5">
          <label className="form-label small fw-semibold">Tìm kiếm tệp</label>
          <div className="input-group">
            <span className="input-group-text bg-white"><CIcon icon={cilSearch} /></span>
            <CFormInput
              value={keyword}
              placeholder="Tên file, ví dụ: banchotblockchain.pdf"
              onChange={(event) => onKeywordChange(event.target.value)}
            />
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <label className="form-label small fw-semibold">Loại tệp</label>
          <CFormSelect value={contentType} onChange={(event) => onContentTypeChange(event.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="application/pdf">PDF</option>
            <option value="image">Hình ảnh</option>
            <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word</option>
            <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel</option>
          </CFormSelect>
        </div>
        <div className="col-sm-6 col-lg-2">
          <label className="form-label small fw-semibold">Sắp xếp theo</label>
          <CFormSelect value={sortBy} onChange={(event) => onSortByChange(event.target.value as SortBy)}>
            <option value="UploadedAt">Ngày tải lên</option>
            <option value="OriginalFileName">Tên file</option>
            <option value="FileSize">Kích thước</option>
          </CFormSelect>
        </div>
        <div className="col-lg-2">
          <label className="form-label small fw-semibold">Thứ tự</label>
          <CFormSelect value={sortDirection} onChange={(event) => onSortDirectionChange(event.target.value as 'asc' | 'desc')}>
            <option value="desc">Mới nhất trước</option>
            <option value="asc">Cũ nhất trước</option>
          </CFormSelect>
        </div>
      </div>
    </CCardBody>
  </CCard>
)

export default FileFilters
