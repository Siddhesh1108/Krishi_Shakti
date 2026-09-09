import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PortalSelection } from './pages/PortalSelection'
import { Signup } from './pages/Signup'

// Lab Portal Imports
import { LabLayout } from './layouts/LabLayout'
import { LabLogin } from './pages/lab/LabLogin'
import { LabDashboard } from './pages/lab/LabDashboard'
import { LabRequests } from './pages/lab/LabRequests'
import { LabRequestDetail } from './pages/lab/LabRequestDetail'
import { LabReports } from './pages/lab/LabReports'
import { LabProfile } from './pages/lab/LabProfile'

// Admin Portal Imports
import { AdminLayout } from './layouts/AdminLayout'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminLabManagement } from './pages/admin/AdminLabManagement'
import { AdminUserManagement } from './pages/admin/AdminUserManagement'
import { AdminExpertManagement } from './pages/admin/AdminExpertManagement'
import { AdminMarketplace } from './pages/admin/AdminMarketplace'
import { AdminPlaceholder } from './pages/admin/AdminPlaceholder'

// Expert Portal Imports
import { ExpertLayout } from './layouts/ExpertLayout'
import { ExpertLogin } from './pages/expert/ExpertLogin'
import { ExpertDashboard } from './pages/expert/ExpertDashboard'
import { ExpertRequests } from './pages/expert/ExpertRequests'
import { ExpertClients } from './pages/expert/ExpertClients'
import { ExpertChat } from './pages/expert/ExpertChat'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PortalSelection />} />
          <Route path="/login" element={<PortalSelection />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/lab/login" element={<LabLogin />} />
          <Route
            path="/lab/*"
            element={
              <ProtectedRoute allowedRoles={['lab']}>
                <LabLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<LabDashboard />} />
            <Route path="requests" element={<LabRequests />} />
            <Route path="requests/:id" element={<LabRequestDetail />} />
            <Route path="reports" element={<LabReports />} />
            <Route path="profile" element={<LabProfile />} />
            <Route path="*" element={<Navigate to="/lab/dashboard" replace />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="labs" element={<AdminLabManagement />} />
            <Route path="experts" element={<AdminExpertManagement />} />
            <Route path="field-workers" element={<AdminPlaceholder title="Field Workers Management" />} />
            <Route path="marketplace" element={<AdminMarketplace />} />
            <Route path="soil-tests" element={<AdminPlaceholder title="Soil Tests Monitoring" />} />
            <Route path="reports" element={<AdminPlaceholder title="Reports Audit" />} />
            <Route path="settings" element={<AdminPlaceholder title="System Settings" />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          <Route path="/expert/login" element={<ExpertLogin />} />
          <Route
            path="/expert/*"
            element={
              <ProtectedRoute allowedRoles={['expert']}>
                <ExpertLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ExpertDashboard />} />
            <Route path="requests" element={<ExpertRequests />} />
            <Route path="clients" element={<ExpertClients />} />
            <Route path="chat" element={<ExpertChat />} />
            <Route path="profile" element={<AdminPlaceholder title="Expert Profile" />} />
            <Route path="*" element={<Navigate to="/expert/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
