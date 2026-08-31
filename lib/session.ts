export const SESSION_COOKIE = 'app_session';
export type Role = 'admin';
export type Session = { id: string; role: Role };

export function parseSession(value?: string | null): Session | null {
  if (!value) return null;
  const sep = value.indexOf('|');
  if (sep <= 0) return null;
  const id = value.slice(0, sep);
  const role = value.slice(sep + 1);
  if (id && role === 'admin') return { id, role };
  return null;
}
