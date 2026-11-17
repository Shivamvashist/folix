import { magicLinkClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

/** Browser-side auth: sign in, sign out. Session checks that matter happen on the server. */
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});
