import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks'

export default function LoginPage({ onSwitch }) {
  const { login, authError, setAuthError } = useAuth()
  const { loading, run } = useAsync()
  const navigate = useNavigate()

  const [email, setEmail] = useState('alex@postcraft.io')
  const [password, setPassword] = useState('password123')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setAuthError('Please fill in all fields.'); return }
    await run(async () => {
      const { ok } = await login(email, password)
      if (ok) navigate('/')
    })
  }

  return (
    <div className="login-pro-container">
      <div className="login-pro-card">
        <div className="login-pro-logo">🧵</div>
        <h2 className="login-pro-title">Sign in to Postcraft</h2>
        <p className="login-pro-sub">Welcome back! Please enter your credentials to continue.</p>
        <form onSubmit={handleSubmit} className="login-pro-form">
          <div className="login-pro-field">
            <label className="login-pro-label">Email</label>
            <div className="login-pro-input-wrap">
              <Mail size={16} className="login-pro-input-icon" />
              <input
                className="login-pro-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setAuthError('') }}
                autoComplete="email"
              />
            </div>
          </div>
          <div className="login-pro-field">
            <label className="login-pro-label">Password</label>
            <div className="login-pro-input-wrap">
              <Lock size={16} className="login-pro-input-icon" />
              <input
                className="login-pro-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setAuthError('') }}
                autoComplete="current-password"
              />
              <button type="button" className="login-pro-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {authError && (
            <div className="login-pro-error">
              <span>⚠️</span> {authError}
            </div>
          )}
          <button type="submit" className="login-pro-submit" disabled={loading}>
            {loading ? 'Signing in…' : <><span>Sign In</span> <ArrowRight size={16} /></>}
          </button>
        </form>
        <div className="login-pro-footer">
          <span>Don't have an account?</span>
          <span className="login-pro-link" onClick={onSwitch}>Create one free →</span>
        </div>
      </div>
    </div>
  )
}
