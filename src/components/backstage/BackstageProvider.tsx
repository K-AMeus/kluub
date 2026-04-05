'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { createBrowserSupabaseClient } from '@/supabase/client';
import type { Host, Venue } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface BackstageContextValue {
  user: User | null;
  hosts: Host[];
  hostIds: string[];
  venues: Venue[];
  isLoading: boolean;
  error: string | null;
}

const BackstageContext = createContext<BackstageContextValue>({
  user: null,
  hosts: [],
  hostIds: [],
  venues: [],
  isLoading: true,
  error: null,
});

export function useBackstage() {
  return useContext(BackstageContext);
}

export default function BackstageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    async function fetchData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError('auth');
          setIsLoading(false);
          return;
        }

        setUser(user);

        const { data: hostUserData, error: hostError } = await supabase
          .from('host_users')
          .select('host_id, hosts (id, name)')
          .eq('user_id', user.id);

        if (hostError) {
          setError('hosts');
          setIsLoading(false);
          return;
        }

        const hostsList = (hostUserData
          ?.map((hu: any) => hu.hosts as Host | null)
          .filter(Boolean) || []) as Host[];

        setHosts(hostsList);

        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('id, name, city')
          .order('name', { ascending: true });

        if (venuesError) {
          console.error('Error fetching venues:', venuesError);
        } else {
          setVenues((venuesData || []) as Venue[]);
        }
      } catch (err) {
        console.error('BackstageProvider error:', err);
        setError('unexpected');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const hostIds = useMemo(() => hosts.map((h) => h.id), [hosts]);

  const value = useMemo(
    () => ({ user, hosts, hostIds, venues, isLoading, error }),
    [user, hosts, hostIds, venues, isLoading, error]
  );

  return (
    <BackstageContext.Provider value={value}>
      {children}
    </BackstageContext.Provider>
  );
}
