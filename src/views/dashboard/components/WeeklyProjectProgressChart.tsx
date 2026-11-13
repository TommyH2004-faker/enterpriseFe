import React, { useMemo, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CProgress,
  CRow,
  CSpinner,
} from '@coreui/react'
import { CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilBarChart,
  cilCalendar,
  cilCheckCircle,
  cilFilter,
  cilPlus,
  cilReload,
  cilSpeedometer,
} from '@coreui/icons'
import { DashboardWeeklyTrendResponse } from 'src/types/dashboard'
import ChartEmpty from './ChartEmpty'

interface Props {
  data: DashboardWeeklyTrendResponse | null
  loading: boolean
  error?: string | null
  fromDate?: string
  toDate?: string
  onDateRangeChange: (fromDate?: string, toDate?: string) => void
  onRetry?: () => void
}

type PresetType = '4weeks' | '7days' | '30days' | 'thisMonth' | 'custom'

const formatDateForInput = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const WeeklyProjectProgressChart: React.FC<Props> = ({
  data,
  loading,
  error,
  fromDate,
  toDate,
  onDateRangeChange,
  onRetry,
}) => {
  const [activePreset, setActivePreset] = useState<PresetType>('4weeks')
  const [localFromDate, setLocalFromDate] = useState<string>(fromDate || '')
  const [localToDate, setLocalToDate] = useState<string>(toDate || '')
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)

  // Xử lý các nút chọn nhanh thời gian (Quick Presets)
  const handleSelectPreset = (preset: PresetType) => {
    setActivePreset(preset)
    const now = new Date()

    if (preset === '4weeks') {
      setLocalFromDate('')
      setLocalToDate('')
      setShowDatePicker(false)
      onDateRangeChange(undefined, undefined)
      return
    }

    if (preset === '7days') {
      const past7 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      const f = formatDateForInput(past7)
      const t = formatDateForInput(now)
      setLocalFromDate(f)
      setLocalToDate(t)
      setShowDatePicker(false)
      onDateRangeChange(f, t)
      return
    }

    if (preset === '30days') {
      const past30 = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
      const f = formatDateForInput(past30)
      const t = formatDateForInput(now)
      setLocalFromDate(f)
      setLocalToDate(t)
      setShowDatePicker(false)
      onDateRangeChange(f, t)
      return
    }

    if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const f = formatDateForInput(firstDay)
      const t = formatDateForInput(now)
      setLocalFromDate(f)
      setLocalToDate(t)
      setShowDatePicker(false)
      onDateRangeChange(f, t)
      return
    }

    if (preset === 'custom') {
      setShowDatePicker(true)
    }
  }

  // Áp dụng khoảng thời gian tùy chọn
  const handleApplyCustomDates = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!localFromDate || !localToDate) return
    setActivePreset('custom')
    onDateRangeChange(localFromDate, localToDate)
  }

  // Đặt lại về mặc định
  const handleResetFilter = () => {
    handleSelectPreset('4weeks')
  }

  // Dữ liệu biểu đồ cột
  const chartData = useMemo(() => {
    if (!data || !data.weeks || data.weeks.length === 0) return null

    const labels = data.weeks.map((w) => w.weekLabel)
    const createdData = data.weeks.map((w) => w.tasksCreated)
    const completedData = data.weeks.map((w) => w.tasksCompleted)
    const inProgressData = data.weeks.map((w) => w.tasksInProgress)

    return {
      labels,
      datasets: [
        {
          label: 'Đã hoàn thành',
          backgroundColor: '#10B981',
          hoverBackgroundColor: '#059669',
          borderRadius: 8,
          barPercentage: 0.75,
          categoryPercentage: 0.65,
          data: completedData,
        },
        {
          label: 'Tạo mới',
          backgroundColor: '#4F46E5',
          hoverBackgroundColor: '#4338CA',
          borderRadius: 8,
          barPercentage: 0.75,
          categoryPercentage: 0.65,
          data: createdData,
        },
        {
          label: 'Đang thực hiện',
          backgroundColor: '#F59E0B',
          hoverBackgroundColor: '#D97706',
          borderRadius: 8,
          barPercentage: 0.75,
          categoryPercentage: 0.65,
          data: inProgressData,
        },
      ],
    }
  }, [data])

  const maxTaskCount = useMemo(() => {
    if (!data?.weeks) return 10
    const max = Math.max(
      ...data.weeks.flatMap((w) => [w.tasksCreated, w.tasksCompleted, w.tasksInProgress]),
      0,
    )
    return Math.max(max + 2, 5)
  }, [data])

  return (
    <CCard
      className="border-0 rounded-4 overflow-hidden"
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        background: '#ffffff',
      }}
    >
      <CCardBody className="p-4">
        {/* ==================== 1. HEADER ROW ==================== */}
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-4">
          {/* Title & Icon lớn rực rỡ */}
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
              }}
            >
              <CIcon icon={cilBarChart} size="xxl" style={{ width: 30, height: 30 }} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                  Tiến độ công việc theo thời gian
                </h5>
                <CBadge
                  color="light"
                  className="text-primary border border-primary border-opacity-25 px-2 py-1 fw-semibold small"
                >
                  Biểu đồ cột
                </CBadge>
              </div>
              <div className="text-muted small mt-1">
                Theo dõi và so sánh số lượng công việc tạo mới, đã hoàn thành và đang thực hiện
              </div>
            </div>
          </div>

          {/* Quick Segmented Control / Presets */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div
              className="d-inline-flex p-1 bg-light rounded-pill border"
              style={{ gap: '2px' }}
            >
              <button
                type="button"
                className={`btn btn-sm px-3 rounded-pill fw-semibold transition-all ${
                  activePreset === '4weeks'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary border-0 bg-transparent'
                }`}
                style={{ fontSize: '0.825rem' }}
                onClick={() => handleSelectPreset('4weeks')}
              >
                4 tuần gần nhất
              </button>
              <button
                type="button"
                className={`btn btn-sm px-3 rounded-pill fw-semibold transition-all ${
                  activePreset === '7days'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary border-0 bg-transparent'
                }`}
                style={{ fontSize: '0.825rem' }}
                onClick={() => handleSelectPreset('7days')}
              >
                7 ngày qua
              </button>
              <button
                type="button"
                className={`btn btn-sm px-3 rounded-pill fw-semibold transition-all ${
                  activePreset === '30days'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary border-0 bg-transparent'
                }`}
                style={{ fontSize: '0.825rem' }}
                onClick={() => handleSelectPreset('30days')}
              >
                30 ngày qua
              </button>
              <button
                type="button"
                className={`btn btn-sm px-3 rounded-pill fw-semibold transition-all ${
                  activePreset === 'thisMonth'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary border-0 bg-transparent'
                }`}
                style={{ fontSize: '0.825rem' }}
                onClick={() => handleSelectPreset('thisMonth')}
              >
                Tháng này
              </button>
              <button
                type="button"
                className={`btn btn-sm px-3 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 transition-all ${
                  activePreset === 'custom' || showDatePicker
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary border-0 bg-transparent'
                }`}
                style={{ fontSize: '0.825rem' }}
                onClick={() => {
                  setShowDatePicker(!showDatePicker)
                  if (!showDatePicker) setActivePreset('custom')
                }}
              >
                <CIcon icon={cilCalendar} size="sm" />
                Tùy chọn
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 2. CUSTOM DATE PICKER BAR (IF EXPANDED) ==================== */}
        {showDatePicker && (
          <form
            onSubmit={handleApplyCustomDates}
            className="p-3 mb-4 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-3"
            style={{ background: '#f8fafc' }}
          >
            <div className="d-flex align-items-center gap-2 text-muted small fw-semibold">
              <CIcon icon={cilFilter} className="text-primary" size="lg" />
              <span>Khoảng thời gian thống kê:</span>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="d-flex align-items-center gap-1">
                <span className="small text-muted">Từ:</span>
                <CFormInput
                  type="date"
                  size="sm"
                  value={localFromDate}
                  onChange={(e) => setLocalFromDate(e.target.value)}
                  style={{ width: 145 }}
                  className="rounded-2"
                  required
                />
              </div>

              <div className="d-flex align-items-center gap-1">
                <span className="small text-muted">Đến:</span>
                <CFormInput
                  type="date"
                  size="sm"
                  value={localToDate}
                  onChange={(e) => setLocalToDate(e.target.value)}
                  style={{ width: 145 }}
                  className="rounded-2"
                  required
                />
              </div>

              <CButton
                type="submit"
                color="primary"
                size="sm"
                className="px-3 rounded-2 fw-semibold d-inline-flex align-items-center gap-1"
                disabled={loading}
              >
                {loading ? <CSpinner size="sm" /> : (
                  <>
                    <CIcon icon={cilFilter} size="sm" />
                    Áp dụng
                  </>
                )}
              </CButton>
              <CButton
                type="button"
                color="light"
                size="sm"
                variant="outline"
                className="rounded-2 d-inline-flex align-items-center gap-1"
                onClick={handleResetFilter}
                disabled={loading}
              >
                <CIcon icon={cilReload} size="sm" />
                Mặc định
              </CButton>
            </div>
          </form>
        )}

        {/* ==================== 3. THREE HERO KPI STAT CARDS ==================== */}
        {data && (
          <CRow className="g-3 mb-4">
            {/* Card 1: Tạo mới */}
            <CCol xs={12} md={4}>
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between border"
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)',
                  borderColor: '#dbeafe',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 48,
                      height: 48,
                      background: 'rgba(79, 70, 229, 0.12)',
                      color: '#4f46e5',
                    }}
                  >
                    <CIcon icon={cilPlus} size="xl" style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Công việc tạo mới
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>
                      {data.totalTasksCreated.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <CBadge color="info" className="px-2 py-1 rounded-pill">
                  Đầu vào
                </CBadge>
              </div>
            </CCol>

            {/* Card 2: Hoàn thành */}
            <CCol xs={12} md={4}>
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between border"
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #ecfdf5 100%)',
                  borderColor: '#a7f3d0',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 48,
                      height: 48,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#059669',
                    }}
                  >
                    <CIcon icon={cilCheckCircle} size="xl" style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Đã hoàn thành
                    </div>
                    <div className="fw-bold text-success" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>
                      {data.totalTasksCompleted.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <CBadge color="success" className="px-2 py-1 rounded-pill text-white">
                  Đã giải quyết
                </CBadge>
              </div>
            </CCol>

            {/* Card 3: Tỷ lệ hoàn thành */}
            <CCol xs={12} md={4}>
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between border"
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
                  borderColor: '#e9d5ff',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 48,
                      height: 48,
                      background: 'rgba(124, 58, 237, 0.12)',
                      color: '#7c3aed',
                    }}
                  >
                    <CIcon icon={cilSpeedometer} size="xl" style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Hiệu suất hoàn thành
                    </div>
                    <div className="fw-bold text-primary" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>
                      {data.averageCompletionRate}%
                    </div>
                  </div>
                </div>
                <CBadge
                  color={
                    data.averageCompletionRate >= 80
                      ? 'success'
                      : data.averageCompletionRate >= 50
                      ? 'info'
                      : 'warning'
                  }
                  className="px-2 py-1 rounded-pill"
                >
                  {data.averageCompletionRate >= 80 ? 'Xuất sắc' : data.averageCompletionRate >= 50 ? 'Khá' : 'Cần cải thiện'}
                </CBadge>
              </div>
            </CCol>
          </CRow>
        )}

        {/* ==================== 4. MAIN COLUMN BAR CHART ==================== */}
        {loading ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center py-5 text-muted gap-2 rounded-3 bg-light"
            style={{ minHeight: 280 }}
          >
            <CSpinner color="primary" />
            <div className="small fw-semibold">Đang tổng hợp dữ liệu tiến độ...</div>
          </div>
        ) : error ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center py-5 text-center text-danger gap-2 rounded-3 bg-light"
            style={{ minHeight: 280 }}
          >
            <div className="fw-semibold">{error}</div>
            {onRetry && (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill d-inline-flex align-items-center gap-1 mt-2 px-3"
                onClick={onRetry}
              >
                <CIcon icon={cilReload} size="sm" />
                Thử lại
              </button>
            )}
          </div>
        ) : chartData ? (
          <>
            <div style={{ height: 280 }} className="mb-4">
              <CChartBar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        boxHeight: 8,
                        font: {
                          size: 12,
                          weight: 'bold',
                        },
                      },
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      padding: 12,
                      cornerRadius: 8,
                      callbacks: {
                        afterBody: (context: any) => {
                          const index = context[0]?.dataIndex
                          if (index !== undefined && data?.weeks[index]) {
                            const w = data.weeks[index]
                            return `\nTỷ lệ hoàn thành: ${w.completionRate}%`
                          }
                          return ''
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 11,
                          weight: '600',
                        },
                        color: '#64748b',
                      },
                    },
                    y: {
                      beginAtZero: true,
                      suggestedMax: maxTaskCount,
                      grid: {
                        color: 'rgba(226, 232, 240, 0.6)',
                      },
                      ticks: {
                        precision: 0,
                        color: '#64748b',
                      },
                    },
                  },
                }}
              />
            </div>

            {/* ==================== 5. COMPACT TIMELINE BREAKDOWN ==================== */}
            <div className="pt-3 border-top">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-uppercase fw-bold text-muted" style={{ letterSpacing: '0.04em' }}>
                  Chi tiết từng mốc thời gian
                </span>
                {fromDate && toDate && (
                  <span className="small text-muted d-inline-flex align-items-center">
                    <span className="me-1">Thời gian:</span>
                    <strong className="text-dark">{fromDate}</strong>
                    <CIcon icon={cilArrowRight} size="sm" className="mx-1 text-muted" />
                    <strong className="text-dark">{toDate}</strong>
                  </span>
                )}
              </div>

              <CRow className="g-3">
                {data?.weeks.map((week) => (
                  <CCol
                    sm={6}
                    lg={data.weeks.length <= 4 ? 3 : data.weeks.length <= 6 ? 2 : 3}
                    key={week.weekNumber}
                  >
                    <div
                      className="p-3 rounded-3 border h-100 transition-all hover-shadow"
                      style={{
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark small text-truncate d-inline-flex align-items-center" title={week.weekLabel}>
                          <CIcon icon={cilCalendar} size="sm" className="text-primary me-1 flex-shrink-0" />
                          {week.weekLabel}
                        </span>
                        <span
                          className={`badge rounded-pill ${
                            week.completionRate >= 80
                              ? 'bg-success text-white'
                              : week.completionRate >= 50
                              ? 'bg-info text-dark'
                              : 'bg-warning text-dark'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {week.completionRate}%
                        </span>
                      </div>

                      <div className="d-flex justify-content-between small text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                        <span>
                          Tạo: <strong className="text-dark">{week.tasksCreated}</strong>
                        </span>
                        <span>
                          Xong: <strong className="text-success">{week.tasksCompleted}</strong>
                        </span>
                        <span>
                          Làm: <strong className="text-warning">{week.tasksInProgress}</strong>
                        </span>
                      </div>

                      <CProgress
                        value={week.completionRate}
                        color={
                          week.completionRate >= 80
                            ? 'success'
                            : week.completionRate >= 50
                            ? 'info'
                            : 'warning'
                        }
                        height={6}
                        className="rounded-pill"
                      />
                    </div>
                  </CCol>
                ))}
              </CRow>
            </div>
          </>
        ) : (
          <ChartEmpty />
        )}
      </CCardBody>
    </CCard>
  )
}

export default WeeklyProjectProgressChart
