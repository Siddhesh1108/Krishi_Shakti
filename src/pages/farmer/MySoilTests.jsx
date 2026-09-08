import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { soilTestService } from '../../lib/services';
import {
  ClipboardList, Search, PlusCircle, CheckCircle2, Clock, Activity,
  TrendingUp, FileCheck, Eye, ShieldCheck, X
} from 'lucide-react';

export function MySoilTests() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const userId = user?.id || 'demo-farmer-id';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDetailReq, setSelectedDetailReq] = useState(null);

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await soilTestService.getFarmerSoilTestRequests(userId);
        setRequests(data);
      } catch (err) {
        console.warn('Failed to load farmer soil tests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [userId]);

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

  const filteredRequests = requests.filter(req =>
    req.id.toLowerCase().includes(search.toLowerCase()) ||
    req.sample_id.toLowerCase().includes(search.toLowerCase()) ||
    req.farm_location.toLowerCase().includes(search.toLowerCase()) ||
    req.current_crop.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-content farmer-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#a3e635' }}>Loading Your Soil Test Requests...</p>
      </div>
    );
  }

  return (
    <div className="page-content farmer-page-content">
      <div className="page-header farmer-page-header" style={{ marginBottom: '20px' }}>
        <div>
          <span className="eyebrow green-eyebrow" style={{ color: '#a3e635' }}>MY ACCOUNT</span>
          <h1>My Soil Tests</h1>
          <p>Track live laboratory processing, sample statuses, and progress for your submitted soil samples.</p>
        </div>

        <button className="button primary farmer-button" onClick={() => navigate('/farmer/soil-test')} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
          <PlusCircle size={16} /> Request New Soil Test
        </button>
      </div>

      {/* Security Privacy Notice */}
      <div style={{ background: '#0a120d', border: '1px solid #16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={18} style={{ color: '#a3e635' }} />
        <span style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
          Strict User Data Isolation Active: Displaying soil test requests belonging <strong>ONLY</strong> to your account (<code style={{ color: '#a3e635' }}>{userId}</code>).
        </span>
      </div>

      <div className="farmer-toolbar" style={{ marginBottom: '20px' }}>
        <label className="search-box farmer-search-box" style={{ maxWidth: '380px' }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Request ID, Sample ID, location, or crop..."
          />
        </label>
      </div>

      <div className="farmer-requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRequests.length === 0 ? (
          <div className="empty-card" style={{ padding: '40px', textAlign: 'center', background: '#111c16', borderRadius: '12px', border: '1px dashed #1e2d24' }}>
            <ClipboardList size={36} style={{ color: '#64748b', marginBottom: '12px' }} />
            <h3 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>No Soil Tests Found</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>You do not have any active or past soil test requests matching your search.</p>
            <button className="button primary-sm" onClick={() => navigate('/farmer/soil-test')} style={{ marginTop: '12px', background: '#16a34a' }}>
              Submit Soil Test Request
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '16px', color: '#38bdf8' }}>{req.id}</strong>
                  <code style={{ background: '#0a120d', padding: '2px 8px', borderRadius: '4px', color: '#a3e635', fontSize: '12px' }}>Sample: {req.sample_id}</code>
                </div>
                <div style={{ color: '#f8fafc', fontSize: '14px', marginBottom: '4px' }}>
                  Location: <strong>{req.farm_location}, {req.village}, {req.district}</strong>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  Crop: <strong>{req.current_crop}</strong> (Planned: {req.planned_crop}) · Date: {req.collection_date}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>{getStatusBadge(req.status)}</div>

                <button className="button secondary-sm" onClick={() => setSelectedDetailReq(req)}>
                  <Eye size={14} /> View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedDetailReq && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '14px', width: '100%', maxWidth: '560px', padding: '24px', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} style={{ color: '#a3e635' }} /> Soil Test Request Details
              </h3>
              <button className="icon-button" onClick={() => setSelectedDetailReq(null)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#0a120d', padding: '16px', borderRadius: '8px', fontSize: '13.5px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Request ID</span>
                  <strong style={{ color: '#38bdf8' }}>{selectedDetailReq.id}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Sample ID</span>
                  <strong style={{ color: '#a3e635' }}>{selectedDetailReq.sample_id}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Collection Date</span>
                  <span>{selectedDetailReq.collection_date}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Current Status</span>
                  <span>{getStatusBadge(selectedDetailReq.status)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Farm Location</span>
                <span>{selectedDetailReq.farm_location}, {selectedDetailReq.village}, {selectedDetailReq.district}, {selectedDetailReq.state}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Land Area</span>
                  <span>{selectedDetailReq.land_area} Acres</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Soil Type</span>
                  <span>{selectedDetailReq.soil_type}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Current Crop</span>
                  <span>{selectedDetailReq.current_crop}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="button primary-sm" onClick={() => navigate('/farmer/reports')} style={{ background: '#16a34a' }}>
                Check My Soil Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
