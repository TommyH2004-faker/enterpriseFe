import { SelectOption } from "src/types/activityLog"


const pad = (n: number) => String(n).padStart(2, '0')

/** Backend lưu UTC. Nếu chuỗi thiếu Z/offset thì coi là UTC để không lệch múi giờ. */
export function parseUtc(iso: string): Date {
  const hasTz = /(Z|[+-]\d{2}:?\d{2})$/i.test(iso)
  return new Date(hasTz ? iso : `${iso}Z`)
}

export function formatDateTime(iso: string, withSeconds = true): string {
  const d = parseUtc(iso)
  if (Number.isNaN(d.getTime())) return iso
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}${withSeconds ? `:${pad(d.getSeconds())}` : ''}`
  return `${date} ${time}`
}

const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Ngày đầu - cuối tháng hiện tại, dạng yyyy-MM-dd */
export function getCurrentMonthRange() {
  const now = new Date()
  return {
    fromDate: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    toDate: toDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

/** yyyy-MM-dd (giờ địa phương) -> thời điểm UTC đầu ngày */
export function startOfDayUtc(date?: string): string | undefined {
  if (!date) return undefined
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString()
}

/** yyyy-MM-dd (giờ địa phương) -> thời điểm UTC cuối ngày */
export function endOfDayUtc(date?: string): string | undefined {
  if (!date) return undefined
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString()
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function formatNumber(value?: number): string {
  return value === undefined ? '—' : value.toLocaleString('en-US')
}

export function prettyJson(value: string | null): string | null {
  if (!value) return null
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

export function getErrorMessage(error: unknown): string {
  const e = error as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message ?? e?.message ?? 'Đã xảy ra lỗi, vui lòng thử lại.'
}

/** Guid -> 8 ký tự đầu để hiển thị gọn */
export function shortId(id?: string | null): string {
  return id ? id.slice(0, 8) : '-'
}

/** "ChangeDepartment" -> "Change Department" */
export function humanize(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

export function toOptions(values: string[] = []): SelectOption[] {
  return values.map((v) => ({ value: v, label: humanize(v) }))
}

/** Lấy n mục lớn nhất của dictionary thống kê */
export function topEntries(record: Record<string, number> | undefined, n: number) {
  return Object.entries(record ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, value]) => ({ label: humanize(label), value }))
}

export type Tone = 'success' | 'danger' | 'primary' | 'info' | 'warning' | 'secondary'

/** Đoán màu theo tên hành động (enum có thể có rất nhiều giá trị). */
export function getActionColor(action: string): Tone {
  if (/^(create|add|assign|grant|approve|activate)/i.test(action)) return 'success'
  if (/(delete|remove|revoke|lock|deactivate|reject)/i.test(action)) return 'danger'
  return 'primary'
}
