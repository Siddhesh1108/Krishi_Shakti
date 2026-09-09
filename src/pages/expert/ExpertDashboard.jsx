import React, { useState, useEffect } from 'react';
import { expertService } from '../../lib/services';
import { useAuthContext } from '../../context/AuthContext';
import {
  Stethoscope, AlertTriangle, CheckCircle2, BookOpen, Clock, ArrowUpRight, Check, X
} from 'lucide-react';

export function ExpertDashboard() {
  const [assignments, setAssignments] = useState([]);
  const { user } = useAuthContext();

  useEffect(() => {
    async function load() {
      if (user?.uid) {
          const data = await expertService.getAssignments(user.uid);
          setAssignments(data);
      }
    }
    load();
  }, [user]);

  const highPriority = 0; // Not tracked in assignments currently
  const pendingCases = assignments.length;

  return (
    <div className="page-content expert-page-content">
      <div className="page-header expert-page-header">
        <div>
          <span className="eyebrow purple-eyebrow">PATHOLOGY & CLINICAL ADVISORY</span>
          <h1>Clinical Case Overview</h1>
          <p>Review AI-detected pathology diagnoses, verify severity scores, and issue certified spray prescriptions.</p>
        </div>
      </div>


      {/* Metrics Grid */}
      <div className="metric-grid expert-metrics-grid">
        <div className="metric-card expert-metric-card">
          <div className="metric-icon purple"><Stethoscope size={20} /></div>
          <span>Assigned Cases</span>
          <div className="metric-value">{assignments.length} <small>cases</small></div>
          <p>Total clinical telemetry logs</p>
        </div>

        <div className="metric-card expert-metric-card">
          <div className="metric-icon coral"><AlertTriangle size={20} /></div>
          <span>High Priority Cases</span>
          <div className="metric-value">{highPriority} <small>urgent</small></div>
          <p>Requires immediate triage</p>
        </div>

        <div className="metric-card expert-metric-card">
          <div className="metric-icon amber"><Clock size={20} /></div>
          <span>Pending Prescriptions</span>
          <div className="metric-value">{pendingCases} <small>pending</small></div>
          <p>Awaiting specialist review</p>
        </div>

        <div className="metric-card expert-metric-card">
          <div className="metric-icon green"><CheckCircle2 size={20} /></div>
          <span>Resolved Diagnostics</span>
          <div className="metric-value">0 <small>resolved</small></div>
          <p>Sent to farmer mobile app</p>
        </div>
      </div>
    </div>
  );
}
