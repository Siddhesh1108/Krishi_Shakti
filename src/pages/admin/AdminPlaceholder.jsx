import React from 'react';

export function AdminPlaceholder({ title }) {
  return (
    <div className="page-content" style={{ padding: '40px', color: '#f8fafc' }}>
      <h1>{title}</h1>
      <p style={{ color: '#94a3b8' }}>This section is currently under construction and connected to the secure DB layer.</p>
    </div>
  );
}
