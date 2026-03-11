export function formatCurrency(amount, currency = 'PKR') {
  const num = Number(amount || 0)
  return `${currency} ${num.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function formatTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('en-PK', {
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export function monthString(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function getStatusLabel(status) {
  const map = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return map[status] || status
}

export function getOrderTypeLabel(type) {
  const map = {
    dine_in: 'Dine In',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
  }
  return map[type] || type
}

export function fileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
