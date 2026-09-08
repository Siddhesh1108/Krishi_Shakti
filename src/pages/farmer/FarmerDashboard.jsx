import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { soilTestService } from '../../lib/services';
import {
  Sprout, PlusCircle, ClipboardList, FileText, CheckCircle2, Clock,
  ArrowRight, ShieldCheck, Activity, FileCheck
} from 'lucide-react';

export function FarmerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || 'demo-farmer-id';
  const farmerName = user?.user_metadata?.name || 'Arjun Singh';

  useEffect(() => {
    async function loadUserData() {
      try {
        const [reqsData, repsData] = await Promise.all([
          soilTestService.getFarmerSoilTestRequests(userId),
          soilTestService.getFarmerSoilTestReports(userId)
        ]);
        setRequests(reqsData);
        setReports(repsData);
      } catch (err) {
        console.warn('Failed to load farmer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="page-content farmer-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#a3e635' }}>Loading Farmer Dashboard...</p>
      </div>
    );
  }

  const activeRequests = requests.filter(r => r.status !== 'Completed');

  return (
    <div className="page-content farmer-page-content">
      <div className="page-header farmer-page-header">
        <div>
          <span className="eyebrow green-eyebrow" style={{ color: '#a3e635' }}>FARMER DIGITAL SERVICES</span>
          <h1>Welcome, {farmerName}!</h1>
          <p>Manage your farm plots, request professional soil testing, and view certified lab reports.</p>
        </div>

        <button className="button primary farmer-button" onClick={() => navigate('/farmer/soil-test')} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
          <PlusCircle size={16} /> Request Soil Test
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metric-grid farmer-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card" style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a3e635', marginBottom: '8px' }}>
            <ClipboardList size={22} />
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Total Test Requests</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>{requests.length}</div>
          <small style={{ color: '#64748b' }}>Submitted from your account</small>
        </div>

        <div className="metric-card" style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '8px' }}>
            <Activity size={22} />
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Tests In Progress</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>{activeRequests.length}</div>
          <small style={{ color: '#64748b' }}>Active in laboratory</small>
        </div>

        <div className="metric-card" style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', marginBottom: '8px' }}>
            <FileCheck size={22} />
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Available Soil Reports</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a3e635' }}>{reports.length}</div>
          <small style={{ color: '#64748b' }}>Ready for view/download</small>
        </div>
      </div>

      {/* Grid: Quick Actions & Recent Tests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Quick Action Modules */}
        <section className="panel farmer-panel" style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px' }}>
          <div className="panel-heading" style={{ marginBottom: '16px' }}>
            <span className="eyebrow green-eyebrow" style={{ color: '#a3e635' }}>SERVICES</span>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Quick Portal Actions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => navigate('/farmer/soil-test')}
              style={{ background: '#0a140e', border: '1px solid #16a34a', padding: '16px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong style={{ color: '#a3e635', fontSize: '15px', display: 'block' }}>+ Request Soil Test</strong>
                <small style={{ color: '#94a3b8' }}>Fill sample details to initiate lab testing</small>
              </div>
              <ArrowRight size={18} style={{ color: '#a3e635' }} />
            </button>

            <button
              onClick={() => navigate('/farmer/soil-tests')}
              style={{ background: '#0a120d', border: '1px solid #1e293b', padding: '16px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '15px', display: 'block' }}>My Soil Test Requests ({requests.length})</strong>
                <small style={{ color: '#94a3b8' }}>Track real-time testing progress</small>
              </div>
              <ArrowRight size={18} style={{ color: '#38bdf8' }} />
            </button>

            <button
              onClick={() => navigate('/farmer/reports')}
              style={{ background: '#0a120d', border: '1px solid #1e293b', padding: '16px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '15px', display: 'block' }}>My Soil Reports ({reports.length})</strong>
                <small style={{ color: '#94a3b8' }}>View & download official lab PDF reports</small>
              </div>
              <ArrowRight size={18} style={{ color: '#38bdf8' }} />
            </button>
          </div>
        </section>

        {/* Active Soil Tests */}
        <section className="panel farmer-panel" style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px' }}>
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span className="eyebrow green-eyebrow" style={{ color: '#a3e635' }}>LIVE STATUS</span>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Active Soil Tests</h2>
            </div>
            <button className="text-button" onClick={() => navigate('/farmer/soil-tests')} style={{ fontSize: '13px', color: '#38bdf8' }}>
              View All
            </button>
          </div>

          {requests.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: '#0a120d', borderRadius: '8px' }}>
              <Clock size={28} style={{ color: '#64748b', marginBottom: '8px' }} />
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13.5px' }}>You haven't requested any soil tests yet.</p>
              <button className="button primary-sm" onClick={() => navigate('/farmer/soil-test')} style={{ marginTop: '12px', background: '#16a34a' }}>
                Submit First Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {requests.slice(0, 3).map((req) => (
                <div key={req.id} style={{ background: '#0a120d', border: '1px solid #1e293b', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#f8fafc', fontSize: '14px', display: 'block' }}>{req.id}</strong>
                    <small style={{ color: '#94a3b8' }}>{req.current_crop} · {req.farm_location}</small>
                  </div>
                  <span className={`status-pill ${req.status === 'Completed' ? 'healthy' : req.status === 'Testing' ? 'amber' : 'blue'}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
