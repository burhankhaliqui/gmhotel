import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gmhotel_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = async (username, password) => {
    const result = await window.api.auth.login({ username, password })
    if (result.success) {
      setUser(result.user)
      localStorage.setItem('gmhotel_user', JSON.stringify(result.user))
    }
    return result
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gmhotel_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
