/**
 * The one return shape for every server action (docs/rules/04-backend.md, "Server actions").
 * Actions return failures the user can act on; they throw only for bugs.
 */
export type ActionErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'rateLimited'
  | 'limitReached'
  | 'internal';

export type ActionError = {
  code: ActionErrorCode;
  /** Safe to show to the user. Never a raw exception message. */
  message: string;
  /** Per-field messages for form validation failures, keyed by field name. */
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<TData = void> = { ok: true; data: TData } | { ok: false; error: ActionError };

export function ok(): ActionResult;
export function ok<TData>(data: TData): ActionResult<TData>;
export function ok<TData>(data?: TData): ActionResult<TData | undefined> {
  return { ok: true, data };
}

export function fail(code: ActionErrorCode, message: string, fieldErrors?: ActionError['fieldErrors']) {
  return { ok: false as const, error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } };
}
