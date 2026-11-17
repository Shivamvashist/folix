import {
  ChartNoAxesColumn,
  LayoutTemplate,
  type LucideIcon,
  NotebookText,
  Share2,
  Users,
  WandSparkles,
} from 'lucide-react';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { FEATURES, type FeatureIcon } from '@/content/marketing';
import { cn } from '@/lib/utils';

const ICONS: Record<FeatureIcon, LucideIcon> = {
  caseStudy: NotebookText,
  audiences: Users,
  templates: LayoutTemplate,
  rewrite: WandSparkles,
  share: Share2,
  analytics: ChartNoAxesColumn,
};

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          id="features-title"
          eyebrow={FEATURES.eyebrow}
          title={FEATURES.title}
          description={FEATURES.description}
        />

        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.items.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <li
                key={feature.name}
                className={cn(
                  'rounded-2xl border border-border bg-card p-7 transition-colors duration-300 hover:border-brand/40',
                  feature.isWide && 'lg:col-span-2',
                )}
              >
                <Icon aria-hidden="true" className="size-6 text-brand" strokeWidth={1.75} />
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{feature.name}</h3>
                <p className="mt-2.5 leading-relaxed text-muted-foreground">{feature.description}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
