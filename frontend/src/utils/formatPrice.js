
export function formatPrice(amount) {
  if (amount == null) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const STATUS_LABEL = {
  PENDING:   'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED:   'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
}

export const STATUS_CLASS = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  SHIPPED:   'badge-shipped',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
}
