import { Container } from '@/components/layout/container';
import { PRINCIPLES } from '@/content/marketing';

export function Principles() {
  return (
    <section
      id="principles"
      aria-labelledby="principles-title"
      className="bg-inverse py-20 text-inverse-foreground sm:py-28"
    >
      <Container>
        <h2
          id="principles-title"
          className="font-mono text-xs tracking-[0.14em] text-inverse-muted uppercase"
        >
          {PRINCIPLES.eyebrow}
        </h2>

        <ul className="mt-10 grid gap-12 md:grid-cols-2 md:gap-16">
          {PRINCIPLES.items.map((principle) => (
            <li key={principle.title} className="border-t border-inverse-foreground/15 pt-8">
              <h3 className="font-display text-title font-semibold">{principle.title}</h3>
              <p className="mt-5 max-w-lg text-lead text-inverse-muted">{principle.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
