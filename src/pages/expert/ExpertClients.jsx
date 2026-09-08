import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { expertService } from '../../lib/services';
import { Users, Phone, Mail } from 'lucide-react';

export function ExpertClients() {
  const { user } = useAuthContext();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const assignments = await expertService.getAssignments(user.id);
        const uniqueClients = [];
        const seen = new Set();
        assignments.forEach(a => {
            if (a.profiles && !seen.has(a.profiles.id)) {
                seen.add(a.profiles.id);
                uniqueClients.push(a.profiles);
            }
        });
        setClients(uniqueClients);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadClients();
  }, [user]);

  if (loading) return <div style={{ padding: 40, color: '#f8fafc' }}>Loading clients...</div>;

  return (
    <div className="page-content expert-page-content">
      <div className="page-header expert-page-header">
        <div>
          <span className="eyebrow purple-eyebrow">CLIENT DIRECTORY</span>
          <h1>Assigned Clients</h1>
          <p>Farmers assigned to your pathology supervision.</p>
        </div>
      </div>
      
      <div className="panel expert-panel" style={{ marginTop: '24px', padding: '20px' }}>
         {clients.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
               <Users size={36} style={{ marginBottom: 16 }} />
               <p>No clients assigned to you yet.</p>
           </div>
         ) : (
             <div className="table-responsive">
                 <table className="expert-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '12px' }}>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px' }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} style={{ borderBottom: '1px solid #1e293b', color: '#f8fafc' }}>
                                <td style={{ padding: '12px' }}><strong>{client.full_name}</strong></td>
                                <td style={{ padding: '12px', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> {client.mobile || 'N/A'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><Mail size={14} /> {client.email || 'N/A'}</div>
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
