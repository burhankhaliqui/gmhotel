import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDateTime, todayString } from '../../utils/formatters'
import { STATUS_COLORS } from '../../utils/constants'
import Button from '../shared/Button'

export default function DailySummary({ onBack }) {
  const { settings } = useApp()
  const [date, setDate] = useState(todayString())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const currency = settings.currency || 'PKR'

  const loadSummary = useCallback(async () => {
    setLoading(true)
    const result = await window.api.reports.getDailySummary(date)
    if (result.success) setData(result.data)
    setLoading(false)
  }, [date])

  useEffect(() => { loadSummary() }, [loadSummary])

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    const { orderStats: s, expenseStats: e } = data
    await window.api.reports.saveDaily({
      date: data.date,
      total_orders: s.total_orders || 0,
      total_sales: s.total_sales || 0,
      dine_in_sales: s.dine_in_sales || 0,
      takeaway_sales: s.takeaway_sales || 0,
      delivery_sales: s.delivery_sales || 0,
      total_expenses: e.total_expenses || 0,
      net_profit: data.net_profit || 0,
    })
    setSaving(false)
    alert('Summary saved!')
  }

  const handlePrint = async () => {
    if (!data) return
    const { orderStats: s, expenseStats: e } = data
    await window.api.print.dailySummary({
      date: data.date,
      restaurant_name: settings.restaurant_name || 'GM Hotel',
      total_orders: s.total_orders || 0,
      total_sales: s.total_sales || 0,
      dine_in_sales: s.dine_in_sales || 0,
      takeaway_sales: s.takeaway_sales || 0,
      delivery_sales: s.delivery_sales || 0,
      total_expenses: e.total_expenses || 0,
      net_profit: data.net_profit || 0,
    })
  }

  const s = data?.orderStats || {}
  const e = data?.expenseStats || {}

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Daily Summary</h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={ev => setDate(ev.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handlePrint} variant="outline" size="sm" disabled={!data}>
            🖨 Print
          </Button>
          <Button onClick={handleSave} size="sm" loading={saving} disabled={!data}>
            Save Summary
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">Loading...</div>
      ) : !data ? (
        <div className="text-center text-gray-400 py-12">No data for selected date</div>
      ) : (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryCard label="Total Orders" value={s.total_orders || 0} color="text-gray-800" />
            <SummaryCard label="Total Sales" value={formatCurrency(s.total_sales || 0, currency)} color="text-green-600" />
            <SummaryCard label="Total Expenses" value={formatCurrency(e.total_expenses || 0, currency)} color="text-red-600" />
            <SummaryCard label="Net Profit" value={formatCurrency(data.net_profit || 0, currency)} color={(data.net_profit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Dine In" value={formatCurrency(s.dine_in_sales || 0, currency)} color="text-blue-600" />
            <SummaryCard label="Takeaway" value={formatCurrency(s.takeaway_sales || 0, currency)} color="text-indigo-600" />
            <SummaryCard label="Delivery" value={formatCurrency(s.delivery_sales || 0, currency)} color="text-purple-600" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <SmallCard label="Pending" value={s.pending_count || 0} color="bg-yellow-50 text-yellow-700" />
            <SmallCard label="Processing" value={s.processing_count || 0} color="bg-blue-50 text-blue-700" />
            <SmallCard label="Completed" value={s.completed_count || 0} color="bg-green-50 text-green-700" />
            <SmallCard label="Cancelled" value={s.cancelled_count || 0} color="bg-red-50 text-red-700" />
          </div>

          {/* Expenses */}
          {data.expensesList && data.expensesList.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Expenses</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expensesList.map(exp => (
                    <tr key={exp.id} className="border-b border-gray-50">
                      <td className="py-1.5 font-medium">{exp.category}</td>
                      <td className="py-1.5 text-gray-600">{exp.description || '-'}</td>
                      <td className="py-1.5 text-right text-red-600">{formatCurrency(exp.amount, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Orders ({data.orders?.length || 0})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Token</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Table</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.orders || []).map(order => (
                    <tr key={order.id} className="border-b border-gray-50">
                      <td className="py-1.5 font-mono font-bold text-blue-700">#{order.token_number}</td>
                      <td className="py-1.5">{order.order_type?.replace('_', ' ')}</td>
                      <td className="py-1.5">{order.table_number || '-'}</td>
                      <td className="py-1.5">{formatDateTime(order.created_at)}</td>
                      <td className="py-1.5 font-semibold">{formatCurrency(order.total, currency)}</td>
                      <td className="py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function SmallCard({ label, value, color }) {
  return (
    <div className={`rounded-lg p-3 ${color}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}
