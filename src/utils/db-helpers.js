export async function fetchCategories() {
  return window.api.categories.getAll()
}

export async function fetchItems() {
  return window.api.items.getAll()
}

export async function fetchOrders(filters) {
  return window.api.orders.getAll(filters)
}

export async function fetchTodayStats() {
  return window.api.orders.getTodayStats()
}
