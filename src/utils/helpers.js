export const fmtDate = (s) => {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export const excerpt = (text, len = 130) => {
  if (!text) return ''
  return text.length > len ? text.slice(0, len).trim() + '…' : text
}

export const initials = (name) => (name || '?')[0].toUpperCase()
