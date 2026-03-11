import React, { useState, useEffect } from 'react'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import DataTable from '../shared/Table'
import { USER_ROLES } from '../../utils/constants'

export default function Users() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', role: 'cashier', full_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadUsers = async () => {
    const result = await window.api.users.getAll()
    if (result.success) setUsers(result.data)
  }

  useEffect(() => { loadUsers() }, [])

  const openCreate = () => {
    setEditItem(null)
    setForm({ username: '', password: '', role: 'cashier', full_name: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ username: item.username, password: '', role: item.role, full_name: item.full_name || '' })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.username.trim()) { setError('Username is required'); return }
    if (!editItem && !form.password.trim()) { setError('Password is required for new user'); return }
    setLoading(true)
    let result
    if (editItem) {
      result = await window.api.users.update(editItem.id, form)
    } else {
      result = await window.api.users.create(form)
    }
    setLoading(false)
    if (result.success) { setShowModal(false); loadUsers() }
    else setError(result.message || 'Failed to save')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    const result = await window.api.users.delete(id)
    if (result.success) loadUsers()
    else alert('Error: ' + result.message)
  }

  const columns = [
    { header: 'Username', key: 'username', render: r => <span className="font-mono font-medium">{r.username}</span> },
    { header: 'Full Name', key: 'full_name', render: r => r.full_name || '-' },
    {
      header: 'Role', key: 'role', render: r => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          r.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {r.role}
        </span>
      )
    },
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
        <h2 className="text-lg font-bold text-gray-800">Users</h2>
        <Button onClick={openCreate} size="sm">+ Add User</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={users} emptyMessage="No users found" />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit User' : 'New User'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editItem ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {USER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
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
