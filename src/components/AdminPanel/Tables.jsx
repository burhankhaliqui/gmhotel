import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import DataTable from '../shared/Table'

export default function Tables() {
  const { tables, loadTables } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ table_number: '', capacity: 4 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditItem(null)
    setForm({ table_number: `T${tables.length + 1}`, capacity: 4 })
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ table_number: item.table_number, capacity: item.capacity })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.table_number.trim()) { setError('Table number is required'); return }
    setLoading(true)
    let result
    if (editItem) {
      result = await window.api.tables.update(editItem.id, form)
    } else {
      result = await window.api.tables.create(form)
    }
    setLoading(false)
    if (result.success) { setShowModal(false); loadTables() }
    else setError(result.message || 'Failed to save')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this table?')) return
    const result = await window.api.tables.delete(id)
    if (result.success) loadTables()
    else alert('Error: ' + result.message)
  }

  const columns = [
    { header: 'Table #', key: 'table_number', render: r => <span className="font-bold text-blue-700">{r.table_number}</span> },
    { header: 'Capacity', key: 'capacity', render: r => `${r.capacity} persons` },
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
        <h2 className="text-lg font-bold text-gray-800">Tables ({tables.length})</h2>
        <Button onClick={openCreate} size="sm">+ Add Table</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={tables} emptyMessage="No tables found" />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Table' : 'New Table'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
            <input
              type="text"
              value={form.table_number}
              onChange={e => setForm(f => ({ ...f, table_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. T1, VIP-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (persons)</label>
            <input
              type="number"
              value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
              min="1"
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
