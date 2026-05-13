import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import { Loading, Alert, Pagination, PostGrid } from '../components/shared'
import { fmtDate, initials } from '../utils/helpers'
import * as api from '../api/blogApi'
import styles from './ProfilePage.module.css'

export default function ProfilePage({ userId }) {
  const { auth, logout } = useAuth()
  const { navigate }     = useNav()
  const [user,       setUser]       = useState(null)
  const [posts,      setPosts]      = useState([])
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [editing,    setEditing]    = useState(false)
  const [form,       setForm]       = useState({})
  const [formError,  setFormError]  = useState('')
  const [saving,     setSaving]     = useState(false)

  const isSelf = user?.username === auth.username
  const loadPosts = useCallback(async (u, p = 0) => {
    try {
      const data = await api.getPostsByAuthor(u.id, p, 9, auth?.token)
      setPosts(data.content || [])
      setTotalPages(data.totalPages || 0)
      setPage(p)
    } catch { /* handled silently */ }
  }, [auth])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let u
      if (userId) {
        u = await api.getUser(userId, auth?.token)
      } else {
        // fallback: get by username
        u = await api.getUserByName(auth.username, auth.token)
      }
      setUser(u)
      await loadPosts(u, 0)
    } catch { /* handled silently */ }
    setLoading(false)
  }, [userId, auth, loadPosts])

  useEffect(() => { load() }, [load])

  const saveProfile = async () => {
    setSaving(true); setFormError('')
    try {
      const updated = await api.updateUser(user.id, form, auth.token)
      setUser(updated); setEditing(false)
    } catch (e) { setFormError(e.message) }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return
    try {
      await api.deleteUser(user.id, auth.token)
      logout(); navigate('home')
    } catch { /* handled silently */ }
  }

  if (loading) return <div className="container"><Loading /></div>
  if (!user)   return <div className="container"><Alert msg="User not found." /></div>

  return (
    <div className={styles.page}>
      <button className="back-link" onClick={() => navigate('home')}>← Back</button>

      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{initials(user.username)}</div>
        <div className={styles.info}>
          <div className={styles.name}>{user.username}</div>
          <div className={styles.email}>{user.email}</div>
          <div className={styles.since}>Member since {fmtDate(user.createdAt)}</div>
        </div>
        {isSelf && (
          <div className={styles.profileActions}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setEditing(true)
                setForm({ username: user.username, email: user.email, password: '', confirmPassword: '' })
              }}
            >Edit Profile</button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        )}
      </div>

      <div className="section-header">
        <h2 className="section-title">Posts by {user.username}</h2>
      </div>

      {posts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✍️</div>
          <div className="empty-title">No posts yet</div>
        </div>
      ) : (
        <>
          <PostGrid posts={posts} isAuthor={isSelf} />
          <Pagination page={page} totalPages={totalPages} onPage={(p) => loadPosts(user, p)} />
        </>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(false)}>
          <div className="modal">
            <div className="modal-title">Edit Profile</div>
            <Alert msg={formError} />
            {(['username', 'email', 'password', 'confirmPassword']).map((k) => (
              <div className="form-group" key={k}>
                <label className="form-label">
                  {k === 'confirmPassword' ? 'Confirm Password' : k.charAt(0).toUpperCase() + k.slice(1)}
                </label>
                <input
                  className="form-input"
                  type={k.includes('assword') ? 'password' : k === 'email' ? 'email' : 'text'}
                  value={form[k] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
