import { useState } from 'react'
import { Heart, MessageCircle, Repeat2, Bookmark, Edit2, Trash2, Eye, Hash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import StatusBadge from './StatusBadge'
import ConfirmModal from './ConfirmModal'
import PreviewModal from './PreviewModal'
import CommentsModal from './CommentsModal'
import { AVATAR_GRADIENTS } from '../data/posts'

function ActionButton({ icon: Icon, count, active, activeClass, onClick, title, filled }) {
  return (
    <button
      className={`action-btn ${active ? activeClass : ''}`}
      onClick={e => { e.stopPropagation(); onClick?.() }}
      title={title}
    >
      <Icon size={14} fill={filled && active ? 'currentColor' : 'none'} />
      {count > 0 && <span>{count.toLocaleString()}</span>}
    </button>
  )
}

export default function PostCard({ post, compact = false, extraActions }) {
  const { dispatch, addToast, setEditingPost, getCommentsForPost } = useApp()
  const navigate = useNavigate()
  const [confirming,     setConfirming]     = useState(false)
  const [showPreview,    setShowPreview]    = useState(false)
  const [showComments,   setShowComments]   = useState(false)

  const [c1, c2] = AVATAR_GRADIENTS[post.avatarIdx ?? 0]
  const commentCount = getCommentsForPost(post.id).length

  const handleEdit = e => {
    e.stopPropagation()
    setEditingPost(post)
    navigate('/editor')
  }

  const handleDelete = () => {
    dispatch({ type: 'DELETE_POST', id: post.id })
    addToast('Post deleted.', 'warning')
  }

  const handleRepost = () => {
    dispatch({ type: 'TOGGLE_REPOST', id: post.id })
    if (!post.reposted) addToast('Reposted to your timeline! 🔁', 'success')
    else addToast('Repost removed.', 'info')
  }

  return (
    <>
      <article
        className="post-card"
        onClick={() => setShowPreview(true)}
        role="article"
        aria-label={post.title}
      >
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${c1}, ${c2})`,
          opacity: post.status === 'published' ? 1 : 0.3,
        }} />

        <div className="post-header">
          <div
            className="post-avatar"
            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
          >
            {post.author[0]}
          </div>
          <div className="post-meta">
            <div className="post-author">
              {post.author}
              <span className="post-handle">{post.authorHandle}</span>
              <span className="post-dot">·</span>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>{post.createdAt}</span>
            </div>
            <div className="post-time">
              <span className="meta-chip">📖 {post.readTime}m</span>
              <span className="meta-chip">{post.wordCount.toLocaleString()}w</span>
              {post.category && <span className="meta-chip">{post.category}</span>}
            </div>
          </div>
          <StatusBadge status={post.status} />
        </div>

        <div className="post-content">
          <div className="post-title">{post.title}</div>
          <div className="post-excerpt">
            {post.body.substring(0, compact ? 100 : 180)}
            {post.body.length > (compact ? 100 : 180) && '…'}
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(t => (
              <span key={t} className="tag">
                <Hash size={9} style={{ display: 'inline', marginRight: 2 }} />{t}
              </span>
            ))}
          </div>
        )}

        <div className="post-footer">
          <ActionButton
            icon={Heart} count={post.likes} active={post.liked} activeClass="active-like" filled
            onClick={() => dispatch({ type: 'TOGGLE_LIKE', id: post.id })} title="Like"
          />
          <button
            className="action-btn"
            onClick={e => { e.stopPropagation(); setShowComments(true) }}
            title="Comments"
          >
            <MessageCircle size={14} />
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
          <ActionButton
            icon={Repeat2} count={post.reposts} active={post.reposted} activeClass="active-repost"
            onClick={handleRepost} title="Repost"
          />
          <ActionButton
            icon={Bookmark} count={post.bookmarks} active={post.bookmarked} activeClass="active-bookmark" filled
            onClick={() => { dispatch({ type: 'TOGGLE_BOOKMARK', id: post.id }); if (!post.bookmarked) addToast('Saved to bookmarks!', 'success') }}
            title="Bookmark"
          />

          <div className="action-btn-sep">
            <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); setShowPreview(true) }}>
              <Eye size={11} /> Read
            </button>
            <button className="btn btn-ghost btn-xs" onClick={handleEdit}>
              <Edit2 size={11} /> Edit
            </button>
            <button className="btn btn-danger btn-xs" onClick={e => { e.stopPropagation(); setConfirming(true) }}>
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {extraActions}
      </article>

      {confirming && (
        <ConfirmModal
          icon="🗑️"
          title="Delete this post?"
          message={`"${post.title.substring(0, 50)}${post.title.length > 50 ? '…' : ''}" will be permanently deleted.`}
          onConfirm={() => { handleDelete(); setConfirming(false) }}
          onCancel={() => setConfirming(false)}
        />
      )}
      {showPreview    && <PreviewModal    post={post} onClose={() => setShowPreview(false)} />}
      {showComments   && <CommentsModal   post={post} onClose={() => setShowComments(false)} />}
    </>
  )
}
