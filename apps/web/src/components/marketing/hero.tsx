import { ArrowRight } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { HeroPreview } from '@/components/marketing/hero-preview';
import { LinkButton } from '@/components/shared/link-button';
import { ROUTES } from '@/config/routes';
import { HERO } from '@/content/marketing';

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10" />

      <Container className="pt-16 pb-20 sm:pt-24 lg:pt-28 lg:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow inline-flex animate-rise items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            {HERO.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="mt-7 animate-rise font-display text-display font-semibold [animation-delay:80ms]"
          >
            {HERO.titleLead} <span className="text-brand">{HERO.titleAccent}</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl animate-rise text-lead text-muted-foreground [animation-delay:160ms]">
            {HERO.description}
          </p>

          <div className="mt-9 flex animate-rise flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <LinkButton href={ROUTES.login} variant="brand" size="lg" className="w-full sm:w-auto">
              {HERO.primaryCta}
              <ArrowRight aria-hidden="true" />
            </LinkButton>
            <LinkButton href="#how-it-works" variant="outline" size="lg" className="w-full sm:w-auto">
              {HERO.secondaryCta}
            </LinkButton>
          </div>

          <p className="mt-5 animate-rise text-sm text-muted-foreground [animation-delay:320ms]">
            {HERO.footnote}
          </p>
        </div>

        <HeroPreview className="mt-16 animate-rise [animation-delay:400ms] lg:mt-20" />
      </Container>
    </section>
  );
}
