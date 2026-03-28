import { useState } from 'react'
import {
  MapPin, Link2, Calendar, Settings, Edit2,
  Check, X, Heart, MessageCircle, Repeat2,
  Bookmark, Globe, FileText, Users, Award,
  TrendingUp
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useAsync, simulateAsync } from '../hooks'
import PostCard from '../components/PostCard'
import { AVATAR_GRADIENTS } from '../data/posts'

const COVERS = [
  'linear-gradient(135deg,#7c6ff7 0%,#c471f5 50%,#f97316 100%)',
  'linear-gradient(135deg,#22c55e 0%,#38bdf8 100%)',
  'linear-gradient(135deg,#f43f5e 0%,#f97316 100%)',
  'linear-gradient(135deg,#0f0f18 0%,#7c6ff7 100%)',
  'linear-gradient(135deg,#38bdf8 0%,#a855f7 100%)',
]

const ACHIEVEMENTS = [
  { icon: '🚀', label: 'First Post',   check: (p) => p.length >= 1 },
  { icon: '🌐', label: 'Published',    check: (_, pub) => pub.length >= 1 },
  { icon: '❤️', label: '100 Likes',   check: (_, __, tl) => tl >= 100 },
  { icon: '🔁', label: 'Viral',        check: (_, __, _2, tr) => tr >= 10 },
  { icon: '⭐', label: '500 Likes',   check: (_, __, tl) => tl >= 500 },
  { icon: '🏆', label: 'Power User',  check: (p, _, tl) => p.length >= 5 && tl >= 200 },
]

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const { posts, totalLikes, totalComments, totalReposts, totalBookmarks, published } = useApp()
  const navigate = useNavigate()
  const { loading, run } = useAsync()

  const [activeTab, setActiveTab] = useState('posts')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarIdx: user?.avatarIdx ?? 0,
    coverIdx: user?.coverIdx ?? 0,
    twitter: user?.twitter || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
  })

  if (!user) return null

  const [uc1, uc2] = AVATAR_GRADIENTS[form.avatarIdx]
  const cover = COVERS[form.coverIdx]

  const myPosts    = posts
  const bookmarked = posts.filter(p => p.bookmarked)
  const liked      = posts.filter(p => p.liked)

  const tabContent = { posts: myPosts, bookmarks: bookmarked, liked }
  const currentPosts = tabContent[activeTab] || []

  const TABS = [
    { key: 'posts',     label: 'Posts',     icon: FileText,   count: myPosts.length },
    { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark,   count: bookmarked.length },
    { key: 'liked',     label: 'Liked',     icon: Heart,      count: liked.length },
  ]

  const STATS = [
    { icon: FileText,      label: 'Total Posts',  value: posts.length },
    { icon: Globe,         label: 'Published',    value: published.length },
    { icon: Heart,         label: 'Likes',        value: totalLikes },
    { icon: MessageCircle, label: 'Comments',     value: totalComments },
    { icon: Repeat2,       label: 'Reposts',      value: totalReposts },
    { icon: Bookmark,      label: 'Bookmarks',    value: totalBookmarks },
  ]

  const handleSave = () => run(async () => {
    await simulateAsync(700)
    updateProfile(form)
    setEditing(false)
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCancel = () => {
    setForm({ name: user.name, bio: user.bio, location: user.location, website: user.website })
    setEditing(false)
  }

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-title">
          <Users size={16} /> Profile
        </div>
        <div className="topbar-actions">
          {editing ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
                <X size={12} /> Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Saving…</>
                  : <><Check size={12} /> Save</>}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')}>
                <Settings size={12} /> Settings
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
                <Edit2 size={12} /> Edit Profile
              </button>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={handleLogout}>
                Log Out
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: 0 }}>

        {/* ── Cover ── */}
        <div style={{ height: 140, background: cover, position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(7,7,13,0.92) 100%)'
          }} />
        </div>

        {/* ── Hero row ── */}
        <div className="pf-hero">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="pf-avatar" style={{ background: `linear-gradient(135deg,${uc1},${uc2})` }}>
              {user.name[0]}
            </div>
            {user.verified && <span className="pf-verified">✓</span>}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <form className="pf-edit-grid" style={{ gridTemplateColumns: '1fr 1fr' }} onSubmit={e => { e.preventDefault(); handleSave(); }}>
                {/* Avatar Picker */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Avatar Style</label>
                  <select className="form-input" value={form.avatarIdx} onChange={e => setForm(p => ({ ...p, avatarIdx: Number(e.target.value) }))}>
                    {AVATAR_GRADIENTS.map((g, i) => (
                      <option key={i} value={i}>Avatar {i + 1}</option>
                    ))}
                  </select>
                </div>
                {/* Cover Picker */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cover Style</label>
                  <select className="form-input" value={form.coverIdx} onChange={e => setForm(p => ({ ...p, coverIdx: Number(e.target.value) }))}>
                    {COVERS.map((c, i) => (
                      <option key={i} value={i}>Cover {i + 1}</option>
                    ))}
                  </select>
                </div>
                {/* Name */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                {/* Email */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                {/* Phone */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                {/* Location */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="City, Country" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                {/* Bio */}
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" style={{ minHeight: 52 }} maxLength={160} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                </div>
                {/* Website */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Website</label>
                  <input className="form-input" placeholder="https://yoursite.com" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                </div>
                {/* Social Links */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Twitter</label>
                  <input className="form-input" placeholder="@yourhandle" value={form.twitter} onChange={e => setForm(p => ({ ...p, twitter: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">LinkedIn</label>
                  <input className="form-input" placeholder="linkedin.com/in/yourprofile" value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">GitHub</label>
                  <input className="form-input" placeholder="github.com/yourprofile" value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} />
                </div>
                {/* Active Status Toggle */}
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Active Status</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                      style={{ width: 18, height: 18 }}
                    />
                    {form.isActive ? 'Active' : 'Inactive'}
                  </label>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel}>
                    <X size={12} /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? <><span className="spinner" /> Saving…</> : <><Check size={12} /> Save</>}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                  <h1 className="pf-name">{user.name}</h1>
                  {user.verified && (
                    <span className="pf-verified-label"><Check size={9} /> Verified</span>
                  )}
                </div>
                <div className="pf-handle">{user.handle}</div>
                              <div style={{ margin: '4px 0 8px 0', fontWeight: 500, color: user.isActive ? '#22c55e' : '#ef4444' }}>
                                Status: {user.isActive ? 'Active' : 'Inactive'}
                              </div>
                {user.bio && <p className="pf-bio">{user.bio}</p>}
                <div className="pf-meta">
                  {user.location && (
                    <span className="pf-meta-item"><MapPin size={11} /> {user.location}</span>
                  )}
                  {user.website && (
                    <a href={user.website} className="pf-meta-item pf-meta-link" target="_blank" rel="noopener noreferrer">
                      <Link2 size={11} /> {user.website.replace('https://', '')}
                    </a>
                  )}
                  <span className="pf-meta-item"><Calendar size={11} /> Joined {user.joinedAt}</span>
                </div>
              </>
            )}
          </div>

          {/* Follow counts */}
          <div className="pf-follow-block">
            <div className="pf-follow-item">
              <span className="pf-follow-num">{user.followers?.toLocaleString()}</span>
              <span className="pf-follow-label">Followers</span>
            </div>
            <div className="pf-follow-divider" />
            <div className="pf-follow-item">
              <span className="pf-follow-num">{user.following?.toLocaleString()}</span>
              <span className="pf-follow-label">Following</span>
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="pf-body">

          {/* ── LEFT sidebar ── */}
          <aside className="pf-sidebar">

            {/* Stats widget */}
            <div className="pf-widget">
              <div className="pf-widget-title"><TrendingUp size={12} /> Stats</div>
              {STATS.map(s => (
                <div key={s.label} className="pf-stat-row">
                  <span className="pf-stat-label">
                    <s.icon size={12} style={{ color: 'var(--accent)' }} /> {s.label}
                  </span>
                  <span className="pf-stat-val">{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="pf-widget">
              <div className="pf-widget-title"><Award size={12} /> Achievements</div>
              <div className="pf-achievements-grid">
                {ACHIEVEMENTS.map(a => {
                  const earned = a.check(posts, published, totalLikes, totalReposts)
                  return (
                    <div
                      key={a.label}
                      className={`pf-badge ${earned ? 'pf-badge-earned' : 'pf-badge-locked'}`}
                      title={earned ? a.label : `${a.label} (locked)`}
                    >
                      <span style={{ fontSize: 18 }}>{a.icon}</span>
                      <span className="pf-badge-label">{a.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </aside>

          {/* ── RIGHT content ── */}
          <div className="pf-content">
            {/* Tabs */}
            <div className="pf-tabs">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`pf-tab ${activeTab === t.key ? 'pf-tab-active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  <t.icon size={13} />
                  {t.label}
                  <span className="pf-tab-count">{t.count}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="pf-tab-body">
              {currentPosts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    {activeTab === 'bookmarks' ? '🔖' : activeTab === 'liked' ? '❤️' : '✍️'}
                  </div>
                  <div className="empty-title">Nothing here yet</div>
                  <div className="empty-sub">
                    {activeTab === 'bookmarks'
                      ? 'Bookmark posts to see them here.'
                      : activeTab === 'liked'
                        ? 'Posts you like will appear here.'
                        : 'Start creating content!'}
                  </div>
                  {activeTab === 'posts' && (
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/editor')}>
                      Create your first post
                    </button>
                  )}
                </div>
              ) : (
                currentPosts.map((post, i) => (
                  <div key={post.id} style={{ animationDelay: `${i * 35}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
