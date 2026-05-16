import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../api/blogApi'

const AuthContext = createContext(null)

// Decode JWT and check if expired
const decodeJWT = (token) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const decoded = JSON.parse(atob(parts[1]))
    return decoded
  } catch {
    return null
  }
}

const isTokenExpired = (token) => {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  return decoded.exp * 1000 < Date.now() // exp is in seconds, convert to ms
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const s = sessionStorage.getItem('blog_auth')
      if (!s) return null
      
      const authData = JSON.parse(s)
      // Check if token is expired
      if (isTokenExpired(authData.token)) {
        sessionStorage.removeItem('blog_auth')
        return null
      }
      return authData
    } catch {
      return null
    }
  })

  const [tokenExpired, setTokenExpired] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Check token expiration periodically
  useEffect(() => {
    if (!auth?.token) return
    
    // Check every minute
    const interval = setInterval(() => {
      if (isTokenExpired(auth.token)) {
        setAuth(null)
        sessionStorage.removeItem('blog_auth')
        setTokenExpired(true)
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [auth?.token])

  // Listen for token expired event from API
  useEffect(() => {
    const handleTokenExpired = () => {
      setTokenExpired(true)
    }
    
    window.addEventListener('tokenExpired', handleTokenExpired)
    return () => window.removeEventListener('tokenExpired', handleTokenExpired)
  }, [])

  // Listen for API error event
  useEffect(() => {
    const handleApiError = (event) => {
      setApiError(event.detail)
    }
    
    window.addEventListener('apiError', handleApiError)
    return () => window.removeEventListener('apiError', handleApiError)
  }, [])

  const persist = (a) => {
    setAuth(a)
    sessionStorage.setItem('blog_auth', JSON.stringify(a))
  }

  const login = async (username, password) => {
    const data = await api.login({ username, password })
    persist({ token: data.accessToken, username: data.username })
  }

  const register = async (username, email, password, confirmPassword) => {
    const data = await api.register({ username, email, password, confirmPassword })
    persist({ token: data.accessToken, username: data.username })
  }

  const logout = () => {
    setAuth(null)
    sessionStorage.removeItem('blog_auth')
  }

  const isAuthenticated = () => auth !== null && !isTokenExpired(auth.token)

  const clearTokenExpired = () => {
    setTokenExpired(false)
  }

  const clearApiError = () => {
    setApiError(null)
  }

  const triggerTokenExpired = () => {
    setAuth(null)
    sessionStorage.removeItem('blog_auth')
    setTokenExpired(true)
  }

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      register, 
      logout, 
      isAuthenticated,
      tokenExpired,
      clearTokenExpired,
      triggerTokenExpired,
      apiError,
      clearApiError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
