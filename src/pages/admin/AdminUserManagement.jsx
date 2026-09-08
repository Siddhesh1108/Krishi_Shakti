import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/services';
import { Users, Search, ShieldAlert, CheckCircle2, UserX, UserCheck, Check } from 'lucide-react';

export function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const data = await adminService.getAllUsers();
      setUsers(data);
    }
    loadUsers();
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        notify(`User ${u.name} status updated to ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.district.toLowerCase().includes(search.toLowerCase()) ||
    u.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content admin-page-content">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">USER DIRECTORY</span>
          <h1>Farmers & User Management</h1>
          <p>National farmer registry, acreage telemetry distribution, and user account status controls.</p>
        </div>
      </div>

      {toast && <div className="toast-success-banner blue-toast"><Check size={16} /> {toast}</div>}

      <div className="admin-toolbar">
        <label className="search-box admin-search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by farmer name, district, or state..."
          />
        </label>
      </div>

      <div className="panel admin-panel">
        <div className="user-table-container">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Farmer Name</th>
                <th>Phone Number</th>
                <th>District / State</th>
                <th>Farms Tracked</th>
                <th>Total Acreage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <small style={{ display: 'block', color: '#94a3b8' }}>{u.role}</small>
                  </td>
                  <td>{u.phone}</td>
                  <td>{u.district}, {u.state}</td>
                  <td>{u.farmsCount} plots</td>
                  <td>{u.acreage} acres</td>
                  <td>
                    <span className={`status-pill ${u.status === 'ACTIVE' ? 'healthy' : 'coral'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`button ${u.status === 'ACTIVE' ? 'danger-outline-sm' : 'success-sm'}`}
                      onClick={() => toggleStatus(u.id)}
                    >
                      {u.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
