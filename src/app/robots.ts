import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/et/backstage/',
          '/en/backstage/',
          '/et/auth/',
          '/en/auth/',
        ],
      },
    ],
    sitemap: 'https://www.kluub.ee/sitemap.xml',
  };
}
