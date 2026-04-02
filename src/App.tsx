import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing/Landing'
import Dashboard from './pages/dashboard/Dashboard'
import Admin from './pages/admin/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
