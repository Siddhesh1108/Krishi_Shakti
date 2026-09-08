import React from 'react';
import { MessageSquare } from 'lucide-react';

export function ExpertChat() {
  return (
    <div className="page-content expert-page-content">
      <div className="page-header expert-page-header">
        <div>
          <span className="eyebrow purple-eyebrow">COMMUNICATION</span>
          <h1>Expert Chat Console</h1>
          <p>Secure communication channel with assigned farmers.</p>
        </div>
      </div>
      
      <div className="panel expert-panel" style={{ marginTop: '24px', padding: '40px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={48} style={{ color: '#a855f7', marginBottom: '16px' }} />
          <h2 style={{ color: '#f8fafc', marginBottom: '8px' }}>Chat Initialization Required</h2>
          <p style={{ color: '#94a3b8', maxWidth: '400px' }}>Select an assigned case from your 'Requests' or 'Clients' directory to initiate a secure encrypted chat session.</p>
      </div>
    </div>
  );
}
