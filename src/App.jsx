import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NgoLayout } from './layouts/NgoLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ExpertLayout } from './layouts/ExpertLayout'
import { PortalSelection } from './pages/PortalSelection'
import { NgoLogin } from './pages/ngo/NgoLogin'
import { NgoDashboard } from './pages/ngo/NgoDashboard'
import { NgoProfile } from './pages/ngo/NgoProfile'
import { NgoProjects } from './pages/ngo/NgoProjects'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminNgoManagement } from './pages/admin/AdminNgoManagement'
import { AdminUserManagement } from './pages/admin/AdminUserManagement'
import { AdminContentManagement } from './pages/admin/AdminContentManagement'
import { ExpertLogin } from './pages/expert/ExpertLogin'
import { ExpertDashboard } from './pages/expert/ExpertDashboard'
import { ExpertKnowledge } from './pages/expert/ExpertKnowledge'
import { ExpertAvailability } from './pages/expert/ExpertAvailability'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Institutional Web Portal Gateway */}
          <Route path="/" element={<PortalSelection />} />
          <Route path="/login" element={<PortalSelection />} />

          {/* NGO Unprotected Auth Route */}
          <Route path="/ngo/login" element={<NgoLogin />} />

          {/* NGO Panel (Strictly Separated) */}
          <Route
            path="/ngo/*"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NgoLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<NgoDashboard />} />
            <Route path="profile" element={<NgoProfile />} />
            <Route path="projects" element={<NgoProjects />} />
            <Route path="*" element={<Navigate to="/ngo/dashboard" replace />} />
          </Route>

          {/* Admin Unprotected Auth Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Panel (Strictly Separated) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="ngos" element={<AdminNgoManagement />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="content" element={<AdminContentManagement />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Expert Unprotected Auth Route */}
          <Route path="/expert/login" element={<ExpertLogin />} />

          {/* Expert Panel (Strictly Separated) */}
          <Route
            path="/expert/*"
            element={
              <ProtectedRoute allowedRoles={['expert']}>
                <ExpertLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ExpertDashboard />} />
            <Route path="cases" element={<ExpertDashboard />} />
            <Route path="knowledge" element={<ExpertKnowledge />} />
            <Route path="availability" element={<ExpertAvailability />} />
            <Route path="*" element={<Navigate to="/expert/dashboard" replace />} />
          </Route>

          {/* Fallback to Portal Selection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
