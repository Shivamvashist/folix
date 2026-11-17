import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/** The page gutter and maximum width. Every full-width section puts its content in one. */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)} {...props} />;
}
