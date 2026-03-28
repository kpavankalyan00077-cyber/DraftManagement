import { createContext, useContext, useReducer, useCallback, useState } from 'react'
import { INITIAL_POSTS, INITIAL_COMMENTS } from '../data/posts'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

function postsReducer(state, action) {
  switch (action.type) {
    case 'ADD_POST':      return [action.post, ...state]
    case 'UPDATE_POST':   return state.map(p => p.id === action.id ? { ...p, ...action.updates } : p)
    case 'DELETE_POST':   return state.filter(p => p.id !== action.id)
    case 'TOGGLE_LIKE':   return state.map(p => p.id === action.id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)
    case 'TOGGLE_BOOKMARK': return state.map(p => p.id === action.id ? { ...p, bookmarked: !p.bookmarked, bookmarks: p.bookmarked ? p.bookmarks - 1 : p.bookmarks + 1 } : p)
    case 'TOGGLE_REPOST': return state.map(p => p.id === action.id ? { ...p, reposted: !p.reposted, reposts: p.reposted ? p.reposts - 1 : p.reposts + 1 } : p)
    case 'INCREMENT_COMMENTS': return state.map(p => p.id === action.id ? { ...p, comments: p.comments + 1 } : p)
    case 'DECREMENT_COMMENTS': return state.map(p => p.id === action.id ? { ...p, comments: Math.max(0, p.comments - 1) } : p)
    default: return state
  }
}

function commentsReducer(state, action) {
  switch (action.type) {
    case 'ADD_COMMENT':   return [action.comment, ...state]
    case 'DELETE_COMMENT': return state.filter(c => c.id !== action.id)
    case 'TOGGLE_COMMENT_LIKE': return state.map(c => c.id === action.id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c)
    case 'ADD_REPLY':     return state.map(c => c.id === action.parentId ? { ...c, replies: [...(c.replies || []), action.reply] } : c)
    case 'TOGGLE_REPLY_LIKE': return state.map(c => ({ ...c, replies: (c.replies || []).map(r => r.id === action.id ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) }))
    case 'DELETE_REPLY': return state.map(c => c.id === action.commentId ? { ...c, replies: (c.replies || []).filter(r => r.id !== action.replyId) } : c)
    default: return state
  }
}

export function AppProvider({ children }) {
  const [posts,    dispatch]         = useReducer(postsReducer,    INITIAL_POSTS)
  const [comments, commentsDispatch] = useReducer(commentsReducer, INITIAL_COMMENTS)
  const [toasts,       setToasts]      = useState([])
  const [editingPost,  setEditingPost] = useState(null)
  const [activePostId, setActivePostId]= useState(null)

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3600)
  }, [])

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  const getCommentsForPost = useCallback((postId) => comments.filter(c => c.postId === postId), [comments])

  const drafts    = posts.filter(p => p.status === 'draft')
  const review    = posts.filter(p => p.status === 'review')
  const published = posts.filter(p => p.status === 'published')
  const totalLikes     = posts.reduce((a, p) => a + p.likes, 0)
  const totalComments  = posts.reduce((a, p) => a + p.comments, 0)
  const totalReposts   = posts.reduce((a, p) => a + p.reposts, 0)
  const totalBookmarks = posts.reduce((a, p) => a + p.bookmarks, 0)

  return (
    <AppContext.Provider value={{
      posts, dispatch,
      comments, commentsDispatch, getCommentsForPost,
      drafts, review, published,
      totalLikes, totalComments, totalReposts, totalBookmarks,
      toasts, addToast, removeToast,
      editingPost, setEditingPost,
      activePostId, setActivePostId,
    }}>
      {children}
    </AppContext.Provider>
  )
}
