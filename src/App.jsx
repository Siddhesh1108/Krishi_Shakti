import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PortalSelection } from './pages/PortalSelection'

// Lab Portal Imports
import { LabLayout } from './layouts/LabLayout'
import { LabLogin } from './pages/lab/LabLogin'
import { LabDashboard } from './pages/lab/LabDashboard'
import { LabRequests } from './pages/lab/LabRequests'
import { LabRequestDetail } from './pages/lab/LabRequestDetail'
import { LabReports } from './pages/lab/LabReports'
import { LabProfile } from './pages/lab/LabProfile'

// Farmer Portal Imports
import { FarmerLayout } from './layouts/FarmerLayout'
import { FarmerLogin } from './pages/farmer/FarmerLogin'
import { FarmerDashboard } from './pages/farmer/FarmerDashboard'
import { SoilTestRequestForm } from './pages/farmer/SoilTestRequestForm'
import { MySoilTests } from './pages/farmer/MySoilTests'
import { MySoilReports } from './pages/farmer/MySoilReports'

// Admin Portal Imports
import { AdminLayout } from './layouts/AdminLayout'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminLabManagement } from './pages/admin/AdminLabManagement'
import { AdminUserManagement } from './pages/admin/AdminUserManagement'
import { AdminContentManagement } from './pages/admin/AdminContentManagement'

// Expert Portal Imports
import { ExpertLayout } from './layouts/ExpertLayout'
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

          {/* Lab Unprotected Auth Route */}
          <Route path="/lab/login" element={<LabLogin />} />

          {/* Lab Portal (Strictly Separated) */}
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

          {/* Farmer Unprotected Auth Route */}
          <Route path="/farmer/login" element={<FarmerLogin />} />

          {/* Farmer Portal (Strictly Separated) */}
          <Route
            path="/farmer/*"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="soil-test" element={<SoilTestRequestForm />} />
            <Route path="soil-tests" element={<MySoilTests />} />
            <Route path="reports" element={<MySoilReports />} />
            <Route path="*" element={<Navigate to="/farmer/dashboard" replace />} />
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
            <Route path="labs" element={<AdminLabManagement />} />
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
