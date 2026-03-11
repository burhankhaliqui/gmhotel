import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import DataTable from '../shared/Table'

export default function DeliveryBoys() {
  const { deliveryBoys, loadDeliveryBoys } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', phone: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name, phone: item.phone || '' })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    let result
    if (editItem) {
      result = await window.api.deliveryBoys.update(editItem.id, form)
    } else {
      result = await window.api.deliveryBoys.create(form)
    }
    setLoading(false)
    if (result.success) { setShowModal(false); loadDeliveryBoys() }
    else setError(result.message || 'Failed to save')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this delivery boy?')) return
    const result = await window.api.deliveryBoys.delete(id)
    if (result.success) loadDeliveryBoys()
    else alert('Error: ' + result.message)
  }

  const columns = [
    { header: '#', render: (_, i) => i + 1, width: '50px' },
    { header: 'Name', key: 'name', render: r => <span className="font-medium">{r.name}</span> },
    { header: 'Phone', key: 'phone', render: r => r.phone || '-' },
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
        <h2 className="text-lg font-bold text-gray-800">Delivery Boys</h2>
        <Button onClick={openCreate} size="sm">+ Add Delivery Boy</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={deliveryBoys} emptyMessage="No delivery boys found" />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Delivery Boy' : 'New Delivery Boy'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone number"
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
