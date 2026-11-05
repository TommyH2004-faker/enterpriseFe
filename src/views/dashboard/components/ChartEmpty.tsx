import { FC } from 'react'

const ChartEmpty: FC = () => (
  <div
    className="d-flex align-items-center justify-content-center text-body-secondary"
    style={{ minHeight: 280 }}
  >
    Chưa có dữ liệu công việc để hiển thị.
  </div>
)

export default ChartEmpty