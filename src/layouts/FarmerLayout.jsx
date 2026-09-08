import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  Sprout, LayoutDashboard, PlusCircle, ClipboardList, FileText, LogOut,
  Menu, X, ShieldCheck
} from 'lucide-react';

export function FarmerLayout() {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const farmerNavItems = [
    { label: 'Farmer Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'Request Soil Test', path: '/farmer/soil-test', icon: PlusCircle },
    { label: 'My Soil Tests', path: '/farmer/soil-tests', icon: ClipboardList },
    { label: 'My Soil Reports', path: '/farmer/reports', icon: FileText },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/farmer/login');
  };

  const farmerName = user?.user_metadata?.name || 'Arjun Singh';

  return (
    <div className="platform-shell farmer-shell">
      {/* Sidebar */}
      <aside className={`sidebar farmer-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand farmer-brand">
          <span className="brand-mark farmer-mark"><Sprout size={20} /></span>
          <div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#fff' }}>FARMER PORTAL</strong>
            <small style={{ fontSize: '11px', color: '#a3e635' }}>KrishiShakti Services</small>
          </div>
          {mobileOpen && (
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ marginLeft: 'auto', color: '#fff' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="workspace-label farmer-label">
          FARMER SERVICES WORKSPACE
        </div>

        <nav className="side-nav">
          {farmerNavItems.map((item) => {
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
          <div className="api-status farmer-api-status">
            <span className="status-dot green-dot"></span>
            <div>
              <strong>Farmer Portal Online</strong>
              <small>Secured Account Session</small>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar farmer-topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span style={{ color: '#a3e635', fontWeight: 600 }}>Farmer Portal</span>
            <span>/</span>
            <strong>{farmerNavItems.find(item => location.pathname === item.path)?.label || 'Overview'}</strong>
          </div>

          <div className="top-actions">
            <div className="farmer-badge-chip" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(163, 230, 53, 0.1)', border: '1px solid rgba(163, 230, 53, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', color: '#a3e635' }}>
              <ShieldCheck size={15} />
              <span>Verified Farmer</span>
            </div>

            <div className="profile-chip farmer-profile-chip">
              <span className="avatar farmer-avatar" style={{ background: '#16a34a', color: '#fff' }}>
                <Sprout size={16} />
              </span>
              <span className="profile-copy">
                <strong>{farmerName}</strong>
                <small>Agricultural User</small>
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
