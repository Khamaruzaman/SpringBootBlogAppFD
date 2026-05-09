import { useNav } from '../context/NavContext'
import { fmtDate, excerpt } from '../utils/helpers'
import styles from './shared.module.css'

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', msg }) {
  if (!msg) return null
  return <div className={`alert alert-${type}`}>{msg}</div>
}

// ── Loading ───────────────────────────────────────────────────────────────────
export function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <br />Loading…
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 0}>
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`page-btn ${i === page ? 'active' : ''}`}
          onClick={() => onPage(i)}
        >
          {i + 1}
        </button>
      ))}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages - 1}>
        Next →
      </button>
    </div>
  )
}

// ── PostCard ──────────────────────────────────────────────────────────────────
export function PostCard({ post }) {
  const { navigate } = useNav()
  return (
    <div className={styles.card} onClick={() => navigate('post', { id: post.id })}>
      <div className={styles.cardTop} />
      <div className={styles.cardBody}>
        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <div className={styles.cardTitle}>{post.title}</div>
        <div className={styles.cardExcerpt}>{excerpt(post.content)}</div>
        <div className={styles.cardMeta}>
          <div>
            <div className={styles.cardAuthor}>by {post.author?.username || 'Unknown'}</div>
            <div className={styles.cardDate}>{fmtDate(post.createdAt)}</div>
          </div>
          <div className={styles.cardViews}>👁 {post.views ?? 0}</div>
        </div>
      </div>
    </div>
  )
}

// ── PostGrid ──────────────────────────────────────────────────────────────────
export function PostGrid({ posts }) {
  return (
    <div className={styles.grid}>
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  )
}
