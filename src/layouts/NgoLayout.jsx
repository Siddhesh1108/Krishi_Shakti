import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  Building2, LayoutDashboard, FolderKanban, LogOut, Menu, ShieldCheck,
  Sprout, X, UserCheck, HeartHandshake, Bell
} from 'lucide-react';

export function NgoLayout() {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const ngoNavItems = [
    { label: 'NGO Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
    { label: 'Field Projects & Grants', path: '/ngo/projects', icon: FolderKanban },
    { label: 'Organization Profile', path: '/ngo/profile', icon: Building2 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/ngo/login');
  };

  const ngoName = user?.user_metadata?.organization || user?.user_metadata?.name || 'Green Earth NGO Trust';

  return (
    <div className="platform-shell ngo-shell">
      {/* Sidebar */}
      <aside className={`sidebar ngo-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand ngo-brand">
          <span className="brand-mark ngo-mark"><HeartHandshake size={20} /></span>
          <div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#fff' }}>NGO Portal</strong>
            <small style={{ fontSize: '11px', color: '#6ee7b7' }}>KrishiDrishti Partner</small>
          </div>
          {mobileOpen && (
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ marginLeft: 'auto', color: '#fff' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="workspace-label ngo-label">
          NGO FIELD WORKSPACE
        </div>

        <nav className="side-nav">
          {ngoNavItems.map((item) => {
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
          <div className="api-status ngo-api-status">
            <span className="status-dot green-dot"></span>
            <div>
              <strong>NGO Telemetry</strong>
              <small>Connected & Syncing</small>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar ngo-topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span style={{ color: '#6ee7b7', fontWeight: 600 }}>NGO Partner</span>
            <span>/</span>
            <strong>{ngoNavItems.find(item => location.pathname === item.path)?.label || 'Dashboard'}</strong>
          </div>

          <div className="top-actions">
            <div className="ngo-badge-chip">
              <ShieldCheck size={15} style={{ color: '#10b981' }} />
              <span>Verified NGO</span>
            </div>

            <div className="profile-chip ngo-profile-chip">
              <span className="avatar ngo-avatar">
                <Building2 size={16} />
              </span>
              <span className="profile-copy">
                <strong>{ngoName}</strong>
                <small>Agricultural Field Partner</small>
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
