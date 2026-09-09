import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FlaskConical, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LabLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { auth } = await import('../../lib/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const firebaseUser = userCredential.user;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', firebaseUser.uid)
        .single();
        
      if (profileError) throw profileError;
      
      if (profile.role !== 'lab') {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
          throw new Error('Unauthorized role. This portal is for Labs only.');
      }
      
      navigate('/lab/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page lab-auth-page">
      <div className="auth-brand">
        <span className="brand-mark lab-mark-brand"><FlaskConical size={20} /></span>
        Soil Testing Lab Portal
      </div>

      <div className="auth-art lab-auth-art">
        <div className="auth-sun lab-sun"></div>
        <div className="auth-copy">
          <span className="eyebrow light lab-eyebrow">PRECISION SOIL PATHOLOGY & TESTING</span>
          <h1>Accredited Soil Testing Operations</h1>
          <p>Process incoming farmer soil samples, conduct NPK & micronutrient diagnostics, and generate verified soil health reports.</p>
        </div>
        <div className="lab-perks-list">
          <div className="lab-perk-item"><CheckCircle2 size={16} style={{ color: '#38bdf8' }} /> Real-Time Soil Sample Tracking & Processing</div>
          <div className="lab-perk-item"><CheckCircle2 size={16} style={{ color: '#38bdf8' }} /> NABL & ICAR Compliant Soil Health Reports</div>
          <div className="lab-perk-item"><CheckCircle2 size={16} style={{ color: '#38bdf8' }} /> Encrypted Direct PDF Report Uploads to Farmers</div>
        </div>
        <div className="auth-quote">“Precise soil analytics transform field potential into record yields.”</div>
      </div>

      <div className="auth-form">
        <div className="auth-form-inner">
          <div className="auth-role-pill lab-pill">
            <FlaskConical size={14} /> Laboratory Authorized Portal
          </div>
          <h2>Lab Representative Sign In</h2>
          <p>Enter your credentials to access soil test management.</p>

          <form onSubmit={handleLogin}>
              <label className="field-label">
                Laboratory Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lab@example.com"
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
              
              <button className="button primary full lab-button" type="submit" disabled={loading} style={{marginTop: '24px'}}>
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>

          {error && <p className="form-error">{error}</p>}

          <small className="auth-note">
            <ShieldCheck size={14} /> Encrypted Lab Authorization · Strict User Data Isolation
          </small>
        </div>
      </div>
    </div>
  );
}
