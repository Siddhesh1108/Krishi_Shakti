import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // 'admin' | 'lab' | 'expert' | 'farmer'

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error || !data) return null;
      return data.role;
    } catch (e) {
      console.error('Failed to fetch user role:', e);
      return null;
    }
  };

  useEffect(() => {
    import('../lib/roomdbAuth').then(({ roomdbAuth }) => {
        const unsubscribe = roomdbAuth.onAuthStateChanged(async (bridgeUser) => {
            setLoading(true);
            setUser(bridgeUser);
            if (bridgeUser) {
                const dbRole = await fetchUserRole(bridgeUser.uid);
                setRole(dbRole);
            } else {
                setRole(null);
            }
            setLoading(false);
        });
        // cleanup would normally go here, simplified for mock
        // return () => unsubscribe();
    }).catch(err => {
        console.error('Failed to initialize Bridge Auth', err);
        setLoading(false);
    });
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      const { roomdbAuth } = await import('../lib/roomdbAuth');
      await roomdbAuth.logout();
      setUser(null); // manually clear since we don't have realtime listener from android yet
      setRole(null);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setLoading(false);
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
