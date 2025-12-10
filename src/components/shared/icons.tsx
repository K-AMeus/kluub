interface IconProps {
  className?: string;
  size?: number;
  ariaLabel?: string;
}

export function LocationIcon({
  className = '',
  size = 20,
  ariaLabel = 'Location',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-label={ariaLabel}
    >
      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  );
}

export function CalendarIcon({
  className = '',
  size = 20,
  ariaLabel = 'Calendar',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-label={ariaLabel}
    >
      <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
      <line x1='16' y1='2' x2='16' y2='6' />
      <line x1='8' y1='2' x2='8' y2='6' />
      <line x1='3' y1='10' x2='21' y2='10' />
    </svg>
  );
}

export function TicketIcon({
  className = '',
  size = 20,
  ariaLabel = 'Ticket',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-label={ariaLabel}
    >
      <path d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z' />
      <path d='M13 5v2' />
      <path d='M13 17v2' />
      <path d='M13 11v2' />
    </svg>
  );
}

export function FacebookIcon({
  className = '',
  size = 20,
  ariaLabel = 'Facebook',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={className}
      aria-label={ariaLabel}
    >
      <path d='M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.125v-3.622h3.125v-2.672c0-3.097 1.894-4.785 4.659-4.785 1.325 0 2.463.099 2.794.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.762v2.312h3.592l-.467 3.622h-3.125v9.294h6.125c.731 0 1.324-.593 1.324-1.324v-21.351c0-.732-.593-1.325-1.324-1.325z' />
    </svg>
  );
}

export function ArrowLeftIcon({
  className = '',
  size = 20,
  ariaLabel = 'Arrow left',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-label={ariaLabel}
    >
      <path d='M19 12H5' />
      <path d='m12 19-7-7 7-7' />
    </svg>
  );
}

export function ChevronRightIcon({
  className = '',
  size = 20,
  ariaLabel = 'Chevron right',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-label={ariaLabel}
    >
      <path d='m9 18 6-6-6-6' />
    </svg>
  );
}
