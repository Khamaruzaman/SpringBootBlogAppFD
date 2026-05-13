import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavContext";
import { Loading, Alert } from "../components/shared";
import PostFormModal from "../components/PostFormModal";
import CommentSection from "../components/CommentSection";
import { fmtDate } from "../utils/helpers";
import * as api from "../api/blogApi";
import styles from "./PostPage.module.css";

export default function PostPage({ id }) {
  const { auth } = useAuth();
  const { navigate, goBack } = useNav();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.getPost(id, auth?.token);
      setPost(p);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [id, auth]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePublishToggle = async () => {
    try {
      const updated = post.published
        ? await api.unpublishPost(id, auth.token)
        : await api.publishPost(id, auth.token);
      setPost(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      await api.deletePost(id, auth.token);
      goBack();
    } catch (e) {
      setError(e.message);
    }
  };

  const isAuthor = post && auth && post.author?.username === auth.username;

  if (loading)
    return (
      <div className="container">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="container" style={{ padding: "40px 0" }}>
        <Alert msg={error} />
      </div>
    );
  if (!post) return null;

  return (
    <article className={styles.page}>
      <button className="back-link" onClick={() => goBack()}>
        ← Back
      </button>

      <header className={styles.header}>
        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.map((t) => (
              <span key={t} className="tag accent">
                {t}
              </span>
            ))}
          </div>
        )}
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <button
            className={styles.authorLink}
            onClick={() => navigate("profile", { userId: post.author?.id })}
          >
            by {post.author?.username}
          </button>
          <span className="divider">·</span>
          <span className={styles.metaText}>{fmtDate(post.createdAt)}</span>
          <span className="divider">·</span>
          <span className={styles.metaText}>👁 {post.views ?? 0} views</span>
          {post.published !== undefined && (
            <>
              <span className="divider">·</span>
              <span
                className={`publish-badge ${post.published ? "badge-published" : "badge-draft"}`}
              >
                {post.published ? "Published" : "Draft"}
              </span>
            </>
          )}
        </div>
      </header>

      <Alert msg={error} />
      <div className={styles.content}>{post.content}</div>

      {isAuthor && (
        <div className={styles.actionsBar}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditingPost(true)}
          >
            ✎ Edit
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handlePublishToggle}
          >
            {post.published ? "⊘ Unpublish" : "✓ Publish"}
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            ✕ Delete
          </button>
        </div>
      )}

      <CommentSection postId={id} />

      {editingPost && (
        <PostFormModal
          initial={post}
          onClose={() => setEditingPost(false)}
          onSave={(updated) => {
            setPost(updated);
            setEditingPost(false);
          }}
        />
      )}
    </article>
  );
}
