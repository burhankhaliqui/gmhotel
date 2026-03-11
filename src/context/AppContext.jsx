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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCategories = useCallback(async () => {
    try {
      if (!window.api) { console.error('API not ready when loading categories'); return }
      const result = await window.api.categories.getAll()
      if (result && result.success) setCategories(result.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
      setCategories([])
    }
  }, [])

  const loadItems = useCallback(async () => {
    try {
      if (!window.api) { console.error('API not ready when loading items'); return }
      const result = await window.api.items.getAll()
      if (result && result.success) setItems(result.data || [])
    } catch (err) {
      console.error('Failed to load items:', err)
      setItems([])
    }
  }, [])

  const loadTables = useCallback(async () => {
    try {
      if (!window.api) { console.error('API not ready when loading tables'); return }
      const result = await window.api.tables.getAll()
      if (result && result.success) setTables(result.data || [])
    } catch (err) {
      console.error('Failed to load tables:', err)
      setTables([])
    }
  }, [])

  const loadWaiters = useCallback(async () => {
    try {
      if (!window.api) { console.error('API not ready when loading waiters'); return }
      const result = await window.api.waiters.getAll()
      if (result && result.success) setWaiters(result.data || [])
    } catch (err) {
      console.error('Failed to load waiters:', err)
      setWaiters([])
    }
  }, [])

  const loadDeliveryBoys = useCallback(async () => {
    try {
      if (!window.api) { console.error('API not ready when loading delivery boys'); return }
      const result = await window.api.deliveryBoys.getAll()
      if (result && result.success) setDeliveryBoys(result.data || [])
    } catch (err) {
      console.error('Failed to load delivery boys:', err)
      setDeliveryBoys([])
    }
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      if (!window.api) { console.error('API not ready when loading settings'); return }
      const result = await window.api.settings.get()
      if (result && result.success) setSettings(result.data || {})
    } catch (err) {
      console.error('Failed to load settings:', err)
      setSettings({})
    }
  }, [])

  const loadOrders = useCallback(async (filters) => {
    try {
      if (!window.api) { console.error('API not ready when loading orders'); return { success: false } }
      const result = await window.api.orders.getAll(filters)
      if (result && result.success) setOrders(result.data || [])
      return result
    } catch (err) {
      console.error('Failed to load orders:', err)
      setOrders([])
      return { success: false }
    }
  }, [])

  const loadTodayStats = useCallback(async () => {
    try {
      if (!window.api) { console.error('API not ready when loading today stats'); return }
      const result = await window.api.orders.getTodayStats()
      if (result && result.success) setTodayStats(result.data)
    } catch (err) {
      console.error('Failed to load today stats:', err)
      setTodayStats(null)
    }
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!window.api) {
        throw new Error('Electron API not available')
      }
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
    } catch (err) {
      console.error('Init error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [loadCategories, loadItems, loadTables, loadWaiters, loadDeliveryBoys, loadSettings, loadOrders, loadTodayStats])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <AppContext.Provider value={{
      categories, items, tables, waiters, deliveryBoys, settings, orders, todayStats, loading, error,
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
