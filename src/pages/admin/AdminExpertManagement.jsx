import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/services';
import { Stethoscope, UserPlus, CheckCircle, Search } from 'lucide-react';

export function AdminExpertManagement() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperts() {
      try {
        const data = await adminService.getAllUsers('expert');
        setExperts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadExperts();
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#f8fafc' }}>Loading experts...</div>;

  return (
    <div className="page-content admin-page-content">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">EXPERT DIRECTORY</span>
          <h1>Expert Management</h1>
        </div>
        <button className="button primary admin-button">
          <UserPlus size={16} /> Register New Expert
        </button>
      </div>

      <div className="panel admin-panel" style={{ marginTop: '24px', padding: '20px' }}>
        <div className="table-responsive">
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Mobile</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {experts.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #1e293b', color: '#f8fafc' }}>
                  <td style={{ padding: '12px' }}><code style={{ color: '#38bdf8' }}>{exp.id.substring(0,8)}</code></td>
                  <td style={{ padding: '12px' }}><strong>{exp.full_name}</strong></td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{exp.email}</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{exp.mobile || 'N/A'}</td>
                  <td style={{ padding: '12px' }}><span className="status-pill healthy"><CheckCircle size={12} /> Active</span></td>
                </tr>
              ))}
              {experts.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No experts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
