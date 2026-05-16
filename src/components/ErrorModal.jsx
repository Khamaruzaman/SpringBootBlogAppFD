import { useAuth } from '../context/AuthContext'
import styles from './shared.module.css'

export default function ErrorModal() {
  const { apiError, clearApiError } = useAuth()

  if (!apiError) return null

  const handleClose = () => {
    clearApiError()
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Error</h2>
        </div>
        <div className={styles.modalBody}>
          <p>{apiError.message}</p>
          {apiError.details && (
            <div className={styles.errorDetails}>
              <strong>Details:</strong>
              <p>{apiError.details}</p>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-primary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
