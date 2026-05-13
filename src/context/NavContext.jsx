import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [page, setPage] = useState({ view: 'home', params: {} })

  // Restore page state from sessionStorage on mount
  useEffect(() => {
    const savedPage = sessionStorage.getItem('currentPage')
    if (savedPage) {
      try {
        setPage(JSON.parse(savedPage))
      } catch (e) {
        // Fallback to home if storage is corrupted
        setPage({ view: 'home', params: {} })
      }
    }
  }, [])

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = (e) => {
      const pageData = e.state?.pageData || { view: 'home', params: {} }
      setPage(pageData)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((view, params = {}) => {
    const newPage = { view, params }
    setPage(newPage)
    
    // Save to sessionStorage for refresh
    sessionStorage.setItem('currentPage', JSON.stringify(newPage))
    
    // Push to browser history for back/forward buttons
    window.history.pushState({ pageData: newPage }, '', window.location.href)
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  return (
    <NavContext.Provider value={{ page, navigate, goBack }}>
      {children}
    </NavContext.Provider>
  )
}

export const useNav = () => useContext(NavContext)
