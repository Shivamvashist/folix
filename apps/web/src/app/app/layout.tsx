import type { Metadata } from 'next';

import { AppHeader } from '@/components/app/app-header';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s | Folix' },
  robots: { index: false, follow: false },
};

/**
 * The signed-in shell. It does NOT authorise anything: each page under /app calls
 * `requireUser()` itself, because a layout check does not protect its children.
 */
export default function AppLayout({ children }: LayoutProps<'/app'>) {
  return (
    <>
      <AppHeader />
      <main id="main" className="flex-1 py-10 sm:py-14">
        <Container>{children}</Container>
      </main>
    </>
  );
}
