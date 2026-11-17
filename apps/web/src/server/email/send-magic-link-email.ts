import 'server-only';

import { Resend } from 'resend';

import { SITE } from '@/config/site';
import { env } from '@/env';

type MagicLinkEmail = {
  to: string;
  url: string;
};

/**
 * Sends the sign-in link. Without RESEND_API_KEY the link is printed to the server
 * console in development, and the call fails loudly anywhere else.
 */
export async function sendMagicLinkEmail({ to, url }: MagicLinkEmail): Promise<void> {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not set: cannot send sign-in emails.');
    }
    console.warn(`[dev] Sign-in link for ${to}: ${url}`);
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `Your ${SITE.name} sign-in link`,
    text: [
      `Sign in to ${SITE.name} with this link:`,
      '',
      url,
      '',
      'The link expires in 10 minutes and can be used once.',
      'If you did not ask for it, you can ignore this email.',
    ].join('\n'),
  });

  if (error) throw new Error(`Sign-in email failed: ${error.message}`);
}
