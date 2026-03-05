'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import type { City, PriceTier, Venue } from '@/lib/types';
import { formatDateTimeForInput } from '@/lib/event-utils';
import PriceInfoTooltip from '@/components/shared/PriceInfoTooltip';
import ImageUpload from '@/components/shared/ImageUpload';
import { revalidateEvents } from '@/lib/db';

interface FacebookImportData {
  title?: string;
  description?: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  facebookUrl: string;
}

export default function EventUploadForm() {
  const t = useTranslations('backstage');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceTier, setPriceTier] = useState<PriceTier>(0);
  const [venueId, setVenueId] = useState('');
  const [city, setCity] = useState<City>('TARTU');
  const [imageUrl, setImageUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedFrom, setImportedFrom] = useState(false);

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

        setTitle(event.title);
        setDescription(event.description);
        setPriceTier(event.priceTier);
        setVenueId(event.venueId);
        setCity(event.city);
        setImageUrl(event.imageUrl || '');
        setFacebookUrl(event.facebookUrl || '');

        setStartTime(formatDateTimeForInput(event.startTime));
        setEndTime(formatDateTimeForInput(event.endTime));

        localStorage.removeItem('duplicateEvent');

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

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError(t('authError'));
          setIsLoadingVenues(false);
          return;
        }

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

        const venues = (data?.map((vu: any) => vu.venues).filter(Boolean) ||
          []) as Venue[];

        setUserVenues(venues);

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

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = t('titleRequired');
    if (!description.trim()) errors.description = t('descriptionRequired');
    if (!venueId) errors.venueId = t('venueRequired');
    if (!startTime) errors.startTime = t('startTimeRequired');
    if (!endTime) errors.endTime = t('endTimeRequired');

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end <= start) {
        errors.endTime = t('endTimeAfterStart');
      }
    }

    if (facebookUrl && !isValidUrl(facebookUrl)) {
      errors.facebookUrl = t('invalidUrl');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriceTier(0);
    setImageUrl('');
    setFacebookUrl('');
    setStartTime('');
    setEndTime('');
    setValidationErrors({});
    setImportedFrom(false);
    setImportUrl('');

    if (userVenues.length > 0) {
      setVenueId(userVenues[0].id);
      setCity(userVenues[0].city);
    }
  };

  const handleVenueChange = (newVenueId: string) => {
    setVenueId(newVenueId);

    const selectedVenue = userVenues.find((v) => v.id === newVenueId);
    if (selectedVenue) {
      setCity(selectedVenue.city);
    }
  };

  const handleFacebookImport = async () => {
    const url = importUrl.trim();
    if (!url) return;

    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    try {
      const parsed = new URL(withProtocol);
      const hostname = parsed.hostname.replace('www.', '').replace('m.', '');
      if (!hostname.includes('facebook.com') && hostname !== 'fb.me') {
        setError(t('importInvalidUrl'));
        return;
      }
    } catch {
      setError(t('importInvalidUrl'));
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/import/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('importError'));
        setIsImporting(false);
        return;
      }

      const imported = data as FacebookImportData;

      if (imported.title) setTitle(imported.title);
      if (imported.description) setDescription(imported.description);
      if (imported.imageUrl) setImageUrl(imported.imageUrl);
      if (imported.facebookUrl) setFacebookUrl(imported.facebookUrl);

      if (imported.startTime) {
        try {
          setStartTime(formatDateTimeForInput(imported.startTime));
        } catch {
        }
      }
      if (imported.endTime) {
        try {
          setEndTime(formatDateTimeForInput(imported.endTime));
        } catch {
        }
      }

      setImportedFrom(true);
      setSuccess(t('importSuccess'));
      setImportUrl('');

      setTimeout(() => {
        document.getElementById('event-form')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    } catch (err) {
      setError(t('importError'));
      console.error('Facebook import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

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

      await revalidateEvents();
      setSuccess(t('eventCreated'));
      resetForm();

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
      <div className='flex items-center justify-center py-16'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#E4DD3B]/20 border-t-[#E4DD3B] rounded-full animate-spin mx-auto mb-4' />
          <p className='text-white/40 text-sm'>{t('loadingVenues')}</p>
        </div>
      </div>
    );
  }

  // No venues state
  if (userVenues.length === 0) {
    return (
      <div className='bg-white/2 border border-white/6 p-8 md:p-12'>
        <div className='text-center max-w-sm mx-auto'>
          <div className='mb-5 inline-flex items-center justify-center w-14 h-14 bg-white/4 border border-white/6'>
            <svg className='w-7 h-7 text-white/30' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' />
            </svg>
          </div>

          <h2 className='text-white text-lg font-semibold mb-2'>
            {t('noVenuesTitle')}
          </h2>

          <p className='text-white/40 text-sm'>{t('noVenuesMessage')}</p>
        </div>
      </div>
    );
  }

  // Shared input classes
  const inputClasses = 'w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 focus:outline-none focus:border-[#E4DD3B]/40 focus:ring-1 focus:ring-[#E4DD3B]/20 transition-all duration-200 disabled:opacity-40 text-sm';
  const labelClasses = 'block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider';

  return (
    <div className='max-w-2xl space-y-4'>
      {/* Facebook Import Card */}
      <div className='bg-white/2 border border-white/6 p-5'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-8 h-8 bg-[#1877F2] flex items-center justify-center shrink-0'>
            <svg className='w-4 h-4 text-white' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
            </svg>
          </div>
          <div>
            <h3 className='text-white font-medium text-sm'>
              {t('importFromFacebook')}
            </h3>
            <p className='text-white/30 text-xs'>
              {t('importDescription')}
            </p>
          </div>
        </div>

        <div className='flex gap-2'>
          <input
            type='url'
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            disabled={isImporting}
            className={inputClasses + ' focus:border-[#1877F2]/50 focus:ring-[#1877F2]/20'}
            placeholder={t('fbUrlPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleFacebookImport();
              }
            }}
          />
          <button
            type='button'
            onClick={handleFacebookImport}
            disabled={isImporting || !importUrl.trim()}
            className='px-5 py-3 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0'
          >
            {isImporting ? (
              <>
                <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                {t('importing')}
              </>
            ) : (
              t('importButton')
            )}
          </button>
        </div>

        {!importedFrom && (
          <p className='text-white/25 text-xs mt-3'>
            {t('orCreateManually')}
          </p>
        )}
      </div>

      {/* Event Form Card */}
      <div id='event-form' className='bg-white/2 border border-white/6 p-5 md:p-6'>

        {importedFrom && (
          <div className='mb-5 p-3 bg-[#1877F2]/6 border border-[#1877F2]/20 text-[#6CB4EE] text-sm flex items-center gap-3'>
            <svg className='w-4 h-4 shrink-0' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
            </svg>
            <span className='text-xs'>{t('reviewAndPublish')}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className='mb-5 p-3 bg-red-500/6 border border-red-500/20 text-red-400 text-sm flex items-center gap-3'>
            <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' />
            </svg>
            <span className='text-xs'>{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className='mb-5 p-3 bg-emerald-500/6 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3'>
            <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <span className='text-xs'>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Title */}
          <div>
            <label htmlFor='title' className={labelClasses}>
              {t('eventTitle')} <span className='text-red-400'>*</span>
            </label>
            <input
              id='title'
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
              className={inputClasses}
              placeholder={t('eventTitlePlaceholder')}
            />
            {validationErrors.title && (
              <p className='mt-1.5 text-xs text-red-400'>{validationErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor='description' className={labelClasses}>
              {t('eventDescription')} <span className='text-red-400'>*</span>
            </label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
              rows={4}
              className={inputClasses + ' min-h-30 resize-y'}
              placeholder={t('eventDescriptionPlaceholder')}
            />
            {validationErrors.description && (
              <p className='mt-1.5 text-xs text-red-400'>{validationErrors.description}</p>
            )}
          </div>

          {/* Venue + Price Tier */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='md:col-span-2'>
              <label htmlFor='venue' className={labelClasses}>
                {t('venue')} <span className='text-red-400'>*</span>
              </label>
              <select
                id='venue'
                value={venueId}
                onChange={(e) => handleVenueChange(e.target.value)}
                required
                disabled={isSubmitting}
                className={inputClasses}
              >
                <option value='' className='bg-[#111]'>
                  {t('venueSelect')}
                </option>
                {userVenues.map((venue) => (
                  <option key={venue.id} value={venue.id} className='bg-[#111]'>
                    {venue.name}
                  </option>
                ))}
              </select>
              {validationErrors.venueId && (
                <p className='mt-1.5 text-xs text-red-400'>{validationErrors.venueId}</p>
              )}
            </div>

            <div className='md:col-span-1'>
              <label htmlFor='priceTier' className={labelClasses + ' flex items-center gap-1'}>
                {t('priceTier')} <span className='text-red-400'>*</span>
                <PriceInfoTooltip size={14} />
              </label>
              <select
                id='priceTier'
                value={priceTier}
                onChange={(e) => setPriceTier(Number(e.target.value) as PriceTier)}
                required
                disabled={isSubmitting}
                className={inputClasses}
              >
                <option value={0} className='bg-[#111]'>{t('priceTierFree')}</option>
                <option value={1} className='bg-[#111]'>{t('priceTierLow')}</option>
                <option value={2} className='bg-[#111]'>{t('priceTierMedium')}</option>
                <option value={3} className='bg-[#111]'>{t('priceTierHigh')}</option>
              </select>
            </div>
          </div>

          {/* Start Time + End Time */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='startTime' className={labelClasses}>
                {t('startTime')} <span className='text-red-400'>*</span>
              </label>
              <input
                id='startTime'
                type='datetime-local'
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={isSubmitting}
                className={inputClasses}
              />
              {validationErrors.startTime && (
                <p className='mt-1.5 text-xs text-red-400'>{validationErrors.startTime}</p>
              )}
            </div>

            <div>
              <label htmlFor='endTime' className={labelClasses}>
                {t('endTime')} <span className='text-red-400'>*</span>
              </label>
              <input
                id='endTime'
                type='datetime-local'
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={isSubmitting}
                className={inputClasses}
              />
              {validationErrors.endTime && (
                <p className='mt-1.5 text-xs text-red-400'>{validationErrors.endTime}</p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelClasses}>
              {t('eventImage')}
            </label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              disabled={isSubmitting}
              labels={{
                dropzone: t('imageDropzone'),
                dropzoneHint: t('imageDropzoneHint'),
                uploading: t('imageUploading'),
                removeImage: t('imageRemove'),
                dragActive: t('imageDragActive'),
              }}
            />
          </div>

          {/* Facebook URL */}
          <div>
            <label htmlFor='facebookUrl' className={labelClasses}>
              {t('facebookUrl')}
            </label>
            <input
              id='facebookUrl'
              type='url'
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              disabled={isSubmitting}
              className={inputClasses}
              placeholder={t('facebookUrlPlaceholder')}
            />
            {validationErrors.facebookUrl && (
              <p className='mt-1.5 text-xs text-red-400'>{validationErrors.facebookUrl}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full py-3 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' />
                {t('creatingEvent')}
              </>
            ) : (
              t('createEvent')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}