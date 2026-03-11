import React from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ onNewOrder, onAdminPanel, onReports, currentView }) {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-blue-700 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-blue-700 font-bold text-sm">GM</span>
        </div>
        <span className="font-bold text-lg tracking-wide">GM Hotel POS</span>
      </div>

      <div className="flex items-center gap-2">
        {onNewOrder && (
          <button
            onClick={onNewOrder}
            className="flex items-center gap-2 bg-white text-blue-700 px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Order
          </button>
        )}

        {onReports && (
          <button
            onClick={onReports}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'reports' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            Reports
          </button>
        )}

        {user?.role === 'admin' && onAdminPanel && (
          <button
            onClick={onAdminPanel}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'admin' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            Admin Panel
          </button>
        )}

        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
          <div className="text-right">
            <div className="text-xs font-semibold">{user?.full_name || user?.username}</div>
            <div className="text-xs opacity-70 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
