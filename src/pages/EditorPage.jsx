import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bold, Italic, Strikethrough, Heading1, Heading2,
  Quote, List, Code, Code2, Link, Minus,
  Eye, Save, Send, Rocket, X, Check, Hash,
  AlignLeft, Type, Smile
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAutosave, useTextStats, useAsync, simulateAsync } from '../hooks'
import PreviewModal from '../components/PreviewModal'
import { AVATAR_GRADIENTS, CATEGORIES } from '../data/posts'

// ─── Toolbar config ──────────────────────────────────────────────────────────
const TOOLBAR = [
  {
    group: 'format',
    items: [
      { Icon: Bold,          label: 'B',   title: 'Bold (Ctrl+B)',   action: (ins) => ins('**', '**') },
      { Icon: Italic,        label: 'I',   title: 'Italic (Ctrl+I)', action: (ins) => ins('_', '_'), style: { fontStyle: 'italic' } },
      { Icon: Strikethrough, label: 'S',   title: 'Strikethrough',   action: (ins) => ins('~~', '~~') },
    ]
  },
  {
    group: 'headings',
    items: [
      { Icon: Heading1, label: 'H1', title: 'Heading 1', action: (ins) => ins('\n# ', '') },
      { Icon: Heading2, label: 'H2', title: 'Heading 2', action: (ins) => ins('\n## ', '') },
      { Icon: Quote,    label: '"',  title: 'Blockquote', action: (ins) => ins('\n> ', '') },
    ]
  },
  {
    group: 'lists',
    items: [
      { Icon: List,  label: '—', title: 'Bullet list', action: (ins) => ins('\n- ', '') },
      { Icon: Code,  label: '</>', title: 'Inline code', action: (ins) => ins('`', '`') },
      { Icon: Code2, label: '{}', title: 'Code block', action: (ins) => ins('\n```\n', '\n```') },
    ]
  },
  {
    group: 'misc',
    items: [
      { Icon: Link,  label: '🔗', title: 'Link', action: (ins) => ins('[', '](url)') },
      { Icon: Minus, label: '—',  title: 'Divider', action: (ins) => ins('\n---\n', '') },
    ]
  },
]

