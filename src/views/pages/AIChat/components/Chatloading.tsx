export default function ChatLoading() {
  return (
    <div className="aicw-loading" role="status" aria-live="polite">
      <span className="aicw-loading__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>Đang tìm dữ liệu và soạn câu trả lời…</span>
    </div>
  )
}