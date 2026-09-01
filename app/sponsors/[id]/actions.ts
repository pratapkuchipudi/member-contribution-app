'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function addSponsorPayment(id: string, fd: FormData) {
  await requireAdmin();
  const s = await createClient();
  const { error } = await s.from('sponsor_payments').insert({
    sponsor_id: id,
    amount: Number(fd.get('amount')),
    payment_date: String(fd.get('payment_date')),
    payment_method: String(fd.get('payment_method') || '') || null,
    notes: String(fd.get('notes') || '') || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/sponsors/${id}`);
  revalidatePath('/sponsors');
  revalidatePath('/');
}

export async function addSponsorNote(id: string, fd: FormData) {
  await requireAdmin();
  const s = await createClient();
  const note = String(fd.get('note') || '').trim();
  if (!note) return;
  const { error } = await s.from('sponsor_notes').insert({ sponsor_id: id, note });
  if (error) throw new Error(error.message);
  revalidatePath(`/sponsors/${id}`);
}

export async function updateSponsor(id: string, fd: FormData) {
  await requireAdmin();
  const s = await createClient();
  const { error } = await s.from('sponsors').update({
    member_id: String(fd.get('member_id') || '') || null,
    name: String(fd.get('name') || '').trim(),
    phone: String(fd.get('phone') || '').trim(),
    expected_amount: Number(fd.get('expected_amount') || 0),
    address: String(fd.get('address') || '').trim() || null,
    meeting_date: String(fd.get('meeting_date') || '') || null,
    status: String(fd.get('status') || 'New'),
    notes: String(fd.get('notes') || '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/sponsors/${id}`);
  revalidatePath('/sponsors');
  revalidatePath('/');
  redirect(`/sponsors/${id}`);
}

export async function deleteSponsor(id: string) {
  await requireAdmin();
  const s = await createClient();
  const { error } = await s.from('sponsors').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/sponsors');
  revalidatePath('/');
  redirect('/sponsors');
}
