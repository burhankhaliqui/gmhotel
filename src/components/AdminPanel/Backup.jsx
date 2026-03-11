import React, { useState, useEffect } from 'react'
import { formatDateTime, fileSize } from '../../utils/formatters'
import Button from '../shared/Button'

export default function Backup() {
  const [backups, setBackups] = useState([])
  const [dbInfo, setDbInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [backupResult, infoResult] = await Promise.all([
      window.api.backup.getList(),
      window.api.backup.getDatabaseInfo(),
    ])
    if (backupResult.success) setBackups(backupResult.data)
    if (infoResult.success) setDbInfo(infoResult.data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async () => {
    setCreating(true)
    const result = await window.api.backup.create()
    setCreating(false)
    if (result.success) {
      alert('Backup created successfully!')
      loadData()
    } else {
      alert('Backup failed: ' + result.message)
    }
  }

  const handleOpenFolder = async () => {
    await window.api.backup.openFolder()
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Database Backup</h2>
        <div className="flex gap-3">
          <Button onClick={handleOpenFolder} variant="outline" size="sm">Open Folder</Button>
          <Button onClick={handleCreate} loading={creating} size="sm">Create Backup</Button>
        </div>
      </div>

      {/* DB Info */}
      {dbInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-blue-600">Database Size</div>
            <div className="font-bold text-blue-800">{fileSize(dbInfo.size)}</div>
          </div>
          <div>
            <div className="text-xs text-blue-600">Last Modified</div>
            <div className="font-medium text-blue-800 text-sm">{formatDateTime(dbInfo.last_modified)}</div>
          </div>
          <div>
            <div className="text-xs text-blue-600">Total Backups</div>
            <div className="font-bold text-blue-800">{backups.length}</div>
          </div>
        </div>
      )}

      {/* Backup List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Backup History</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No backups found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {backups.map((backup, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="text-sm font-medium text-gray-800">{backup.name}</div>
                  <div className="text-xs text-gray-500">{formatDateTime(backup.created_at)}</div>
                </div>
                <div className="text-xs text-gray-500">{fileSize(backup.size)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Backups are stored in the application data folder.
          A backup is also automatically created when closing the application.
        </p>
      </div>
    </div>
  )
}
