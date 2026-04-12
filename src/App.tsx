import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/landing/Landing'
import Dashboard from './pages/dashboard/Dashboard'
import Admin from './pages/admin/Admin'
import Privacy from './pages/Privacy'
import Success from './pages/Success'
import Login from './pages/Login'
import Owner from './pages/Owner'
import Errors from './pages/Errors'
import Metrics from './pages/Metrics'
import Founder from './pages/Founder'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/success" element={<Success />} />
          <Route path="/login" element={<Login />} />
          <Route path="/internal/errors" element={<Errors />} />
          <Route path="/internal/metrics" element={<Metrics />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/owner" element={<Owner />} />
            <Route path="/founder" element={<Founder />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
