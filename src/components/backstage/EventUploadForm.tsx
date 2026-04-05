'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import { useBackstage } from '@/components/backstage/BackstageProvider';
import type { City } from '@/lib/types';
import { formatTime } from '@/lib/date-utils';
import { formatDateTimeForInput } from '@/lib/event-utils';
import { DEFAULT_EVENT_IMAGE } from '@/lib/constants';
import { LocationIcon, CalendarIcon, TicketIcon } from '@/components/shared/icons';
import ImageUpload from '@/components/shared/ImageUpload';
import DateTimePicker from '@/components/backstage/DateTimePicker';
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
  const { hosts, venues: allVenues, isLoading: contextLoading } = useBackstage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [hostId, setHostId] = useState('');
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const cityVenues = allVenues.filter((v) => v.city === city);

  useEffect(() => {
    if (!contextLoading && hosts.length > 0 && !hostId) {
      setHostId(hosts[0].id);
    }
  }, [contextLoading, hosts, hostId]);

  useEffect(() => {
    if (!contextLoading && cityVenues.length > 0 && !venueId) {
      setVenueId(cityVenues[0].id);
    }
  }, [contextLoading, cityVenues, venueId]);

  // Check for duplicated event data in localStorage
  useEffect(() => {
    const duplicateData = localStorage.getItem('duplicateEvent');
    if (duplicateData) {
      try {
        const event = JSON.parse(duplicateData);

        setTitle(event.title);
        setDescription(event.description);
        if (event.price === '0') {
          setIsFree(true);
          setPrice('');
        } else {
          setIsFree(false);
          setPrice(event.price || '');
        }
        setHostId(event.hostId || '');
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
    if (!isFree && !price.trim()) errors.price = t('priceRequired');
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
    setIsFree(true);
    setPrice('');
    setImageUrl('');
    setFacebookUrl('');
    setStartTime('');
    setEndTime('');
    setValidationErrors({});
    setImportedFrom(false);
    setImportUrl('');

    if (cityVenues.length > 0) {
      setVenueId(cityVenues[0].id);
    }
  };

  const handleVenueChange = (newVenueId: string) => {
    setVenueId(newVenueId);
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
      const supabase = createBrowserSupabaseClient();
      const { error: submitError } = await supabase.from('events').insert({
        title: title.trim(),
        description: description.trim(),
        price: isFree ? '0' : price.trim(),
        host_id: hostId,
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
  if (contextLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#E4DD3B]/20 border-t-[#E4DD3B] rounded-full animate-spin mx-auto mb-4' />
          <p className='text-white/40 text-sm'>{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  // No hosts state
  if (hosts.length === 0) {
    return (
      <div className='bg-white/2 border border-white/6 p-8 md:p-12'>
        <div className='text-center max-w-sm mx-auto'>
          <div className='mb-5 inline-flex items-center justify-center w-14 h-14 bg-white/4 border border-white/6'>
            <svg className='w-7 h-7 text-white/30' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' />
            </svg>
          </div>

          <h2 className='text-white text-lg font-semibold mb-2'>
            {t('noHostsTitle')}
          </h2>

          <p className='text-white/40 text-sm'>{t('noHostsMessage')}</p>
        </div>
      </div>
    );
  }

  // Shared input classes
  const inputClasses = 'w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 focus:outline-none focus:border-[#E4DD3B]/40 focus:ring-1 focus:ring-[#E4DD3B]/20 transition-all duration-200 disabled:opacity-40 text-sm';
  const labelClasses = 'block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider';

  const previewVenue = allVenues.find((v) => v.id === venueId);
  const previewImage = imageUrl || DEFAULT_EVENT_IMAGE;
  const previewPrice = isFree ? t('priceFree') : (price || t('price'));

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[1fr_375px] gap-6 items-start'>

      {/* Left column: all form fields */}
      <div className='space-y-4'>

        {/* Facebook Import Card */}
        <div className='bg-white/2 border border-white/6 p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-[#1877F2] flex items-center justify-center shrink-0'>
              <svg className='w-4 h-4 text-white' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
              </svg>
            </div>
            <div>
              <h3 className='text-white font-medium text-sm'>{t('importFromFacebook')}</h3>
              <p className='text-white/30 text-xs'>{t('importDescription')}</p>
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
              className='px-5 py-3 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-sm font-medium transition-all duration-75 hover:duration-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0'
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
            <p className='text-white/25 text-xs mt-3'>{t('orCreateManually')}</p>
          )}
        </div>

        {/* Event Form Card */}
        <div id='event-form' className='bg-white/2 border border-white/6 p-5 md:p-6'>

          {importedFrom && (
            <div className='mb-5 p-3 bg-[#1877F2]/6 border border-[#1877F2]/20 text-[#6CB4EE] text-sm flex items-center gap-3'>
              <svg className='w-4 h-4 shrink-0' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
              </svg>
              <span className='text-xs flex-1'>{t('reviewAndPublish')}</span>
              <svg className='w-6 h-6 shrink-0 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75' />
              </svg>
            </div>
          )}

          {error && (
            <div className='mb-5 p-3 bg-red-500/6 border border-red-500/20 text-red-400 text-sm flex items-center gap-3'>
              <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' />
              </svg>
              <span className='text-xs'>{error}</span>
            </div>
          )}

          {success && !importedFrom && (
            <div className='mb-5 p-3 bg-emerald-500/6 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3'>
              <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <span className='text-xs'>{success}</span>
            </div>
          )}

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

            {/* Host selector (if multiple hosts) */}
            {hosts.length > 1 && (
              <div>
                <label htmlFor='host' className={labelClasses}>
                  {t('host')} <span className='text-red-400'>*</span>
                </label>
                <select
                  id='host'
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className={inputClasses}
                >
                  {hosts.map((host) => (
                    <option key={host.id} value={host.id} className='bg-[#111]'>
                      {host.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Venue + Price */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
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
                  <option value='' className='bg-[#111]'>{t('venueSelect')}</option>
                  {cityVenues.map((venue) => (
                    <option key={venue.id} value={venue.id} className='bg-[#111]'>
                      {venue.name}
                    </option>
                  ))}
                </select>
                {validationErrors.venueId && (
                  <p className='mt-1.5 text-xs text-red-400'>{validationErrors.venueId}</p>
                )}
              </div>
              <div>
                <label className={labelClasses}>
                  {t('price')} <span className='text-red-400'>*</span>
                </label>
                <div className='flex gap-1 bg-white/[0.03] border border-white/[0.08] p-1 mb-2'>
                  <button
                    type='button'
                    onClick={() => setIsFree(true)}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 text-sm font-medium transition-all duration-75 cursor-pointer ${
                      isFree
                        ? 'bg-[#E4DD3B]/12 text-[#E4DD3B]'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t('priceFree')}
                  </button>
                  <button
                    type='button'
                    onClick={() => setIsFree(false)}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 text-sm font-medium transition-all duration-75 cursor-pointer ${
                      !isFree
                        ? 'bg-[#E4DD3B]/12 text-[#E4DD3B]'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t('pricePaid')}
                  </button>
                </div>
                {!isFree && (
                  <input
                    id='price'
                    type='text'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={inputClasses}
                    placeholder={t('pricePlaceholder')}
                  />
                )}
                {validationErrors.price && (
                  <p className='mt-1.5 text-xs text-red-400'>{validationErrors.price}</p>
                )}
              </div>
            </div>

            {/* Start Time + End Time */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label htmlFor='startTime' className={labelClasses}>
                  {t('startTime')} <span className='text-red-400'>*</span>
                </label>
                <DateTimePicker
                  id='startTime'
                  value={startTime}
                  onChange={setStartTime}
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.startTime && (
                  <p className='mt-1.5 text-xs text-red-400'>{validationErrors.startTime}</p>
                )}
              </div>
              <div>
                <label htmlFor='endTime' className={labelClasses}>
                  {t('endTime')} <span className='text-red-400'>*</span>
                </label>
                <DateTimePicker
                  id='endTime'
                  value={endTime}
                  onChange={setEndTime}
                  required
                  disabled={isSubmitting}
                  defaultHour='04'
                />
                {validationErrors.endTime && (
                  <p className='mt-1.5 text-xs text-red-400'>{validationErrors.endTime}</p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className={labelClasses}>{t('eventImage')}</label>
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
              className='w-full py-3 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black font-semibold text-sm transition-all duration-75 hover:duration-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
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

      {/* Right column: mobile preview (sticky) */}
      <div className='lg:sticky lg:top-24 lg:-mt-7'>
        <p className='text-white/30 text-xs font-semibold uppercase tracking-wider mb-3'>{t('mobilePreview')}</p>
        {/* Event card — mirrors EventCard mobile layout */}
        <div className='relative bg-[#060606] border border-white/20 flex'>
          {/* Image */}
          <div className='relative w-28 h-28 m-4 rounded-lg overflow-hidden shrink-0'>
            <img
              src={previewImage}
              alt={title || 'Event preview'}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Content */}
          <div className='flex-1 flex flex-col justify-between min-w-0 py-4 pr-4'>
            <div>
              <h3 className='text-white font-display text-base uppercase tracking-wide line-clamp-2 leading-snug'>
                {title || <span className='text-white/25'>{t('eventTitle')}</span>}
              </h3>
              <div className='mt-2 space-y-1.5'>
                <div className='flex items-center gap-2 text-xs text-white/95'>
                  <LocationIcon size={14} className='text-[#E4DD3B] shrink-0' />
                  <span className='truncate'>
                    {previewVenue ? previewVenue.name : <span className='text-white/25'>{t('venueSelect')}</span>}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-xs text-white/95'>
                  <CalendarIcon size={14} className='text-[#E4DD3B] shrink-0' />
                  <span>
                    {startTime && endTime
                      ? `${formatTime(startTime)} – ${formatTime(endTime)}`
                      : <span className='text-white/25'>{t('startTime')} – {t('endTime')}</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 text-xs mt-2'>
              <TicketIcon size={14} className='text-[#E4DD3B]' />
              <span className='text-white/95'>{previewPrice}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
