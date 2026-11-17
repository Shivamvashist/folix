import Link from 'next/link';

import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { LinkButton } from '@/components/shared/link-button';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { NAV_LINKS } from '@/content/marketing';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/80 backdrop-blur-md supports-[backdrop-filter]:border-border/60">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href={ROUTES.home}
          aria-label={`${SITE.name} home`}
          className="-mx-2 rounded-md px-2 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <LinkButton href={ROUTES.login} variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </LinkButton>
          <LinkButton href={ROUTES.login}>Start free</LinkButton>
        </div>
      </Container>
    </header>
  );
}
