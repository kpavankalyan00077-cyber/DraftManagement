import { createContext, useContext, useState, useCallback } from 'react'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Demo users database
const DEMO_USERS = [
  {
    id: 'user_1',
    name: 'Alex Rivera',
    handle: '@alexrivera',
    email: 'alex@postcraft.io',
    password: 'password123',
    bio: 'Senior engineer & occasional writer. Building tools for the web.',
    website: 'https://alexrivera.dev',
    location: 'San Francisco, CA',
    avatarIdx: 0,
    followers: 2841,
    following: 312,
    joinedAt: 'January 2024',
    verified: true,
    coverIdx: 0,
  },
  {
    id: 'user_2',
    name: 'Sam Chen',
    handle: '@samchen',
    email: 'sam@example.com',
    password: 'demo1234',
    bio: 'Product designer. Writing about design systems and UX.',
    website: '',
    location: 'New York, NY',
    avatarIdx: 1,
    followers: 1204,
    following: 88,
    joinedAt: 'March 2024',
    verified: false,
    coverIdx: 1,
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')

  const login = useCallback(async (email, password) => {
    setAuthError('')
    // Simulate API delay
    await new Promise(r => setTimeout(r, 900))
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      return { ok: true }
    }
    setAuthError('Invalid email or password. Try alex@postcraft.io / password123')
    return { ok: false }
  }, [])

  const register = useCallback(async (name, email, password) => {
    setAuthError('')
    await new Promise(r => setTimeout(r, 1000))
    if (DEMO_USERS.find(u => u.email === email)) {
      setAuthError('An account with this email already exists.')
      return { ok: false }
    }
    const newUser = {
      id: `user_${Date.now()}`,
      name, email,
      handle: '@' + name.toLowerCase().replace(/\s+/g, ''),
      bio: '',
      website: '',
      location: '',
      avatarIdx: Math.floor(Math.random() * 7),
      followers: 0,
      following: 0,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      verified: false,
      coverIdx: Math.floor(Math.random() * 5),
    }
    setUser(newUser)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAuthError('')
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  )
}
