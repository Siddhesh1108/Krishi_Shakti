import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { soilTestService } from '../../lib/services';
import {
  ClipboardList, Search, Filter, Eye, CheckCircle2, Clock, Activity,
  TrendingUp, FileUp, Check
} from 'lucide-react';

export function LabRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await soilTestService.getLabSoilTestRequests();
        setRequests(data);
      } catch (err) {
        console.warn('Failed to load soil test requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    await soilTestService.updateSoilTestRequestStatus(id, newStatus);
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    notify(`Request ${id} status updated to '${newStatus}'.`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="status-pill monitor"><Clock size={12} /> Pending</span>;
      case 'Sample Received':
        return <span className="status-pill blue"><Activity size={12} /> Sample Received</span>;
      case 'Testing':
        return <span className="status-pill amber"><TrendingUp size={12} /> Testing</span>;
      case 'Completed':
        return <span className="status-pill healthy"><CheckCircle2 size={12} /> Completed</span>;
      default:
        return <span className="status-pill grey">{status}</span>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.sample_id.toLowerCase().includes(search.toLowerCase()) ||
      req.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
      req.district.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="page-content lab-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#38bdf8' }}>Loading incoming soil test requests...</p>
      </div>
    );
  }

  return (
    <div className="page-content lab-page-content">
      <div className="page-header lab-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">SOIL ANALYSIS QUEUE</span>
          <h1>Soil Test Requests</h1>
          <p>Review incoming farmer sample requests, update laboratory workflow status, and issue soil diagnostics.</p>
        </div>
      </div>

      {toast && <div className="toast-success-banner blue-toast"><Check size={16} /> {toast}</div>}

      {/* Toolbar & Filters */}
      <div className="lab-toolbar" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <label className="search-box lab-search-box" style={{ flex: '1', minWidth: '260px' }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Request ID, Sample ID, Farmer name, or District..."
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: '#94a3b8' }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Sample Received">Sample Received</option>
            <option value="Testing">Testing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests Grid / Table */}
      <div className="lab-requests-grid">
        {filteredRequests.length === 0 ? (
          <div className="empty-card" style={{ padding: '40px', textAlign: 'center', background: '#0e1713', border: '1px dashed #334155', borderRadius: '12px' }}>
            <ClipboardList size={36} style={{ color: '#64748b', marginBottom: '12px' }} />
            <h3>No Soil Test Requests Found</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>There are currently no requests matching your search filter.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="lab-request-card" style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>{req.id}</span>
                    <code style={{ background: '#09130e', padding: '2px 8px', borderRadius: '4px', color: '#a3e635', fontSize: '12px' }}>Sample: {req.sample_id}</code>
                  </div>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '17px', color: '#f8fafc' }}>{req.farmer_name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                    {req.farm_location}, {req.village}, {req.district}, {req.state}
                  </p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              <div className="lab-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: '#0a120d', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Land Area</span>
                  <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{req.land_area} Acres</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Soil Type</span>
                  <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{req.soil_type}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Current Crop</span>
                  <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{req.current_crop}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Planned Crop</span>
                  <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{req.planned_crop}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Collection Date</span>
                  <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{req.collection_date}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button className="button secondary-sm" onClick={() => navigate(`/lab/requests/${req.id}`)}>
                  <Eye size={14} /> View Complete Details & Timeline
                </button>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {req.status === 'Pending' && (
                    <button className="button success-sm" onClick={() => handleStatusUpdate(req.id, 'Sample Received')}>
                      <CheckCircle2 size={14} /> Mark Sample Received
                    </button>
                  )}
                  {req.status === 'Sample Received' && (
                    <button className="button primary-sm" onClick={() => handleStatusUpdate(req.id, 'Testing')}>
                      <TrendingUp size={14} /> Start Testing
                    </button>
                  )}
                  {(req.status === 'Testing' || req.status === 'Sample Received' || req.status === 'Completed') && (
                    <button className="button primary-sm" style={{ background: '#0284c7' }} onClick={() => navigate(`/lab/requests/${req.id}`)}>
                      <FileUp size={14} /> Upload / Manage Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
