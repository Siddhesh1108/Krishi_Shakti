import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { expertService } from '../../lib/services';
import { FileText, Search, Clock, Activity, ArrowRight } from 'lucide-react';

export function ExpertRequests() {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const assignments = await expertService.getAssignments(user.id);
        // Map assignments to actual user requests (complex query needed in real life, simplified here)
        setRequests(assignments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadRequests();
  }, [user]);

  if (loading) return <div style={{ padding: 40, color: '#f8fafc' }}>Loading assigned requests...</div>;

  return (
    <div className="page-content expert-page-content">
      <div className="page-header expert-page-header">
        <div>
          <span className="eyebrow purple-eyebrow">PATHOLOGY & REVIEW</span>
          <h1>Assigned Requests</h1>
          <p>Review soil and crop health requests exclusively assigned to your specialist ID.</p>
        </div>
      </div>
      
      <div className="panel expert-panel" style={{ marginTop: '24px', padding: '20px' }}>
         {requests.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
               <FileText size={36} style={{ marginBottom: 16 }} />
               <p>No active requests currently assigned to you.</p>
           </div>
         ) : (
             <div className="table-responsive">
                 <table className="expert-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '12px' }}>
                        <th style={{ padding: '12px' }}>Assignment ID</th>
                        <th style={{ padding: '12px' }}>Farmer Name</th>
                        <th style={{ padding: '12px' }}>Assigned Date</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id} style={{ borderBottom: '1px solid #1e293b', color: '#f8fafc' }}>
                                <td style={{ padding: '12px' }}><code style={{ color: '#a855f7' }}>{req.id.substring(0,8)}</code></td>
                                <td style={{ padding: '12px' }}><strong>{req.profiles?.full_name}</strong></td>
                                <td style={{ padding: '12px', color: '#94a3b8' }}>{new Date(req.assigned_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>
                                    <span className="status-pill purple"><Activity size={12} /> Active Case</span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <button className="button primary-sm" style={{ background: '#7c3aed' }}>
                                        Review <ArrowRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
         )}
      </div>
    </div>
  );
}
