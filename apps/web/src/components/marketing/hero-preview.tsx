import { Lock, Sparkles } from 'lucide-react';

import { PREVIEW_SAMPLE } from '@/content/marketing';
import { cn } from '@/lib/utils';

type HeroPreviewProps = {
  className?: string;
};

/**
 * An illustration of the product: an interview answer on the left becomes a written case
 * study on the right. Built from markup, not a screenshot, so it stays sharp, themed and light.
 * It is decorative: the same story is told in text by the sections below.
 */
export function HeroPreview({ className }: HeroPreviewProps) {
  const { project } = PREVIEW_SAMPLE;

  return (
    <div aria-hidden="true" className={cn('relative mx-auto max-w-5xl', className)}>
      {/* Browser frame with the generated portfolio */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift lg:ml-72">
        <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto flex h-7 w-full max-w-64 items-center justify-center gap-1.5 rounded-md border border-border bg-background font-mono text-[0.7rem] text-muted-foreground">
            <Lock className="size-3" />
            {PREVIEW_SAMPLE.url}
          </div>
          <div className="w-11" />
        </div>

        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_1.15fr] md:gap-10">
          <div>
            <p className="eyebrow">Portfolio</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {PREVIEW_SAMPLE.name}
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{PREVIEW_SAMPLE.headline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.7rem] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
            <p className="font-mono text-[0.7rem] tracking-[0.14em] text-brand uppercase">{project.label}</p>
            <p className="mt-2 font-display text-xl font-semibold tracking-tight">{project.title}</p>
            <dl className="mt-5 space-y-4">
              {project.sections.map((section) => (
                <div key={section.label} className="grid grid-cols-[5.5rem_1fr] gap-3 text-sm">
                  <dt className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                    {section.label}
                  </dt>
                  <dd className="leading-relaxed">{section.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Interview card overlapping the frame: the raw answer the case study was written from */}
      <div className="relative mx-4 -mt-6 max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lift lg:absolute lg:top-24 lg:left-0 lg:mx-0 lg:mt-0 lg:w-80">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Sparkles className="size-3.5" />
          </span>
          <p className="eyebrow">Interview</p>
        </div>
        <p className="mt-4 text-sm font-medium">{PREVIEW_SAMPLE.interviewQuestion}</p>
        <p className="mt-3 rounded-xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-muted-foreground">
          {PREVIEW_SAMPLE.interviewAnswer}
        </p>
        <p className="mt-3 font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase">
          Example profile
        </p>
      </div>
    </div>
  );
}
