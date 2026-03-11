import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatters'
import { ORDER_TYPES, PAYMENT_METHODS } from '../utils/constants'
import ItemPopup from './ItemPopup'
import CheckoutPanel from './CheckoutPanel'

export default function NewOrderScreen({ editOrder, onClose }) {
  const { categories, items, tables, waiters, deliveryBoys, settings } = useApp()
  const { user } = useAuth()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [orderType, setOrderType] = useState('dine_in')
  const [tableId, setTableId] = useState('')
  const [waiterId, setWaiterId] = useState('')
  const [deliveryBoyId, setDeliveryBoyId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [popupItem, setPopupItem] = useState(null)
  const [saving, setSaving] = useState(false)

  // Load edit order data
  useEffect(() => {
    if (editOrder) {
      setOrderType(editOrder.order_type || 'dine_in')
      setTableId(editOrder.table_id || '')
      setWaiterId(editOrder.waiter_id || '')
      setDeliveryBoyId(editOrder.delivery_boy_id || '')
      setCustomerName(editOrder.customer_name || '')
      setCustomerPhone(editOrder.customer_phone || '')
      setPaymentMethod(editOrder.payment_method || 'cash')
      setDiscount(editOrder.discount || 0)
      setNotes(editOrder.notes || '')

      // Load order items
      window.api.orders.getById(editOrder.id).then(result => {
        if (result.success && result.data.items) {
          setCartItems(result.data.items.map(item => ({
            id: item.item_id || `custom_${Date.now()}_${Math.random()}`,
            item_id: item.item_id,
            item_name: item.item_name,
            category_name: item.category_name,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            notes: item.notes,
          })))
        }
      })
    }
  }, [editOrder])

  // Set first category as selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  const filteredItems = items.filter(item =>
    item.category_id === selectedCategory && item.active
  )

  const handleItemClick = (item) => {
    setPopupItem(item)
  }

  const handleAddToCart = (item, quantity, price, itemNotes) => {
    const cartKey = `${item.id}_${price}`
    const existing = cartItems.findIndex(c => c.id === item.id && c.price === price)
    if (existing >= 0) {
      const updated = [...cartItems]
      updated[existing] = {
        ...updated[existing],
        quantity: updated[existing].quantity + quantity,
        total: (updated[existing].quantity + quantity) * price,
      }
      setCartItems(updated)
    } else {
      setCartItems(prev => [...prev, {
        id: item.id,
        item_id: item.id,
        item_name: item.name,
        category_name: item.category_name,
        unit: item.unit,
        quantity,
        price,
        total: quantity * price,
        notes: itemNotes,
      }])
    }
    setPopupItem(null)
  }

  const handleUpdateQuantity = (index, qty) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter((_, i) => i !== index))
    } else {
      const updated = [...cartItems]
      updated[index] = { ...updated[index], quantity: qty, total: qty * updated[index].price }
      setCartItems(updated)
    }
  }

  const handleRemoveItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
  const total = Math.max(0, subtotal - (discount || 0))

  const selectedTable = tables.find(t => t.id === Number(tableId))
  const selectedWaiter = waiters.find(w => w.id === Number(waiterId))
  const selectedDeliveryBoy = deliveryBoys.find(d => d.id === Number(deliveryBoyId))

  const handleSave = async (status = 'pending') => {
    if (cartItems.length === 0) {
      alert('Please add items to the order')
      return
    }
    setSaving(true)

    const orderData = {
      order_type: orderType,
      status,
      table_id: tableId || null,
      table_number: selectedTable?.table_number || null,
      waiter_id: waiterId || null,
      waiter_name: selectedWaiter?.name || null,
      delivery_boy_id: deliveryBoyId || null,
      delivery_boy_name: selectedDeliveryBoy?.name || null,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      subtotal,
      discount: discount || 0,
      total,
      payment_method: paymentMethod,
      notes: notes || null,
      created_by: user?.id,
      items: cartItems,
    }

    try {
      let result
      if (editOrder) {
        result = await window.api.orders.update(editOrder.id, orderData)
      } else {
        result = await window.api.orders.create(orderData)
      }

      if (result.success) {
        // Auto print if completed
        if (status === 'completed' || status === 'processing') {
          const printData = {
            ...orderData,
            order_number: editOrder?.order_number || result.order_number,
            token_number: editOrder?.token_number || result.token_number,
            created_at: new Date().toISOString(),
            restaurant_name: settings.restaurant_name,
            address: settings.address,
            phone: settings.phone,
          }
          await window.api.print.bill(printData).catch(() => {})
        }
        onClose()
      } else {
        alert('Error: ' + (result.message || 'Failed to save order'))
      }
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const currency = settings.currency || 'PKR'

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-700 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-bold text-lg">
            {editOrder ? `Edit Order #${editOrder.token_number}` : 'New Order'}
          </h1>
        </div>

        {/* Order Type */}
        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
          {ORDER_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setOrderType(type.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                orderType === type.value ? 'bg-white text-blue-700' : 'text-white/80 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Categories */}
        <div className="w-36 bg-gray-800 flex flex-col overflow-y-auto">
          {categories.filter(c => c.active).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-3 text-left text-sm font-medium transition-colors border-b border-gray-700 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="leading-tight">{cat.name}</span>
              </div>
              <span className="text-xs opacity-60 ml-4">{cat.unit}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-100">
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No items in this category</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 xl:grid-cols-4">
              {filteredItems.map(item => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleItemClick(item)}
                  className="bg-white rounded-xl p-3 text-left shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-200"
                >
                  <div className="font-medium text-gray-800 text-sm leading-tight">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.category_name}</div>
                  <div className="text-blue-700 font-bold text-sm mt-2">
                    {formatCurrency(item.price, currency)}
                    <span className="text-gray-400 font-normal text-xs">/{item.unit}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Panel */}
        <CheckoutPanel
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          orderType={orderType}
          tableId={tableId}
          setTableId={setTableId}
          waiterId={waiterId}
          setWaiterId={setWaiterId}
          deliveryBoyId={deliveryBoyId}
          setDeliveryBoyId={setDeliveryBoyId}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          discount={discount}
          setDiscount={setDiscount}
          notes={notes}
          setNotes={setNotes}
          subtotal={subtotal}
          total={total}
          tables={tables}
          waiters={waiters}
          deliveryBoys={deliveryBoys}
          onSave={handleSave}
          saving={saving}
          currency={currency}
          isEdit={!!editOrder}
        />
      </div>

      {/* Item Popup */}
      <AnimatePresence>
        {popupItem && (
          <ItemPopup
            item={popupItem}
            currency={currency}
            onAdd={handleAddToCart}
            onClose={() => setPopupItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
