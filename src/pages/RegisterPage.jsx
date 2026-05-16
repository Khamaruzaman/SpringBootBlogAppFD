import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import { Alert } from '../components/shared'
import PasswordInput from '../components/PasswordInput'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const { navigate } = useNav()
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    const { username, email, password, confirmPassword } = form
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill all fields.'); return
    }
    if (password !== confirmPassword) { setError("Passwords don't match."); return }
    setLoading(true); setError('')
    try {
      await register(username, email, password, confirmPassword)
      navigate('home')
    } catch (e) { setError(e.message || 'Registration failed.') }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Join Us</h1>
      <p className={styles.sub}>Start writing today.</p>
      <Alert msg={error} />

      <div className="form-group">
        <label className="form-label">Username</label>
        <input className="form-input" value={form.username} onChange={set('username')} placeholder="5-15 chars, letters/numbers/_" />
        <div className="form-hint">Pattern: a–z, A–Z, 0–9, _ (5–15 chars)</div>
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
      </div>

      <PasswordInput
        label="Password"
        value={form.password}
        onChange={set('password')}
        placeholder="Min. 8 characters"
      />

      <PasswordInput
        label="Confirm Password"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        placeholder="Repeat password"
      />

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit} disabled={loading}>
        {loading ? 'Creating…' : 'Create Account →'}
      </button>

      <div className="form-footer">
        Already a member?{' '}
        <button className="form-link" onClick={() => navigate('login')}>Sign in</button>
      </div>
    </div>
  )
}
