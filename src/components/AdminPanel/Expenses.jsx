import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { formatCurrency, todayString } from '../../utils/formatters'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import DataTable from '../shared/Table'

const EXPENSE_CATEGORIES = ['Food', 'Utilities', 'Salaries', 'Rent', 'Maintenance', 'Supplies', 'Transport', 'Other']

export default function Expenses() {
  const { settings } = useApp()
  const [expenses, setExpenses] = useState([])
  const [date, setDate] = useState(todayString())
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ category: 'Other', description: '', amount: '', date: todayString() })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currency = settings.currency || 'PKR'

  const loadExpenses = useCallback(async () => {
    const result = await window.api.expenses.getAll({ date })
    if (result.success) setExpenses(result.data)
  }, [date])

  useEffect(() => { loadExpenses() }, [loadExpenses])

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const openCreate = () => {
    setEditItem(null)
    setForm({ category: 'Other', description: '', amount: '', date })
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ category: item.category, description: item.description || '', amount: item.amount, date: item.date })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Valid amount is required')
      return
    }
    setLoading(true)
    let result
    if (editItem) {
      result = await window.api.expenses.update(editItem.id, { ...form, amount: Number(form.amount) })
    } else {
      result = await window.api.expenses.create({ ...form, amount: Number(form.amount) })
    }
    setLoading(false)
    if (result.success) { setShowModal(false); loadExpenses() }
    else setError(result.message || 'Failed to save')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    const result = await window.api.expenses.delete(id)
    if (result.success) loadExpenses()
    else alert('Error: ' + result.message)
  }

  const columns = [
    { header: 'Category', key: 'category', render: r => <span className="font-medium">{r.category}</span> },
    { header: 'Description', key: 'description', render: r => r.description || '-' },
    { header: 'Amount', key: 'amount', render: r => <span className="font-semibold text-red-600">{formatCurrency(r.amount, currency)}</span> },
    {
      header: 'Actions', render: r => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:underline">Edit</button>
          <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:underline">Delete</button>
        </div>
      )
    },
  ]

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Expenses</h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={openCreate} size="sm">+ Add Expense</Button>
        </div>
      </div>

      <div className="mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-red-700 font-medium">Total Expenses for {date}</span>
        <span className="text-red-700 font-bold text-lg">{formatCurrency(totalExpenses, currency)}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={expenses} emptyMessage="No expenses for this date" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Expense' : 'New Expense'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({currency}) *</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
