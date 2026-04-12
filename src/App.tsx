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

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/owner" element={<Owner />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
