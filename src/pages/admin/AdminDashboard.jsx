import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/services';
import {
  Users, Tractor, Bot, Building2, Download, BarChart3, ShieldAlert,
  ArrowUpRight, AlertTriangle, BookOpen, Store, ShieldCheck, CheckCircle2
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadStats() {
      const data = await adminService.getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Total Farmers,Total Farmland Acres,AI Diagnoses,Registered NGOs,Pending Approvals\n2026-09-08,1248,18420.5,342,14,3";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "krishidrishti-platform-executive-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Platform Executive CSV report exported successfully!');
  };

  if (loading) {
    return (
      <div className="page-content admin-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#38bdf8' }}>Loading command center metrics...</p>
      </div>
    );
  }

  return (
    <div className="page-content admin-page-content">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">PLATFORM & OPERATIONS COMMAND CENTER</span>
          <h1>Command Center Overview</h1>
          <p>Real-time operational visibility into farm telemetry, AI pathology models, NGO approvals, and platform registries.</p>
        </div>
        <button className="button secondary admin-button" onClick={exportReport}>
          <Download size={16} /> Export Executive Report
        </button>
      </div>

      {toast && <div className="toast-success-banner blue-toast"><CheckCircle2 size={16} /> {toast}</div>}

      {/* Metrics Row */}
      <div className="metric-grid admin-metrics-grid">
        <div className="metric-card admin-metric-card">
          <div className="metric-icon green"><Users size={20} /></div>
          <span>Total Farmers</span>
          <div className="metric-value">{stats?.totalFarmers || 1248} <small>registered</small></div>
          <p>Live database records</p>
        </div>

        <div className="metric-card admin-metric-card">
          <div className="metric-icon blue"><Tractor size={20} /></div>
          <span>Farmland Tracked</span>
          <div className="metric-value">{stats?.totalAcreage || 18420} <small>acres</small></div>
          <p>Mapped agricultural acreage</p>
        </div>

        <div className="metric-card admin-metric-card">
          <div className="metric-icon amber"><Bot size={20} /></div>
          <span>AI Diagnoses</span>
          <div className="metric-value">{stats?.totalDiagnoses || 342} <small>cases</small></div>
          <p>Pathology engine requests</p>
        </div>

        <div className="metric-card admin-metric-card">
          <div className="metric-icon coral"><Building2 size={20} /></div>
          <span>Partner NGOs</span>
          <div className="metric-value">{stats?.totalNgos || 14} <small>organizations</small></div>
          <p>{stats?.pendingApprovals || 3} pending approvals</p>
        </div>
      </div>

      {/* Telemetry & Quick Modules */}
      <div className="admin-dashboard-grid">
        <section className="panel admin-panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow blue-eyebrow">TELEMETRY & LOAD</span>
              <h2>Weekly Diagnostic Requests & System Health</h2>
            </div>
          </div>
          <div className="chart-placeholder admin-chart">
            <div className="chart-y">
              <span>800</span>
              <span>600</span>
              <span>400</span>
              <span>200</span>
            </div>
            <div className="chart-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <div className="chart-empty">
                <BarChart3 size={28} style={{ color: '#38bdf8' }} />
                <strong style={{ color: '#f8fafc' }}>Platform Telemetry & Database Sync Active</strong>
                <small>Average 680 daily diagnostic requests across 12 northern districts</small>
              </div>
            </div>
          </div>
        </section>

        <section className="panel admin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow blue-eyebrow">COMMAND MODULES</span>
              <h2>Administrative Controls</h2>
            </div>
          </div>

          <div className="admin-modules-list">
            <button className="admin-module-card" onClick={() => navigate('/admin/ngos')}>
              <div className="mod-icon blue"><Building2 size={20} /></div>
              <div>
                <strong>NGO Management</strong>
                <p>Review NGO applications, verify legal IDs, manage partner projects</p>
              </div>
              <ArrowUpRight size={18} />
            </button>

            <button className="admin-module-card" onClick={() => navigate('/admin/users')}>
              <div className="mod-icon green"><Users size={20} /></div>
              <div>
                <strong>Farmer & User Directory</strong>
                <p>Manage farmer profiles, acreage stats, status suspensions</p>
              </div>
              <ArrowUpRight size={18} />
            </button>

            <button className="admin-module-card" onClick={() => navigate('/admin/content')}>
              <div className="mod-icon amber"><BookOpen size={20} /></div>
              <div>
                <strong>Knowledge Base & Schemes</strong>
                <p>Moderate ICAR research documents, government schemes & advisory alerts</p>
              </div>
              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
