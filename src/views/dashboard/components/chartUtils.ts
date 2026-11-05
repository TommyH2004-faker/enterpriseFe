export interface ChartRow {
  key: string
  label: string
  count: number
}

/**
 * Chuyển dữ liệu API thành các dòng biểu đồ:
 * - Giữ thứ tự theo bảng nhãn đã biết, thiếu thì điền 0.
 * - Giá trị lạ từ backend (không có trong bảng nhãn) vẫn được hiển thị bằng key gốc.
 * - Danh sách API rỗng trả về mảng rỗng để hiển thị empty state.
 */
export const buildChartRows = (
  items: Array<{ key: string; count: number }>,
  labels: Record<string, string>,
): ChartRow[] => {
  if (items.length === 0) return []

  const countByKey = new Map<string, number>()
  items.forEach((item) => {
    countByKey.set(item.key, (countByKey.get(item.key) ?? 0) + item.count)
  })

  const known = Object.keys(labels).map((key) => ({
    key,
    label: labels[key],
    count: countByKey.get(key) ?? 0,
  }))

  const unknown = [...countByKey.keys()]
    .filter((key) => !(key in labels))
    .map((key) => ({ key, label: key, count: countByKey.get(key) ?? 0 }))

  return [...known, ...unknown]
}

export const hasAnyData = (rows: ChartRow[]): boolean =>
  rows.some((row) => row.count > 0)