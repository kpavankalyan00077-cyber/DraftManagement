import { useState, useEffect } from 'react'
import {
  Settings, User, Bell, Shield, Palette, Download,
  Trash2, Save, Info, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useAsync, simulateAsync } from '../hooks'
import { CATEGORIES } from '../data/posts'
import { AVATAR_GRADIENTS } from '../data/posts'

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  )
}

function SettingRow({ label, desc, checked, onChange }) {
  return (
    <div className="setting-row">
      <div className="setting-row-text">
        <div className="setting-row-label">{label}</div>
        {desc && <div className="setting-row-desc">{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

const SECTIONS = [
  { key: 'profile',  label: 'Profile',   icon: User },
  { key: 'prefs',    label: 'Preferences', icon: Bell },
  { key: 'privacy',  label: 'Privacy',   icon: Shield },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'about',    label: 'About',     icon: Info },
]

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { addToast } = useApp()
  const { loading, run } = useAsync()

  const [activeSection, setActiveSection] = useState('profile')

  const [profile, setProfile] = useState({
    name:    user?.name    || '',
    handle:  user?.handle  || '',
    bio:     user?.bio     || '',
    email:   user?.email   || '',
    website: user?.website || '',
    location:user?.location|| '',
    defaultCategory: 'Technology',
  })

  const [prefs, setPrefs] = useState({
    autosave:      true,
    notifications: true,
    analytics:     true,
    emailDigest:   false,
    showReadTime:  true,
    compactMode:   false,
  })

  const setPref  = (k, v) => setPrefs(p => ({ ...p, [k]: v }))
  const setField = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const [uc1, uc2] = AVATAR_GRADIENTS[user?.avatarIdx ?? 0]

  const [selectedTheme, setSelectedTheme] = useState('Dark')
  const [accentColor, setAccentColor] = useState(() => {
    const cssAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent')
    return cssAccent ? cssAccent.trim() : '#7c6ff7'
  })

  useEffect(() => {
    const themeMap = {
      Dark: {
        '--bg': '#07070d', '--surface': '#0e0e17', '--surface2': '#14141f', '--border': '#1f1f2e'
      },
      Darker: {
        '--bg': '#06060c', '--surface': '#0c0c16', '--surface2': '#12121d', '--border': '#1c1c2d'
      },
      AMOLED: {
        '--bg': '#010104', '--surface': '#070711', '--surface2': '#0b0b16', '--border': '#13132a'
      }
    }
    const themeVars = themeMap[selectedTheme] || themeMap.Dark
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
    document.documentElement.style.setProperty('--accent', accentColor)
    document.documentElement.style.setProperty('--accent2', accentColor)
  }, [selectedTheme, accentColor])

  const handleSave = () => run(async () => {
    await simulateAsync(800)
    updateProfile({ name: profile.name, bio: profile.bio, location: profile.location, website: profile.website })
    addToast('Settings saved!', 'success')
  })

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <Settings size={16} /> Settings
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
            {loading
              ? <><span className="spinner" /> Saving…</>
              : <><Save size={12} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="settings-layout">

          {/* ── Left nav ── */}
          <nav className="settings-nav">
            {SECTIONS.map(s => (
              <button
                key={s.key}
                className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`}
                onClick={() => setActiveSection(s.key)}
              >
                <s.icon size={14} />
                {s.label}
                {activeSection === s.key && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </button>
            ))}
          </nav>

          {/* ── Content area ── */}
          <div className="settings-content-area">

            {/* PROFILE */}
            {activeSection === 'profile' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Profile</h2>
                  <p className="settings-section-sub">How others see you on Postcraft</p>
                </div>

                {/* Avatar row */}
                <div className="settings-avatar-row">
                  <div className="settings-avatar" style={{ background: `linear-gradient(135deg,${uc1},${uc2})` }}>
                    {profile.name[0] || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{profile.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>{profile.handle}</div>
                    <button className="btn btn-ghost btn-xs" onClick={() => addToast('Photo upload coming soon!', 'info')}>
                      Change avatar
                    </button>
                  </div>
                </div>

                <div className="settings-fields-grid">
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input className="form-input" value={profile.name} onChange={e => setField('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Handle</label>
                    <input className="form-input" value={profile.handle} onChange={e => setField('handle', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={profile.email} onChange={e => setField('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" placeholder="City, Country" value={profile.location} onChange={e => setField('location', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Bio <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({profile.bio.length}/160)</span></label>
                    <textarea className="form-textarea" maxLength={160} value={profile.bio} onChange={e => setField('bio', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Website</label>
                    <input className="form-input" placeholder="https://yoursite.com" value={profile.website} onChange={e => setField('website', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Default Category</label>
                    <select className="form-select" value={profile.defaultCategory} onChange={e => setField('defaultCategory', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES */}
            {activeSection === 'prefs' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Preferences</h2>
                  <p className="settings-section-sub">Control how Postcraft behaves for you</p>
                </div>
                <div className="settings-rows">
                  <SettingRow label="Auto-save drafts"      desc="Save your work every 30 seconds"          checked={prefs.autosave}      onChange={v => setPref('autosave', v)} />
                  <SettingRow label="Notifications"          desc="Alerts for likes, comments, and reposts"  checked={prefs.notifications} onChange={v => setPref('notifications', v)} />
                  <SettingRow label="Analytics tracking"     desc="Track performance of your posts"          checked={prefs.analytics}     onChange={v => setPref('analytics', v)} />
                  <SettingRow label="Email digest"           desc="Weekly stats summary to your inbox"       checked={prefs.emailDigest}   onChange={v => setPref('emailDigest', v)} />
                  <SettingRow label="Show read time"         desc="Display estimated read time on posts"     checked={prefs.showReadTime}  onChange={v => setPref('showReadTime', v)} />
                  <SettingRow label="Compact mode"           desc="Denser layout with smaller post cards"    checked={prefs.compactMode}   onChange={v => setPref('compactMode', v)} />
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {activeSection === 'privacy' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Privacy & Data</h2>
                  <p className="settings-section-sub">Control your data and account visibility</p>
                </div>
                <div className="settings-rows" style={{ marginBottom: 24 }}>
                  <SettingRow label="Public profile"   desc="Allow anyone to view your profile page"    checked={true}  onChange={() => {}} />
                  <SettingRow label="Show in search"   desc="Let others find you by name or handle"     checked={true}  onChange={() => {}} />
                  <SettingRow label="Activity status"  desc="Show when you were last active"            checked={false} onChange={() => {}} />
                </div>
                <div className="settings-danger-zone">
                  <div className="settings-danger-title">Danger Zone</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => addToast('Exporting data…', 'info')}>
                      <Download size={12} /> Export My Data
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => addToast('Account deletion requires email confirmation.', 'warning')}>
                      <Trash2 size={12} /> Delete Account
                    </button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 12, lineHeight: 1.65 }}>
                    Your data is encrypted at rest and in transit. We never sell your data to third parties.
                    Deleting your account is permanent and cannot be undone.
                  </p>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeSection === 'appearance' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Appearance</h2>
                  <p className="settings-section-sub">Customize how Postcraft looks</p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div className="form-label" style={{ marginBottom: 10 }}>Theme</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['Dark', 'Darker', 'AMOLED'].map(t => (
                      <button
                        key={t}
                        className={`btn ${selectedTheme === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                        onClick={() => setSelectedTheme(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="form-label" style={{ marginBottom: 10 }}>Accent color</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      ['Purple', '#7c6ff7'],
                      ['Blue',   '#38bdf8'],
                      ['Green',  '#22c55e'],
                      ['Pink',   '#f472b6'],
                      ['Orange', '#f97316'],
                    ].map(([name, color]) => (
                      <button
                        key={name}
                        title={name}
                        onClick={() => setAccentColor(color)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: color,
                          border: `${accentColor === color ? '3px' : '2px'} solid ${accentColor === color ? '#fff' : 'var(--border2)'}`,
                          boxShadow: accentColor === color ? '0 0 0 2px rgba(255,255,255,.4)' : 'none',
                          cursor: 'pointer', transition: 'var(--ease)',
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT */}
            {activeSection === 'about' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">About Postcraft</h2>
                  <p className="settings-section-sub">Version info and tech stack</p>
                </div>

                <div className="settings-about-logo">
                  <div className="settings-about-icon">🧵</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-.3px' }}>Postcraft</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Content Studio v2.0</div>
                  </div>
                </div>

                <div className="settings-about-table">
                  {[
                    ['Version',   '2.0.0'],
                    ['React',     '18.3.1'],
                    ['Vite',      '5.x + SWC'],
                    ['Router',    'React Router v6'],
                    ['Icons',     'Lucide React'],
                    ['Built',     new Date().toLocaleDateString()],
                  ].map(([k, v]) => (
                    <div key={k} className="settings-about-row">
                      <span style={{ color: 'var(--text3)' }}>{k}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--text2)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
