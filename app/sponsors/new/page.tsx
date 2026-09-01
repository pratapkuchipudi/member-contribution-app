import { createClient } from '@/lib/supabase/server';
import { createSponsor } from '../actions';

export default async function Page() {
  const s = await createClient();
  const { data: members } = await s.from('members').select('id,name').order('name');
  const m = members ?? [];
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Add Sponsor</h1>
      <form action={createSponsor} className="mt-4 space-y-3 rounded-xl border bg-white p-5">
        <input name="name" required placeholder="Name" className="w-full rounded border px-3 py-2" />
        <input name="phone" required placeholder="Phone Number" className="w-full rounded border px-3 py-2" />
        <textarea name="address" placeholder="Address" className="w-full rounded border px-3 py-2" />
        <input name="expected_amount" required type="number" min="0" step="0.01" placeholder="Expected Amount" className="w-full rounded border px-3 py-2" />
        <select name="member_id" className="w-full rounded border px-3 py-2">
          <option value="">Referred by Member</option>
          {m.map((x: any) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <input name="meeting_date" type="date" className="w-full rounded border px-3 py-2" />
        <select name="status" className="w-full rounded border px-3 py-2">
          {['New', 'Contacted', 'Meeting Scheduled', 'Interested', 'Confirmed', 'Paid', 'Not Interested'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <textarea name="notes" placeholder="Notes" className="w-full rounded border px-3 py-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Save Sponsor</button>
      </form>
    </div>
  );
}
