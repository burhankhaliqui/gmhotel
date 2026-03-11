import React from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Login from './components/Login'
import BaseScreen from './components/BaseScreen'

function AppContent() {
  const { user } = useAuth()
  if (!user) return <Login />
  return <BaseScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}
