import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const userData = JSON.parse(atob(token.split('.')[1]))
      
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('🔐 [AuthContext] Iniziando login per:', email)
      
      const response = await axios.post('/api/users/login', { 
        email, 
        password 
      })
      
      console.log('✅ [AuthContext] Risposta ricevuta:', response.data)
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Risposta del server incompleta')
      }
      
      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      console.log('🎉 [AuthContext] Login completato con successo')
      return { success: true }
      
    } catch (error) {
      console.error('❌ [AuthContext] Errore durante il login:', error)
      
      let errorMessage = 'Errore durante il login'
      
      if (error.response) {
        errorMessage = error.response.data?.error || `Errore del server: ${error.response.status}`
        console.log('📡 Dettagli errore server:', error.response.data)
      } else if (error.request) {
        errorMessage = 'Impossibile connettersi al server'
        console.log('🌐 Nessuna risposta dal server')
      } else {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage 
      }
    }
  }

  const register = async (userData) => {
    try {
      console.log('👤 [AuthContext] Iniziando registrazione per:', userData.email)
      
      const response = await axios.post('/api/users', userData)
      
      console.log('✅ [AuthContext] Registrazione completata:', response.data)
      
      if (response.data.user) {
        const loginResult = await login(userData.email, userData.password)
        return loginResult
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ [AuthContext] Errore durante la registrazione:', error)
      
      let errorMessage = 'Errore durante la registrazione'
      
      if (error.response) {
        errorMessage = error.response.data?.error || `Errore del server: ${error.response.status}`
      } else if (error.request) {
        errorMessage = 'Impossibile connettersi al server'
      } else {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage 
      }
    }
  }

  const logout = () => {
    console.log('👋 [AuthContext] Logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    try {
      await axios.put('/api/users/profile', profileData)
      if (profileData.name) {
        setUser(prev => ({ ...prev, name: profileData.name }))
        const updatedUser = { ...user, name: profileData.name }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Update failed' 
      }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}