'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
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

    let cancelled = false;

    async function fetchData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !user) {
          setError('auth');
          setIsLoading(false);
          return;
        }

        setUser(user);

        const [hostUsersResult, venuesResult] = await Promise.all([
          supabase
            .from('host_users')
            .select('host_id, hosts (id, name)')
            .eq('user_id', user.id),
          supabase
            .from('venues')
            .select('id, name, city')
            .order('name', { ascending: true }),
        ]);

        if (cancelled) return;

        if (hostUsersResult.error) {
          setError('hosts');
          setIsLoading(false);
          return;
        }

        type HostUserRow = { host_id: string; hosts: Host | Host[] | null };
        const hostsList: Host[] = ((hostUsersResult.data ?? []) as HostUserRow[])
          .flatMap((hu) =>
            Array.isArray(hu.hosts) ? hu.hosts : hu.hosts ? [hu.hosts] : [],
          )
          .filter((h): h is Host => Boolean(h));

        setHosts(hostsList);

        if (venuesResult.error) {
          console.error('Error fetching venues:', venuesResult.error);
        } else {
          setVenues((venuesResult.data || []) as Venue[]);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('BackstageProvider error:', err);
        setError('unexpected');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const hostIds = useMemo(() => hosts.map((h) => h.id), [hosts]);

  const value = useMemo(
    () => ({ user, hosts, hostIds, venues, isLoading, error }),
    [user, hosts, hostIds, venues, isLoading, error],
  );

  return (
    <BackstageContext.Provider value={value}>
      {children}
    </BackstageContext.Provider>
  );
}
