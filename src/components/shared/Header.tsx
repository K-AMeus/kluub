import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  return (
    <header className='bg-black/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-[#E4DD3B]/30'>
      <nav className='relative px-4 md:px-8 lg:px-10 flex items-center justify-end h-14 md:h-16'>
        <Link
          href='/'
          className='absolute left-1/2 -translate-x-1/2 text-white font-display text-xl md:text-3xl tracking-wider hover:text-[#E4DD3B] transition-colors duration-300'
        >
          KLUUB.EE
        </Link>

        <LanguageSwitcher />
      </nav>
    </header>
  );
}
