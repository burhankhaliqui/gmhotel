import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './shared/Navbar'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatTime, getStatusLabel, getOrderTypeLabel } from '../utils/formatters'
import { STATUS_COLORS } from '../utils/constants'
import NewOrderScreen from './NewOrderScreen'
import AdminPanel from './AdminPanel/AdminDashboard'
import DailySummary from './AdminPanel/DailySummary'

const STATUS_TABS = [
  { value: null, label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function BaseScreen() {
  const { user } = useAuth()
  const { orders, todayStats, loadOrders, loadTodayStats, settings } = useApp()
  const [currentView, setCurrentView] = useState('pos')
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  const [viewOrder, setViewOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const refreshData = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadOrders(), loadTodayStats()])
    setLoading(false)
  }, [loadOrders, loadTodayStats])

  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  const filteredOrders = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        order.order_number?.toLowerCase().includes(q) ||
        String(order.token_number).includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.table_number?.toLowerCase().includes(q) ||
        order.waiter_name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleStatusChange = async (orderId, status) => {
    await window.api.orders.updateStatus(orderId, status)
    await refreshData()
  }

  const handlePrint = async (order) => {
    const result = await window.api.orders.getById(order.id)
    if (result.success) {
      await window.api.print.bill({
        ...result.data,
        items: result.data.items,
        restaurant_name: settings.restaurant_name,
        address: settings.address,
        phone: settings.phone,
      })
    }
  }

  if (showNewOrder) {
    return (
      <NewOrderScreen
        editOrder={editOrder}
        onClose={() => { setShowNewOrder(false); setEditOrder(null); refreshData() }}
      />
    )
  }

  if (currentView === 'admin') {
    return <AdminPanel onBack={() => setCurrentView('pos')} />
  }

  if (currentView === 'reports') {
    return <DailySummary onBack={() => setCurrentView('pos')} />
  }

  const currency = settings.currency || 'PKR'

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Navbar
        onNewOrder={() => { setEditOrder(null); setShowNewOrder(true) }}
        onAdminPanel={() => setCurrentView('admin')}
        onReports={() => setCurrentView('reports')}
        currentView={currentView}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Stats */}
        <div className="w-52 bg-white border-r border-gray-200 flex flex-col p-3 gap-3 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Summary</h3>

          <StatCard label="Total Orders" value={todayStats?.total_orders || 0} color="text-gray-800" />
          <StatCard label="Total Sales" value={formatCurrency(todayStats?.total_sales || 0, currency)} color="text-green-600" />
          <StatCard label="Pending" value={todayStats?.pending_orders || 0} color="text-yellow-600" />
          <StatCard label="Processing" value={todayStats?.processing_orders || 0} color="text-blue-600" />
          <StatCard label="Completed" value={todayStats?.completed_orders || 0} color="text-emerald-600" />
          <StatCard label="Cancelled" value={todayStats?.cancelled_orders || 0} color="text-red-600" />

          <div className="border-t pt-3 mt-1 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">By Type</h4>
            <StatCard label="Dine In" value={formatCurrency(todayStats?.dine_in_sales || 0, currency)} color="text-gray-700" small />
            <StatCard label="Takeaway" value={formatCurrency(todayStats?.takeaway_sales || 0, currency)} color="text-gray-700" small />
            <StatCard label="Delivery" value={formatCurrency(todayStats?.delivery_sales || 0, currency)} color="text-gray-700" small />
          </div>

          <button
            onClick={refreshData}
            className="mt-auto w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search + Filters */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-1">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.value || 'all'}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === tab.value
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setEditOrder(null); setShowNewOrder(true) }}
              className="ml-auto flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              NEW ORDER
            </button>
          </div>

          {/* Orders Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {['Token', 'Order #', 'Type', 'Table', 'Time', 'Customer', 'Waiter', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                      {loading ? 'Loading...' : 'No orders found'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-3 py-3 font-mono font-bold text-blue-700">#{order.token_number}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{order.order_number}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {getOrderTypeLabel(order.order_type)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-700">{order.table_number || '-'}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{formatTime(order.created_at)}</td>
                      <td className="px-3 py-3 text-gray-700">{order.customer_name || '-'}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{order.waiter_name || '-'}</td>
                      <td className="px-3 py-3 font-semibold text-gray-800">{formatCurrency(order.total, currency)}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <ActionBtn
                            title="Edit"
                            color="text-blue-600 hover:bg-blue-50"
                            onClick={() => { setEditOrder(order); setShowNewOrder(true) }}
                            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                          />
                          <ActionBtn
                            title="Print"
                            color="text-gray-600 hover:bg-gray-50"
                            onClick={() => handlePrint(order)}
                            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />}
                          />
                          {order.status === 'pending' && (
                            <ActionBtn
                              title="Mark Processing"
                              color="text-indigo-600 hover:bg-indigo-50"
                              onClick={() => handleStatusChange(order.id, 'processing')}
                              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                            />
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <ActionBtn
                              title="Complete"
                              color="text-green-600 hover:bg-green-50"
                              onClick={() => handleStatusChange(order.id, 'completed')}
                              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                            />
                          )}
                          {order.status !== 'cancelled' && order.status !== 'completed' && (
                            <ActionBtn
                              title="Cancel"
                              color="text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                            />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, small }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-2.5 ${small ? 'py-1.5' : ''}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-bold mt-0.5 ${color} ${small ? 'text-sm' : 'text-base'}`}>{value}</div>
    </div>
  )
}

function ActionBtn({ title, color, onClick, icon }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${color}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </button>
  )
}
