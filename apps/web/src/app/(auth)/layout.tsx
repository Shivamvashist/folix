import Link from 'next/link';

import { Logo } from '@/components/brand/logo';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { PRINCIPLES } from '@/content/marketing';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link
          href={ROUTES.home}
          aria-label={`${SITE.name} home`}
          className="-mx-2 self-start rounded-md px-2 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo />
        </Link>
        <main id="main" className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      <aside className="hidden flex-col justify-end bg-inverse p-14 text-inverse-foreground lg:flex">
        <p className="font-mono text-xs tracking-[0.14em] text-inverse-muted uppercase">
          {PRINCIPLES.eyebrow}
        </p>
        <ul className="mt-8 space-y-8">
          {PRINCIPLES.items.map((principle) => (
            <li key={principle.title}>
              <p className="font-display text-3xl font-semibold tracking-tight">{principle.title}</p>
              <p className="mt-3 max-w-md leading-relaxed text-inverse-muted">{principle.description}</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
