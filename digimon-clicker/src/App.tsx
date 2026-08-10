import { useEffect } from 'react'
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { BattlePage } from './pages/BattlePage'
import { DigiDexPage } from './pages/DigiDexPage'
import { PartyPage } from './pages/PartyPage'
import { ShopPage } from './pages/ShopPage'
import { SettingsPage } from './pages/SettingsPage'
import { useGameStore } from './store/gameStore'
import { usePlatformTarget } from './utils/platform'
import './App.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/battle', label: 'Battle' },
  { to: '/digidex', label: 'DigiDex' },
  { to: '/party', label: 'Party' },
  { to: '/shop', label: 'Shop' },
  { to: '/settings', label: 'Settings' },
]

function App() {
  const theme = useGameStore((state) => state.theme)
  const platformTarget = usePlatformTarget()

  // The chosen theme lives on <html> (via data-theme) rather than a wrapper element so it applies
  // to everything, including anything portaled outside #root - see index.css's :root[data-theme] rules.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <HashRouter>
      {/* Keep page-level composition lightweight so each route stays focused on its own domain. */}
      <div className="app-shell" data-platform={platformTarget}>
        {platformTarget === 'mobile' && (
          <p className="desktop-notice" role="status">
            DigiClick is currently optimized for desktop browsers - mobile support is planned for a future update.
          </p>
        )}
        <header className="app-header">
          <div>
            <p className="brand">DigiClick</p>
            <h1>Digimon-inspired clicker RPG foundation</h1>
          </div>
          <nav className="app-nav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/battle" element={<BattlePage />} />
            <Route path="/digidex" element={<DigiDexPage />} />
            <Route path="/party" element={<PartyPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

export default App
