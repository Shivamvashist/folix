import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type LinkButtonVariant = 'primary' | 'brand' | 'outline' | 'ghost' | 'inverse';
type LinkButtonSize = 'md' | 'lg';

type LinkButtonProps = {
  /** An internal route from ROUTES, or an in-page anchor such as `#features`. */
  href: Route | `#${string}`;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  className?: string;
  children: ReactNode;
};

const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-200 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0';

const VARIANTS: Record<LinkButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/85',
  brand: 'bg-brand text-brand-foreground hover:bg-brand/90 shadow-soft',
  outline: 'border-input bg-background hover:bg-accent border',
  ghost: 'hover:bg-accent',
  inverse: 'bg-inverse-foreground text-inverse hover:bg-inverse-foreground/90',
};

// Both sizes meet the 44px touch target on touch screens.
const SIZES: Record<LinkButtonSize, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

/** A navigation link styled as a button. For actions (submit, toggle) use `Button`. */
export function LinkButton({ href, variant = 'primary', size = 'md', className, children }: LinkButtonProps) {
  return (
    <Link href={href as Route} className={cn(BASE, VARIANTS[variant], SIZES[size], className)}>
      {children}
    </Link>
  );
}
