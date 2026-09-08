import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // 'lab' | 'admin' | 'expert' | 'farmer'

  const getDemoUser = (targetRole) => {
    switch (targetRole) {
      case 'lab':
        return {
          id: 'demo-lab-id',
          email: 'lab@krishidrishti.ag',
          user_metadata: {
            name: 'Central Soil Testing Laboratory',
            role: 'lab',
            organization: 'National Soil Research Lab'
          }
        };
      case 'admin':
        return {
          id: 'demo-admin-id',
          email: 'admin@krishidrishti.ag',
          user_metadata: {
            name: 'System Administrator',
            role: 'admin',
            organization: 'KrishiDrishti Admin Ops'
          }
        };
      case 'expert':
        return {
          id: 'demo-expert-id',
          email: 'expert.pathologist@krishidrishti.ag',
          user_metadata: {
            name: 'Dr. Ananya Rao',
            role: 'expert',
            organization: 'ICAR Plant Pathology Specialist'
          }
        };
      default:
        return {
          id: 'demo-farmer-id',
          email: 'arjun@krishidrishti.ag',
          user_metadata: {
            name: 'Arjun Singh',
            role: 'farmer',
            organization: 'Karnal Farm Plot 4'
          }
        };
    }
  };

  const determineRole = (currentUser) => {
    const storedRole = sessionStorage.getItem('user_role');
    if (storedRole && ['lab', 'admin', 'expert', 'farmer'].includes(storedRole)) {
      return storedRole;
    }
    if (currentUser?.user_metadata?.role && ['lab', 'admin', 'expert', 'farmer'].includes(currentUser.user_metadata.role)) {
      return currentUser.user_metadata.role;
    }
    if (currentUser?.app_metadata?.role && ['lab', 'admin', 'expert', 'farmer'].includes(currentUser.app_metadata.role)) {
      return currentUser.app_metadata.role;
    }
    if (sessionStorage.getItem('demo_mode') === 'true') {
      const demoRole = sessionStorage.getItem('demo_role');
      if (demoRole && ['lab', 'admin', 'expert', 'farmer'].includes(demoRole)) {
        return demoRole;
      }
    }
    return null; // Strict security: Missing/invalid role returns null, never defaults to farmer
  };

  useEffect(() => {
    if (sessionStorage.getItem('demo_mode') === 'true') {
      const activeRole = sessionStorage.getItem('demo_role');
      if (activeRole && ['lab', 'admin', 'expert', 'farmer'].includes(activeRole)) {
        const demoUser = getDemoUser(activeRole);
        setUser(demoUser);
        setSession({ user: demoUser });
        setRole(activeRole);
        setLoading(false);
        return;
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setRole(determineRole(session.user));
      } else {
        setRole(null);
      }
      setLoading(false);
    }).catch(err => {
      console.warn('Supabase getSession failed, resetting auth state:', err);
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setRole(determineRole(session.user));
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loginDemo = (targetRole = 'farmer') => {
    sessionStorage.setItem('demo_mode', 'true');
    sessionStorage.setItem('demo_role', targetRole);
    sessionStorage.setItem('user_role', targetRole);
    
    const demoUser = getDemoUser(targetRole);
    setUser(demoUser);
    setSession({ user: demoUser });
    setRole(targetRole);
  };

  const setAuthenticatedRole = (targetRole) => {
    sessionStorage.setItem('user_role', targetRole);
    setRole(targetRole);
  };

  const logout = async () => {
    sessionStorage.removeItem('demo_mode');
    sessionStorage.removeItem('demo_role');
    sessionStorage.removeItem('user_role');
    setUser(null);
    setSession(null);
    setRole(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        loginDemo,
        setAuthenticatedRole,
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
