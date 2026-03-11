import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '../utils/formatters'

export default function ItemPopup({ item, currency, onAdd, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(item.price)
  const [notes, setNotes] = useState('')

  const total = quantity * price

  const adjustQty = (delta) => {
    setQuantity(q => Math.max(0.5, q + delta))
  }

  const handleAdd = () => {
    if (quantity > 0) {
      onAdd(item, quantity, price, notes)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.category_name} • {item.unit}</p>
          {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Price ({currency})</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Quantity ({item.unit})</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustQty(-0.5)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-colors"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(Math.max(0.5, Number(e.target.value)))}
              min="0.5"
              step="0.5"
              className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => adjustQty(0.5)}
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Special instructions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Total & Add */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-xl font-bold text-blue-700">{formatCurrency(total, currency)}</div>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
          >
            Add to Order
          </button>
        </div>
      </motion.div>
    </div>
  )
}
