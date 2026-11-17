import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

/** The Folix mark (a page with a folded corner) and wordmark. Colours follow the text colour. */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-display text-xl font-semibold tracking-tight',
        className,
      )}
    >
      <LogoMark className="size-6" />
      folix
    </span>
  );
}

export function LogoMark({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <path
        d="M5 4.5A2.5 2.5 0 0 1 7.5 2H14l6 6v11.5a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 5 19.5z"
        className="fill-brand"
      />
      <path d="M14 2l6 6h-4a2 2 0 0 1-2-2z" className="fill-brand-soft" />
      <path
        d="M9 12.25h6M9 16h3.5"
        className="stroke-brand-foreground"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