// ─── Publish Flow Panel ──────────────────────────────────────────────────────
function PublishPanel({ onDraft, onReview, onPublish, loading }) {
  const STEPS = [
    { icon: '📝', label: 'Save Draft',     desc: 'Continue editing later', action: onDraft,   cls: 'btn-surface',  key: 'draft' },
    { icon: '🔍', label: 'Submit Review',  desc: 'Send for peer review',   action: onReview,  cls: 'btn-surface',  key: 'review' },
    { icon: '🚀', label: 'Publish Now',    desc: 'Go live immediately',    action: onPublish, cls: 'btn-primary', key: 'publish' },
  ]

  return (
    <div className="panel">
      <div className="panel-header">
        <AlignLeft size={14} className="panel-header-icon" />
        Publish Flow
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {STEPS.map(s => (
          <button
            key={s.key}
            className={`btn ${s.cls}`}
            style={{ width: '100%', justifyContent: 'flex-start', gap: 10, padding: '9px 12px' }}
            onClick={s.action}
            disabled={loading}
          >
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13 }}>{s.label}</div>
              <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 400 }}>{s.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Quality Checklist ───────────────────────────────────────────────────────
function QualityPanel({ title, body, tags, category, wordCount }) {
  const checks = [
    { label: 'Title added',           done: title.trim().length > 5 },
    { label: 'Content written',       done: body.length > 50 },
    { label: 'At least one tag',      done: tags.length > 0 },
    { label: 'Category selected',     done: !!category },
    { label: 'Long-form (200+ words)', done: wordCount >= 200 },
    { label: 'In-depth (500+ words)', done: wordCount >= 500 },
  ]

  const done  = checks.filter(c => c.done).length
  const score = Math.round((done / checks.length) * 100)

  return (
    <div className="panel">
      <div className="panel-header">
        <Type size={14} className="panel-header-icon" />
        Post Quality
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', marginLeft: 'auto' }}>
          {score}%
        </span>
      </div>
      <div className="panel-body">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${score}%` }} />
        </div>
        <div className="checklist">
          {checks.map(c => (
            <div key={c.label} className={`check-item ${c.done ? 'done' : 'todo'}`}>
              {c.done
                ? <Check size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                : <div style={{ width: 14, height: 14, borderRadius: 4, border: '1.5px solid var(--border2)', flexShrink: 0 }} />
              }
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export default function EditorPage() {
  const { dispatch, addToast, editingPost, setEditingPost } = useApp()
  const navigate = useNavigate()

  const [title,    setTitle]    = useState(editingPost?.title    || '')
  const [body,     setBody]     = useState(editingPost?.body     || '')
  const [category, setCategory] = useState(editingPost?.category || 'Technology')
  const [tagInput, setTagInput] = useState('')
  const [tags,     setTags]     = useState(editingPost?.tags     || [])
  const [preview,  setPreview]  = useState(false)
  const bodyRef = useRef(null)

  const { wordCount, readTime } = useTextStats(body)
  const { loading, run } = useAsync()

  const titleLen = title.length
  const MAX_TITLE = 120

  // Autosave simulation
  const saveStatus = useAutosave(
    () => simulateAsync(600),
    [title, body, tags, category]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'b') { e.preventDefault(); insertFormat('**', '**') }
        if (e.key === 'i') { e.preventDefault(); insertFormat('_', '_') }
        if (e.key === 's') { e.preventDefault(); handleSave('draft') }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, tags, category])

  const insertFormat = useCallback((prefix, suffix) => {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const selected = body.substring(s, e)
    const newBody  = body.substring(0, s) + prefix + selected + suffix + body.substring(e)
    setBody(newBody)
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = s + prefix.length + selected.length + suffix.length
      el.focus()
    }, 0)
  }, [body])

  const addTag = () => {
    const cleaned = tagInput.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (cleaned && !tags.includes(cleaned) && tags.length < 8) {
      setTags(prev => [...prev, cleaned])
      setTagInput('')
    }
  }

  const buildPost = (status) => ({
    id: editingPost?.id || Date.now(),
    title: title.trim(),
    body: body.trim(),
    tags, category, status,
    author: 'You',
    authorHandle: '@you',
    likes:     editingPost?.likes     || 0,
    comments:  editingPost?.comments  || 0,
    reposts:   editingPost?.reposts   || 0,
    bookmarks: editingPost?.bookmarks || 0,
    liked:     editingPost?.liked     || false,
    bookmarked: editingPost?.bookmarked || false,
    reposted:  editingPost?.reposted  || false,
    createdAt: editingPost?.createdAt || 'Just now',
    readTime, wordCount,
    avatarIdx: editingPost?.avatarIdx ?? (Date.now() % AVATAR_GRADIENTS.length),
  })

  const handleSave = async (status, toastMsg, successPath) => {
    if (!title.trim()) { addToast('Add a title first!', 'error'); return }
    if (status === 'published' && body.length < 50) {
      addToast('Need at least 50 characters to publish!', 'error'); return
    }

    await run(async () => {
      await simulateAsync(status === 'published' ? 1800 : 1000)
      const post = buildPost(status)
      if (editingPost) {
        dispatch({ type: 'UPDATE_POST', id: editingPost.id, updates: post })
      } else {
        dispatch({ type: 'ADD_POST', post })
      }
      addToast(toastMsg, 'success')
      setEditingPost(null)
      navigate(successPath || '/')
    })
  }

  const previewPost = {
    ...buildPost('draft'),
    status: editingPost?.status || 'draft',
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          {editingPost
            ? <><span>✏️</span> Editing: <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{editingPost.title.substring(0, 32)}{editingPost.title.length > 32 ? '…' : ''}</span></>
            : <><span>✨</span> New Post</>
          }
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setPreview(true)}>
            <Eye size={13} /> Preview
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleSave('draft', '💾 Saved to drafts!', '/drafts')}
            disabled={loading}
          >
            <Save size={13} /> {loading ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleSave('review', '📤 Submitted for review!', '/review')}
            disabled={loading}
          >
            <Send size={13} /> Review
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleSave('published', '🚀 Published!', '/published')}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" /> Publishing…</>
              : <><Rocket size={13} /> Publish</>
            }
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="editor-layout">
          {/* ── Left: editor ── */}
          <div>
            <div className="editor-main">
              {/* Toolbar */}
              <div className="editor-toolbar">
                {TOOLBAR.map((group, gi) => (
                  <div key={group.group} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {gi > 0 && <div className="toolbar-divider" />}
                    {group.items.map(item => (
                      <button
                        key={item.title}
                        className="toolbar-btn"
                        title={item.title}
                        onClick={() => item.action(insertFormat)}
                        style={item.style}
                      >
                        <item.Icon size={13} />
                      </button>
                    ))}
                  </div>
                ))}

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="meta-chip">📖 ~{readTime}m</span>
                  <span className="meta-chip">{wordCount.toLocaleString()} words</span>
                  <span className="meta-chip">{body.length} chars</span>
                </div>
              </div>

              {/* Title */}
              <div className="editor-title-wrap">
                <textarea
                  className="editor-title"
                  placeholder="Write a compelling title…"
                  value={title}
                  onChange={e => {
                    if (e.target.value.length <= MAX_TITLE) setTitle(e.target.value)
                  }}
                  rows={1}
                  style={{ resize: 'none', overflow: 'hidden' }}
                  onInput={e => {
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                />
                <span className={`editor-title-counter ${
                  titleLen > MAX_TITLE * 0.85 ? (titleLen >= MAX_TITLE ? 'over' : 'warn') : ''
                }`}>
                  {titleLen}/{MAX_TITLE}
                </span>
              </div>

              {/* Body */}
              <textarea
                ref={bodyRef}
                className="editor-body"
                placeholder={`Start writing your post…\n\nTips:\n• Use the toolbar for Markdown formatting\n• Ctrl+B for bold, Ctrl+I for italic\n• Ctrl+S to save draft`}
                value={body}
                onChange={e => setBody(e.target.value)}
              />

              {/* Status bar */}
              <div className="editor-statusbar">
                <div className="save-status">
                  <div className={`save-dot ${saveStatus}`} />
                  <span>
                    {saveStatus === 'saving' ? 'Saving…'
                      : saveStatus === 'saved' ? 'All changes saved'
                      : 'Auto-save enabled'}
                  </span>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 11, color: 'var(--text3)' }}>
                  <span>Markdown supported</span>
                  <span className="kbd">Ctrl+B</span><span style={{fontSize:10}}>bold</span>
                  <span className="kbd">Ctrl+I</span><span style={{fontSize:10}}>italic</span>
                  <span className="kbd">Ctrl+S</span><span style={{fontSize:10}}>save</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: sidebar ── */}
          <div className="editor-sidebar">
            <QualityPanel title={title} body={body} tags={tags} category={category} wordCount={wordCount} />

            <div className="panel">
              <div className="panel-header">
                <Hash size={14} className="panel-header-icon" />
                Post Details
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags ({tags.length}/8)</label>
                  <div className="tag-input-row">
                    <input
                      className="form-input"
                      placeholder="Add tag…"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
                        if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                          setTags(prev => prev.slice(0, -1))
                        }
                      }}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={addTag} disabled={tags.length >= 8}>
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="tags-list">
                      {tags.map(t => (
                        <div key={t} className="tag-item">
                          #{t}
                          <button className="tag-remove" onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <PublishPanel
              onDraft={()  => handleSave('draft',     '💾 Draft saved!',          '/drafts')}
              onReview={()  => handleSave('review',    '📤 Submitted for review!', '/review')}
              onPublish={() => handleSave('published', '🚀 Published!',            '/published')}
              loading={loading}
            />

            {editingPost && (
              <div className="panel">
                <div className="panel-header">⚠️ Danger Zone</div>
                <div className="panel-body">
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                    Discard all unsaved changes and return to feed.
                  </p>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => { setEditingPost(null); navigate('/') }}
                  >
                    <X size={13} /> Discard Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {preview && <PreviewModal post={previewPost} onClose={() => setPreview(false)} />}
    </>
  )
}
