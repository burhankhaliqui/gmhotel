import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import { CATEGORY_COLORS } from '../../utils/constants'

export default function Categories() {
  const { categories, loadCategories } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', unit: 'piece', color: '#1e40af', sort_order: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', unit: 'piece', color: '#1e40af', sort_order: categories.length })
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name, unit: item.unit, color: item.color, sort_order: item.sort_order })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')
    let result
    if (editItem) {
      result = await window.api.categories.update(editItem.id, { ...form, active: editItem.active })
    } else {
      result = await window.api.categories.create(form)
    }
    setLoading(false)
    if (result.success) {
      setShowModal(false)
      loadCategories()
    } else {
      setError(result.message || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Items in this category may be affected.')) return
    const result = await window.api.categories.delete(id)
    if (result.success) loadCategories()
    else alert('Error: ' + result.message)
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Categories</h2>
        <Button onClick={openCreate} size="sm">+ Add Category</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name[0]}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{cat.name}</div>
                <div className="text-xs text-gray-500">Unit: {cat.unit}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => openEdit(cat)}
                className="flex-1 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="flex-1 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Category' : 'New Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Category name"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
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
