import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  Stethoscope, LayoutDashboard, BookOpen, CalendarDays, LogOut, Menu,
  ShieldCheck, X, Activity, UserCheck
} from 'lucide-react';

export function ExpertLayout() {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const expertNavItems = [
    { label: 'Case Overview', path: '/expert/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Cases', path: '/expert/cases', icon: Stethoscope },
    { label: 'Knowledge Sources', path: '/expert/knowledge', icon: BookOpen },
    { label: 'Availability Calendar', path: '/expert/availability', icon: CalendarDays },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const expertName = user?.user_metadata?.name || 'Dr. Ananya Rao';

  return (
    <div className="platform-shell expert-shell">
      {/* Sidebar */}
      <aside className={`sidebar expert-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand expert-brand">
          <span className="brand-mark expert-mark"><Stethoscope size={20} /></span>
          <div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#fff' }}>Expert Portal</strong>
            <small style={{ fontSize: '11px', color: '#a5b4fc' }}>Clinical Agronomy Node</small>
          </div>
          {mobileOpen && (
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ marginLeft: 'auto', color: '#fff' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="workspace-label expert-label">
          CLINICAL PATHOLOGY WORKSPACE
        </div>

        <nav className="side-nav">
          {expertNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
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
          <div className="api-status expert-api-status">
            <span className="status-dot purple-dot"></span>
            <div>
              <strong>Pathology Node Active</strong>
              <small>ICAR Knowledge Base Synced</small>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar expert-topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span style={{ color: '#818cf8', fontWeight: 600 }}>Expert Console</span>
            <span>/</span>
            <strong>{expertNavItems.find(item => location.pathname === item.path)?.label || 'Overview'}</strong>
          </div>

          <div className="top-actions">
            <div className="expert-badge-chip">
              <ShieldCheck size={15} style={{ color: '#818cf8' }} />
              <span>Certified Agronomist</span>
            </div>

            <div className="profile-chip expert-profile-chip">
              <span className="avatar expert-avatar">
                {expertName.substring(0, 2).toUpperCase()}
              </span>
              <span className="profile-copy">
                <strong>{expertName}</strong>
                <small>Plant Pathologist</small>
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
