const BASE = ''  // empty = use Vite proxy (proxies /api → http://localhost:8080)

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

async function call(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(token),
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  
  const json = await res.json()
  
  // Handle error responses
  if (!json.success) {
    const error = new Error(json.message || 'An error occurred')
    error.status = res.status
    error.details = json.data?.details
    
    // Check if it's a session expired (401 on protected endpoints, not auth endpoints)
    if (res.status === 401 && !path.includes('/api/auth/')) {
      sessionStorage.removeItem('blog_auth')
      // Dispatch event to notify auth context
      window.dispatchEvent(new CustomEvent('tokenExpired'))
    } else if (res.status === 401 || res.status === 400 || res.status >= 500) {
      // For auth errors (login/register) and other errors, dispatch a general error event
      window.dispatchEvent(new CustomEvent('apiError', { detail: { message: json.message, details: json.data?.details } }))
    }
    
    throw error
  }
  
  return json.data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login    = (body)          => call('POST', '/api/auth/login', body)
export const register = (body)          => call('POST', '/api/auth/register', body)

// ── Posts ─────────────────────────────────────────────────────────────────────
export const getPosts        = (page = 0, size = 9, token)              => call('GET',    `/api/posts?page=${page}&size=${size}`, null, token)
export const getPost         = (id, token)                              => call('GET',    `/api/posts/${id}`, null, token)
export const createPost      = (body, token)                            => call('POST',   '/api/posts', body, token)
export const updatePost      = (id, body, token)                        => call('PUT',    `/api/posts/${id}`, body, token)
export const deletePost      = (id, token)                              => call('DELETE', `/api/posts/${id}`, null, token)
export const publishPost     = (id, token)                              => call('POST',   `/api/posts/${id}/publish`, null, token)
export const unpublishPost   = (id, token)                              => call('POST',   `/api/posts/${id}/unpublish`, null, token)
export const searchPosts     = (keyword, page = 0, size = 9, token)    => call('GET',    `/api/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, null, token)
export const getPostsByAuthor = (authorId, page = 0, size = 9, token)  => call('GET',    `/api/posts/author/${authorId}?page=${page}&size=${size}`, null, token)

// ── Comments ──────────────────────────────────────────────────────────────────
export const getComments   = (postId, token)          => call('GET',    `/api/posts/${postId}/comments`, null, token)
export const addComment    = (postId, body, token)    => call('POST',   `/api/posts/${postId}/comments`, body, token)
export const updateComment = (id, body, token)        => call('PUT',    `/api/comments/${id}`, body, token)
export const deleteComment = (id, token)              => call('DELETE', `/api/comments/${id}`, null, token)

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUser        = (id, token)          => call('GET',    `/api/users/${id}`, null, token)
export const getUserByName  = (username, token)    => call('GET',    `/api/users/username/${username}`, null, token)
export const updateUser     = (id, body, token)    => call('PUT',    `/api/users/${id}`, body, token)
export const deleteUser     = (id, token)          => call('DELETE', `/api/users/${id}`, null, token)
export const getAllUsers     = (token)             => call('GET',    '/api/users', null, token)
