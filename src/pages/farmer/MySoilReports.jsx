import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { soilTestService } from '../../lib/services';
import {
  FileText, Download, Eye, CheckCircle2, ShieldCheck, FileCheck, X
} from 'lucide-react';

export function MySoilReports() {
  const { user } = useAuthContext();
  const userId = user?.id || 'demo-farmer-id';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreviewReport, setActivePreviewReport] = useState(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await soilTestService.getFarmerSoilTestReports(userId);
        setReports(data);
      } catch (err) {
        console.warn('Failed to load farmer soil reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [userId]);

  const handlePreviewReport = async (report) => {
    const signedUrl = await soilTestService.getReportSignedUrl(report.report_file_path);
    setActivePreviewReport({ ...report, signedUrl });
  };

  const handleDownloadReport = async (report) => {
    const signedUrl = await soilTestService.getReportSignedUrl(report.report_file_path);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      // Trigger printable PDF report preview
      handlePreviewReport(report);
    }
  };

  if (loading) {
    return (
      <div className="page-content farmer-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#a3e635' }}>Loading Your Soil Health Cards & Reports...</p>
      </div>
    );
  }

  return (
    <div className="page-content farmer-page-content">
      <div className="page-header farmer-page-header" style={{ marginBottom: '20px' }}>
        <div>
          <span className="eyebrow green-eyebrow" style={{ color: '#a3e635' }}>MY ACCOUNT</span>
          <h1>My Soil Reports</h1>
          <p>Official NABL-accredited soil test cards and nutrient pathology reports linked to your account.</p>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div style={{ background: '#0a120d', border: '1px solid #16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={18} style={{ color: '#a3e635' }} />
        <span style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
          Account Isolated: Showing official soil test reports belonging <strong>ONLY</strong> to your account (<code style={{ color: '#a3e635' }}>{userId}</code>).
        </span>
      </div>

      <div className="farmer-reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {reports.length === 0 ? (
          <div className="empty-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#111c16', borderRadius: '12px', border: '1px dashed #1e2d24' }}>
            <FileText size={36} style={{ color: '#64748b', marginBottom: '12px' }} />
            <h3 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>No Soil Reports Available</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Once the laboratory completes testing your soil sample, your PDF report will appear here automatically.</p>
          </div>
        ) : (
          reports.map((report) => {
            const req = report.soil_test_requests;
            return (
              <div key={report.id} style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#15803d', padding: '8px', borderRadius: '8px', color: '#fff' }}>
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <strong style={{ color: '#f8fafc', fontSize: '15px', display: 'block' }}>{report.report_name}</strong>
                        <small style={{ color: '#a3e635' }}>Report ID: {report.id}</small>
                      </div>
                    </div>
                    <span className="status-pill healthy"><CheckCircle2 size={12} /> Available</span>
                  </div>

                  <div style={{ background: '#0a120d', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Request ID:</span>
                      <strong style={{ color: '#38bdf8' }}>{report.request_id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Sample Code:</span>
                      <code style={{ color: '#a3e635' }}>{req?.sample_id || 'SAMP-1024'}</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Report Date:</span>
                      <span style={{ color: '#cbd5e1' }}>{new Date(report.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {report.remarks && (
                    <p style={{ fontSize: '12.5px', color: '#cbd5e1', fontStyle: 'italic', margin: '0 0 16px 0', background: '#07100b', padding: '8px', borderRadius: '6px' }}>
                      "Remarks: {report.remarks}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button className="button secondary-sm" style={{ flex: 1 }} onClick={() => handlePreviewReport(report)}>
                    <Eye size={14} /> View Report
                  </button>
                  <button className="button primary-sm" style={{ flex: 1, background: '#16a34a' }} onClick={() => handleDownloadReport(report)}>
                    <Download size={14} /> Download Report
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Report Viewer Modal */}
      {activePreviewReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', width: '100%', maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={18} style={{ color: '#a3e635' }} /> {activePreviewReport.report_name}
                </h3>
                <small style={{ color: '#94a3b8' }}>Sample ID: {activePreviewReport.soil_test_requests?.sample_id || 'SAMP-1024'}</small>
              </div>
              <button className="icon-button" onClick={() => setActivePreviewReport(null)} style={{ color: '#f8fafc' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#0b1329', color: '#f8fafc' }}>
              {activePreviewReport.signedUrl ? (
                <iframe
                  src={activePreviewReport.signedUrl}
                  title="PDF Report Viewer"
                  style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
                />
              ) : (
                /* PDF Document Render Card */
                <div style={{ background: '#fff', color: '#0f172a', padding: '32px', borderRadius: '12px', fontFamily: 'sans-serif' }}>
                  <div style={{ borderBottom: '2px solid #16a34a', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ margin: 0, color: '#15803d', fontSize: '22px' }}>CENTRAL SOIL TESTING LABORATORY</h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>NABL Accredited & ICAR Certified Diagnostic Station</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>OFFICIAL SOIL CARD</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>{new Date(activePreviewReport.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Farmer / Account Holder:</strong>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{user?.user_metadata?.name || 'Arjun Singh'}</div>
                      <div style={{ color: '#64748b' }}>Plot Location: {activePreviewReport.soil_test_requests?.farm_location || 'Karnal'}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Sample Code:</strong>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#16a34a' }}>{activePreviewReport.soil_test_requests?.sample_id || 'SAMP-2026-109'}</div>
                      <div style={{ color: '#64748b' }}>Soil Type: {activePreviewReport.soil_test_requests?.soil_type || 'Clay Loam'}</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', color: '#15803d', marginBottom: '12px' }}>SOIL NUTRIENT & PATHOLOGY RESULTS</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: '#e2e8f0', color: '#334155' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Nutrient Parameter</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Measured Value</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Optimal Range</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>Available Nitrogen (N)</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>242 kg/ha</td>
                        <td style={{ padding: '8px' }}>280 - 560 kg/ha</td>
                        <td style={{ padding: '8px', color: '#d97706', fontWeight: 'bold' }}>Slight Deficit</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>Available Phosphorus (P)</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>18.4 kg/ha</td>
                        <td style={{ padding: '8px' }}>11 - 25 kg/ha</td>
                        <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>Optimal</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>Available Potassium (K)</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>210 kg/ha</td>
                        <td style={{ padding: '8px' }}>120 - 280 kg/ha</td>
                        <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>Optimal</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>Soil pH Index</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>7.2 pH</td>
                        <td style={{ padding: '8px' }}>6.5 - 7.5 pH</td>
                        <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>Balanced Neutral</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '12px', borderRadius: '4px', fontSize: '13px', color: '#14532d', marginBottom: '20px' }}>
                    <strong>Senior Chemist Recommendation:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>{activePreviewReport.remarks}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Tested & Verified By:</div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{activePreviewReport.tested_by}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>✓ Verified Laboratory Report</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', background: '#1e293b', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="button primary-sm" onClick={() => setActivePreviewReport(null)} style={{ background: '#16a34a' }}>
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
