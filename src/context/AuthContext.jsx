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
    import('../lib/firebase').then(({ auth }) => {
        import('firebase/auth').then(({ onAuthStateChanged }) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                setLoading(true);
                setUser(firebaseUser);
                if (firebaseUser) {
                    const dbRole = await fetchUserRole(firebaseUser.uid);
                    setRole(dbRole);
                } else {
                    setRole(null);
                }
                setLoading(false);
            });
            return () => unsubscribe();
        });
    }).catch(err => {
        console.error('Failed to initialize Firebase Auth', err);
        setLoading(false);
    });
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      const { auth } = await import('../lib/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
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
