import React, { useState, useEffect } from 'react';
import { ngoService } from '../../lib/services';
import {
  FolderKanban, Plus, CheckCircle2, XCircle, Droplet, Leaf, Sprout,
  X, Check, IndianRupee, Users, Clock
} from 'lucide-react';

export function NgoProjects() {
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('');
  const [beneficiaryCount, setBeneficiaryCount] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('Irrigation');

  useEffect(() => {
    async function load() {
      const [pData, rData] = await Promise.all([
        ngoService.getProjects(),
        ngoService.getAssistanceRequests()
      ]);
      setProjects(pData);
      setRequests(rData);
    }
    load();
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProj = await ngoService.createProject({
      title: title.trim(),
      region: region.trim() || 'Karnal District',
      beneficiaryCount: parseInt(beneficiaryCount || '100', 10),
      budget: budget.startsWith('₹') ? budget : `₹ ${budget}`,
      category
    });

    setProjects([newProj, ...projects]);
    setShowModal(false);
    setTitle('');
    setRegion('');
    setBeneficiaryCount('');
    setBudget('');
    notify(`New Field Project "${newProj.title}" launched successfully!`);
  };

  const handleApproveRequest = (reqId) => {
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
    notify('Farmer assistance application approved.');
  };

  const handleRejectRequest = (reqId) => {
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
    notify('Farmer assistance application rejected.');
  };

  return (
    <div className="page-content ngo-page-content">
      <div className="page-header ngo-page-header">
        <div>
          <span className="eyebrow green-eyebrow">FIELD PROGRAM MANAGEMENT</span>
          <h1>Projects & Farmer Assistance Grants</h1>
          <p>Track regional agricultural interventions, solar irrigation subsidies, and bio-input distributions.</p>
        </div>
        <button className="button primary ngo-button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Field Project
        </button>
      </div>

      {toast && <div className="toast-success-banner"><Check size={16} /> {toast}</div>}

      <div className="projects-grid">
        {/* Projects List */}
        <section className="panel ngo-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow green-eyebrow">ACTIVE INITIATIVES ({projects.length})</span>
              <h2>Registered NGO Projects</h2>
            </div>
          </div>

          <div className="ngo-projects-full-list">
            {projects.map((proj) => (
              <div key={proj.id} className="project-card-full">
                <div className="card-top">
                  <div>
                    <h3>{proj.title}</h3>
                    <span className="proj-pill-category"><Droplet size={13} /> {proj.category}</span>
                  </div>
                  <span className={`status-pill ${proj.status === 'COMPLETED' ? 'healthy' : 'monitor'}`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span>Target Region</span>
                    <strong>{proj.region}</strong>
                  </div>
                  <div className="stat">
                    <span>Beneficiaries</span>
                    <strong>{proj.beneficiaryCount} Farmers</strong>
                  </div>
                  <div className="stat">
                    <span>Allocated Budget</span>
                    <strong>{proj.budget}</strong>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Completion Status</span>
                    <strong>{proj.progress}%</strong>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assistance Applications Review */}
        <section className="panel ngo-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow green-eyebrow">APPLICATIONS QUEUE</span>
              <h2>Farmer Assistance Requests</h2>
            </div>
          </div>

          <div className="requests-review-list">
            {requests.map((req) => (
              <div key={req.id} className="request-review-card">
                <div className="req-header">
                  <div>
                    <strong>{req.farmerName}</strong>
                    <small>{req.Village} · Applied: {req.date}</small>
                  </div>
                  <span className={`status-tag ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </div>

                <div className="req-body">
                  <p>Request: <strong>{req.requestType}</strong> ({req.acreage})</p>
                </div>

                {req.status === 'PENDING' && (
                  <div className="req-actions">
                    <button className="button success-sm" onClick={() => handleApproveRequest(req.id)}>
                      <CheckCircle2 size={14} /> Approve Grant
                    </button>
                    <button className="button danger-sm" onClick={() => handleRejectRequest(req.id)}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content ngo-modal">
            <div className="modal-header">
              <h2>Launch New Field Project</h2>
              <button className="icon-button" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="modal-form">
              <label className="field-label">
                Project Title
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Drip Irrigation Subsidy Drive 2026"
                  required
                />
              </label>

              <div className="form-row-2">
                <label className="field-label">
                  Target Region / Block
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Karnal & Nilokheri"
                    required
                  />
                </label>

                <label className="field-label">
                  Category
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Irrigation">Irrigation & Drip</option>
                    <option value="Organic Farming">Organic Farming</option>
                    <option value="Equipment Sharing">Equipment Sharing</option>
                    <option value="Soil Mapping">Soil Mapping</option>
                  </select>
                </label>
              </div>

              <div className="form-row-2">
                <label className="field-label">
                  Target Beneficiaries (Farmers)
                  <input
                    type="number"
                    value={beneficiaryCount}
                    onChange={(e) => setBeneficiaryCount(e.target.value)}
                    placeholder="250"
                    required
                  />
                </label>

                <label className="field-label">
                  Project Budget
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="15,00,000"
                    required
                  />
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="button secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button primary ngo-button">Launch Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
