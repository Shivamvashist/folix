import { ArrowRight } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { LinkButton } from '@/components/shared/link-button';
import { ROUTES } from '@/config/routes';
import { FINAL_CTA } from '@/content/marketing';

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-16 text-center text-brand-foreground sm:px-12 sm:py-24">
          <h2 id="cta-title" className="mx-auto max-w-3xl font-display text-title font-semibold">
            {FINAL_CTA.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lead opacity-85">{FINAL_CTA.description}</p>
          <LinkButton
            href={ROUTES.login}
            size="lg"
            className="mt-9 bg-brand-foreground text-brand hover:bg-brand-foreground/90"
          >
            {FINAL_CTA.cta}
            <ArrowRight aria-hidden="true" />
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
