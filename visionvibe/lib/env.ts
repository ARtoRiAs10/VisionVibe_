/**
 * Environment helpers.
 *
 * An empty value in .env.local must be treated as "not configured", otherwise
 * the app would try to use a blank API key / database url.
 */
export function envValue(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined || raw === null) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function hasEnv(name: string): boolean {
  return envValue(name) !== undefined;
}

/** First environment variable that has a non-empty value. */
export function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = envValue(name);
    if (value) return value;
  }
  return undefined;
}
