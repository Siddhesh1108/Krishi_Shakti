import React, { useState, useEffect } from 'react';
import { expertService } from '../../lib/services';
import {
  Stethoscope, AlertTriangle, CheckCircle2, BookOpen, Clock, ArrowUpRight, Check, X
} from 'lucide-react';

export function ExpertDashboard() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function load() {
      const data = await expertService.getExpertCases();
      setCases(data);
    }
    load();
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleResolveCase = (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    setCases(cases.map(c => c.id === selectedCase.id ? { ...c, status: 'Resolved', notes: prescriptionNotes } : c));
    notify(`Prescription submitted for case "${selectedCase.title}" and sent to farmer.`);
    setSelectedCase(null);
    setPrescriptionNotes('');
  };

  const highPriority = cases.filter(c => c.priority === 'HIGH' && c.status !== 'Resolved').length;
  const pendingCases = cases.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="page-content expert-page-content">
      <div className="page-header expert-page-header">
        <div>
          <span className="eyebrow purple-eyebrow">PATHOLOGY & CLINICAL ADVISORY</span>
          <h1>Clinical Case Overview</h1>
          <p>Review AI-detected pathology diagnoses, verify severity scores, and issue certified spray prescriptions.</p>
        </div>
      </div>

      {toast && <div className="toast-success-banner purple-toast"><Check size={16} /> {toast}</div>}

      {/* Metrics Grid */}
      <div className="metric-grid expert-metrics-grid">
        <div className="metric-card expert-metric-card">
          <div className="metric-icon purple"><Stethoscope size={20} /></div>
          <span>Assigned Cases</span>
          <div className="metric-value">{cases.length} <small>cases</small></div>
          <p>Total clinical telemetry logs</p>
        </div>

        <div className="metric-card expert-metric-card">
          <div className="metric-icon coral"><AlertTriangle size={20} /></div>
          <span>High Priority Cases</span>
          <div className="metric-value">{highPriority} <small>urgent</small></div>
          <p>Requires immediate triage</p>
        </div>

        <div className="metric-card expert-metric-card">
          <div className="metric-icon amber"><Clock size={20} /></div>
          <span>Pending Prescriptions</span>
          <div className="metric-value">{pendingCases} <small>pending</small></div>
          <p>Awaiting specialist review</p>
        </div>

        <div className="metric-card expert-metric-card">
          <div className="metric-icon green"><CheckCircle2 size={20} /></div>
          <span>Resolved Diagnostics</span>
          <div className="metric-value">{cases.length - pendingCases} <small>resolved</small></div>
          <p>Sent to farmer mobile app</p>
        </div>
      </div>

      {/* Cases Review Panel */}
      <section className="panel expert-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow purple-eyebrow">PATHOLOGY QUEUE</span>
            <h2>Active Crop Disease Cases</h2>
          </div>
        </div>

        <div className="expert-cases-list">
          {cases.map((c) => (
            <div key={c.id} className="expert-case-card">
              <div className="case-header-row">
                <div>
                  <strong>{c.title}</strong>
                  <small style={{ display: 'block', color: '#94a3b8' }}>Farmer: {c.farmer} · Location: {c.location}</small>
                </div>
                <span className={`status-pill ${c.status === 'Resolved' ? 'healthy' : c.priority === 'HIGH' ? 'coral' : 'monitor'}`}>
                  {c.status === 'Resolved' ? 'Resolved' : `${c.priority} PRIORITY`}
                </span>
              </div>

              <div className="case-body-info">
                <p>Detected Issue: <strong>{c.symptoms}</strong></p>
                <p>AI Diagnosis: <span style={{ color: '#818cf8', fontWeight: 600 }}>{c.aiDiagnosis}</span></p>
              </div>

              {c.status !== 'Resolved' && (
                <button
                  className="button primary expert-button"
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    setSelectedCase(c);
                    setPrescriptionNotes(c.notes || '');
                  }}
                >
                  <Stethoscope size={14} /> Review & Submit Prescription
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Prescription Modal */}
      {selectedCase && (
        <div className="modal-overlay">
          <div className="modal-content expert-modal">
            <div className="modal-header">
              <h2>Specialist Treatment Prescription</h2>
              <button className="icon-button" onClick={() => setSelectedCase(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleResolveCase} className="modal-form">
              <p>Case: <strong>{selectedCase.title}</strong> ({selectedCase.farmer})</p>
              <p>AI Finding: <strong>{selectedCase.aiDiagnosis}</strong></p>

              <label className="field-label" style={{ marginTop: 14 }}>
                Specialist Prescription & Dosage Recommendation
                <textarea
                  rows={4}
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="e.g. Apply Copper Oxychloride 50% WP @ 2.5g/litre water. Repeat foliar spray after 7 days if humidity remains high."
                  required
                />
              </label>

              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button type="button" className="button secondary" onClick={() => setSelectedCase(null)}>Cancel</button>
                <button type="submit" className="button primary expert-button">Authorize & Send Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
