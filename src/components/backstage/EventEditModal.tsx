'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import type { City, PriceTier, Event, Venue } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { formatDateTimeForInput } from '@/lib/event-utils';
import { refreshEventsCache } from '@/app/actions';

interface EventEditModalProps {
  event: Event;
  venues: Venue[];
  onClose: () => void;
  onEventUpdated: () => void;
  onEventDeleted: () => void;
}

export default function EventEditModal({
  event,
  venues,
  onClose,
  onEventUpdated,
  onEventDeleted,
}: EventEditModalProps) {
  const t = useTranslations('backstage');
  const locale = useLocale();
  const router = useRouter();

  // Form fields (initialized with event data)
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [priceTier, setPriceTier] = useState<PriceTier>(event.priceTier);
  const [venueId, setVenueId] = useState(event.venueId);
  const [city, setCity] = useState<City>(event.city);
  const [imageUrl, setImageUrl] = useState(event.imageUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(event.facebookUrl || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showPriceInfo, setShowPriceInfo] = useState(false);

  const supabase = createBrowserSupabaseClient();

  // Convert ISO timestamps to datetime-local format
  useEffect(() => {
    setStartTime(formatDateTimeForInput(event.startTime));
    setEndTime(formatDateTimeForInput(event.endTime));
  }, [event]);

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

    if (imageUrl && !isValidUrl(imageUrl)) {
      errors.imageUrl = t('invalidUrl');
    }

    if (facebookUrl && !isValidUrl(facebookUrl)) {
      errors.facebookUrl = t('invalidUrl');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle venue change
  const handleVenueChange = (newVenueId: string) => {
    setVenueId(newVenueId);

    const selectedVenue = venues.find((v) => v.id === newVenueId);
    if (selectedVenue) {
      setCity(selectedVenue.city);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title: title.trim(),
          description: description.trim(),
          price_tier: priceTier,
          venue_id: venueId,
          city: city,
          image_url: imageUrl.trim() || null,
          facebook_url: facebookUrl.trim() || null,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
        })
        .eq('id', event.id);

      if (updateError) {
        setError(t('updateError'));
        console.error('Error updating event:', updateError);
        return;
      }

      await refreshEventsCache();

      setSuccess(t('eventUpdated'));
      setTimeout(() => {
        onEventUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      setError(t('unexpectedError'));
      console.error('Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = () => {
    // Save event data to localStorage (without the ID)
    const duplicateData = {
      title: event.title,
      description: event.description,
      priceTier: event.priceTier,
      venueId: event.venueId,
      city: event.city,
      imageUrl: event.imageUrl,
      facebookUrl: event.facebookUrl,
      startTime: event.startTime,
      endTime: event.endTime,
    };

    localStorage.setItem('duplicateEvent', JSON.stringify(duplicateData));

    // Navigate to upload page
    router.push(`/${locale}/backstage/events/upload`);
  };

  // Handle delete
  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (deleteError) {
        setError(t('deleteError'));
        console.error('Error deleting event:', deleteError);
        setIsDeleting(false);
        return;
      }

      await refreshEventsCache();

      setSuccess(t('eventDeleted'));
      setTimeout(() => {
        onEventDeleted();
        onClose();
      }, 1500);
    } catch (err) {
      setError(t('unexpectedError'));
      console.error('Unexpected error:', err);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20'
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className='relative bg-black/90 border border-[#E4DD3B]/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-white/40 hover:text-white transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          <div className='p-6 md:p-8'>
            {/* Header */}
            <div className='mb-6'>
              <h2 className='font-display text-2xl text-white tracking-wider'>
                {t('editEvent')}
              </h2>
            </div>

            {/* Error message */}
            {error && (
              <div className='mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3'>
                <svg
                  className='w-5 h-5 shrink-0 mt-0.5'
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
                  className='w-5 h-5 shrink-0 mt-0.5'
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
            <form onSubmit={handleUpdate} className='space-y-6'>
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
                  disabled={isSubmitting || isDeleting}
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
                  {t('eventDescription')}{' '}
                  <span className='text-red-400'>*</span>
                </label>
                <textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isSubmitting || isDeleting}
                  rows={4}
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-[border-color,box-shadow,opacity] duration-200 disabled:opacity-50 min-h-[7.5rem]'
                  placeholder={t('eventDescriptionPlaceholder')}
                />
                {validationErrors.description && (
                  <p className='mt-1 text-sm text-red-400'>
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Venue Selector */}
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
                    disabled={isSubmitting || isDeleting}
                    className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                  >
                    <option value='' className='bg-black'>
                      {t('venueSelect')}
                    </option>
                    {venues.map((venue) => (
                      <option
                        key={venue.id}
                        value={venue.id}
                        className='bg-black'
                      >
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

                {/* Price Tier - 1/3 width */}
                <div className='md:col-span-1 relative'>
                  <label
                    htmlFor='priceTier'
                    className='block text-white/70 text-sm mb-2 flex items-center gap-1'
                  >
                    {t('priceTier')} <span className='text-red-400'>*</span>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPriceInfo(!showPriceInfo);
                      }}
                      className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
                    >
                      <svg
                        className='w-4 h-4 text-white/70'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </label>

                  {/* Price Info Tooltip */}
                  {showPriceInfo && (
                    <>
                      {/* Backdrop */}
                      <div
                        className='fixed inset-0 z-10'
                        onClick={() => setShowPriceInfo(false)}
                      />
                      {/* Tooltip */}
                      <div className='absolute top-8 left-0 z-20 bg-black/95 border border-[#E4DD3B]/30 rounded-lg p-3 min-w-[200px] shadow-xl'>
                        <div className='text-xs text-white/90 space-y-1'>
                          <div><strong>Free:</strong> 0 EUR</div>
                          <div><strong>Low cost:</strong> 0-10 EUR</div>
                          <div><strong>Medium cost:</strong> 10-20 EUR</div>
                          <div><strong>High cost:</strong> 20+ EUR</div>
                        </div>
                        {/* Arrow */}
                        <div className='absolute -top-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-[#E4DD3B]/30'></div>
                      </div>
                    </>
                  )}
                  <select
                    id='priceTier'
                    value={priceTier}
                    onChange={(e) =>
                      setPriceTier(Number(e.target.value) as PriceTier)
                    }
                    required
                    disabled={isSubmitting || isDeleting}
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
                    disabled={isSubmitting || isDeleting}
                    className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-[border-color,box-shadow,opacity] duration-200 disabled:opacity-50'
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
                    disabled={isSubmitting || isDeleting}
                    className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-[border-color,box-shadow,opacity] duration-200 disabled:opacity-50'
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
                  disabled={isSubmitting || isDeleting}
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
                  disabled={isSubmitting || isDeleting}
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E4DD3B]/50 focus:ring-1 focus:ring-[#E4DD3B]/50 transition-all duration-200 disabled:opacity-50'
                  placeholder={t('facebookUrlPlaceholder')}
                />
                {validationErrors.facebookUrl && (
                  <p className='mt-1 text-sm text-red-400'>
                    {validationErrors.facebookUrl}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                <button
                  type='submit'
                  disabled={isSubmitting || isDeleting}
                  className='flex-1 py-3 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
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
                      {t('updatingEvent')}
                    </>
                  ) : (
                    t('updateEvent')
                  )}
                </button>

                <button
                  type='button'
                  onClick={handleDuplicate}
                  disabled={isSubmitting || isDeleting}
                  className='px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                    />
                  </svg>
                  {t('duplicateEvent')}
                </button>

                <button
                  type='button'
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                  className='px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {t('deleteEvent')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className='fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4'
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className='bg-black/95 border border-red-500/30 rounded-xl p-6 max-w-md w-full'
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='text-xl text-white font-semibold mb-3'>
              {t('confirmDelete')}
            </h3>
            <p className='text-white/50 text-sm mb-6'>
              {t('confirmDeleteMessage')}
            </p>

            <div className='flex gap-3'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className='flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-200'
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className='flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-all duration-200 flex items-center justify-center gap-2'
              >
                {isDeleting ? (
                  <>
                    <svg
                      className='w-4 h-4 animate-spin'
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
                    {t('deletingEvent')}
                  </>
                ) : (
                  t('deleteEvent')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
