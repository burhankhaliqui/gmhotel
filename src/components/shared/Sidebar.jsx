import React from 'react'

export default function Sidebar({ items, activeItem, onSelect }) {
  return (
    <aside className="w-56 bg-gray-800 text-white flex flex-col h-full">
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeItem === item.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
