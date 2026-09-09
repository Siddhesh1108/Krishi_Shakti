import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Cpu, ShieldCheck, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export function AdminLogin() {
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
      
      if (profile.role !== 'admin') {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
          throw new Error('Unauthorized role. This portal is for Administrators only.');
      }
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-auth-page">
      <div className="auth-brand">
        <span className="brand-mark admin-mark-brand"><Cpu size={20} /></span>
        Platform Command Console
      </div>

      <div className="auth-art admin-auth-art">
        <div className="auth-sun admin-sun"></div>
        <div className="auth-copy">
          <span className="eyebrow light admin-eyebrow">SYSTEM OPERATIONS & AUDIT</span>
          <h1>Central Platform Command.</h1>
          <p>Supervise soil testing lab accreditations, review real-time AI pathology models, manage national farmer registries, and direct scheme alerts.</p>
        </div>
        <div className="admin-perks-list">
          <div className="admin-perk-item"><CheckCircle2 size={16} style={{ color: '#38bdf8' }} /> Executive Operations & Telemetry Monitoring</div>
          <div className="admin-perk-item"><CheckCircle2 size={16} style={{ color: '#38bdf8' }} /> Registered Soil Lab Verification & Audit Control</div>
          <div className="admin-perk-item"><CheckCircle2 size={16} style={{ color: '#38bdf8' }} /> Full User & Agronomic Data Moderation</div>
        </div>
        <div className="auth-quote">“Operational clarity powers seamless agricultural governance.”</div>
      </div>

      <div className="auth-form">
        <div className="auth-form-inner">
          <div className="auth-role-pill admin-pill">
            <KeyRound size={14} /> Restricted Administrator Access
          </div>
          <h2>Administrator Sign In</h2>
          <p>Enter system administrator credentials.</p>

          <form onSubmit={handleLogin}>
              <label className="field-label">
                Administrative Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
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
              
              <button className="button primary full admin-button" type="submit" disabled={loading} style={{marginTop: '24px'}}>
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>

          {error && <p className="form-error">{error}</p>}

          <small className="auth-note">
            <ShieldCheck size={14} /> 256-Bit Encrypted Admin Session · Strict Authorization
          </small>
        </div>
      </div>
    </div>
  );
}
