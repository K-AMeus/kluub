'use client';

import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

interface PrivacyPolicyPageProps {
  title: string;
  content: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText(
      (node as { props: { children?: ReactNode } }).props.children,
    );
  }
  return '';
}

function numericId(children: ReactNode): string | undefined {
  const match = extractText(children).match(/^\s*(\d+)\./);
  return match ? match[1] : undefined;
}

export default function PrivacyPolicyPage({
  title,
  content,
}: PrivacyPolicyPageProps) {
  return (
    <>
      <Header />
      <main className='pt-20 md:pt-32 pb-16 md:pb-24 px-4 md:px-8'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='font-display text-2xl sm:text-3xl md:text-5xl tracking-wide mb-6 md:mb-8 text-center break-words'>
            {title}
          </h1>
          <article className='border border-[#E4DD3B]/40 bg-neutral-900 text-white p-4 sm:p-6 md:p-10 break-words'>
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2
                    id={numericId(children)}
                    className='font-display text-xl sm:text-2xl mt-8 mb-3 scroll-mt-20 md:scroll-mt-24 break-words'
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className='font-display text-lg sm:text-xl mt-6 mb-2 break-words'>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className='mb-4 text-sm md:text-base leading-relaxed'>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className='list-disc pl-5 md:pl-6 mb-4 space-y-1 text-sm md:text-base leading-relaxed'>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className='list-decimal pl-5 md:pl-6 mb-4 space-y-1 text-sm md:text-base leading-relaxed'>
                    {children}
                  </ol>
                ),
                a: ({ href, children }) => (
                  <a href={href} className='text-[#E4DD3B] underline'>
                    {children}
                  </a>
                ),
                hr: () => <hr className='my-8 border-t border-white/10' />,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
