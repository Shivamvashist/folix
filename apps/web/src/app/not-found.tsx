import { LinkButton } from '@/components/shared/link-button';
import { ROUTES } from '@/config/routes';

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-title font-semibold">This page does not exist.</h1>
      <p className="mt-4 max-w-md text-lead text-muted-foreground">
        The link may be old, or the portfolio may have moved to a new address.
      </p>
      <LinkButton href={ROUTES.home} className="mt-8">
        Back to home
      </LinkButton>
    </main>
  );
}
