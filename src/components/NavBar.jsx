import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { auth, logout, isAuthenticated } = useAuth()
  const { navigate } = useNav()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate('search', { keyword: search.trim() })
  }

  const handleLogout = () => {
    logout()
    navigate('login')
  }

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <button className={styles.brand} onClick={() => navigate('home')}>
          The<span>Journal</span>
        </button>

        <div className={styles.links}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>⌕</button>
          </form>

          {isAuthenticated() ? (
            <>
              <button className={styles.navBtn} onClick={() => navigate('profile', {})}>
                @{auth.username}
              </button>
              <button className={styles.navBtn} onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <button className={styles.navBtn} onClick={() => navigate('login')}>Sign In</button>
              <button className={`${styles.navBtn} ${styles.accent}`} onClick={() => navigate('register')}>Join</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
