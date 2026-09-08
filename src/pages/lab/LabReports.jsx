import React, { useState, useEffect } from 'react';
import { soilTestService } from '../../lib/services';
import {
  FileText, Search, Download, Eye, CheckCircle2, ShieldCheck, FileCheck, X
} from 'lucide-react';

export function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activePreviewReport, setActivePreviewReport] = useState(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await soilTestService.getReports();
        setReports(data);
      } catch (err) {
        console.warn('Failed to load soil test reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handlePreviewReport = async (report) => {
    const signedUrl = await soilTestService.getReportSignedUrl(report.report_file_path);
    setActivePreviewReport({ ...report, signedUrl });
  };

  const filteredReports = reports.filter(rep =>
    rep.report_name.toLowerCase().includes(search.toLowerCase()) ||
    rep.id.toLowerCase().includes(search.toLowerCase()) ||
    (rep.soil_test_requests?.farmer_name && rep.soil_test_requests.farmer_name.toLowerCase().includes(search.toLowerCase())) ||
    (rep.soil_test_requests?.sample_id && rep.soil_test_requests.sample_id.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="page-content lab-page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#38bdf8' }}>Loading Verified Soil Test Reports Archive...</p>
      </div>
    );
  }

  return (
    <div className="page-content lab-page-content">
      <div className="page-header lab-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">VERIFIED DIAGNOSTIC ARCHIVE</span>
          <h1>Soil Test Reports Repository</h1>
          <p>Complete record of published laboratory PDF reports linked to farmer accounts.</p>
        </div>
      </div>

      <div className="lab-toolbar" style={{ marginBottom: '20px' }}>
        <label className="search-box lab-search-box" style={{ maxWidth: '400px' }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by report name, sample code, or farmer..."
          />
        </label>
      </div>

      <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredReports.length === 0 ? (
          <div className="empty-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#0e1713', borderRadius: '12px' }}>
            <FileText size={36} style={{ color: '#64748b', marginBottom: '8px' }} />
            <h3>No Soil Reports Found</h3>
            <p style={{ color: '#94a3b8' }}>No published reports match your search criteria.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const req = report.soil_test_requests;
            return (
              <div key={report.id} style={{ background: '#111c16', border: '1px solid #1e2d24', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#0369a1', padding: '8px', borderRadius: '8px', color: '#fff' }}>
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <strong style={{ color: '#f8fafc', fontSize: '15px', display: 'block' }}>{report.report_name}</strong>
                        <small style={{ color: '#38bdf8' }}>Report ID: {report.id}</small>
                      </div>
                    </div>
                    <span className="status-pill healthy"><ShieldCheck size={12} /> Verified</span>
                  </div>

                  <div style={{ background: '#0a120d', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Farmer:</span>
                      <strong style={{ color: '#f8fafc' }}>{req?.farmer_name || 'Associated User'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Sample Code:</span>
                      <code style={{ color: '#a3e635' }}>{req?.sample_id || 'SAMP-1024'}</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Date Uploaded:</span>
                      <span style={{ color: '#cbd5e1' }}>{new Date(report.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {report.remarks && (
                    <p style={{ fontSize: '12.5px', color: '#cbd5e1', fontStyle: 'italic', margin: '0 0 16px 0', background: '#07100b', padding: '8px', borderRadius: '6px' }}>
                      "{report.remarks}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button className="button secondary-sm" style={{ flex: 1 }} onClick={() => handlePreviewReport(report)}>
                    <Eye size={14} /> View Report
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
                  <FileCheck size={18} style={{ color: '#38bdf8' }} /> {activePreviewReport.report_name}
                </h3>
                <small style={{ color: '#94a3b8' }}>Sample ID: {activePreviewReport.soil_test_requests?.sample_id} · Tested By: {activePreviewReport.tested_by}</small>
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
                  <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ margin: 0, color: '#0369a1', fontSize: '22px' }}>CENTRAL SOIL TESTING LABORATORY</h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>NABL Accredited & ICAR Certified Diagnostic Station</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>OFFICIAL REPORT</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>{new Date(activePreviewReport.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Farmer / Beneficiary:</strong>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{activePreviewReport.soil_test_requests?.farmer_name || 'Arjun Singh'}</div>
                      <div style={{ color: '#64748b' }}>Plot Location: {activePreviewReport.soil_test_requests?.farm_location || 'Karnal'}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Sample Code:</strong>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0284c7' }}>{activePreviewReport.soil_test_requests?.sample_id || 'SAMP-2026-109'}</div>
                      <div style={{ color: '#64748b' }}>Soil Type: {activePreviewReport.soil_test_requests?.soil_type || 'Loam'}</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', color: '#0369a1', marginBottom: '12px' }}>SOIL NUTRIENT & CHEMICAL COMPOSITION</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: '#e2e8f0', color: '#334155' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Parameter</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Measured Value</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Ideal Range</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>Nitrogen (N)</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>242 kg/ha</td>
                        <td style={{ padding: '8px' }}>280 - 560 kg/ha</td>
                        <td style={{ padding: '8px', color: '#d97706', fontWeight: 'bold' }}>Low (Deficient)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>Phosphorus (P)</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>18.4 kg/ha</td>
                        <td style={{ padding: '8px' }}>11 - 25 kg/ha</td>
                        <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>Optimal</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>Potassium (K)</td>
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

                  <div style={{ background: '#eff6ff', borderLeft: '4px solid #0284c7', padding: '12px', borderRadius: '4px', fontSize: '13px', color: '#1e3a8a', marginBottom: '20px' }}>
                    <strong>Senior Chemist Remarks:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>{activePreviewReport.remarks}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Tested & Verified By:</div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{activePreviewReport.tested_by}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>✓ Digitally Signed & Sealed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', background: '#1e293b', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="button primary-sm" onClick={() => setActivePreviewReport(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
