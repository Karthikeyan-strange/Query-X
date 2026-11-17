import React from 'react'
import ReactDOM from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CustomerPortal from './pages/CustomerPortal'
import { getStoredUser } from './api/client'
import './styles.css'
import './dashboard.css'
import './customer-portal.css'
import './theme.css'

function AppRouter() {
  const path = window.location.pathname
  if (path === '/customer') return <CustomerPortal />
  if (
    path === '/agent' ||
    path === '/complaints' ||
    path === '/investigations' ||
    path === '/escalated-cases' ||
    path === '/regional-events' ||
    path === '/shipment-tracking' ||
    path === '/profile' ||
    path === '/settings' ||
    path.startsWith('/complaints/')
  ) {
    return <DashboardPage />
  }
  const user = getStoredUser()
  if (user && (user.role === 'ADMIN' || user.role === 'SUPERVISOR' || user.role === 'SUPPORT')) {
    return <DashboardPage />
  }
  return <LoginPage />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
