import React from 'react'
import { formatCurrency } from '../utils/formatters'
import { PAYMENT_METHODS } from '../utils/constants'

export default function CheckoutPanel({
  cartItems, onUpdateQuantity, onRemoveItem,
  orderType, tableId, setTableId, waiterId, setWaiterId,
  deliveryBoyId, setDeliveryBoyId, customerName, setCustomerName,
  customerPhone, setCustomerPhone, paymentMethod, setPaymentMethod,
  discount, setDiscount, notes, setNotes,
  subtotal, total, tables, waiters, deliveryBoys,
  onSave, saving, currency, isEdit,
}) {
  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-gray-700 text-sm">Order Details</h2>
      </div>

      {/* Order Info */}
      <div className="px-3 py-2 border-b border-gray-100 space-y-2">
        {orderType === 'dine_in' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-16 flex-shrink-0">Table</label>
            <select
              value={tableId}
              onChange={e => setTableId(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select table</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.table_number}</option>
              ))}
            </select>
          </div>
        )}

        {orderType === 'dine_in' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-16 flex-shrink-0">Waiter</label>
            <select
              value={waiterId}
              onChange={e => setWaiterId(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select waiter</option>
              {waiters.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}

        {orderType === 'delivery' && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-16 flex-shrink-0">Delivery</label>
              <select
                value={deliveryBoyId}
                onChange={e => setDeliveryBoyId(e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select delivery boy</option>
                {deliveryBoys.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-16 flex-shrink-0">Customer</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Name"
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-16 flex-shrink-0">Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Phone"
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {orderType === 'takeaway' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-16 flex-shrink-0">Customer</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Name (optional)"
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            No items added
          </div>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="flex items-start gap-2 py-2 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-800 leading-tight truncate">{item.item_name}</div>
                <div className="text-xs text-gray-500">{formatCurrency(item.price, currency)}/{item.unit}</div>
                {item.notes && <div className="text-xs text-blue-500 italic">{item.notes}</div>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onUpdateQuantity(index, item.quantity - 0.5)}
                  className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-xs flex items-center justify-center font-bold"
                >
                  −
                </button>
                <span className="text-xs font-mono w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(index, item.quantity + 0.5)}
                  className="w-5 h-5 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
              <div className="text-xs font-bold text-gray-800 w-16 text-right flex-shrink-0">
                {formatCurrency(item.total, currency)}
              </div>
              <button
                onClick={() => onRemoveItem(index)}
                className="text-red-400 hover:text-red-600 p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 px-3 py-2 space-y-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 w-20 flex-shrink-0">Discount</span>
          <input
            type="number"
            value={discount}
            onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
            min="0"
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between text-base font-bold text-blue-700 pt-1 border-t">
          <span>TOTAL</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>

        {/* Payment Method */}
        <div className="flex gap-1 pt-1">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.value}
              onClick={() => setPaymentMethod(m.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paymentMethod === m.value
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Order notes..."
          rows={2}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Save Buttons */}
      <div className="px-3 pb-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSave('pending')}
            disabled={saving || cartItems.length === 0}
            className="py-2.5 rounded-xl text-sm font-semibold border-2 border-blue-700 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '...' : 'Save'}
          </button>
          <button
            onClick={() => onSave('processing')}
            disabled={saving || cartItems.length === 0}
            className="py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process
          </button>
        </div>
        <button
          onClick={() => onSave('completed')}
          disabled={saving || cartItems.length === 0}
          className="w-full py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {saving ? 'Saving...' : '✓ Complete & Print'}
        </button>
      </div>
    </div>
  )
}
