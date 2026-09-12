import React from "react";
import {
  CCol,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilGrid, cilList, cilSearch, cilSortAscending } from "@coreui/icons";

interface Props {
  searchName: string;
  sortOption: string;
  viewMode: "list" | "grid";
  onSearchNameChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onViewModeChange: (mode: "list" | "grid") => void;
}
const DepartmentFilters: React.FC<Props> = ({
  searchName,
  sortOption,
  viewMode,
  onSearchNameChange,
  onSortChange,
  onViewModeChange,
}) => (
  <CRow className="g-3 align-items-center mb-3">
    <CCol xs={12} md={4}>
      <CInputGroup>
        <CInputGroupText className="bg-white border-end-0">
          <CIcon icon={cilSearch} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          placeholder="Tìm kiếm tên phòng ban..."
          className="border-start-0 ps-0"
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
        />
      </CInputGroup>
    </CCol>
    <CCol xs={8} sm={5} md={4}>
      <CInputGroup>
        <CInputGroupText className="bg-white border-end-0 text-muted">
          <CIcon icon={cilSortAscending} />
        </CInputGroupText>
        <CFormSelect
          className="border-start-0"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name-asc">Tên (A-Z)</option>
          <option value="name-desc">Tên (Z-A)</option>
          <option value="code-asc">Mã phòng ban (A-Z)</option>
          <option value="code-desc">Mã phòng ban (Z-A)</option>
          <option value="date-new">Ngày tạo (Mới-Cũ)</option>
          <option value="date-old">Ngày tạo (Cũ-Mới)</option>
        </CFormSelect>
      </CInputGroup>
    </CCol>
    <CCol xs={4} sm={3} md="auto" className="ms-md-auto">
      <div className="btn-group border rounded p-1 bg-light">
        <button
          className={`btn btn-sm border-0 px-3 ${viewMode === "list" ? "bg-white shadow-sm" : "text-muted"}`}
          onClick={() => onViewModeChange("list")}
          title="Dạng danh sách"
        >
          <CIcon icon={cilList} />
        </button>
        <button
          className={`btn btn-sm border-0 px-3 ${viewMode === "grid" ? "bg-white shadow-sm" : "text-muted"}`}
          onClick={() => onViewModeChange("grid")}
          title="Dạng lưới"
        >
          <CIcon icon={cilGrid} />
        </button>
      </div>
    </CCol>
  </CRow>
);
export default DepartmentFilters;
