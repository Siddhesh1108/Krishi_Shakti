import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Stethoscope, ShieldCheck, ArrowRight, CheckCircle2, Activity } from 'lucide-react';

export function ExpertLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('expert@test.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { roomdbAuth } = await import('../../lib/roomdbAuth');
      
      const { user: bridgeUser } = await roomdbAuth.login(email.trim(), password.trim());
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', bridgeUser.uid)
        .single();
        
      if (profileError) throw profileError;
      
      if (profile.role !== 'expert') {
          await roomdbAuth.logout();
          throw new Error('Unauthorized role. This portal is for Agronomy Experts only.');
      }
      
      navigate('/expert/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page expert-auth-page">
      <div className="auth-brand">
        <span className="brand-mark expert-mark-brand"><Stethoscope size={20} /></span>
        Agronomy Expert Portal
      </div>

      <div className="auth-art expert-auth-art">
        <div className="auth-sun expert-sun"></div>
        <div className="auth-copy">
          <span className="eyebrow light expert-eyebrow">CLINICAL DIAGNOSTICS & ADVISORY</span>
          <h1>Expert Plant Pathology.</h1>
          <p>Review AI crop disease assessments, issue verified prescription treatments, and guide field agronomists across regions.</p>
        </div>
        <div className="expert-perks-list">
          <div className="expert-perk-item"><CheckCircle2 size={16} style={{ color: '#a5b4fc' }} /> Case Review & Diagnostic Prescriptions</div>
          <div className="expert-perk-item"><CheckCircle2 size={16} style={{ color: '#a5b4fc' }} /> Grounded ICAR Knowledge Vector Base</div>
          <div className="expert-perk-item"><CheckCircle2 size={16} style={{ color: '#a5b4fc' }} /> Direct Agronomist Consultation Sync</div>
        </div>
        <div className="auth-quote">“Precision pathology turns crop disease warnings into actionable yields.”</div>
      </div>

      <div className="auth-form">
        <div className="auth-form-inner">
          <div className="auth-role-pill expert-pill">
            <Activity size={14} /> Certified Specialist Access
          </div>
          <h2>Expert Pathologist Sign In</h2>
          <p>Enter your registered specialist credentials to enter the expert portal.</p>

          <form onSubmit={handleLogin}>
              <label className="field-label">
                Specialist Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="expert@example.com"
                  required
                  autoFocus
                />
              </label>
              
              <label className="field-label" style={{marginTop: '16px', display: 'block'}}>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>
              
              <button className="button primary full expert-button" type="submit" disabled={loading} style={{marginTop: '24px'}}>
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>

          {error && <p className="form-error">{error}</p>}

          <small className="auth-note">
            <ShieldCheck size={14} /> ICAR Certified Specialist Authorization · Isolated Role Security
          </small>
        </div>
      </div>
    </div>
  );
}
