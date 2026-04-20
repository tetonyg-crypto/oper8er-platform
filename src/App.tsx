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
import OwnerROI from './pages/OwnerROI'
import Costs from './pages/Costs'
import Changelog from './pages/Changelog'
import Support from './pages/Support'
import Help from './pages/Help'
import RepDetail from './pages/rep/RepDetail'

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
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/support" element={<Support />} />
          <Route path="/help" element={<Help />} />
          <Route path="/rep/:id" element={<RepDetail />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/owner" element={<Owner />} />
            <Route path="/owner/roi" element={<OwnerROI />} />
            <Route path="/founder" element={<Founder />} />
            <Route path="/founder/costs" element={<Costs />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
