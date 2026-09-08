import React, { useState } from 'react';
import { BookOpen, Bell, Check, ShieldCheck } from 'lucide-react';

export function AdminContentManagement() {
  const [toast, setToast] = useState('');
  const [schemes, setSchemes] = useState([
    { id: 'sch-1', name: 'PM-KISAN Samman Nidhi', state: 'Central Scheme', status: 'ACTIVE', category: 'Direct Benefit' },
    { id: 'sch-2', name: 'Sub-Mission on Agricultural Mechanization (SMAM)', state: 'Central Scheme', status: 'ACTIVE', category: 'Subsidy' },
    { id: 'sch-3', name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', state: 'All States', status: 'ACTIVE', category: 'Insurance' }
  ]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBroadcastAlert = () => {
    notify('Emergency agronomic advisory alert broadcast to registered soil labs and regional stations!');
  };

  const toggleSchemeStatus = (id) => {
    setSchemes(schemes.map(s => s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : s));
    notify('Updated scheme moderation status.');
  };

  return (
    <div className="page-content admin-page-content">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">CONTENT & KNOWLEDGE BASE</span>
          <h1>Schemes & Knowledge Moderation</h1>
          <p>Moderate ICAR research documents, manage government scheme eligibility cards, and broadcast alerts.</p>
        </div>
        <button className="button primary admin-button" onClick={handleBroadcastAlert}>
          <Bell size={16} /> Broadcast Advisory Alert
        </button>
      </div>

      {toast && <div className="toast-success-banner blue-toast"><Check size={16} /> {toast}</div>}

      <div className="admin-dashboard-grid" style={{ display: 'grid', gap: 20 }}>
        <section className="panel admin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow blue-eyebrow">SCHEME MODERATION</span>
              <h2>Active Government Schemes ({schemes.length})</h2>
            </div>
          </div>

          <div className="admin-schemes-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {schemes.map((s) => (
              <div key={s.id} className="admin-scheme-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{s.name}</strong>
                  <small style={{ display: 'block', color: '#94a3b8' }}>{s.state} · {s.category}</small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`status-pill ${s.status === 'ACTIVE' ? 'healthy' : 'monitor'}`}>{s.status}</span>
                  <button className="button secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => toggleSchemeStatus(s.id)}>
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel admin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow blue-eyebrow">AGRONOMIC KNOWLEDGE</span>
              <h2>ICAR Research Library Sync</h2>
            </div>
          </div>

          <div className="admin-knowledge-info" style={{ padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b' }}>
            <p style={{ color: '#cbd5e1' }}>Knowledge base is connected to n8n RAG Vector store and ICAR agronomy repository.</p>
            <div className="sync-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, color: '#38bdf8' }}>
              <ShieldCheck size={20} />
              <div>
                <strong style={{ display: 'block', color: '#fff' }}>Vector Embeddings Active</strong>
                <small style={{ color: '#94a3b8' }}>Last synced 12 minutes ago</small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
