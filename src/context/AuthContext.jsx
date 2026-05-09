import { createContext, useContext, useState } from 'react'
import * as api from '../api/blogApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const s = sessionStorage.getItem('blog_auth')
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

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

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
