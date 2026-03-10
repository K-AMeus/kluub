'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { createBrowserSupabaseClient } from '@/supabase/client';
import type { Venue } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface BackstageContextValue {
  user: User | null;
  venues: Venue[];
  venueIds: string[];
  isLoading: boolean;
  error: string | null;
}

const BackstageContext = createContext<BackstageContextValue>({
  user: null,
  venues: [],
  venueIds: [],
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

        const { data: venueUserData, error: venueError } = await supabase
          .from('venue_users')
          .select(
            `
            venue_id,
            venues (
              id,
              name,
              city,
              address,
              lat,
              lng
            )
          `
          )
          .eq('user_id', user.id);

        if (venueError) {
          setError('venues');
          setIsLoading(false);
          return;
        }

        const venuesList = (venueUserData
          ?.map((vu: any) => vu.venues)
          .filter(Boolean) || []) as Venue[];

        setVenues(venuesList);
      } catch (err) {
        console.error('BackstageProvider error:', err);
        setError('unexpected');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const venueIds = useMemo(() => venues.map((v) => v.id), [venues]);

  const value = useMemo(
    () => ({ user, venues, venueIds, isLoading, error }),
    [user, venues, venueIds, isLoading, error]
  );

  return (
    <BackstageContext.Provider value={value}>
      {children}
    </BackstageContext.Provider>
  );
}
