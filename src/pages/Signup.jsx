import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Sprout, User, Lock, Mail, Phone, ChevronRight } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'farmer', // default role
    labName: '' // only for lab role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim() || !formData.fullName.trim()) return;
    if (formData.role === 'lab' && !formData.labName.trim()) {
      setError('Lab Name is required for Lab registration.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { roomdbAuth } = await import('../lib/roomdbAuth');
      
      const { user: bridgeUser } = await roomdbAuth.signup(formData.email.trim(), formData.password.trim());
      
      // Create profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: bridgeUser.uid,
          email: formData.email.trim(),
          role: formData.role,
          full_name: formData.fullName.trim(),
          mobile: formData.phone.trim() || null
        }]);
        
      if (profileError) throw profileError;

      // If lab, create lab profile
      if (formData.role === 'lab') {
         const { error: labError } = await supabase
          .from('labs')
          .insert([{
            id: bridgeUser.uid,
            lab_name: formData.labName.trim(),
            active: true
          }]);
          
         if (labError) throw labError;
      }
      
      // Redirect based on role
      if (formData.role === 'lab') {
        navigate('/lab/dashboard');
      } else if (formData.role === 'expert') {
        navigate('/expert/dashboard');
      } else {
        // Farmer app typically might redirect somewhere else or to a farmer dashboard
        // Since we don't have a farmer portal mapped, just go to root for now
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-mark"><Sprout size={20} /></span>
        KrishiShakti
      </div>

      <div className="auth-art">
        <div className="auth-sun"></div>
        <div className="auth-copy">
          <span className="eyebrow light">JOIN THE NETWORK</span>
          <h1>Empowering Modern Agriculture.</h1>
          <p>Create an account to access tailored services. Whether you're a farmer seeking guidance, a lab providing tests, or an expert offering solutions, you're in the right place.</p>
        </div>
      </div>

      <div className="auth-form">
        <div className="auth-form-inner">
          <h2>Create an Account</h2>
          <p>Fill in the details below to register.</p>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <label className="field-label">
              Select Role
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="farmer">Farmer</option>
                <option value="lab">Soil Testing Lab</option>
                <option value="expert">Agronomy Expert</option>
              </select>
            </label>

            <label className="field-label">
              Full Name
              <div className="input-with-icon">
                <User size={16} />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
              </div>
            </label>
            
            {formData.role === 'lab' && (
              <label className="field-label">
                Lab Name
                <div className="input-with-icon">
                  <User size={16} />
                  <input type="text" name="labName" value={formData.labName} onChange={handleChange} placeholder="Green Earth Labs" required />
                </div>
              </label>
            )}

            <label className="field-label">
              Email Address
              <div className="input-with-icon">
                <Mail size={16} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
            </label>

            <label className="field-label">
              Mobile Number (Optional)
              <div className="input-with-icon">
                <Phone size={16} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
              </div>
            </label>

            <label className="field-label">
              Password
              <div className="input-with-icon">
                <Lock size={16} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </label>
            
            <button className="button primary full" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Creating Account...' : 'Sign Up'} <ChevronRight size={16} />
            </button>
          </form>

          {error && <p className="form-error" style={{ marginTop: '16px', color: '#ef4444', fontSize: '14px' }}>{error}</p>}

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            Already have an account? <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 500, textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
