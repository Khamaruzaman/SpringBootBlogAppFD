import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import { Alert } from '../components/shared'
import PasswordInput from '../components/PasswordInput'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const { navigate } = useNav()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.username || !form.password) { setError('Please fill all fields.'); return }
    setLoading(true); setError('')
    try {
      await login(form.username, form.password)
      navigate('home')
    } catch (e) {
      setError(e.message || 'Invalid credentials.')
    }
    setLoading(false)
  }

  const onKey = (e) => e.key === 'Enter' && submit()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Sign In</h1>
      <p className={styles.sub}>Welcome back, writer.</p>
      <Alert msg={error} />

      <div className="form-group">
        <label className="form-label">Username</label>
        <input
          className="form-input"
          value={form.username}
          onChange={set('username')}
          placeholder="your_username"
          autoComplete="username"
          onKeyDown={onKey}
        />
      </div>

      <PasswordInput
        label="Password"
        value={form.password}
        onChange={set('password')}
        placeholder="••••••••"
        autoComplete="current-password"
        onKeyDown={onKey}
      />

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>

      <div className="form-footer">
        New here?{' '}
        <button className="form-link" onClick={() => navigate('register')}>Create an account</button>
      </div>
    </div>
  )
}
