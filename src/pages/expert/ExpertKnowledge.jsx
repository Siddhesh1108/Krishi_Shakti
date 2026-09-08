import React, { useState } from 'react';
import { BookOpen, Search, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export function ExpertKnowledge() {
  const [searchTerm, setSearchTerm] = useState('');

  const articles = [
    {
      id: 1,
      title: 'ICAR Protocol: Late Blight (Phytophthora infestans) Management',
      crop: 'Solanaceous (Potato/Tomato)',
      category: 'Fungal Pathology',
      dosage: 'Mancozeb 75% WP @ 2.0 g/L or Cymoxanil 8% + Mancozeb 64% WP @ 1.5 g/L',
      snippet: 'Foliar application recommended during high humidity (>80%) and temperature range 10-20°C.'
    },
    {
      id: 2,
      title: 'Yellow Vein Mosaic Virus (YVMV) Vectors & Control',
      crop: 'Okra (Bhindi)',
      category: 'Viral Pathology',
      dosage: 'Imidacloprid 17.8% SL @ 0.3 ml/L for whitefly vector control',
      snippet: 'Destroy infected plants immediately to prevent whitefly-mediated vector spread across fields.'
    },
    {
      id: 3,
      title: 'Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)',
      crop: 'Paddy Rice',
      category: 'Bacterial Pathology',
      dosage: 'Streptocycline @ 0.1g/L + Copper Oxychloride 50% WP @ 2.5g/L',
      snippet: 'Drain field water temporarily and avoid high nitrogen fertilizer application during active outbreak.'
    }
  ];

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content expert-page-content">
      <div className="page-header expert-page-header">
        <div>
          <span className="eyebrow purple-eyebrow">ICAR AGRONOMY REPOSITORY</span>
          <h1>Clinical Knowledge Sources</h1>
          <p>Certified pathology manuals, chemical dosage guides, and treatment protocols for certified agronomists.</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, maxWidth: 480, background: '#1e1b4b', padding: '8px 14px', borderRadius: 8, border: '1px solid #4338ca' }}>
          <Search size={18} style={{ color: '#818cf8', marginTop: 2 }} />
          <input
            type="text"
            placeholder="Search crop, pathogen, or chemical treatment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>
      </div>

      <div className="expert-panel" style={{ display: 'grid', gap: 16 }}>
        {filtered.map(item => (
          <div key={item.id} style={{ background: '#13112c', border: '1px solid #312e81', borderRadius: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: '12px', background: '#3730a3', color: '#c7d2fe', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  {item.category}
                </span>
                <h3 style={{ margin: '8px 0 4px', color: '#fff', fontSize: '16px' }}>{item.title}</h3>
                <small style={{ color: '#a5b4fc' }}>Target Crop: <strong>{item.crop}</strong></small>
              </div>
              <FileText size={20} style={{ color: '#818cf8' }} />
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '8px 0' }}>{item.snippet}</p>

            <div style={{ marginTop: 12, padding: 10, background: '#1e1b4b', borderRadius: 6, borderLeft: '3px solid #818cf8' }}>
              <strong style={{ display: 'block', fontSize: '12px', color: '#a5b4fc' }}>RECOMMENDED DOSAGE & TREATMENT:</strong>
              <span style={{ fontSize: '13px', color: '#e0e7ff' }}>{item.dosage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
