import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, FlaskConical, Cpu, Stethoscope, ArrowRight,
  ShieldCheck, CheckCircle2, ClipboardList
} from 'lucide-react';

export function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="portal-selection-page">
      <div className="portal-selection-container">
        {/* Brand Header */}
        <header className="portal-header">
          <div className="brand-badge">
            <span className="brand-mark-lg"><Sprout size={24} /></span>
            <span className="brand-title">KrishiShakti Enterprise</span>
          </div>
          <h1>Platform Web Portals</h1>
          <p>Select your authorized workspace to access Farmer Services, Soil Testing Operations, Expert Pathology, or Platform Administration.</p>
        </header>

        {/* Portals Selection Grid */}
        <div className="portals-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {/* Farmer Portal Card */}
          <div className="portal-card farmer-card" onClick={() => navigate('/farmer/login')} style={{ background: '#111c16', border: '1px solid #16a34a', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="portal-icon green-icon" style={{ background: 'rgba(163, 230, 53, 0.15)', padding: '10px', borderRadius: '10px', color: '#a3e635' }}>
                <Sprout size={24} />
              </span>
              <span className="role-tag green-tag" style={{ background: '#16a34a', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Farmer Services</span>
            </div>
            <h2 style={{ fontSize: '20px', color: '#f8fafc', margin: '0 0 8px 0' }}>Farmer / User Portal</h2>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '16px' }}>Request soil testing, track sample progress, and view certified lab reports directly in your account.</p>
            <div className="portal-features" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#cbd5e1', marginBottom: '20px' }}>
              <span><CheckCircle2 size={14} style={{ color: '#a3e635' }} /> Soil Test Requests</span>
              <span><CheckCircle2 size={14} style={{ color: '#a3e635' }} /> Certified PDF Reports</span>
            </div>
            <button className="button primary full farmer-button" style={{ marginTop: 'auto', background: '#16a34a', borderColor: '#16a34a' }}>
              Enter Farmer Portal <ArrowRight size={16} />
            </button>
          </div>

          {/* Soil Testing Lab Portal Card */}
          <div className="portal-card lab-card" onClick={() => navigate('/lab/login')} style={{ background: '#111c16', border: '1px solid #0284c7', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="portal-icon blue-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '10px', color: '#38bdf8' }}>
                <FlaskConical size={24} />
              </span>
              <span className="role-tag blue-tag" style={{ background: '#0284c7', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Soil Testing Lab</span>
            </div>
            <h2 style={{ fontSize: '20px', color: '#f8fafc', margin: '0 0 8px 0' }}>Soil Testing Lab Portal</h2>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '16px' }}>Process incoming soil samples, manage laboratory testing workflows, and upload verified PDF test reports.</p>
            <div className="portal-features" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#cbd5e1', marginBottom: '20px' }}>
              <span><CheckCircle2 size={14} style={{ color: '#38bdf8' }} /> Sample Intake & Diagnostics</span>
              <span><CheckCircle2 size={14} style={{ color: '#38bdf8' }} /> Encrypted Report Uploads</span>
            </div>
            <button className="button primary full lab-button" style={{ marginTop: 'auto', background: '#0284c7', borderColor: '#0284c7' }}>
              Enter Lab Portal <ArrowRight size={16} />
            </button>
          </div>

          {/* Admin Command Center Card */}
          <div className="portal-card admin-card" onClick={() => navigate('/admin/login')} style={{ background: '#111c16', border: '1px solid #334155', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="portal-icon blue-icon" style={{ background: 'rgba(148, 163, 184, 0.15)', padding: '10px', borderRadius: '10px', color: '#94a3b8' }}>
                <Cpu size={24} />
              </span>
              <span className="role-tag blue-tag" style={{ background: '#334155', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>System Admin</span>
            </div>
            <h2 style={{ fontSize: '20px', color: '#f8fafc', margin: '0 0 8px 0' }}>Platform Command Center</h2>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '16px' }}>Supervise platform telemetry, audit lab accreditations, manage user directories, and monitor system health.</p>
            <div className="portal-features" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#cbd5e1', marginBottom: '20px' }}>
              <span><CheckCircle2 size={14} style={{ color: '#94a3b8' }} /> Executive Operations & Audit</span>
              <span><CheckCircle2 size={14} style={{ color: '#94a3b8' }} /> Soil Testing Lab Moderation</span>
            </div>
            <button className="button primary full admin-button" style={{ marginTop: 'auto', background: '#334155', borderColor: '#475569' }}>
              Enter Admin Console <ArrowRight size={16} />
            </button>
          </div>

          {/* Agronomy Expert Portal Card */}
          <div className="portal-card expert-card" onClick={() => navigate('/expert/login')} style={{ background: '#111c16', border: '1px solid #7c3aed', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="portal-icon purple-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '10px', color: '#a855f7' }}>
                <Stethoscope size={24} />
              </span>
              <span className="role-tag purple-tag" style={{ background: '#7c3aed', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Clinical Pathology</span>
            </div>
            <h2 style={{ fontSize: '20px', color: '#f8fafc', margin: '0 0 8px 0' }}>Agronomy Expert Portal</h2>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '16px' }}>Review AI crop disease assessments, issue prescription treatment plans, and consult ICAR knowledge bases.</p>
            <div className="portal-features" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#cbd5e1', marginBottom: '20px' }}>
              <span><CheckCircle2 size={14} style={{ color: '#a855f7' }} /> Crop Pathology Triage</span>
              <span><CheckCircle2 size={14} style={{ color: '#a855f7' }} /> Specialist Treatment Rx</span>
            </div>
            <button className="button primary full expert-button" style={{ marginTop: 'auto', background: '#7c3aed', borderColor: '#7c3aed' }}>
              Enter Expert Portal <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="portal-footer">
          <small><ShieldCheck size={14} /> KrishiShakti Enterprise System · 256-Bit Role Isolation</small>
        </footer>
      </div>
    </div>
  );
}
