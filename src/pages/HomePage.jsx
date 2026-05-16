import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import { Loading, Pagination, PostGrid } from '../components/shared'
import PostFormModal from '../components/PostFormModal'
import * as api from '../api/blogApi'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { auth } = useAuth()
  const { navigate } = useNav()
  const [posts,      setPosts]      = useState([])
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const data = await api.getPosts(p, 9, auth?.token)
      setPosts(data.content || [])
      setTotalPages(data.page?.totalPages || 0)
      setPage(p)
    } catch { /* handled silently */ }
    setLoading(false)
  }, [auth])

  useEffect(() => { load(0) }, [load])

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.eyebrow}>✦ The Open Journal</div>
          <h1 className={styles.heroTitle}>Stories worth<br /><em>reading.</em></h1>
          <p className={styles.heroSub}>
            Ideas, essays, and dispatches from writers who care about craft.
          </p>
          {auth && (
            <button className="btn btn-primary" style={{ marginTop: 32 }} onClick={() => setShowForm(true)}>
              ✎ Write a Post
            </button>
          )}
          {!auth && (
            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={() => navigate('register')}>Get Started</button>
              <button className="btn btn-outline" onClick={() => navigate('login')}>Sign In</button>
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <div className="container">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Latest Posts</h2>
          </div>

          {loading ? <Loading /> : posts.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📝</div>
              <div className="empty-title">No posts yet</div>
              <p>{auth ? 'Be the first to write something!' : 'Sign in to write the first post.'}</p>
            </div>
          ) : (
            <>
              <PostGrid posts={posts} />
              <Pagination page={page} totalPages={totalPages} onPage={load} />
            </>
          )}
        </section>
      </div>

      {showForm && (
        <PostFormModal
          onClose={() => setShowForm(false)}
          onSave={(post) => { 
            setShowForm(false)
            navigate('post', { id: post.id })
          }}
        />
      )}
    </>
  )
}
