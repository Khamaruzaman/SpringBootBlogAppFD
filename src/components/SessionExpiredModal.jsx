import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import styles from './shared.module.css'

export default function SessionExpiredModal() {
  const { tokenExpired, clearTokenExpired } = useAuth()
  const { navigate } = useNav()

  if (!tokenExpired) return null

  const handleRedirect = () => {
    clearTokenExpired()
    navigate('login')
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Session Expired</h2>
        </div>
        <div className={styles.modalBody}>
          <p>Your login session has expired. Please sign in again to continue.</p>
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-primary" onClick={handleRedirect}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
