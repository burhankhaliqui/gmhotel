import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import DataTable from '../shared/Table'
import { formatCurrency } from '../../utils/formatters'

export default function Items() {
  const { items, categories, loadItems, settings } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ category_id: '', name: '', price: 0, unit: 'piece', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currency = settings.currency || 'PKR'

  const filtered = items.filter(item => {
    if (filterCat && item.category_id !== Number(filterCat)) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openCreate = () => {
    setEditItem(null)
    setForm({ category_id: categories[0]?.id || '', name: '', price: 0, unit: 'piece', description: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ category_id: item.category_id, name: item.name, price: item.price, unit: item.unit, description: item.description || '' })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.category_id) { setError('Category is required'); return }
    setLoading(true)
    setError('')
    let result
    if (editItem) {
      result = await window.api.items.update(editItem.id, { ...form, active: editItem.active })
    } else {
      result = await window.api.items.create(form)
    }
    setLoading(false)
    if (result.success) {
      setShowModal(false)
      loadItems()
    } else {
      setError(result.message || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    const result = await window.api.items.delete(id)
    if (result.success) loadItems()
    else alert('Error: ' + result.message)
  }

  const columns = [
    { header: 'Name', key: 'name', render: r => <span className="font-medium">{r.name}</span> },
    { header: 'Category', key: 'category_name' },
    { header: 'Price', key: 'price', render: r => <span className="font-semibold text-blue-700">{formatCurrency(r.price, currency)}</span> },
    { header: 'Unit', key: 'unit' },
    {
      header: 'Actions', key: 'actions', render: r => (
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
        <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
        <Button onClick={openCreate} size="sm">+ Add Item</Button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={filtered} emptyMessage="No items found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Item' : 'New Item'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Item name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currency})</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['piece', 'plate', 'kg', 'g', 'unit', 'portion', 'glass', 'cup'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional description"
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
