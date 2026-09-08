import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, HeartHandshake, Cpu, Stethoscope, ArrowRight, Smartphone,
  ShieldCheck, Building2, CheckCircle2, Leaf, Lock
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
            <span className="brand-title">KrishiDrishti AI</span>
          </div>
          <h1>Institutional Web Portals</h1>
          <p>Select your authorized web workspace to access platform administration, NGO operations, or agronomic pathology.</p>
        </header>

        {/* Farmer Mobile App Notice Banner */}
        <div className="farmer-app-notice-card">
          <div className="notice-icon">
            <Smartphone size={24} style={{ color: '#34d399' }} />
          </div>
          <div className="notice-content">
            <div className="notice-header">
              <strong>Farmer Portal Migration to Mobile App</strong>
              <span className="app-only-badge">App Exclusive</span>
            </div>
            <p>
              Farmer features (My Farms Telemetry, AI Pathology Diagnosis, Agri Assistant, and Seed Marketplace) are available <strong>exclusively on the KrishiDrishti Mobile App</strong> for field-ready performance.
            </p>
          </div>
        </div>

        {/* Portals Selection Grid */}
        <div className="portals-grid">
          {/* NGO Card */}
          <div className="portal-card ngo-card" onClick={() => navigate('/ngo/login')}>
            <div className="card-top-bar">
              <span className="portal-icon green-icon"><HeartHandshake size={24} /></span>
              <span className="role-tag green-tag">NGO Operations</span>
            </div>
            <h2>NGO Partner Portal</h2>
            <p>Manage water conservation drives, bio-fertilizer distributions, and regional farmer support grants.</p>
            <div className="portal-features">
              <span><CheckCircle2 size={14} style={{ color: '#34d399' }} /> Direct Grant Disbursal</span>
              <span><CheckCircle2 size={14} style={{ color: '#34d399' }} /> Field Intervention Projects</span>
            </div>
            <button className="button primary full ngo-button" style={{ marginTop: 'auto' }}>
              Enter NGO Portal <ArrowRight size={16} />
            </button>
          </div>

          {/* Admin Card */}
          <div className="portal-card admin-card" onClick={() => navigate('/admin/login')}>
            <div className="card-top-bar">
              <span className="portal-icon blue-icon"><Cpu size={24} /></span>
              <span className="role-tag blue-tag">System Admin</span>
            </div>
            <h2>Platform Command Center</h2>
            <p>Supervise platform telemetry, audit partner NGO accreditations, manage national registries, and broadcast alerts.</p>
            <div className="portal-features">
              <span><CheckCircle2 size={14} style={{ color: '#38bdf8' }} /> Executive Operations & Audit</span>
              <span><CheckCircle2 size={14} style={{ color: '#38bdf8' }} /> Partner NGO Moderation</span>
            </div>
            <button className="button primary full admin-button" style={{ marginTop: 'auto' }}>
              Enter Admin Console <ArrowRight size={16} />
            </button>
          </div>

          {/* Expert Card */}
          <div className="portal-card expert-card" onClick={() => navigate('/expert/login')}>
            <div className="card-top-bar">
              <span className="portal-icon purple-icon"><Stethoscope size={24} /></span>
              <span className="role-tag purple-tag">Clinical Pathology</span>
            </div>
            <h2>Agronomy Expert Portal</h2>
            <p>Review AI crop disease assessments, issue prescription treatment plans, and consult ICAR knowledge bases.</p>
            <div className="portal-features">
              <span><CheckCircle2 size={14} style={{ color: '#a5b4fc' }} /> Crop Pathology Triage</span>
              <span><CheckCircle2 size={14} style={{ color: '#a5b4fc' }} /> Specialist Treatment Rx</span>
            </div>
            <button className="button primary full expert-button" style={{ marginTop: 'auto' }}>
              Enter Expert Portal <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="portal-footer">
          <small><ShieldCheck size={14} /> KrishiDrishti AI Enterprise System · 256-Bit Role Isolation</small>
        </footer>
      </div>
    </div>
  );
}
