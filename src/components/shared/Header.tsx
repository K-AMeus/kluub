import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  return (
    <header className='bg-black/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-[#E4DD3B]/30'>
      <nav className='px-6 md:px-8 lg:px-10 flex items-center justify-between h-14 md:h-16'>
        <div className='w-20 md:w-24' />

        <Link
          href='/'
          className='text-white font-display text-2xl md:text-3xl tracking-wider hover:text-[#E4DD3B] transition-colors duration-300'
        >
          KLUUB.EE
        </Link>

        <div className='w-20 md:w-24 flex justify-end'>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
