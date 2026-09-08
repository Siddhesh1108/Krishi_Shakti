import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ allowedRoles, children }) {
  const { user, role, loading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#0e1713',
        color: '#a3b899',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <Loader2 size={36} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: 16, color: '#38bdf8' }} />
        <p style={{ fontSize: '15px', letterSpacing: '0.5px' }}>Verifying security credentials...</p>
      </div>
    );
  }

  // 1. Unauthenticated check
  if (!isAuthenticated || !user) {
    if (allowedRoles.includes('lab')) {
      return <Navigate to="/lab/login" state={{ from: location }} replace />;
    }
    if (allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (allowedRoles.includes('expert')) {
      return <Navigate to="/expert/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role authorization check
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(`Unauthorized access attempt by role '${role}' to ${location.pathname}`);
    if (role === 'lab') {
      return <Navigate to="/lab/dashboard" replace />;
    }
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'expert') {
      return <Navigate to="/expert/dashboard" replace />;
    }
    // No farmer portal, so we logout or go to portal selection
    return <Navigate to="/login" replace />;
  }

  return children;
}
