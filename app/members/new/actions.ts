'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { uniqueLoginId } from '@/lib/login-id';

export async function createMember(fd: FormData) {
  await requireAdmin();
  const s = await createClient();
  const loginId = await uniqueLoginId();
  const { error } = await s.from('members').insert({
    name: String(fd.get('name') || '').trim(),
    phone: String(fd.get('phone') || '').trim(),
    login_id: loginId,
    proposed_amount: Number(fd.get('proposed_amount') || 0),
    proposed_date: String(fd.get('proposed_date') || '') || null,
    notes: String(fd.get('notes') || '').trim() || null,
  });
  if (error) throw new Error(error.message);
  const { data } = await s.from('members').select('id').eq('login_id', loginId).maybeSingle();
  redirect(data?.id ? `/members/${data.id}` : '/members');
}
