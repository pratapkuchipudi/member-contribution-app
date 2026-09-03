import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { updateSponsor } from '../actions';

const statuses = ['New', 'Contacted', 'Meeting Scheduled', 'Interested', 'Confirmed', 'Paid', 'Not Interested'];

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  const s = await createClient();
  const { data: m } = await s.from('sponsors').select('*').eq('id', id).maybeSingle();
  if (!m) notFound();
  const { data: members } = await s.from('members').select('id,name').order('name');
  const list = members ?? [];
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Edit Sponsor</h1>
      <form action={updateSponsor.bind(null, id)} className="mt-4 space-y-3 rounded-xl border bg-white p-5">
        <input name="name" required defaultValue={m.name} placeholder="Name" className="w-full rounded border px-3 py-2" />
        <input name="phone" required defaultValue={m.phone} placeholder="Phone Number" className="w-full rounded border px-3 py-2" />
        <textarea name="address" defaultValue={m.address || ''} placeholder="Address" className="w-full rounded border px-3 py-2" />
        <input name="expected_amount" required type="number" min="0" step="0.01" defaultValue={m.expected_amount} placeholder="Expected Amount" className="w-full rounded border px-3 py-2" />
        <select name="member_id" defaultValue={m.member_id || ''} className="w-full rounded border px-3 py-2">
          <option value="">Referred by Member</option>
          {list.map((x: any) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <input name="meeting_date" type="date" defaultValue={String(m.meeting_date || '').slice(0, 10)} className="w-full rounded border px-3 py-2" />
        <select name="status" defaultValue={m.status || 'New'} className="w-full rounded border px-3 py-2">
          {statuses.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <textarea name="notes" defaultValue={m.notes || ''} placeholder="Notes" className="w-full rounded border px-3 py-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Save Changes</button>
      </form>
    </div>
  );
}
