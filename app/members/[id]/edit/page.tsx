import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, requireMemberAccess } from '@/lib/auth';
import { updateMember } from '../actions';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMemberAccess(id);
  const admin = isAdmin(session);
  const s = await createClient();
  const { data: m } = await s.from('members').select('*').eq('id', id).maybeSingle();
  if (!m) notFound();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">{admin ? 'Edit Member' : 'Update my details'}</h1>
      {m.login_id ? <p className="mt-1 text-sm text-slate-500">Login ID <span className="font-mono font-semibold">{m.login_id}</span></p> : null}
      <form action={updateMember.bind(null, id)} className="mt-4 space-y-3 rounded-xl border bg-white p-5">
        <input name="name" required defaultValue={m.name} placeholder="Name" className="w-full rounded border px-3 py-2" />
        <input name="phone" required defaultValue={m.phone} placeholder="Phone Number" className="w-full rounded border px-3 py-2" />
        {admin ? (
          <>
            <input name="proposed_amount" required type="number" min="0" step="0.01" defaultValue={m.proposed_amount} placeholder="Proposed Amount" className="w-full rounded border px-3 py-2" />
            <input name="proposed_date" type="date" defaultValue={String(m.proposed_date || '').slice(0, 10)} className="w-full rounded border px-3 py-2" />
          </>
        ) : null}
        <textarea name="notes" defaultValue={m.notes || ''} placeholder="Notes" className="w-full rounded border px-3 py-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Save Changes</button>
      </form>
    </div>
  );
}
