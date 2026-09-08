import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { soilTestService } from '../../lib/services';
import {
  FlaskConical, CheckCircle2, ArrowLeft, Send, ShieldCheck, MapPin, Calendar
} from 'lucide-react';

export function SoilTestRequestForm() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const authenticatedUserId = user?.id || 'demo-farmer-id';
  const defaultFarmerName = user?.user_metadata?.name || 'Arjun Singh';

  const [formData, setFormData] = useState({
    sample_id: `SAMP-${Math.floor(1000 + Math.random() * 9000)}`,
    farmer_name: defaultFarmerName,
    farm_location: 'Plot 4, Main Highway Acres',
    village: 'Karnal Village',
    district: 'Karnal',
    state: 'Haryana',
    land_area: '5.0',
    current_crop: 'Wheat (HD-3086)',
    planned_crop: 'Basmati Paddy (Pusa 1121)',
    soil_type: 'Clay Loam',
    collection_date: new Date().toISOString().split('T')[0],
    notes: 'Please conduct full NPK balance testing and salinity checks.'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [createdRequestId, setCreatedRequestId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.farmer_name.trim() || !formData.farm_location.trim() || !formData.land_area) {
      setError('Please fill in all required farm and location details.');
      return;
    }

    setLoading(true);

    try {
      const newRequest = await soilTestService.createSoilTestRequest({
        ...formData,
        user_id: authenticatedUserId
      });

      setCreatedRequestId(newRequest.id);
      setSuccessMsg(`Soil Test Request ${newRequest.id} submitted successfully! Status set to 'Pending'.`);
    } catch (err) {
      console.error('Request submission failed:', err);
      setError('Failed to submit soil test request. Please check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content farmer-page-content">
      <button className="button secondary-sm" onClick={() => navigate('/farmer/dashboard')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to Farmer Dashboard
      </button>

      <div className="page-header farmer-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="eyebrow green-eyebrow" style={{ color: '#a3e635' }}>SOIL DIAGNOSTICS INTAKE</span>
          <h1>Request Soil Test</h1>
          <p>Submit your farm soil sample to an accredited central lab for comprehensive NPK & health analysis.</p>
        </div>
      </div>

      {successMsg ? (
        <div style={{ background: '#111c16', border: '1px solid #16a34a', borderRadius: '14px', padding: '32px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <CheckCircle2 size={48} style={{ color: '#a3e635', marginBottom: '16px' }} />
          <h2 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>Request Submitted Successfully!</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
            Request ID: <strong style={{ color: '#38bdf8' }}>{createdRequestId}</strong> · Status: <span className="status-pill monitor">Pending</span>
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '13.5px', marginBottom: '24px' }}>
            Your request is now visible in your account under <strong>My Soil Tests</strong> and has been routed to the Soil Testing Laboratory portal.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="button primary-sm" onClick={() => navigate('/farmer/soil-tests')} style={{ background: '#16a34a' }}>
              View My Soil Tests
            </button>
            <button className="button secondary-sm" onClick={() => { setSuccessMsg(''); setCreatedRequestId(''); }}>
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '14px', padding: '28px', maxWidth: '800px' }}>
          <form onSubmit={handleSubmit}>
            
            {/* User Security Lock Banner */}
            <div style={{ background: '#0a120d', border: '1px solid #16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} style={{ color: '#a3e635' }} />
              <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
                Bound to Authenticated User ID: <code style={{ color: '#a3e635' }}>{authenticatedUserId}</code>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Soil Sample ID / Sample Code *
                  <input
                    type="text"
                    name="sample_id"
                    value={formData.sample_id}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Farmer / User Name *
                  <input
                    type="text"
                    name="farmer_name"
                    value={formData.farmer_name}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Farm Location Details */}
            <h3 style={{ fontSize: '15px', color: '#a3e635', borderBottom: '1px solid #1e2d24', paddingBottom: '8px', margin: '20px 0 16px 0' }}>
              Farm Location & Plot Information
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                Farm Plot Location / Address *
                <input
                  type="text"
                  name="farm_location"
                  value={formData.farm_location}
                  onChange={handleChange}
                  placeholder="E.g., Plot 4, GT Road Sector 14"
                  required
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Village *
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  District *
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  State *
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Soil & Crop Parameters */}
            <h3 style={{ fontSize: '15px', color: '#a3e635', borderBottom: '1px solid #1e2d24', paddingBottom: '8px', margin: '20px 0 16px 0' }}>
              Agronomic Soil Parameters
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Land Area (Acres) *
                  <input
                    type="number"
                    step="0.1"
                    name="land_area"
                    value={formData.land_area}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Soil Type *
                  <select
                    name="soil_type"
                    value={formData.soil_type}
                    onChange={handleChange}
                    style={{ background: '#0a120d', border: '1px solid #334155', color: '#f8fafc', width: '100%', borderRadius: '6px', padding: '10px' }}
                  >
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black Cotton">Black Cotton</option>
                    <option value="Red Soil">Red Soil</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Sample Collection Date *
                  <input
                    type="date"
                    name="collection_date"
                    value={formData.collection_date}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Crop Currently Grown *
                  <input
                    type="text"
                    name="current_crop"
                    value={formData.current_crop}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Crop Planned Next *
                  <input
                    type="text"
                    name="planned_crop"
                    value={formData.planned_crop}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                Additional Notes / Concerns
                <textarea
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Specify any specific soil deficiencies, salinity concerns, or organic fertilizer advice requested..."
                  style={{ background: '#0a120d', border: '1px solid #334155', color: '#f8fafc', width: '100%', borderRadius: '6px', padding: '10px' }}
                />
              </label>
            </div>

            {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="button secondary-sm" onClick={() => navigate('/farmer/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={loading} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                {loading ? 'Submitting Request...' : 'Submit Soil Test Request'} <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
