import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CBadge,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCheckCircle,
  cilCommentSquare,
  cilPaperclip,
  cilCalendar,
  cilUser,
  cilTags,
  cilAlignLeft,
  cilList,
  cilHistory,
  cilTrash,
  cilCloudUpload,
  cilX,
  cilTask,
  cilPlus,
} from '@coreui/icons'
import { Task } from '../../types'

interface TaskDetailModalProps {
  visible: boolean;
  onClose: () => void;
  task: Task | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ visible, onClose, task }) => {
  if (!task) return null

  return (
    <CModal visible={visible} onClose={onClose} size="xl" alignment="center">
      <CModalHeader className="border-bottom-0 pb-0">
        <CModalTitle className="d-flex align-items-start w-100 mt-2">
          <CIcon icon={cilTask} className="text-primary me-3 mt-1" size="xl" />
          <div className="flex-grow-1">
            <CFormInput 
              type="text" 
              defaultValue={task.content} 
              className="border-0 fw-bold fs-4 px-2 bg-transparent shadow-none p-0 mb-1" 
            />
            <div className="text-muted small px-2">#{task.id}</div>
          </div>
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="p-4 pt-3">
        <CRow>
          {/* LEFT PANEL 70% */}
          <CCol lg={8} className="pe-lg-4">
            
            {/* Description */}
            <div className="mb-5">
              <h6 className="fw-bold mb-3 d-flex align-items-center text-dark">
                <CIcon icon={cilAlignLeft} className="me-2 text-muted" /> Mô tả
              </h6>
              <div className="ms-4">
                <CFormTextarea 
                  rows={4} 
                  placeholder="Thêm mô tả chi tiết hơn về công việc này..." 
                  defaultValue={task.description}
                  className="bg-light border-0 shadow-none mb-2"
                />
                <div className="d-flex gap-2">
                  <CButton color="primary" size="sm">Lưu</CButton>
                  <CButton color="light" size="sm">Hủy</CButton>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="mb-5">
              <h6 className="fw-bold mb-3 d-flex align-items-center text-dark">
                <CIcon icon={cilList} className="me-2 text-muted" /> Danh sách kiểm tra
              </h6>
              <div className="ms-4">
                <div className="d-flex align-items-center mb-3">
                  <span className="small text-muted me-3" style={{ minWidth: '35px' }}>60%</span>
                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" role="progressbar" style={{ width: '60%' }} aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}></div>
                  </div>
                </div>
                
                <div className="list-group list-group-flush mb-3">
                  <div className="list-group-item d-flex align-items-center bg-transparent px-0 border-0 py-1">
                    <CFormCheck id="chk1" defaultChecked className="me-2 mt-0" />
                    <span className="text-decoration-line-through text-muted flex-grow-1">Phân tích yêu cầu</span>
                    <CIcon icon={cilTrash} className="text-muted cursor-pointer hover-text-danger" size="sm" />
                  </div>
                  <div className="list-group-item d-flex align-items-center bg-transparent px-0 border-0 py-1">
                    <CFormCheck id="chk2" defaultChecked className="me-2 mt-0" />
                    <span className="text-decoration-line-through text-muted flex-grow-1">Thiết kế Database Schema</span>
                    <CIcon icon={cilTrash} className="text-muted cursor-pointer hover-text-danger" size="sm" />
                  </div>
                  <div className="list-group-item d-flex align-items-center bg-transparent px-0 border-0 py-1">
                    <CFormCheck id="chk3" className="me-2 mt-0" />
                    <span className="text-dark flex-grow-1">Viết API đăng nhập</span>
                    <CIcon icon={cilTrash} className="text-muted cursor-pointer hover-text-danger" size="sm" />
                  </div>
                  <div className="list-group-item d-flex align-items-center bg-transparent px-0 border-0 py-1">
                    <CFormCheck id="chk4" className="me-2 mt-0" />
                    <span className="text-dark flex-grow-1">Tích hợp Frontend</span>
                    <CIcon icon={cilTrash} className="text-muted cursor-pointer hover-text-danger" size="sm" />
                  </div>
                </div>
                <CButton color="light" size="sm" className="fw-medium">Thêm mục</CButton>
              </div>
            </div>

            {/* Attachments */}
            <div className="mb-5">
              <h6 className="fw-bold mb-3 d-flex align-items-center text-dark">
                <CIcon icon={cilPaperclip} className="me-2 text-muted" /> Tệp đính kèm
              </h6>
              <div className="ms-4">
                {task.attachments > 0 && (
                  <div className="d-flex align-items-center p-2 border rounded mb-3 bg-light bg-opacity-50">
                    <div className="bg-danger text-white rounded p-2 me-3 d-flex align-items-center justify-content-center">
                      <span className="small fw-bold">PDF</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium text-dark small">Tài_liệu_phân_tích.pdf</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>2.4 MB • Thêm vào 2 ngày trước</div>
                    </div>
                    <CButton color="light" size="sm" className="bg-white border-0 shadow-sm text-primary">Tải xuống</CButton>
                  </div>
                )}
                
                <div className="border border-dashed rounded p-4 text-center cursor-pointer hover-bg-light transition-all" style={{ borderStyle: 'dashed' }}>
                  <CIcon icon={cilCloudUpload} size="xl" className="text-muted mb-2" />
                  <div className="small fw-medium text-dark">Kéo thả tệp hoặc click để tải lên</div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="mb-5">
              <h6 className="fw-bold mb-3 d-flex align-items-center text-dark">
                <CIcon icon={cilCommentSquare} className="me-2 text-muted" /> Bình luận
              </h6>
              <div className="ms-4">
                <div className="d-flex mb-4">
                  <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                    A
                  </div>
                  <div className="flex-grow-1">
                    <CFormTextarea rows={2} placeholder="Viết bình luận..." className="mb-2 bg-light border-0 shadow-none" />
                    <CButton color="primary" size="sm">Gửi</CButton>
                  </div>
                </div>
                
                <div className="d-flex mb-3">
                  <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                    B
                  </div>
                  <div className="flex-grow-1">
                    <div className="mb-1">
                      <strong className="text-dark me-2">Trần Thị B</strong>
                      <span className="text-muted" style={{ fontSize: '11px' }}>2 giờ trước</span>
                    </div>
                    <div className="bg-light p-3 rounded text-dark small">
                      Đã xem xét các yêu cầu, cần chốt lại phần API với backend nhé.
                    </div>
                    <div className="mt-1 d-flex gap-3">
                      <span className="text-muted small cursor-pointer hover-text-primary">👍 Thích</span>
                      <span className="text-muted small cursor-pointer hover-text-primary">💬 Trả lời</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <h6 className="fw-bold mb-3 d-flex align-items-center text-dark">
                <CIcon icon={cilHistory} className="me-2 text-muted" /> Lịch sử thay đổi
              </h6>
              <div className="ms-4 border-start border-2 ms-2 ps-3 py-1 position-relative">
                <div className="mb-3 position-relative">
                  <div className="position-absolute bg-secondary rounded-circle border border-2 border-white" style={{ width: '10px', height: '10px', left: '-21px', top: '5px' }}></div>
                  <div className="text-muted small">
                    <strong className="text-dark">Nguyễn Văn A</strong> thay đổi trạng thái từ 'Chưa bắt đầu' → 'Đang làm'
                    <div className="mt-1" style={{ fontSize: '11px' }}>1 giờ trước</div>
                  </div>
                </div>
                <div className="position-relative">
                  <div className="position-absolute bg-secondary rounded-circle border border-2 border-white" style={{ width: '10px', height: '10px', left: '-21px', top: '5px' }}></div>
                  <div className="text-muted small">
                    <strong className="text-dark">Trần Thị B</strong> thêm nhãn <CBadge color="danger">Khẩn cấp</CBadge>
                    <div className="mt-1" style={{ fontSize: '11px' }}>Hôm qua lúc 14:30</div>
                  </div>
                </div>
              </div>
            </div>

          </CCol>

          {/* RIGHT PANEL 30% */}
          <CCol lg={4} className="bg-light bg-opacity-50 p-4 rounded mt-4 mt-lg-0 border border-light">
            
            <div className="mb-4">
              <div className="small fw-bold text-muted mb-2">TRẠNG THÁI</div>
              <CFormSelect className="bg-white border-0 shadow-sm fw-medium" defaultValue="Đang làm">
                <option>Chưa bắt đầu</option>
                <option>Đang làm</option>
                <option>Đang review</option>
                <option>Hoàn thành</option>
              </CFormSelect>
            </div>

            <div className="mb-4">
              <div className="small fw-bold text-muted mb-2">ƯU TIÊN</div>
              <div className="d-flex flex-column gap-2 bg-white p-2 rounded shadow-sm">
                <CFormCheck type="radio" name="priority" id="prioLow" label={<span className="d-flex align-items-center"><span className="rounded-circle bg-info me-2" style={{ width: '8px', height: '8px' }}></span>Thấp</span>} />
                <CFormCheck type="radio" name="priority" id="prioMed" label={<span className="d-flex align-items-center"><span className="rounded-circle bg-warning me-2" style={{ width: '8px', height: '8px' }}></span>Trung bình</span>} />
                <CFormCheck type="radio" name="priority" id="prioHigh" label={<span className="d-flex align-items-center"><span className="rounded-circle bg-danger me-2" style={{ width: '8px', height: '8px' }}></span>Cao</span>} />
                <CFormCheck type="radio" name="priority" id="prioUrgent" label={<span className="d-flex align-items-center"><span className="rounded-circle me-2" style={{ width: '8px', height: '8px', backgroundColor: '#8A1515' }}></span>Khẩn cấp</span>} defaultChecked={task.priority === 'Khẩn cấp'} />
              </div>
            </div>

            <div className="mb-4">
              <div className="small fw-bold text-muted mb-2">NGƯỜI THỰC HIỆN</div>
              <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded shadow-sm border border-light">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                    {task.assignee.charAt(0)}
                  </div>
                  <span className="fw-medium text-dark">{task.assignee}</span>
                </div>
                <a href="#" className="small text-decoration-none">Chuyển giao</a>
              </div>
            </div>

            <div className="mb-4">
              <div className="small fw-bold text-muted mb-2">NGƯỜI BÁO CÁO</div>
              <div className="d-flex align-items-center p-2 bg-transparent">
                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                  T
                </div>
                <span className="text-dark fw-medium">Trần Thị B</span>
              </div>
            </div>

            <div className="mb-4 border-top pt-3">
              <div className="mb-3">
                <label className="small fw-bold text-muted mb-1 d-block">Ngày bắt đầu</label>
                <CFormInput type="date" className="bg-white border-0 shadow-sm form-control-sm" />
              </div>
              <div className="mb-3">
                <label className="small fw-bold text-muted mb-1 d-block">Ngày hạn</label>
                <CFormInput type="date" className={`bg-white border-0 shadow-sm form-control-sm ${task.isOverdue ? 'text-danger border-danger border border-1' : ''}`} defaultValue="2024-12-30" />
              </div>
              <div className="mb-3">
                <label className="small fw-bold text-muted mb-1 d-block">Thời gian dự kiến (giờ)</label>
                <CFormInput type="number" className="bg-white border-0 shadow-sm form-control-sm" defaultValue={16} />
              </div>
              <div className="mb-3">
                <label className="small fw-bold text-muted mb-1 d-block">Thời gian thực tế (giờ)</label>
                <CFormInput type="number" className="bg-white border-0 shadow-sm form-control-sm" defaultValue={8} />
              </div>
            </div>

            <div className="mb-4 border-top pt-3">
              <div className="small fw-bold text-muted mb-2">NHÃN</div>
              <div className="d-flex flex-wrap gap-2 mb-2 bg-white p-2 rounded shadow-sm border border-light">
                {task.labels && task.labels.map((label, idx) => (
                  <CBadge color={label.color} shape="rounded-pill" key={idx} className="d-flex align-items-center px-2 py-1">
                    {label.text} <CIcon icon={cilX} className="ms-1 cursor-pointer" size="sm" />
                  </CBadge>
                ))}
                <input type="text" className="border-0 bg-transparent flex-grow-1 small shadow-none" placeholder="Thêm nhãn mới..." style={{ outline: 'none', minWidth: '100px' }} />
              </div>
            </div>

            <div className="mb-4 border-top pt-3">
              <div className="small fw-bold text-muted mb-2">LIÊN KẾT</div>
              <a href="#" className="small text-decoration-none d-flex align-items-center p-2 border border-dashed rounded text-muted justify-content-center hover-bg-white transition-all">
                <CIcon icon={cilPlus} className="me-1" /> Liên kết công việc khác
              </a>
            </div>

          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  )
}

export default TaskDetailModal
