import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/services';
import { Users, Search, UserX } from 'lucide-react';

export function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');


  useEffect(() => {
    async function loadUsers() {
      const data = await adminService.getAllUsers();
      setUsers(data);
    }
    loadUsers();
  }, []);



  const filteredUsers = users.filter(u =>
    (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.mobile && u.mobile.toLowerCase().includes(search.toLowerCase())) ||
    u.role.toLowerCase().includes(search.toLowerCase())
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



      <div className="admin-toolbar">
        <label className="search-box admin-search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role or mobile..."
          />
        </label>
      </div>

      <div className="panel admin-panel">
        <div className="user-table-container">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Database ID</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.full_name || 'No Name Provided'}</strong>
                    <small style={{ display: 'block', color: '#94a3b8', textTransform: 'capitalize' }}>{u.role}</small>
                  </td>
                  <td>{u.mobile || 'N/A'}</td>
                  <td>{u.email || 'N/A'}</td>
                  <td><code style={{background:'#0a120d', color:'#38bdf8', padding: '2px 4px'}}>{u.id.substring(0,8)}</code></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill healthy`}>
                      ACTIVE
                    </span>
                  </td>
                  <td>
                    <button
                      className="button danger-outline-sm"
                    >
                      <UserX size={14} /> Suspend
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
