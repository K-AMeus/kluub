'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import type { City, PriceTier, Event, Venue } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { formatDateTimeForInput } from '@/lib/event-utils';
import { revalidateEvents } from '@/lib/db';
import PriceInfoTooltip from '@/components/shared/PriceInfoTooltip';
import ImageUpload from '@/components/shared/ImageUpload';

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

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [priceTier, setPriceTier] = useState<PriceTier>(event.priceTier);
  const [venueId, setVenueId] = useState(event.venueId);
  const [city, setCity] = useState<City>(event.city);
  const [imageUrl, setImageUrl] = useState(event.imageUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(event.facebookUrl || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    setStartTime(formatDateTimeForInput(event.startTime));
    setEndTime(formatDateTimeForInput(event.endTime));
  }, [event]);

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

  const handleVenueChange = (newVenueId: string) => {
    setVenueId(newVenueId);

    const selectedVenue = venues.find((v) => v.id === newVenueId);
    if (selectedVenue) {
      setCity(selectedVenue.city);
    }
  };

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

      await revalidateEvents();

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

  const handleDuplicate = () => {
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
    router.push(`/${locale}/backstage/events/upload`);
  };

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

      await revalidateEvents();

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

  const inputClasses = 'w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 focus:outline-none focus:border-[#E4DD3B]/40 focus:ring-1 focus:ring-[#E4DD3B]/20 transition-all duration-200 disabled:opacity-40 text-sm';
  const labelClasses = 'block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider';

  return (
    <>
      {/* Modal Overlay */}
      <div
        className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 md:pt-20 pb-4'
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className='relative bg-[#111] border border-white/8 w-full max-w-2xl max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/6'>
            <h2 className='font-display text-lg text-white tracking-wider'>
              {t('editEvent')}
            </h2>
            <button
              onClick={onClose}
              className='p-1.5 text-white/30 hover:text-white/60 hover:bg-white/6 transition-all duration-200 cursor-pointer'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

          </div>

          {/* Scrollable Body */}
          <div className='p-5 md:p-6 overflow-y-auto flex-1'>
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
            <form id='edit-event-form' onSubmit={handleUpdate} className='space-y-5'>
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
                  disabled={isSubmitting || isDeleting}
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
                  disabled={isSubmitting || isDeleting}
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
                    disabled={isSubmitting || isDeleting}
                    className={inputClasses}
                  >
                    <option value='' className='bg-[#111]'>
                      {t('venueSelect')}
                    </option>
                    {venues.map((venue) => (
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
                    disabled={isSubmitting || isDeleting}
                    className={inputClasses}
                  >
                    <option value={0} className='bg-[#111]'>{t('priceTierFree')}</option>
                    <option value={1} className='bg-[#111]'>{t('priceTierLow')}</option>
                    <option value={2} className='bg-[#111]'>{t('priceTierMedium')}</option>
                    <option value={3} className='bg-[#111]'>{t('priceTierHigh')}</option>
                  </select>
                </div>
              </div>

              {/* Start/End Time */}
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
                    disabled={isSubmitting || isDeleting}
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
                    disabled={isSubmitting || isDeleting}
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
                  disabled={isSubmitting || isDeleting}
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
                  disabled={isSubmitting || isDeleting}
                  className={inputClasses}
                  placeholder={t('facebookUrlPlaceholder')}
                />
                {validationErrors.facebookUrl && (
                  <p className='mt-1.5 text-xs text-red-400'>{validationErrors.facebookUrl}</p>
                )}
              </div>
            </form>
          </div>

          {/* Sticky Footer */}
          <div className='border-t border-white/6 px-5 md:px-6 py-4 bg-[#111]'>
            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                type='submit'
                form='edit-event-form'
                disabled={isSubmitting || isDeleting}
                className='flex-1 py-2.5 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {isSubmitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' />
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
                className='flex-1 py-2.5 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-white/15 text-white/70 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {t('duplicateEvent')}
              </button>

              <button
                type='button'
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting || isDeleting}
                className='flex-1 py-2.5 bg-red-500/6 hover:bg-red-500/12 border border-red-500/20 hover:border-red-500/30 text-red-400 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
              >
                {t('deleteEvent')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className='fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4'
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className='bg-[#111] border border-white/8 p-6 max-w-sm w-full'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-red-500/1 flex items-center justify-center shrink-0'>
                <svg className='w-5 h-5 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' />
                </svg>
              </div>
              <div>
                <h3 className='text-white text-base font-semibold'>
                  {t('confirmDelete')}
                </h3>
                <p className='text-white/40 text-xs mt-0.5'>
                  {t('confirmDeleteMessage')}
                </p>
              </div>
            </div>

            <div className='flex gap-2 mt-6'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className='flex-1 py-2.5 bg-white/4 hover:bg-white/8 border border-white/8 text-white/70 text-sm font-medium transition-all duration-200 cursor-pointer'
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className='flex-1 py-2.5 bg-red-500/12 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2'
              >
                {isDeleting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full animate-spin' />
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
