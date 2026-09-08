import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/services';
import {
  FlaskConical, ShieldCheck, Clock, CheckCircle2, XCircle, Search, Mail, Phone, MapPin, Check
} from 'lucide-react';

export function AdminLabManagement() {
  const [labs, setLabs] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadLabs() {
      const data = await adminService.getAllLabs();
      setLabs(data);
    }
    loadLabs();
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (id) => {
    await adminService.updateLabStatus(id, 'VERIFIED');
    setLabs(labs.map(l => l.id === id ? { ...l, status: 'VERIFIED' } : l));
    notify('Lab accreditation approved and set to VERIFIED status.');
  };

  const handleReject = async (id) => {
    await adminService.updateLabStatus(id, 'REJECTED');
    setLabs(labs.map(l => l.id === id ? { ...l, status: 'REJECTED' } : l));
    notify('Lab accreditation rejected.');
  };

  const filteredLabs = labs.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.regNo.toLowerCase().includes(search.toLowerCase()) ||
    l.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content admin-page-content">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">PARTNER GOVERNANCE</span>
          <h1>Soil Testing Lab Management</h1>
          <p>Verify registration credentials, approve new agricultural soil testing station applications, and monitor diagnostic throughput.</p>
        </div>
      </div>

      {toast && <div className="toast-success-banner blue-toast"><Check size={16} /> {toast}</div>}

      <div className="admin-toolbar">
        <label className="search-box admin-search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Lab name, registration ID, or state..."
          />
        </label>
      </div>

      <div className="admin-lab-list">
        {filteredLabs.map((lab) => (
          <div key={lab.id} className="admin-lab-card" style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div className="lab-title-box" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="lab-avatar-icon" style={{ background: '#0284c7', color: '#fff', padding: '8px', borderRadius: '8px' }}><FlaskConical size={20} /></div>
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>{lab.name}</h3>
                  <small style={{ color: '#94a3b8' }}>Reg No: <strong style={{ color: '#38bdf8' }}>{lab.regNo}</strong> · Region: {lab.state}</small>
                </div>
              </div>
              <span className={`status-pill ${lab.status === 'VERIFIED' ? 'healthy' : lab.status === 'PENDING_APPROVAL' ? 'monitor' : 'coral'}`}>
                {lab.status === 'VERIFIED' ? <ShieldCheck size={14} /> : <Clock size={14} />}
                {lab.status.replace('_', ' ')}
              </span>
            </div>

            <div className="lab-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', background: '#0a120d', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Director / Head Chemist</span>
                <strong style={{ color: '#f8fafc', fontSize: '12.5px' }}>{lab.director || 'Dr. Ramesh Sharma'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Contact Email</span>
                <strong style={{ color: '#38bdf8', fontSize: '12.5px' }}>{lab.contact_email}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Active Diagnostics</span>
                <strong style={{ color: '#f8fafc', fontSize: '12.5px' }}>{lab.active_tests} Tests In Progress</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Reports Published</span>
                <strong style={{ color: '#a3e635', fontSize: '12.5px' }}>{lab.tests_completed} Reports Delivered</strong>
              </div>
            </div>

            {lab.status === 'PENDING_APPROVAL' && (
              <div className="admin-lab-actions" style={{ display: 'flex', gap: '8px' }}>
                <button className="button success-sm" onClick={() => handleApprove(lab.id)}>
                  <CheckCircle2 size={15} /> Approve Accreditation
                </button>
                <button className="button danger-sm" onClick={() => handleReject(lab.id)}>
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
