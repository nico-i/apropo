import { Link, Outlet, Route, HashRouter, Routes, useLocation } from 'react-router-dom'
import { useRecordings } from './hooks/useRecordings'
import Icon from './components/Icon'
import HomePage from './routes/HomePage'
import PlayerPage from './routes/PlayerPage'
import SettingsPage from './routes/SettingsPage'
import './App.css'

export type RecordingsContext = ReturnType<typeof useRecordings>

function Layout() {
  const recordings = useRecordings()
  const location = useLocation()
  const onSettings = location.pathname === '/settings'
  const onPlayer = location.pathname.startsWith('/recordings/')

  return (
    <div className="app">
      {!onPlayer && (
        <header className="app-header">
          <h1>{onSettings ? 'Settings' : 'Recordings'}</h1>
          <Link
            to={onSettings ? '/' : '/settings'}
            className="icon-button"
            aria-label={onSettings ? 'Back to recordings' : 'Settings'}
          >
            <span style={{ opacity: onSettings ? 1 : 0.6, display: 'flex' }}>
              <Icon name={onSettings ? 'close' : 'settings'} />
            </span>
          </Link>
        </header>
      )}
      <main>
        <Outlet context={recordings} />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="recordings/:id" element={<PlayerPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
