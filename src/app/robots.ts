import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://easywork.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/auth/login', '/legal/terms-partners'],
      disallow: ['/admin/', '/api/', '/subscription/checkout-return', '/resumes/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
