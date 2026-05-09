import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import { Loading, Pagination, PostGrid } from '../components/shared'
import * as api from '../api/blogApi'

export default function SearchPage({ keyword }) {
  const { auth }    = useAuth()
  const { navigate } = useNav()
  const [posts,      setPosts]      = useState([])
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading,    setLoading]    = useState(true)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const data = await api.searchPosts(keyword, p, 9, auth?.token)
      setPosts(data.content || [])
      setTotalPages(data.totalPages || 0)
      setPage(p)
    } catch { /* handled silently */ }
    setLoading(false)
  }, [keyword, auth])

  useEffect(() => { load(0) }, [load])

  return (
    <div className="container">
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Results for "{keyword}"</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('home')}>← All Posts</button>
        </div>

        {loading ? <Loading /> : posts.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No results found</div>
            <p>Try a different keyword.</p>
          </div>
        ) : (
          <>
            <PostGrid posts={posts} />
            <Pagination page={page} totalPages={totalPages} onPage={load} />
          </>
        )}
      </section>
    </div>
  )
}
