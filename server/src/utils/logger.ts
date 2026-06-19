export const log = {
  info: (...args: unknown[]) => console.info('[server]', ...args),
  warn: (...args: unknown[]) => console.warn('[server]', ...args),
  error: (...args: unknown[]) => console.error('[server]', ...args)
};
