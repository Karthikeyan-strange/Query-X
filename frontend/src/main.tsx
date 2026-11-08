import React from 'react'
import ReactDOM from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CustomerPortal from './pages/CustomerPortal'
import './styles.css'
import './dashboard.css'
import './customer-portal.css'
import './theme.css'

function AppRouter() {
  const path = window.location.pathname
  if (path === '/agent') return <DashboardPage />
  if (path === '/customer') return <CustomerPortal />
  return <LoginPage />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
