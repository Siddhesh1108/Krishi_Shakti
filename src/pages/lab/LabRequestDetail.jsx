import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { soilTestService } from '../../lib/services';
import {
  ArrowLeft, User, MapPin, FlaskConical, Calendar, FileText, CheckCircle2,
  Clock, Activity, TrendingUp, UploadCloud, FileCheck, AlertCircle, X, ShieldCheck
} from 'lucide-react';

export function LabRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [testedBy, setTestedBy] = useState('Dr. Ramesh Sharma (Senior Soil Chemist)');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRequestDetails() {
      try {
        const reqData = await soilTestService.getSoilTestRequestById(id);
        setRequest(reqData);
        
        const allReports = await soilTestService.getLabSoilTestReports();
        const reqReports = allReports.filter(r => r.request_id === id);
        setReports(reqReports);
      } catch (err) {
        console.warn('Failed to load request details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequestDetails();
  }, [id]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await soilTestService.updateSoilTestRequestStatus(id, newStatus);
      setRequest(updated);
      notify(`Status updated to '${newStatus}'.`);
    } catch (_err) {
      setError('Failed to update status.');
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    setError('');

    if (pdfFile && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file (.pdf).');
      return;
    }

    setUploading(true);

    try {
      const newReport = await soilTestService.uploadSoilTestReport(pdfFile, {
        requestId: id,
        userId: request.user_id,
        labId: 'demo-lab-id',
        remarks: remarks || 'Detailed soil NPK & pH analysis completed.',
        testedBy
      });

      setReports([newReport, ...reports]);
      setRequest({ ...request, status: 'Completed' });
      setShowUploadModal(false);
      setPdfFile(null);
      setRemarks('');
      notify('Soil Test Report uploaded successfully and linked to farmer account!');
    } catch (err) {
      console.error('Report upload failed:', err);
      setError('Failed to upload report. Please check file size or network connection.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content lab-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#38bdf8' }}>Loading Soil Diagnostic File...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="page-content lab-page-content">
        <button className="button secondary-sm" onClick={() => navigate('/lab/requests')} style={{ marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Requests
        </button>
        <div style={{ padding: '30px', background: '#111c16', borderRadius: '12px' }}>
          <h2>Request Not Found</h2>
          <p style={{ color: '#94a3b8' }}>The requested soil sample record does not exist or has been archived.</p>
        </div>
      </div>
    );
  }

  // Timeline Step Status Evaluator
  const statusSteps = [
    { label: 'Request Submitted', key: 'Pending', done: true },
    { label: 'Sample Received', key: 'Sample Received', done: ['Sample Received', 'Testing', 'Report Ready', 'Completed'].includes(request.status) },
    { label: 'Testing Started', key: 'Testing', done: ['Testing', 'Report Ready', 'Completed'].includes(request.status) },
    { label: 'Testing Completed', key: 'Testing Completed', done: ['Report Ready', 'Completed'].includes(request.status) || reports.length > 0 },
    { label: 'Report Uploaded', key: 'Report Ready', done: reports.length > 0 },
    { label: 'Report Delivered', key: 'Completed', done: request.status === 'Completed' || reports.length > 0 }
  ];

  return (
    <div className="page-content lab-page-content">
      <button className="button secondary-sm" onClick={() => navigate('/lab/requests')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to Soil Test Requests
      </button>

      {toast && <div className="toast-success-banner blue-toast"><CheckCircle2 size={16} /> {toast}</div>}

      {/* Request Header */}
      <div className="page-header lab-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="eyebrow blue-eyebrow">SOIL SAMPLE DOSSIER</span>
            <code style={{ background: '#0f172a', padding: '3px 8px', borderRadius: '4px', color: '#a3e635', fontSize: '13px' }}>
              Sample Code: {request.sample_id}
            </code>
          </div>
          <h1>{request.farmer_name}'s Soil Analysis Dossier</h1>
          <p>Request ID: <strong>{request.id}</strong> · Collection Date: {request.collection_date}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="button primary lab-button" onClick={() => setShowUploadModal(true)}>
            <UploadCloud size={16} /> Upload Soil Test Report (PDF)
          </button>
        </div>
      </div>

      {/* Visual Workflow Timeline */}
      <section className="panel lab-panel" style={{ marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: '#38bdf8' }} /> Diagnostic Status Timeline
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {statusSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: step.done ? '#064e3b' : '#0f172a',
                border: step.done ? '1px solid #10b981' : '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                color: step.done ? '#6ee7b7' : '#64748b'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{step.done ? '✓' : idx + 1}</div>
              <strong style={{ fontSize: '12px', display: 'block', color: step.done ? '#f8fafc' : '#94a3b8' }}>{step.label}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Grid: Details & Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Farmer & Location Card */}
        <div className="panel lab-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: '#38bdf8' }} /> Farmer Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Farmer Name</span>
              <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{request.farmer_name}</strong>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Authenticated User ID</span>
              <code style={{ background: '#0a120d', padding: '4px 8px', borderRadius: '4px', color: '#38bdf8', fontSize: '12px' }}>
                {request.user_id}
              </code>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Farm Location / Address</span>
              <strong style={{ color: '#f8fafc' }}>{request.farm_location}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#0a120d', padding: '10px', borderRadius: '6px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Village</span>
                <strong style={{ color: '#f8fafc' }}>{request.village}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>District</span>
                <strong style={{ color: '#f8fafc' }}>{request.district}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>State</span>
                <strong style={{ color: '#f8fafc' }}>{request.state}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Soil & Agronomic Parameters Card */}
        <div className="panel lab-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlaskConical size={18} style={{ color: '#a3e635' }} /> Agronomic & Soil Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Total Land Area</span>
                <strong style={{ color: '#a3e635', fontSize: '15px' }}>{request.land_area} Acres</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Soil Type</span>
                <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{request.soil_type}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Current Crop</span>
                <strong style={{ color: '#f8fafc' }}>{request.current_crop}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Planned Next Crop</span>
                <strong style={{ color: '#f8fafc' }}>{request.planned_crop}</strong>
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Farmer's Additional Notes</span>
              <p style={{ margin: '4px 0 0 0', background: '#0a120d', padding: '10px', borderRadius: '6px', color: '#cbd5e1', fontStyle: 'italic', fontSize: '13px' }}>
                {request.notes || 'No additional notes provided by farmer.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Actions & Uploaded Reports Section */}
      <section className="panel lab-panel" style={{ marginTop: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span className="eyebrow blue-eyebrow">LABORATORY DELIVERABLES</span>
            <h2 style={{ margin: 0 }}>Uploaded PDF Soil Reports ({reports.length})</h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {request.status !== 'Completed' && (
              <>
                <button className="button secondary-sm" onClick={() => handleStatusChange('Sample Received')}>
                  Set: Sample Received
                </button>
                <button className="button secondary-sm" onClick={() => handleStatusChange('Testing')}>
                  Set: Testing
                </button>
              </>
            )}
            <button className="button primary-sm" onClick={() => setShowUploadModal(true)}>
              <UploadCloud size={14} /> Upload Report
            </button>
          </div>
        </div>

        {reports.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#0a120d', borderRadius: '8px', border: '1px dashed #334155' }}>
            <FileText size={32} style={{ color: '#64748b', marginBottom: '8px' }} />
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>No report uploaded yet for this request.</p>
            <button className="button primary-sm" onClick={() => setShowUploadModal(true)} style={{ marginTop: '12px' }}>
              Upload Soil Test Report Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((rep) => (
              <div key={rep.id} style={{ background: '#0a120d', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCheck size={18} style={{ color: '#38bdf8' }} />
                    <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{rep.report_name}</strong>
                    <span className="status-pill healthy"><ShieldCheck size={12} /> Verified Report</span>
                  </div>
                  <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                    Tested By: <strong>{rep.tested_by}</strong> · Uploaded: {new Date(rep.uploaded_at).toLocaleString()}
                  </p>
                  {rep.remarks && (
                    <p style={{ margin: '6px 0 0 0', color: '#cbd5e1', fontSize: '12.5px' }}>
                      Remarks: {rep.remarks}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upload Report Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={20} style={{ color: '#38bdf8' }} /> Upload Soil Test PDF Report
              </h3>
              <button className="icon-button" onClick={() => setShowUploadModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadReport}>
              <div style={{ marginBottom: '14px' }}>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Target Soil Request & Sample
                  <input
                    readOnly
                    value={`${request.id} (${request.sample_id}) - ${request.farmer_name}`}
                    style={{ background: '#0a120d', border: '1px solid #1e293b', color: '#94a3b8', cursor: 'not-allowed' }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Select PDF Report File (.pdf)
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    required
                    style={{ background: '#0a120d', border: '1px solid #334155', color: '#f8fafc', padding: '8px' }}
                  />
                </label>
                <small style={{ color: '#64748b', fontSize: '11px' }}>PDF will be securely uploaded to Supabase Storage bucket `soil-test-reports`.</small>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Tested By / Senior Chemist
                  <input
                    type="text"
                    value={testedBy}
                    onChange={(e) => setTestedBy(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Laboratory Remarks & Soil NPK Summary
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="E.g., Soil Nitrogen is optimal (240 kg/ha). Recommended 15kg Organic Zinc Sulphate per acre..."
                    style={{ background: '#0a120d', border: '1px solid #334155', color: '#f8fafc', width: '100%', borderRadius: '6px', padding: '10px' }}
                  />
                </label>
              </div>

              {error && <p className="form-error" style={{ marginBottom: '12px' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="button secondary-sm" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button primary-sm" disabled={uploading}>
                  {uploading ? 'Uploading PDF...' : 'Publish & Deliver Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
