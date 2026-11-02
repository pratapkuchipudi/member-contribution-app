'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, requireAdmin, requireMemberAccess } from '@/lib/auth';
import { uniqueLoginId } from '@/lib/login-id';

export async function addPayment(id: string, fd: FormData) {
  await requireAdmin();
  const s = await createClient();
  const { error } = await s.from('payments').insert({
    member_id: id,
    amount: Number(fd.get('amount')),
    payment_date: String(fd.get('payment_date')),
    payment_method: String(fd.get('payment_method') || '') || null,
    notes: String(fd.get('notes') || '') || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/members/${id}`);
  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/reports');
}

export async function deletePayment(memberId: string, paymentId: string, fd: FormData) {
  const session = await requireAdmin();
  const reason = String(fd.get('reason') || '').trim();
  if (!reason) throw new Error('Enter a reason to delete this payment.');
  const s = await createClient();
  const { data: payment } = await s.from('payments').select('*').eq('id', paymentId).maybeSingle();
  if (!payment) return;
  const { error } = await s.from('payments').delete().eq('id', paymentId);
  if (error) throw new Error(error.message);
  const amount = '₹' + Number(payment.amount || 0).toLocaleString('en-IN');
  await s.from('member_notes').insert({
    member_id: memberId,
    note: `Payment deleted: ${amount} on ${payment.payment_date || '-'} (${payment.payment_method || 'method not set'}). Reason: ${reason}. Deleted by ${session.id}.`,
  });
  revalidatePath(`/members/${memberId}`);
  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/reports');
}

export async function addNote(id: string, fd: FormData) {
  await requireAdmin();
  const s = await createClient();
  const note = String(fd.get('note') || '').trim();
  if (!note) return;
  const { error } = await s.from('member_notes').insert({ member_id: id, note });
  if (error) throw new Error(error.message);
  revalidatePath(`/members/${id}`);
}

export async function updateMeetingDate(id: string, fd: FormData) {
  await requireAdmin();
  const s = await createClient();
  const { error } = await s.from('members').update({
    meeting_date: String(fd.get('meeting_date') || '') || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/members/${id}`);
  revalidatePath('/members');
  revalidatePath('/referrals');
  revalidatePath('/');
  revalidatePath('/reports');
}

export async function updateMember(id: string, fd: FormData) {
  const session = await requireMemberAccess(id);
  const s = await createClient();
  const patch: Record<string, any> = {
    name: String(fd.get('name') || '').trim(),
    phone: String(fd.get('phone') || '').trim(),
    notes: String(fd.get('notes') || '').trim() || null,
  };
  if (isAdmin(session)) {
    patch.proposed_amount = Number(fd.get('proposed_amount') || 0);
    patch.proposed_date = String(fd.get('proposed_date') || '') || null;
    patch.meeting_date = String(fd.get('meeting_date') || '') || null;
  }
  const { error } = await s.from('members').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/members/${id}`);
  revalidatePath('/members');
  revalidatePath('/roles');
  revalidatePath('/');
  revalidatePath('/reports');
  redirect(`/members/${id}`);
}

export async function deleteMember(id: string) {
  await requireAdmin();
  const s = await createClient();
  const { error } = await s.from('members').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/members');
  revalidatePath('/roles');
  revalidatePath('/');
  redirect('/members');
}

export async function resetMemberLoginId(id: string) {
  await requireAdmin();
  const s = await createClient();
  const loginId = await uniqueLoginId();
  const { error } = await s.from('members').update({ login_id: loginId }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/roles');
  revalidatePath(`/members/${id}`);
  revalidatePath('/members');
}
