import type { MetadataRoute } from 'next';

import { SITE } from '@/config/site';

/** Marketing pages only. Published portfolios are added at Milestone 5. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE.url, changeFrequency: 'weekly', priority: 1 }];
}
