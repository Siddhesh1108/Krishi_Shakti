import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useQuery(queryFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('useQuery error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute };
}

export function useRealtime(table, filter, callback, deps = []) {
  useEffect(() => {
    let channel;
    
    const setupRealtime = () => {
      let channelBuilder = supabase.channel(`public:${table}`).on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (filter) {
            // Very basic filtering for now
            const match = Object.keys(filter).every(key => payload.new && payload.new[key] === filter[key]);
            if (match) callback(payload);
          } else {
            callback(payload);
          }
        }
      );
      
      channel = channelBuilder.subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [table, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, session, loading };
}
