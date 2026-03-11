export const ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
]

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'processing', label: 'Processing', color: 'secondary' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
]

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'online', label: 'Online' },
]

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'cashier', label: 'Cashier' },
]

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const CATEGORY_COLORS = [
  '#dc2626', '#d97706', '#7c3aed', '#059669',
  '#0284c7', '#0891b2', '#db2777', '#1e40af',
  '#65a30d', '#9333ea', '#c2410c', '#0f766e',
]
