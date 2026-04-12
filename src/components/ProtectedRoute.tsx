import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-[#7F77DD] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold">B</span>
          </div>
          <p className="text-[#636366] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
