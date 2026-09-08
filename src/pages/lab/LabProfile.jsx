import React, { useState, useEffect } from 'react';
import { labService } from '../../lib/services';
import {
  Building2, ShieldCheck, Mail, Phone, MapPin, FlaskConical, Award, Activity
} from 'lucide-react';

export function LabProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await labService.getLabProfile();
        setProfile(data);
      } catch (err) {
        console.warn('Failed to load lab profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="page-content lab-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#38bdf8' }}>Loading Laboratory Profile...</p>
      </div>
    );
  }

  return (
    <div className="page-content lab-page-content">
      <div className="page-header lab-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">LABORATORY ACCREDITATION</span>
          <h1>{profile?.name || 'Central Soil Testing Laboratory'}</h1>
          <p>Registration No: <strong>{profile?.regNo || 'LAB-DEL-2022-104'}</strong> · Status: <span style={{ color: '#38bdf8' }}>{profile?.status || 'VERIFIED'}</span></p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Profile Card */}
        <div className="panel lab-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} style={{ color: '#38bdf8' }} /> Laboratory Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Official Name</span>
              <strong style={{ color: '#f8fafc', fontSize: '16px' }}>{profile?.name}</strong>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Accreditation & Compliance</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3e635', fontWeight: 600, marginTop: '2px' }}>
                <Award size={16} /> {profile?.accreditation}
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Region & Jurisdiction</span>
              <strong style={{ color: '#f8fafc' }}>{profile?.state} ({profile?.district})</strong>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Laboratory Address</span>
              <strong style={{ color: '#cbd5e1' }}>{profile?.address}</strong>
            </div>
          </div>
        </div>

        {/* Contact & Capacity Card */}
        <div className="panel lab-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: '#a3e635' }} /> Diagnostic Operations & Contact
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Official Email</span>
              <strong style={{ color: '#38bdf8' }}>{profile?.contact_email}</strong>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Direct Lab Line</span>
              <strong style={{ color: '#f8fafc' }}>{profile?.phone}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#0a120d', padding: '16px', borderRadius: '8px', marginTop: '8px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Active Soil Tests</span>
                <strong style={{ color: '#38bdf8', fontSize: '18px' }}>{profile?.active_tests}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Total Reports Issued</span>
                <strong style={{ color: '#a3e635', fontSize: '18px' }}>{profile?.tests_completed}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
