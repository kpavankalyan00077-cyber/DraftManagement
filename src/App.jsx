import { Routes, Route } from 'react-router-dom'
import { AppProvider }  from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import AuthGate         from './components/AuthGate'
import Sidebar          from './components/Sidebar'
import ToastContainer   from './components/Toast'
import FeedPage         from './pages/FeedPage'
import EditorPage       from './pages/EditorPage'
import DraftsPage       from './pages/DraftsPage'
import ReviewPage       from './pages/ReviewPage'
import PublishedPage    from './pages/PublishedPage'
import AnalyticsPage    from './pages/AnalyticsPage'
import SettingsPage     from './pages/SettingsPage'
import ProfilePage      from './pages/ProfilePage'

function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"          element={<FeedPage />} />
          <Route path="/editor"    element={<EditorPage />} />
          <Route path="/drafts"    element={<DraftsPage />} />
          <Route path="/review"    element={<ReviewPage />} />
          <Route path="/published" element={<PublishedPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthGate>
          <AppShell />
        </AuthGate>
      </AppProvider>
    </AuthProvider>
  )
}
