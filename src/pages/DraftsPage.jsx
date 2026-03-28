import { useNavigate } from 'react-router-dom'
import { FileText, Zap, Send, PenLine } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAsync, simulateAsync } from '../hooks'
import PostCard from '../components/PostCard'

export default function DraftsPage() {
  const { drafts, dispatch, addToast, setEditingPost } = useApp()
  const navigate = useNavigate()
  const { loading, run } = useAsync()

  const quickPublish = async (post) => {
    await run(async () => {
      await simulateAsync(1400)
      dispatch({ type: 'UPDATE_POST', id: post.id, updates: { status: 'published', createdAt: 'Just now' } })
      addToast(`"${post.title.substring(0, 30)}…" published! 🚀`, 'success')
    })
  }

  const submitReview = (post) => {
    dispatch({ type: 'UPDATE_POST', id: post.id, updates: { status: 'review', createdAt: 'Just now' } })
    addToast('Submitted for review! 🔍', 'info')
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <FileText size={18} />
          Drafts
          <span style={{ fontWeight: 400, fontSize: 14, color: 'var(--text3)' }}>({drafts.length})</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/editor')}>
            <PenLine size={13} /> New Post
          </button>
        </div>
      </div>

      <div className="page-body">
        {drafts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <div className="empty-title">No drafts</div>
            <div className="empty-sub">Your unpublished drafts will appear here. Start writing!</div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/editor')}>
              <PenLine size={14} /> Create Draft
            </button>
          </div>
        ) : (
          drafts.map((post, i) => (
            <div key={post.id} style={{ animationDelay: `${i * 50}ms` }}>
              <PostCard post={post} />
              <div className="quick-actions">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => quickPublish(post)}
                  disabled={loading}
                >
                  {loading ? <><span className="spinner" /> Publishing…</> : <><Zap size={12} /> Quick Publish</>}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => submitReview(post)}>
                  <Send size={12} /> Submit Review
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEditingPost(post); navigate('/editor') }}
                >
                  <PenLine size={12} /> Continue Editing
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
