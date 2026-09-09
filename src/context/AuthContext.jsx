import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // 'admin' | 'lab' | 'expert' | 'farmer'

  useEffect(() => {
    // No-auth mode: instantly authorize as a dummy user
    setLoading(false);
    
    // Determine role based on URL to keep layouts happy
    const path = window.location.pathname;
    let currentRole = 'farmer';
    if (path.includes('/admin')) currentRole = 'admin';
    if (path.includes('/expert')) currentRole = 'expert';
    if (path.includes('/lab')) currentRole = 'lab';

    setUser({
      uid: 'dummy-user-123',
      email: 'demo@krishishakti.com',
      user_metadata: { name: 'Demo User' }
    });
    setRole(currentRole);
  }, []);

  const logout = async () => {
    // No-auth mode: do nothing or just redirect
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
