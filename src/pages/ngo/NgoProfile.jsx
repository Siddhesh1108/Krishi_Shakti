import React, { useState, useEffect } from 'react';
import { ngoService } from '../../lib/services';
import {
  Building2, ShieldCheck, Mail, Phone, MapPin, Award, FileText, Check, Save
} from 'lucide-react';

export function NgoProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    async function load() {
      const data = await ngoService.getNgoProfile();
      setProfile(data);
      setPhone(data.phone || '+91 98100 22334');
      setAddress(data.address || '14, Sector 6, Institutional Area, Karnal, Haryana');
    }
    load();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('Organization profile updated successfully!');
    setEditing(false);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="page-content ngo-page-content">
      <div className="page-header ngo-page-header">
        <div>
          <span className="eyebrow green-eyebrow">ORGANIZATION IDENTITY</span>
          <h1>NGO Profile & Registration</h1>
          <p>Verified Partner profile credentials for regional agricultural assistance and grant management.</p>
        </div>
      </div>

      {savedMsg && (
        <div className="toast-success-banner">
          <Check size={16} /> {savedMsg}
        </div>
      )}

      <div className="ngo-profile-grid">
        {/* Main Info Card */}
        <section className="panel ngo-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow green-eyebrow">VERIFIED IDENTITY</span>
              <h2>{profile?.name || 'Green Earth Agriculture Trust'}</h2>
            </div>
            <span className="status-pill healthy">
              <ShieldCheck size={14} /> {profile?.status || 'VERIFIED'}
            </span>
          </div>

          <form onSubmit={handleSave} className="ngo-profile-form">
            <div className="form-row-2">
              <div className="field-group">
                <label className="field-label">Registration ID</label>
                <input type="text" value={profile?.regNo || 'NGO-DEL-2021-884'} disabled />
              </div>
              <div className="field-group">
                <label className="field-label">Official Email</label>
                <input type="email" value={profile?.contactEmail || 'ngo@krishidrishti.org'} disabled />
              </div>
            </div>

            <div className="form-row-2">
              <div className="field-group">
                <label className="field-label">Primary Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Focus State & Region</label>
                <input type="text" value={profile?.state || 'Punjab & Haryana Region'} disabled />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Registered Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              {editing ? (
                <button type="submit" className="button primary ngo-button">
                  <Save size={15} /> Save Changes
                </button>
              ) : (
                <button type="button" className="button secondary" onClick={() => setEditing(true)}>
                  Edit Contact Details
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Credentials & Coverage Sidebar */}
        <div className="ngo-side-panels">
          <section className="panel ngo-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow green-eyebrow">GOVERNANCE</span>
                <h2>Legal & Tax Accreditation</h2>
              </div>
            </div>

            <div className="accreditation-list">
              <div className="accreditation-item">
                <Award size={18} style={{ color: '#10b981' }} />
                <div>
                  <strong>NITI Aayog Darpan Registered</strong>
                  <small>ID: DL/2021/0289110</small>
                </div>
              </div>

              <div className="accreditation-item">
                <FileText size={18} style={{ color: '#10b981' }} />
                <div>
                  <strong>80G & 12A Tax Exempt Status</strong>
                  <small>Verified by Central Board of Direct Taxes</small>
                </div>
              </div>

              <div className="accreditation-item">
                <Building2 size={18} style={{ color: '#10b981' }} />
                <div>
                  <strong>FCRA Approval</strong>
                  <small>Authorized for International Agri-grants</small>
                </div>
              </div>
            </div>
          </section>

          <section className="panel ngo-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow green-eyebrow">OPERATIONAL FIELD</span>
                <h2>District Coverage</h2>
              </div>
            </div>

            <div className="district-chips">
              {['Karnal District', 'Kurukshetra Block', 'Ambala East', 'Kaithal South', 'Panipat North'].map((dist, idx) => (
                <span key={idx} className="district-chip">
                  <MapPin size={13} style={{ color: '#34d399' }} /> {dist}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
