import { env } from '@/env';

export const SITE = {
  name: 'Folix',
  tagline: 'Your career, written well.',
  description:
    'Folix turns your career details into a written, designed and editable portfolio website at your own URL, in a few minutes.',
  url: env.NEXT_PUBLIC_APP_URL,
} as const;
