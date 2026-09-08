import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/services';
import {
  Building2, ShieldCheck, Clock, CheckCircle2, XCircle, Search, Mail, Phone, MapPin, Check
} from 'lucide-react';

export function AdminNgoManagement() {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadNgos() {
      const data = await adminService.getAllNgos();
      setNgos(data);
    }
    loadNgos();
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (id) => {
    await adminService.updateNgoStatus(id, 'VERIFIED');
    setNgos(ngos.map(n => n.id === id ? { ...n, status: 'VERIFIED' } : n));
    notify('NGO accreditation approved and set to VERIFIED status.');
  };

  const handleReject = async (id) => {
    await adminService.updateNgoStatus(id, 'REJECTED');
    setNgos(ngos.map(n => n.id === id ? { ...n, status: 'REJECTED' } : n));
    notify('NGO application rejected.');
  };

  const filteredNgos = ngos.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.regNo.toLowerCase().includes(search.toLowerCase()) ||
    n.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content admin-page-content">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">PARTNER GOVERNANCE</span>
          <h1>NGO Partner Management</h1>
          <p>Verify registration credentials, approve new agricultural NGO applications, and monitor field impact.</p>
        </div>
      </div>

      {toast && <div className="toast-success-banner blue-toast"><Check size={16} /> {toast}</div>}

      <div className="admin-toolbar">
        <label className="search-box admin-search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by NGO name, registration ID, or state..."
          />
        </label>
      </div>

      <div className="admin-ngo-list">
        {filteredNgos.map((ngo) => (
          <div key={ngo.id} className="admin-ngo-card">
            <div className="card-header-row">
              <div className="ngo-title-box">
                <div className="ngo-avatar-icon"><Building2 size={20} /></div>
                <div>
                  <h3>{ngo.name}</h3>
                  <small>Reg No: <strong>{ngo.regNo}</strong> · State: {ngo.state}</small>
                </div>
              </div>
              <span className={`status-pill ${ngo.status === 'VERIFIED' ? 'healthy' : ngo.status === 'PENDING_APPROVAL' ? 'monitor' : 'coral'}`}>
                {ngo.status === 'VERIFIED' ? <ShieldCheck size={14} /> : <Clock size={14} />}
                {ngo.status.replace('_', ' ')}
              </span>
            </div>

            <div className="ngo-meta-grid">
              <div>
                <span>Director / Head</span>
                <strong>{ngo.director || 'Dr. Ramesh Sharma'}</strong>
              </div>
              <div>
                <span>Contact Email</span>
                <strong>{ngo.contact}</strong>
              </div>
              <div>
                <span>Active Projects</span>
                <strong>{ngo.activeProjects} Field Projects</strong>
              </div>
              <div>
                <span>Farmers Supported</span>
                <strong>{ngo.farmersSupported} Farmers</strong>
              </div>
            </div>

            {ngo.status === 'PENDING_APPROVAL' && (
              <div className="admin-ngo-actions">
                <button className="button success-sm" onClick={() => handleApprove(ngo.id)}>
                  <CheckCircle2 size={15} /> Approve Accreditation
                </button>
                <button className="button danger-sm" onClick={() => handleReject(ngo.id)}>
                  <XCircle size={15} /> Reject Application
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
