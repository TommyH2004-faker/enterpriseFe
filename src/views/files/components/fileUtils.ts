import type { TaskAttachmentResponse } from 'src/types/TaskDetailType/attachment'

export const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value))

export const getFileType = (file: TaskAttachmentResponse) => {
  const contentType = file.contentType.toLowerCase()
  if (contentType.includes('pdf')) return { label: 'PDF', color: 'danger' as const }
  if (contentType.includes('image')) return { label: 'Ảnh', color: 'info' as const }
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) return { label: 'Excel', color: 'success' as const }
  if (contentType.includes('word') || contentType.includes('document')) return { label: 'Tài liệu', color: 'primary' as const }
  if (contentType.includes('zip') || contentType.includes('archive')) return { label: 'Lưu trữ', color: 'secondary' as const }
  return { label: contentType.split('/')[1]?.toUpperCase() || 'File', color: 'dark' as const }
}
