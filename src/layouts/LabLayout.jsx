import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  FlaskConical, LayoutDashboard, ClipboardList, FileText, Building2,
  LogOut, Menu, ShieldCheck, X, Activity
} from 'lucide-react';

export function LabLayout() {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const labNavItems = [
    { label: 'Lab Dashboard', path: '/lab/dashboard', icon: LayoutDashboard },
    { label: 'Soil Test Requests', path: '/lab/requests', icon: ClipboardList },
    { label: 'Soil Test Reports', path: '/lab/reports', icon: FileText },
    { label: 'Lab Profile', path: '/lab/profile', icon: Building2 },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const labName = user?.user_metadata?.organization || user?.user_metadata?.name || 'Central Soil Testing Laboratory';

  return (
    <div className="platform-shell lab-shell">
      {/* Sidebar */}
      <aside className={`sidebar lab-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand lab-brand">
          <span className="brand-mark lab-mark"><FlaskConical size={20} /></span>
          <div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#fff' }}>LAB PORTAL</strong>
            <small style={{ fontSize: '11px', color: '#38bdf8' }}>Soil Testing Diagnostics</small>
          </div>
          {mobileOpen && (
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ marginLeft: 'auto', color: '#fff' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="workspace-label lab-label">
          SOIL ANALYSIS WORKSPACE
        </div>

        <nav className="side-nav">
          {labNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/lab/requests' && location.pathname.startsWith('/lab/requests'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout-nav-item" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
          <div className="api-status lab-api-status">
            <span className="status-dot blue-dot"></span>
            <div>
              <strong>Lab Telemetry Online</strong>
              <small>NABL & Supabase Sync</small>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar lab-topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Lab Portal</span>
            <span>/</span>
            <strong>{labNavItems.find(item => location.pathname === item.path)?.label || 'Overview'}</strong>
          </div>

          <div className="top-actions">
            <div className="lab-badge-chip">
              <ShieldCheck size={15} style={{ color: '#38bdf8' }} />
              <span>NABL Accredited Lab</span>
            </div>

            <div className="profile-chip lab-profile-chip">
              <span className="avatar lab-avatar">
                <FlaskConical size={16} />
              </span>
              <span className="profile-copy">
                <strong>{labName}</strong>
                <small>Soil Analysis Specialist</small>
              </span>
            </div>

            <button className="button danger-outline-sm" onClick={handleLogout} title="Sign Out">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Child Page Rendering */}
        <Outlet />
      </main>
    </div>
  );
}
