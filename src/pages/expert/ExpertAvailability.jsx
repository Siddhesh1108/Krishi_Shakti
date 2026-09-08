import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export function ExpertAvailability() {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', time: '09:00 AM - 05:00 PM', status: 'Active Duty', slots: 12 },
    { day: 'Tuesday', time: '09:00 AM - 05:00 PM', status: 'Active Duty', slots: 15 },
    { day: 'Wednesday', time: '09:00 AM - 01:00 PM', status: 'Field Inspection', slots: 6 },
    { day: 'Thursday', time: '09:00 AM - 05:00 PM', status: 'Active Duty', slots: 14 },
    { day: 'Friday', time: '09:00 AM - 05:00 PM', status: 'Active Duty', slots: 10 },
  ]);

  const [toast, setToast] = useState('');

  const toggleStatus = (index) => {
    const updated = [...schedule];
    updated[index].status = updated[index].status === 'Active Duty' ? 'Off Duty' : 'Active Duty';
    setSchedule(updated);
    setToast(`Updated availability for ${updated[index].day}`);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="page-content expert-page-content">
      <div className="page-header expert-page-header">
        <div>
          <span className="eyebrow purple-eyebrow">DUTY ROSTER & TRIAGE HOURS</span>
          <h1>Availability Calendar</h1>
          <p>Manage your Tele-pathology consultation hours, field triage slots, and ICAR duty availability.</p>
        </div>
      </div>

      {toast && <div className="toast-success-banner purple-toast">{toast}</div>}

      <div className="expert-panel" style={{ background: '#13112c', border: '1px solid #312e81', borderRadius: 10, padding: 20 }}>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: 16 }}>Weekly Clinical Schedule</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {schedule.map((slot, idx) => (
            <div
              key={slot.day}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#1e1b4b',
                borderRadius: 8,
                border: '1px solid #3730a3'
              }}
            >
              <div>
                <strong style={{ color: '#fff', fontSize: '15px' }}>{slot.day}</strong>
                <small style={{ display: 'block', color: '#a5b4fc', marginTop: 2 }}>
                  <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {slot.time}
                </small>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontWeight: 600,
                    background: slot.status === 'Active Duty' ? '#065f46' : slot.status === 'Field Inspection' ? '#1e3a8a' : '#881337',
                    color: slot.status === 'Active Duty' ? '#6ee7b7' : slot.status === 'Field Inspection' ? '#93c5fd' : '#fda4af'
                  }}
                >
                  {slot.status}
                </span>

                <button
                  className="button secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => toggleStatus(idx)}
                >
                  Toggle Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
