import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, Users, BookOpen, LogOut, Menu,
  ShieldCheck, X, Zap, Cpu, Bell
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNavItems = [
    { label: 'Command Center', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'NGO Management', path: '/admin/ngos', icon: Building2 },
    { label: 'Farmer & User Directory', path: '/admin/users', icon: Users },
    { label: 'Knowledge Base & Schemes', path: '/admin/content', icon: BookOpen },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const adminName = user?.user_metadata?.name || 'Platform Administrator';

  return (
    <div className="platform-shell admin-shell">
      {/* Sidebar */}
      <aside className={`sidebar admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand admin-brand">
          <span className="brand-mark admin-mark"><Cpu size={20} /></span>
          <div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#fff' }}>Platform Command</strong>
            <small style={{ fontSize: '11px', color: '#38bdf8' }}>System Admin Node</small>
          </div>
          {mobileOpen && (
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ marginLeft: 'auto', color: '#fff' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="workspace-label admin-label">
          EXECUTIVE OPERATIONS WORKSPACE
        </div>

        <nav className="side-nav">
          {adminNavItems.map((item) => {
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
                {item.label === 'NGO Management' && <span className="nav-badge admin-badge-pill">14</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout-nav-item" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
          <div className="api-status admin-api-status">
            <span className="status-dot blue-dot"></span>
            <div>
              <strong>System Core Online</strong>
              <small>Realtime Database Active</small>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar admin-topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Command Console</span>
            <span>/</span>
            <strong>{adminNavItems.find(item => location.pathname === item.path)?.label || 'Overview'}</strong>
          </div>

          <div className="top-actions">
            <div className="admin-badge-chip">
              <ShieldCheck size={15} style={{ color: '#38bdf8' }} />
              <span>Super Administrator</span>
            </div>

            <div className="profile-chip admin-profile-chip">
              <span className="avatar admin-avatar">
                {adminName.substring(0, 2).toUpperCase()}
              </span>
              <span className="profile-copy">
                <strong>{adminName}</strong>
                <small>System Admin</small>
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
