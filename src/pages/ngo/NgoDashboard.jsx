import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ngoService } from '../../lib/services';
import {
  Building2, Users, FolderKanban, IndianRupee, ArrowUpRight, Plus,
  CheckCircle2, Clock, Leaf, Droplet, FileCheck, ShieldAlert
} from 'lucide-react';

export function NgoDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, projData, reqData] = await Promise.all([
          ngoService.getNgoProfile(),
          ngoService.getProjects(),
          ngoService.getAssistanceRequests()
        ]);
        setProfile(profData);
        setProjects(projData);
        setRequests(reqData);
      } catch (e) {
        console.error('NGO Dashboard data error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="page-content ngo-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#6ee7b7' }}>Loading NGO operations data...</p>
      </div>
    );
  }

  return (
    <div className="page-content ngo-page-content">
      <div className="page-header ngo-page-header">
        <div>
          <span className="eyebrow green-eyebrow">NGO COMMAND CENTER</span>
          <h1>{profile?.name || 'Green Earth Agriculture Trust'}</h1>
          <p>Active Coverage: <strong>{profile?.state || 'Punjab & Haryana'}</strong> · Reg No: <strong>{profile?.regNo || 'NGO-DEL-2021-884'}</strong></p>
        </div>
        <div className="header-actions">
          <button className="button primary ngo-button" onClick={() => navigate('/ngo/projects')}>
            <Plus size={16} /> Launch Field Project
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-grid ngo-metrics-grid">
        <div className="metric-card ngo-metric-card">
          <div className="metric-icon green"><FolderKanban size={20} /></div>
          <span>Active Projects</span>
          <div className="metric-value">{projects.length} <small>initiatives</small></div>
          <p>Across regional field blocks</p>
        </div>

        <div className="metric-card ngo-metric-card">
          <div className="metric-icon blue"><Users size={20} /></div>
          <span>Farmers Supported</span>
          <div className="metric-value">{profile?.farmersSupported || 840} <small>farmers</small></div>
          <p>Receiving bio-inputs & drip kits</p>
        </div>

        <div className="metric-card ngo-metric-card">
          <div className="metric-icon amber"><IndianRupee size={20} /></div>
          <span>Grants Disbursed</span>
          <div className="metric-value">{profile?.grantsDisbursed || '₹ 24,50,000'}</div>
          <p>Direct beneficiary assistance</p>
        </div>

        <div className="metric-card ngo-metric-card">
          <div className="metric-icon coral"><Clock size={20} /></div>
          <span>Pending Assistance Requests</span>
          <div className="metric-value">{pendingRequests} <small>requests</small></div>
          <p>Requires NGO verification</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid ngo-dashboard-grid">
        {/* Active Projects Panel */}
        <section className="panel ngo-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow green-eyebrow">FIELD INITIATIVES</span>
              <h2>Active Agricultural Projects</h2>
            </div>
            <button className="text-button" onClick={() => navigate('/ngo/projects')}>
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="ngo-projects-list">
            {projects.map((proj) => (
              <div key={proj.id} className="ngo-project-item">
                <div className="proj-header">
                  <div>
                    <strong>{proj.title}</strong>
                    <span className="proj-category"><Droplet size={13} /> {proj.category}</span>
                  </div>
                  <span className={`status-pill ${proj.status === 'COMPLETED' ? 'healthy' : 'monitor'}`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="proj-details">
                  <small>Region: {proj.region}</small>
                  <small>Beneficiaries: {proj.beneficiaryCount} farmers</small>
                  <small>Budget: {proj.budget}</small>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${proj.progress}%` }}></div>
                </div>
                <small className="progress-text">{proj.progress}% Completed</small>
              </div>
            ))}
          </div>
        </section>

        {/* Assistance Requests Panel */}
        <section className="panel ngo-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow green-eyebrow">FARMER SUPPORT</span>
              <h2>Recent Assistance Applications</h2>
            </div>
          </div>

          <div className="ngo-requests-list">
            {requests.map((req) => (
              <div key={req.id} className="ngo-request-row">
                <div className="req-icon">
                  {req.status === 'APPROVED' ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : <Clock size={18} style={{ color: '#f59e0b' }} />}
                </div>
                <div className="req-info">
                  <strong>{req.farmerName}</strong>
                  <small>{req.Village} · {req.requestType} ({req.acreage})</small>
                </div>
                <span className={`status-tag ${req.status.toLowerCase()}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>

          <button className="panel-link ngo-panel-link" onClick={() => navigate('/ngo/projects')}>
            Review all applications <ArrowUpRight size={15} />
          </button>
        </section>
      </div>

      {/* Focus Areas Footer Band */}
      <section className="panel ngo-focus-band">
        <div className="focus-band-header">
          <h3>Organization Strategic Focus</h3>
          <p>Green Earth Trust operations are mapped against state soil and moisture conservation objectives.</p>
        </div>
        <div className="focus-pills">
          {profile?.focusAreas?.map((area, idx) => (
            <span key={idx} className="focus-pill">
              <Leaf size={14} style={{ color: '#34d399' }} /> {area}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
