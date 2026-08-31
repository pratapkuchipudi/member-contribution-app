import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createLocalClient } from '@/lib/local-db';
import { STARTER_ADMINS, type AdminRecord } from '@/lib/admins';
import { parseSession, SESSION_COOKIE, type Role, type Session } from '@/lib/session';

export { parseSession, SESSION_COOKIE, type Role, type Session };

function envAdmins(): AdminRecord[] {
  return (process.env.ADMIN_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => ({ id, name: id, role: 'admin' as Role }));
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, `${session.id}|${session.role}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

async function rowsFrom(client: { from: (table: string) => any }) {
  const { data, error } = await client.from('app_roles').select('id,name,role');
  if (error) return null;
  return (data ?? []) as { id: string; name?: string; role: string }[];
}

function mergeRoles(...lists: AdminRecord[][]) {
  const merged: AdminRecord[] = [];
  for (const list of lists) {
    for (const row of list) {
      if (!merged.some((item) => item.id === row.id)) merged.push(row);
    }
  }
  return merged;
}

export async function listRoles() {
  const remote = await rowsFrom(await createClient());
  const extra = remote ?? (await rowsFrom(createLocalClient())) ?? [];
  return mergeRoles(
    STARTER_ADMINS,
    envAdmins(),
    extra.map((row) => ({
      id: row.id,
      name: row.name || row.id,
      role: (row.role as Role) || 'admin',
    }))
  );
}

export async function saveRole(id: string, name = '', role: Role = 'admin') {
  const remote = await createClient();
  const { error } = await remote.from('app_roles').insert({ id, name: name || id, role });
  if (error) {
    const { error: localError } = await createLocalClient().from('app_roles').insert({ id, name: name || id, role });
    if (localError) throw new Error(localError.message);
  }
}

export async function sessionLabel(session: Session) {
  const roles = await listRoles();
  return roles.find((row) => row.id === session.id)?.name || session.id;
}

export async function authenticate(id: string): Promise<{ ok: true; session: Session } | { ok: false; reason: 'missing' | 'denied' }> {
  const trimmed = id.trim();
  if (!trimmed) return { ok: false, reason: 'missing' };

  const match = (await listRoles()).find((row) => row.id === trimmed);
  if (match?.role === 'admin') return { ok: true, session: { id: trimmed, role: 'admin' } };
  return { ok: false, reason: 'denied' };
}
