import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** The id the section's `aria-labelledby` points to. */
  id: string;
  className?: string;
};

/** Eyebrow, title and optional lead paragraph that open a marketing section. */
export function SectionHeading({ eyebrow, title, description, id, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-4 font-display text-title font-semibold">
        {title}
      </h2>
      {description ? <p className="mt-5 text-lead text-muted-foreground">{description}</p> : null}
    </div>
  );
}
