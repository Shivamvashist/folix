import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { STEPS } from '@/content/marketing';

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="steps-title"
      className="border-y border-border bg-muted/50 py-20 sm:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading
          id="steps-title"
          eyebrow={STEPS.eyebrow}
          title={STEPS.title}
          className="lg:sticky lg:top-28 lg:self-start"
        />

        <ol className="border-t border-border">
          {STEPS.items.map((step, index) => (
            <li
              key={step.name}
              className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-border py-7 sm:grid-cols-[5rem_1fr]"
            >
              <span aria-hidden="true" className="font-mono text-sm text-brand tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight">{step.name}</h3>
                <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
