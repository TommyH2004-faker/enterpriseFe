const timeFmt = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' })
const fullFmt = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
})

function toDate(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** Giờ nếu là hôm nay, ngược lại là giờ kèm ngày. */
export function formatMessageTime(value?: string | null): string {
  const d = toDate(value)
  if (!d) return ''
  return sameDay(d, new Date()) ? timeFmt.format(d) : fullFmt.format(d)
}

/** Giờ nếu hôm nay, ngược lại là ngày/tháng. */
export function formatSidebarTime(value?: string | null): string {
  const d = toDate(value)
  if (!d) return ''
  return sameDay(d, new Date()) ? timeFmt.format(d) : dateFmt.format(d)
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}