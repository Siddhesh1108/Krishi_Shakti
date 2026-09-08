import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { labService, soilTestService } from '../../lib/services';
import {
  FlaskConical, ClipboardList, CheckCircle2, Clock, FileCheck, ArrowRight,
  TrendingUp, Activity, Search, UploadCloud, Eye
} from 'lucide-react';

export function LabDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLabData() {
      try {
        const [statsData, reqsData] = await Promise.all([
          labService.getLabStats(),
          soilTestService.getLabSoilTestRequests()
        ]);
        setStats(statsData);
        setRecentRequests(reqsData);
      } catch (err) {
        console.warn('Failed to load lab data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLabData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="status-pill monitor"><Clock size={12} /> Pending</span>;
      case 'Sample Received':
        return <span className="status-pill blue"><Activity size={12} /> Sample Received</span>;
      case 'Testing':
        return <span className="status-pill amber"><TrendingUp size={12} /> Testing In Progress</span>;
      case 'Report Ready':
        return <span className="status-pill green"><FileCheck size={12} /> Report Ready</span>;
      case 'Completed':
        return <span className="status-pill healthy"><CheckCircle2 size={12} /> Completed</span>;
      default:
        return <span className="status-pill grey">{status}</span>;
    }
  };

  const filteredRequests = recentRequests.filter(req =>
    req.sample_id.toLowerCase().includes(search.toLowerCase()) ||
    req.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
    req.district.toLowerCase().includes(search.toLowerCase()) ||
    req.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-content lab-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#38bdf8' }}>Connecting to Soil Diagnostic Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="page-content lab-page-content">
      <div className="page-header lab-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">SOIL LABORATORY COMMAND DASHBOARD</span>
          <h1>Central Soil Testing Dashboard</h1>
          <p>Real-time sample monitoring, laboratory diagnostics, and PDF report publication control.</p>
        </div>
        <button className="button primary lab-button" onClick={() => navigate('/lab/requests')}>
          <ClipboardList size={16} /> Manage All Requests ({recentRequests.length})
        </button>
      </div>

      {/* 5 Core Metrics */}
      <div className="metric-grid lab-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <div className="metric-card lab-metric-card">
          <div className="metric-icon amber"><Clock size={20} /></div>
          <span>New Requests</span>
          <div className="metric-value">{stats?.newRequests || 0} <small>pending</small></div>
          <p>Awaiting intake review</p>
        </div>

        <div className="metric-card lab-metric-card">
          <div className="metric-icon blue"><FlaskConical size={20} /></div>
          <span>Samples Received</span>
          <div className="metric-value">{stats?.samplesReceived || 0} <small>samples</small></div>
          <p>In physical laboratory</p>
        </div>

        <div className="metric-card lab-metric-card">
          <div className="metric-icon purple" style={{ color: '#a855f7' }}><TrendingUp size={20} /></div>
          <span>Tests In Progress</span>
          <div className="metric-value">{stats?.testsInProgress || 0} <small>active</small></div>
          <p>Chemical & NPK analysis</p>
        </div>

        <div className="metric-card lab-metric-card">
          <div className="metric-icon green"><FileCheck size={20} /></div>
          <span>Reports Generated</span>
          <div className="metric-value">{stats?.reportsGenerated || 0} <small>PDFs</small></div>
          <p>Verified laboratory reports</p>
        </div>

        <div className="metric-card lab-metric-card">
          <div className="metric-icon teal" style={{ color: '#14b8a6' }}><CheckCircle2 size={20} /></div>
          <span>Reports Delivered</span>
          <div className="metric-value">{stats?.reportsDelivered || 0} <small>delivered</small></div>
          <p>Linked to user accounts</p>
        </div>
      </div>

      {/* Recent Requests Section */}
      <section className="panel lab-panel" style={{ marginTop: '24px' }}>
        <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="eyebrow blue-eyebrow">INCOMING DIAGNOSTIC QUEUE</span>
            <h2>Recent Soil Test Requests</h2>
          </div>
          <label className="search-box lab-search-box" style={{ width: '280px' }}>
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sample code, farmer, district..."
            />
          </label>
        </div>

        <div className="table-responsive" style={{ marginTop: '16px' }}>
          <table className="lab-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Request ID</th>
                <th style={{ padding: '12px' }}>Sample ID</th>
                <th style={{ padding: '12px' }}>Farmer / User</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Location</th>
                <th style={{ padding: '12px' }}>Crop</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    No matching soil test requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.slice(0, 8).map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #1e293b', fontSize: '13.5px' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#38bdf8' }}>{req.id}</td>
                    <td style={{ padding: '12px' }}><code style={{ background: '#0f172a', padding: '3px 6px', borderRadius: '4px', color: '#f8fafc' }}>{req.sample_id}</code></td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: '#f8fafc', display: 'block' }}>{req.farmer_name}</strong>
                      <small style={{ color: '#64748b' }}>{req.village}</small>
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{req.collection_date}</td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>{req.district}, {req.state}</td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>{req.current_crop}</td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(req.status)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        className="button secondary-sm"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => navigate(`/lab/requests/${req.id}`)}
                      >
                        <Eye size={14} /> Open Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
