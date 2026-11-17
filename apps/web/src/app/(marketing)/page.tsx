import { Features } from '@/components/marketing/features';
import { FinalCta } from '@/components/marketing/final-cta';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { IntakePaths } from '@/components/marketing/intake-paths';
import { Principles } from '@/components/marketing/principles';

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntakePaths />
      <HowItWorks />
      <Features />
      <Principles />
      <FinalCta />
    </>
  );
}
