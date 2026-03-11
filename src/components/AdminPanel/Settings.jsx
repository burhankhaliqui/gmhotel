import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Button from '../shared/Button'

export default function Settings() {
  const { settings, loadSettings } = useApp()
  const [form, setForm] = useState({
    restaurant_name: 'GM Hotel',
    address: 'Main Street',
    phone: '',
    currency: 'PKR',
    paper_size: '80mm',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testPrinting, setTestPrinting] = useState(false)

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setForm(prev => ({
        ...prev,
        ...settings,
      }))
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    const result = await window.api.settings.save(form)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      loadSettings()
      setTimeout(() => setSaved(false), 2000)
    } else {
      alert('Failed to save settings: ' + result.message)
    }
  }

  const handleTestPrint = async () => {
    setTestPrinting(true)
    const result = await window.api.print.test()
    setTestPrinting(false)
    if (!result.success) {
      alert('Test print failed: ' + (result.reason || 'Unknown error'))
    }
  }

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Settings</h2>
        <Button onClick={handleSave} loading={saving} variant={saved ? 'success' : 'primary'} size="sm">
          {saved ? '✓ Saved!' : 'Save Settings'}
        </Button>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Restaurant Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Restaurant Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <input
                type="text"
                value={form.restaurant_name}
                onChange={e => handleChange('restaurant_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* POS Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">POS Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={e => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="SAR">SAR - Saudi Riyal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Paper Size</label>
              <select
                value={form.paper_size}
                onChange={e => handleChange('paper_size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="80mm">80mm (Standard)</option>
                <option value="58mm">58mm (Small)</option>
                <option value="A4">A4</option>
              </select>
            </div>
          </div>
        </div>

        {/* Printer Test */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Printer</h3>
          <Button onClick={handleTestPrint} loading={testPrinting} variant="outline" size="sm">
            🖨 Test Print
          </Button>
          <p className="text-xs text-gray-500 mt-2">Click to send a test page to your printer.</p>
        </div>
      </div>
    </div>
  )
}
