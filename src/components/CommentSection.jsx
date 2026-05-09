import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert } from './shared'
import { fmtDate } from '../utils/helpers'
import * as api from '../api/blogApi'
import styles from './CommentSection.module.css'

export default function CommentSection({ postId }) {
  const { auth } = useAuth()
  const [comments,       setComments]       = useState([])
  const [loaded,         setLoaded]         = useState(false)
  const [commentText,    setCommentText]    = useState('')
  const [submitting,     setSubmitting]     = useState(false)
  const [editingId,      setEditingId]      = useState(null)
  const [editText,       setEditText]       = useState('')
  const [error,          setError]          = useState('')

  // Lazy-load on first render
  useState(() => {
    api.getComments(postId, auth?.token)
      .then((data) => { setComments(data || []); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  const submitComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const c = await api.addComment(postId, { content: commentText, postId }, auth.token)
      setComments((prev) => [...prev, c])
      setCommentText('')
    } catch (e) { setError(e.message) }
    setSubmitting(false)
  }

  const saveEdit = async (id) => {
    try {
      const updated = await api.updateComment(id, { content: editText, postId }, auth.token)
      setComments((prev) => prev.map((c) => c.id === id ? updated : c))
      setEditingId(null)
    } catch (e) { setError(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.deleteComment(id, auth.token)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch (e) { setError(e.message) }
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Comments ({comments.length})</h2>
      <Alert msg={error} />

      {auth ? (
        <div className={styles.form}>
          <textarea
            className="form-input"
            placeholder="Share your thoughts…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{ minHeight: 90 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={submitComment}
            disabled={submitting}
            style={{ marginTop: 10 }}
          >
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <p className={styles.loginPrompt}>Sign in to leave a comment.</p>
      )}

      <div className={styles.list}>
        {comments.map((c) => (
          <div key={c.id} className={styles.comment}>
            <div className={styles.commentHeader}>
              <span className={styles.commentAuthor}>{c.author?.username || 'Anonymous'}</span>
              <span className={styles.commentDate}>{fmtDate(c.createdAt)}</span>
            </div>

            {editingId === c.id ? (
              <>
                <textarea
                  className="form-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ minHeight: 80 }}
                />
                <div className={styles.commentActions}>
                  <button className="btn btn-primary btn-sm" onClick={() => saveEdit(c.id)}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.commentBody}>{c.content}</div>
                {auth?.username === c.author?.username && (
                  <div className={styles.commentActions}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setEditingId(c.id); setEditText(c.content) }}
                    >Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {loaded && comments.length === 0 && (
          <p className={styles.loginPrompt}>No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}
