import { AuthProvider, useAuth } from './context/AuthContext'
import { NavProvider, useNav } from './context/NavContext'
import NavBar from './components/NavBar'
import SessionExpiredModal from './components/SessionExpiredModal'
import ErrorModal from './components/ErrorModal'
import HomePage    from './pages/HomePage'
import PostPage    from './pages/PostPage'
import LoginPage   from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage  from './pages/SearchPage'

function Router() {
  const { page } = useNav()
  const { auth, isAuthenticated } = useAuth()
  const { view, params } = page

  // Public pages (no auth required)
  const publicPages = ['login', 'register']
  
  // If not authenticated and trying to access protected page, redirect to login
  if (!isAuthenticated() && !publicPages.includes(view)) {
    return <LoginPage />
  }

  switch (view) {
    case 'home':     return <HomePage />
    case 'post':     return <div className="container"><PostPage id={params.id} /></div>
    case 'login':    return <LoginPage />
    case 'register': return <RegisterPage />
    case 'profile':  return <div className="container"><ProfilePage userId={params.userId} /></div>
    case 'search':   return <SearchPage keyword={params.keyword} />
    default:         return <HomePage />
  }
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <div className="app">
          <NavBar />
          <main style={{ flex: 1 }}>
            <Router />
          </main>
          <footer className="footer">
            <strong>The Journal</strong> · A blog for writers who mean it.
          </footer>
          <SessionExpiredModal />
          <ErrorModal />
        </div>
      </NavProvider>
    </AuthProvider>
  )
}
