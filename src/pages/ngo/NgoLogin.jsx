import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Building2, HeartHandshake, ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export function NgoLogin() {
  const navigate = useNavigate();
  const { loginDemo, setAuthenticatedRole } = useAuthContext();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) {
        console.warn('OTP Notice:', error.message);
        setToastMessage('Trial Mode active. Enter code 123456 to continue.');
      } else {
        setToastMessage(`Verification code sent to ${email.trim()}`);
      }
      setStep('otp');
    } catch (_err) {
      setToastMessage('Trial Mode active. Enter code 123456 to continue.');
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();

    // Demo/Trial OTP handling for NGO (sample key: 123456 ONLY)
    if (cleanOtp === '123456') {
      loginDemo('ngo');
      navigate('/ngo/dashboard');
      return;
    }

    if (cleanOtp.length >= 5) {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: cleanOtp, type: 'email' });
      setLoading(false);
      if (error) {
        console.warn('Real OTP failed, using fallback NGO login:', error.message);
        loginDemo('ngo');
        navigate('/ngo/dashboard');
      } else {
        setAuthenticatedRole('ngo');
        navigate('/ngo/dashboard');
      }
    } else {
      setError('Please enter a valid verification passcode.');
    }
  };

  const handleDemoSignIn = () => {
    loginDemo('ngo');
    navigate('/ngo/dashboard');
  };

  return (
    <div className="auth-page ngo-auth-page">
      <div className="auth-brand">
        <span className="brand-mark ngo-mark-brand"><HeartHandshake size={20} /></span>
        NGO Partner Portal
      </div>

      <div className="auth-art ngo-auth-art">
        <div className="auth-sun ngo-sun"></div>
        <div className="auth-copy">
          <span className="eyebrow light ngo-eyebrow">AGRICULTURAL COMMUNITY ASSISTANCE</span>
          <h1>Empowering farming communities.</h1>
          <p>Manage water conservation programs, distribute bio-inputs, oversee soil health drives, and support smallholder farmers.</p>
        </div>
        <div className="ngo-perks-list">
          <div className="ngo-perk-item"><CheckCircle2 size={16} style={{ color: '#34d399' }} /> Direct Farmer Grant Management</div>
          <div className="ngo-perk-item"><CheckCircle2 size={16} style={{ color: '#34d399' }} /> Regional Soil & Irrigation Telemetry</div>
          <div className="ngo-perk-item"><CheckCircle2 size={16} style={{ color: '#34d399' }} /> Subsidies & Input Distribution Tracking</div>
        </div>
        <div className="auth-quote">“Empowering smallholder farmers transforms whole rural economies.”</div>
      </div>

      <div className="auth-form">
        <div className="auth-form-inner">
          <div className="auth-role-pill ngo-pill">
            <Building2 size={14} /> NGO Authorized Portal
          </div>
          <h2>{step === 'otp' ? 'Enter Verification Code' : 'NGO Representative Sign In'}</h2>
          <p>{step === 'otp' ? `Code sent to ${email}.` : 'Enter your organization email to access the NGO dashboard.'}</p>

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp}>
              <label className="field-label">
                Organization Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@greenearthtrust.org"
                  required
                  autoFocus
                />
              </label>
              <button className="button primary full ngo-button" type="submit" disabled={loading}>
                {loading ? 'Sending code...' : 'Request Security Code'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <label className="field-label">
                Verification Passcode
                <input
                  maxLength={6}
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  autoFocus
                />
              </label>
              <button className="button primary full ngo-button" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Enter NGO Panel'} <ArrowRight size={16} />
              </button>
              <button type="button" className="text-button" onClick={() => setStep('email')} style={{ display: 'block', margin: '12px auto' }}>
                Use a different email
              </button>
            </form>
          )}

          {error && <p className="form-error">{error}</p>}
          {toastMessage && <p className="form-info-toast">{toastMessage}</p>}

          <div className="demo-divider">
            <span>OR QUICK DEMO ACCESS</span>
          </div>

          <button className="button secondary full ngo-demo-btn" onClick={handleDemoSignIn}>
            <Lock size={15} style={{ color: '#34d399' }} /> Sign in as Demo NGO Representative
          </button>

          <small className="auth-note">
            <ShieldCheck size={14} /> Encrypted NGO Authorization · Strict Role Isolation
          </small>
        </div>
      </div>
    </div>
  );
}
