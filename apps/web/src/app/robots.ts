import type { MetadataRoute } from 'next';

import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: [ROUTES.dashboard, '/api/', ROUTES.login] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
