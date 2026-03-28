import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine, Search, TrendingUp, Heart, MessageCircle, Repeat2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PostCard from '../components/PostCard'
import { useDebounce } from '../hooks'

const FILTERS = [
  { key: 'all',       label: '⚡ All' },
  { key: 'draft',     label: '📝 Drafts' },
  { key: 'review',    label: '🔍 Review' },
  { key: 'published', label: '✅ Published' },
]

function StatCard({ label, value, sub, cls, icon }) {
  return (
    <div className={`stat-card ${cls}`}>
      <div className="stat-card-bg">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {sub && <div className="stat-delta">{sub}</div>}
    </div>
  )
}

export default function FeedPage() {
  const { posts, dispatch, totalLikes, totalComments, totalReposts, drafts, review, published } = useApp()
  const navigate  = useNavigate()
  const [filter,   setFilter]  = useState('all')
  const [search,   setSearch]  = useState('')
  const debSearch  = useDebounce(search, 250)

  const filtered = posts.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = !debSearch ||
      p.title.toLowerCase().includes(debSearch.toLowerCase()) ||
      p.tags.some(t => t.includes(debSearch.toLowerCase())) ||
      p.category?.toLowerCase().includes(debSearch.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <TrendingUp size={18} />
          Your Feed
        </div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon"><Search /></span>
            <input
              className="search-input"
              placeholder="Search posts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/editor')}>
            <PenLine size={14} /> New Post
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          <StatCard label="Total Posts"   value={posts.length}      sub={`${published.length} live`} cls="purple" icon="📄" />
          <StatCard label="Total Likes"   value={totalLikes}         sub="across all posts"           cls="green"  icon="❤️" />
          <StatCard label="Comments"      value={totalComments}      sub="& counting"                 cls="blue"   icon="💬" />
          <StatCard label="Reposts"       value={totalReposts}       sub="total shares"               cls="orange" icon="🔁" />
        </div>

        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="filter-count">
                ({f.key === 'all' ? posts.length : f.key === 'draft' ? drafts.length : f.key === 'review' ? review.length : published.length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{search ? '🔍' : '✍️'}</div>
            <div className="empty-title">{search ? 'No results found' : 'Nothing here yet'}</div>
            <div className="empty-sub">
              {search
                ? `No posts matching "${search}"`
                : 'Create your first post to get started!'}
            </div>
            {!search && (
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/editor')}>
                <PenLine size={14} /> Create Post
              </button>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((post, i) => (
              <div key={post.id} style={{ animationDelay: `${i * 40}ms` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
