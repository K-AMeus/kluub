'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import type { City, PriceTier, Venue } from '@/lib/types';
import { formatDateTimeForInput } from '@/lib/event-utils';

export default function EventUploadForm() {
  const t = useTranslations('backstage');
  const locale = useLocale();

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceTier, setPriceTier] = useState<PriceTier>(0);
  const [venueId, setVenueId] = useState('');
  const [city, setCity] = useState<City>('TARTU');
  const [imageUrl, setImageUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // UI states
  const [userVenues, setUserVenues] = useState<Venue[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const supabase = createBrowserSupabaseClient();

  // Check for duplicated event data in localStorage
  useEffect(() => {
    const duplicateData = localStorage.getItem('duplicateEvent');
    if (duplicateData) {
      try {
        const event = JSON.parse(duplicateData);

        // Pre-fill form fields
        setTitle(event.title);
        setDescription(event.description);
        setPriceTier(event.priceTier);
        setVenueId(event.venueId);
        setCity(event.city);
        setImageUrl(event.imageUrl || '');
        setFacebookUrl(event.facebookUrl || '');

        // Format dates for datetime-local input
        setStartTime(formatDateTimeForInput(event.startTime));
        setEndTime(formatDateTimeForInput(event.endTime));

        // Clear localStorage after loading
        localStorage.removeItem('duplicateEvent');

        // Show success message
        setSuccess(t('eventDuplicated'));
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error parsing duplicate event data:', err);
      }
    }
  }, [t]);

  // Fetch user's venues on mount
  useEffect(() => {
    const fetchUserVenues = async () => {
      try {
        setIsLoadingVenues(true);

        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError(t('authError'));
          setIsLoadingVenues(false);
          return;
        }

        // Query venue_users table joined with venues
        const { data, error: venueError } = await supabase
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
          setError(t('venueLoadError'));
          setIsLoadingVenues(false);
          return;
        }

        // Transform the data
        const venues = (data
          ?.map((vu: any) => vu.venues)
          .filter(Boolean) || []) as Venue[];

        setUserVenues(venues);

        // Pre-select first venue if available
        if (venues.length > 0) {
          setVenueId(venues[0].id);
          setCity(venues[0].city);
        }
      } catch (err) {
        setError(t('unexpectedError'));
      } finally {
        setIsLoadingVenues(false);
      }
    };

    fetchUserVenues();
  }, [supabase, t]);

  // Validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!title.trim()) errors.title = t('titleRequired');
    if (!description.trim()) errors.description = t('descriptionRequired');
    if (!venueId) errors.venueId = t('venueRequired');
    if (!startTime) errors.startTime = t('startTimeRequired');
    if (!endTime) errors.endTime = t('endTimeRequired');

    // Time validation
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end <= start) {
        errors.endTime = t('endTimeAfterStart');
      }
    }

    // URL validation (if provided)
    if (imageUrl && !isValidUrl(imageUrl)) {
      errors.imageUrl = t('invalidUrl');
    }

    if (facebookUrl && !isValidUrl(facebookUrl)) {
      errors.facebookUrl = t('invalidUrl');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriceTier(0);
    setImageUrl('');
    setFacebookUrl('');
    setStartTime('');
    setEndTime('');
    setValidationErrors({});

    // Reset to first venue if available
    if (userVenues.length > 0) {
      setVenueId(userVenues[0].id);
      setCity(userVenues[0].city);
    }
  };

  // Handle venue change
  const handleVenueChange = (newVenueId: string) => {
    setVenueId(newVenueId);

    // Auto-update city based on selected venue
    const selectedVenue = userVenues.find((v) => v.id === newVenueId);
    if (selectedVenue) {
      setCity(selectedVenue.city);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Validate
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase.from('events').insert({
        title: title.trim(),
        description: description.trim(),
        price_tier: priceTier,
        venue_id: venueId,
        city: city,
        top_pick: false,
        image_url: imageUrl.trim() || null,
        facebook_url: facebookUrl.trim() || null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      });

      if (submitError) {
        setError(t('submitError'));
        console.error('Error creating event:', submitError);
        return;
      }

      // Success!
      setSuccess(t('eventCreated'));

      // Reset form
      resetForm();

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(t('unexpectedError'));
      console.error('Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingVenues) {
    return (
      <div className='w-full max-w-2xl'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <svg
              className='w-8 h-8 animate-spin mx-auto mb-4 text-[#E4DD3B]'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            <p className='text-white/50'>{t('loadingVenues')}</p>
          </div>
        </div>
      </div>
    );
  }

  // No venues state
  if (userVenues.length === 0) {
    return (
      <div className='w-full max-w-2xl'>
        <div className='relative'>
          {/* Glow effect */}
          <div className='absolute -inset-1 bg-linear-to-r from-[#E4DD3B]/10 via-[#E4DD3B]/20 to-[#E4DD3B]/10 rounded-xl blur-xl opacity-50' />

          <div className='relative bg-black/60 backdrop-blur-xl border border-[#E4DD3B]/30 rounded-xl p-8 md:p-12'>
            <div className='text-center max-w-md mx-auto'>
              <div className='mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10'>
                <svg
                  className='w-8 h-8 text-white/40'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>

              <h2 className='font-display text-xl text-white mb-3'>
                {t('noVenuesTitle')}
              </h2>

              <p className='text-white/50 text-sm'>{t('noVenuesMessage')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className='w-full max-w-2xl'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-2'>
          {t('uploadEvent')}
        </h1>
        <p className='text-white/50 text-sm'>{t('uploadEventSubtitle')}</p>
      </div>

      {/* Form Card */}
      <div className='relative'>
        {/* Glow effect */}
        <div className='absolute -inset-1 bg-linear-to-r from-[#E4DD3B]/10 via-[#E4DD3B]/20 to-[#E4DD3B]/10 rounded-xl blur-xl opacity-50' />

        <div className='relative bg-black/60 backdrop-blur-xl border border-[#E4DD3B]/30 rounded-xl p-6 md:p-8'>
          {/* Error message */}
          {error && (
            <div className='mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3'>
              <svg
                className='w-5 h-5 flex-shrink-0 mt-0.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className='mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-start gap-3'>
              <svg
                className='w-5 h-5 flex-shrink-0 mt-0.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Title */}
            <div>
              <label
                htmlFor='title'
                className='block text-white/70 text-sm mb-2'
              >
                {t('eventTitle')} <span className='text-red-400'>*</span>
              </label>
              <input
                id='title'
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
                className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                placeholder={t('eventTitlePlaceholder')}
              />
              {validationErrors.title && (
                <p className='mt-1 text-sm text-red-400'>
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor='description'
                className='block text-white/70 text-sm mb-2'
              >
                {t('eventDescription')} <span className='text-red-400'>*</span>
              </label>
              <textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
                className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50 resize-none'
                placeholder={t('eventDescriptionPlaceholder')}
              />
              {validationErrors.description && (
                <p className='mt-1 text-sm text-red-400'>
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Venue and City (Same Row - 2/3 and 1/3) */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Venue Selector - 2/3 width */}
              <div className='md:col-span-2'>
                <label
                  htmlFor='venue'
                  className='block text-white/70 text-sm mb-2'
                >
                  {t('venue')} <span className='text-red-400'>*</span>
                </label>
                <select
                  id='venue'
                  value={venueId}
                  onChange={(e) => handleVenueChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                >
                  <option value='' className='bg-black'>
                    {t('venueSelect')}
                  </option>
                  {userVenues.map((venue) => (
                    <option key={venue.id} value={venue.id} className='bg-black'>
                      {venue.name}
                    </option>
                  ))}
                </select>
                {validationErrors.venueId && (
                  <p className='mt-1 text-sm text-red-400'>
                    {validationErrors.venueId}
                  </p>
                )}
              </div>

              {/* City (Read-only) - 1/3 width */}
              <div className='md:col-span-1'>
                <label htmlFor='city' className='block text-white/70 text-sm mb-2'>
                  {t('city')}
                </label>
                <input
                  id='city'
                  type='text'
                  value={city}
                  disabled
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 cursor-not-allowed'
                />
              </div>
            </div>

            {/* Price Tier */}
            <div>
              <label
                htmlFor='priceTier'
                className='block text-white/70 text-sm mb-2'
              >
                {t('priceTier')} <span className='text-red-400'>*</span>
              </label>
              <select
                id='priceTier'
                value={priceTier}
                onChange={(e) => setPriceTier(Number(e.target.value) as PriceTier)}
                required
                disabled={isSubmitting}
                className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
              >
                <option value={0} className='bg-black'>
                  {t('priceTierFree')}
                </option>
                <option value={1} className='bg-black'>
                  {t('priceTierLow')}
                </option>
                <option value={2} className='bg-black'>
                  {t('priceTierMedium')}
                </option>
                <option value={3} className='bg-black'>
                  {t('priceTierHigh')}
                </option>
              </select>
            </div>

            {/* Start Time and End Time (Same Row) */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Start Time */}
              <div>
                <label
                  htmlFor='startTime'
                  className='block text-white/70 text-sm mb-2'
                >
                  {t('startTime')} <span className='text-red-400'>*</span>
                </label>
                <input
                  id='startTime'
                  type='datetime-local'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                />
                {validationErrors.startTime && (
                  <p className='mt-1 text-sm text-red-400'>
                    {validationErrors.startTime}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label
                  htmlFor='endTime'
                  className='block text-white/70 text-sm mb-2'
                >
                  {t('endTime')} <span className='text-red-400'>*</span>
                </label>
                <input
                  id='endTime'
                  type='datetime-local'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                />
                {validationErrors.endTime && (
                  <p className='mt-1 text-sm text-red-400'>
                    {validationErrors.endTime}
                  </p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor='imageUrl'
                className='block text-white/70 text-sm mb-2'
              >
                {t('imageUrl')}
              </label>
              <input
                id='imageUrl'
                type='url'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isSubmitting}
                className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                placeholder={t('imageUrlPlaceholder')}
              />
              {validationErrors.imageUrl && (
                <p className='mt-1 text-sm text-red-400'>
                  {validationErrors.imageUrl}
                </p>
              )}
            </div>

            {/* Facebook URL */}
            <div>
              <label
                htmlFor='facebookUrl'
                className='block text-white/70 text-sm mb-2'
              >
                {t('facebookUrl')}
              </label>
              <input
                id='facebookUrl'
                type='url'
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                disabled={isSubmitting}
                className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                placeholder={t('facebookUrlPlaceholder')}
              />
              {validationErrors.facebookUrl && (
                <p className='mt-1 text-sm text-red-400'>
                  {validationErrors.facebookUrl}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full py-3 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <svg
                    className='w-5 h-5 animate-spin'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  {t('creatingEvent')}
                </>
              ) : (
                t('createEvent')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
