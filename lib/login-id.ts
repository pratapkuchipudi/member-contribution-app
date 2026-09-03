import { createClient } from '@/lib/supabase/server';
import { STARTER_ADMINS } from '@/lib/admins';

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

export function generateLoginId(taken: Set<string>) {
  for (let i = 0; i < 80; i++) {
    let id = '';
    for (let n = 0; n < 5; n++) id += CHARS[Math.floor(Math.random() * CHARS.length)];
    if (!taken.has(id)) return id;
  }
  throw new Error('Could not generate a unique login ID');
}

async function takenIds(client: { from: (table: string) => any }) {
  const taken = new Set(STARTER_ADMINS.map((row) => row.id.toLowerCase()));
  const extra = (process.env.ADMIN_IDS || '').split(',').map((id) => id.trim().toLowerCase()).filter(Boolean);
  extra.forEach((id) => taken.add(id));
  const { data: roles } = await client.from('app_roles').select('id');
  for (const row of roles ?? []) if (row.id) taken.add(String(row.id).toLowerCase());
  const { data: members } = await client.from('members').select('login_id');
  for (const row of members ?? []) if (row.login_id) taken.add(String(row.login_id).toLowerCase());
  return taken;
}

export async function uniqueLoginId() {
  const client = await createClient();
  return generateLoginId(await takenIds(client));
}

export async function ensureMemberLoginIds() {
  const client = await createClient();
  const { data: members } = await client.from('members').select('id,login_id');
  const missing = (members ?? []).filter((row: any) => !row.login_id);
  if (!missing.length) return;
  const taken = await takenIds(client);
  for (const row of missing) {
    const loginId = generateLoginId(taken);
    taken.add(loginId);
    await client.from('members').update({ login_id: loginId }).eq('id', row.id);
  }
}
