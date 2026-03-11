import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [tables, setTables] = useState([])
  const [waiters, setWaiters] = useState([])
  const [deliveryBoys, setDeliveryBoys] = useState([])
  const [settings, setSettings] = useState({})
  const [orders, setOrders] = useState([])
  const [todayStats, setTodayStats] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadCategories = useCallback(async () => {
    const result = await window.api.categories.getAll()
    if (result.success) setCategories(result.data)
  }, [])

  const loadItems = useCallback(async () => {
    const result = await window.api.items.getAll()
    if (result.success) setItems(result.data)
  }, [])

  const loadTables = useCallback(async () => {
    const result = await window.api.tables.getAll()
    if (result.success) setTables(result.data)
  }, [])

  const loadWaiters = useCallback(async () => {
    const result = await window.api.waiters.getAll()
    if (result.success) setWaiters(result.data)
  }, [])

  const loadDeliveryBoys = useCallback(async () => {
    const result = await window.api.deliveryBoys.getAll()
    if (result.success) setDeliveryBoys(result.data)
  }, [])

  const loadSettings = useCallback(async () => {
    const result = await window.api.settings.get()
    if (result.success) setSettings(result.data)
  }, [])

  const loadOrders = useCallback(async (filters) => {
    const result = await window.api.orders.getAll(filters)
    if (result.success) setOrders(result.data)
    return result
  }, [])

  const loadTodayStats = useCallback(async () => {
    const result = await window.api.orders.getTodayStats()
    if (result.success) setTodayStats(result.data)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      loadCategories(),
      loadItems(),
      loadTables(),
      loadWaiters(),
      loadDeliveryBoys(),
      loadSettings(),
      loadOrders(),
      loadTodayStats(),
    ])
    setLoading(false)
  }, [loadCategories, loadItems, loadTables, loadWaiters, loadDeliveryBoys, loadSettings, loadOrders, loadTodayStats])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <AppContext.Provider value={{
      categories, items, tables, waiters, deliveryBoys, settings, orders, todayStats, loading,
      loadCategories, loadItems, loadTables, loadWaiters, loadDeliveryBoys,
      loadSettings, loadOrders, loadTodayStats, loadAll,
      setSettings,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
