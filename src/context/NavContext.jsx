import { createContext, useCallback, useContext, useState } from 'react'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [page, setPage] = useState({ view: 'home', params: {} })

  const navigate = useCallback((view, params = {}) => {
    setPage({ view, params })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <NavContext.Provider value={{ page, navigate }}>
      {children}
    </NavContext.Provider>
  )
}

export const useNav = () => useContext(NavContext)
