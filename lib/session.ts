export const SESSION_COOKIE = 'app_session';
export type Role = 'admin' | 'member';
export type Session = { id: string; role: Role; memberId?: string };

export function parseSession(value?: string | null): Session | null {
  if (!value) return null;
  const sep = value.indexOf('|');
  if (sep <= 0) return null;
  const id = value.slice(0, sep);
  const role = value.slice(sep + 1);
  if (id && (role === 'admin' || role === 'member')) return { id, role };
  return null;
}

export function isAdmin(session?: Session | null) {
  return session?.role === 'admin';
}
