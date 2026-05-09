import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert } from './shared'
import * as api from '../api/blogApi'

export default function PostFormModal({ initial = null, onSave, onClose }) {
  const { auth } = useAuth()
  const [form, setForm] = useState({
    title:   initial?.title            ?? '',
    content: initial?.content          ?? '',
    tags:    initial?.tags?.join(', ') ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        title:   form.title,
        content: form.content,
        tags:    form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        ...(initial ? { id: initial.id } : {}),
      }
      const saved = initial
        ? await api.updatePost(initial.id, body, auth.token)
        : await api.createPost(body, auth.token)
      onSave(saved)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{initial ? 'Edit Post' : 'Write a Post'}</div>
        <Alert msg={error} />

        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={form.title}
            onChange={set('title')}
            placeholder="Your post title…"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            className="form-input"
            value={form.content}
            onChange={set('content')}
            placeholder="Write your story…"
            style={{ minHeight: 220 }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <input
            className="form-input"
            value={form.tags}
            onChange={set('tags')}
            placeholder="tech, writing, ideas  (comma-separated)"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Saving…' : initial ? 'Update Post' : 'Publish Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}
