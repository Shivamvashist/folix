import { FileUp, type LucideIcon, MessagesSquare, PencilLine } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { INTAKE, type IntakePathIcon } from '@/content/marketing';

const ICONS: Record<IntakePathIcon, LucideIcon> = {
  form: PencilLine,
  upload: FileUp,
  interview: MessagesSquare,
};

export function IntakePaths() {
  return (
    <section aria-labelledby="intake-title" className="border-t border-border py-20 sm:py-28">
      <Container>
        <SectionHeading
          id="intake-title"
          eyebrow={INTAKE.eyebrow}
          title={INTAKE.title}
          description={INTAKE.description}
        />

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {INTAKE.paths.map((path) => {
            const Icon = ICONS[path.icon];
            return (
              <li
                key={path.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-7 transition-shadow duration-300 hover:shadow-soft"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{path.name}</h3>
                <p className="mt-2.5 flex-1 leading-relaxed text-muted-foreground">{path.description}</p>
                <p className="mt-6 border-t border-border pt-4 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {path.time}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
