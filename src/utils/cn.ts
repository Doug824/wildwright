/**
 * cn - className utility
 *
 * Simple utility to conditionally join classNames.
 * Filters out falsy values for conditional classes.
 */

export const cn = (...args: (string | undefined | false | null)[]): string =>
  args.filter(Boolean).join(' ');
