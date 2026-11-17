import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { SITE } from '@/config/site';
import { FOOTER, NAV_LINKS } from '@/content/marketing';

export function SiteFooter() {
  return (
    <footer className="bg-inverse text-inverse-foreground">
      <Container className="flex flex-col gap-10 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-inverse-muted">{FOOTER.blurb}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-sm text-inverse-muted transition-colors outline-none hover:text-inverse-foreground focus-visible:ring-3 focus-visible:ring-ring/60"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-inverse-foreground/10 py-6 font-mono text-xs text-inverse-muted">
        &copy; {SITE.name}. All rights reserved.
      </Container>
    </footer>
  );
}
