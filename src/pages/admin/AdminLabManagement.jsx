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

  const filteredLabs = labs.filter(l =>
    (l.lab_name && l.lab_name.toLowerCase().includes(search.toLowerCase())) ||
    (l.license_number && l.license_number.toLowerCase().includes(search.toLowerCase())) ||
    (l.address && l.address.toLowerCase().includes(search.toLowerCase()))
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
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>{lab.lab_name}</h3>
                  <small style={{ color: '#94a3b8' }}>Reg No: <strong style={{ color: '#38bdf8' }}>{lab.license_number || 'Pending'}</strong></small>
                </div>
              </div>
              <span className={`status-pill ${lab.active ? 'healthy' : 'coral'}`}>
                {lab.active ? <ShieldCheck size={14} /> : <XCircle size={14} />}
                {lab.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            <div className="lab-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', background: '#0a120d', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Director / Administrator</span>
                <strong style={{ color: '#f8fafc', fontSize: '12.5px' }}>{lab.profiles?.full_name || 'Not set'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Contact Email</span>
                <strong style={{ color: '#38bdf8', fontSize: '12.5px' }}>{lab.profiles?.email || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Mobile</span>
                <strong style={{ color: '#f8fafc', fontSize: '12.5px' }}>{lab.profiles?.mobile || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Address</span>
                <strong style={{ color: '#f8fafc', fontSize: '12.5px' }}>{lab.address || 'N/A'}</strong>
              </div>
            </div>

            {!lab.active && (
              <div className="admin-lab-actions" style={{ display: 'flex', gap: '8px' }}>
                <button className="button success-sm" onClick={() => notify('Lab approved!')}>
                  <CheckCircle2 size={15} /> Approve Accreditation
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
