import { requireAdmin } from '@/lib/auth';
import { createMember } from './actions';

export default async function Page() {
  await requireAdmin();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Add Member</h1>
      <form action={createMember} className="mt-4 space-y-3 rounded-xl border bg-white p-5">
        <input name="name" required placeholder="Name" className="w-full rounded border px-3 py-2" />
        <input name="phone" required placeholder="Phone Number" className="w-full rounded border px-3 py-2" />
        <input name="proposed_amount" required type="number" min="0" step="0.01" placeholder="Proposed Amount" className="w-full rounded border px-3 py-2" />
        <label className="block text-xs text-slate-500">Date of Meet</label>
        <input name="meeting_date" type="date" className="w-full rounded border px-3 py-2" />
        <label className="block text-xs text-slate-500">Promised Date</label>
        <input name="proposed_date" type="date" className="w-full rounded border px-3 py-2" />
        <textarea name="notes" placeholder="Notes" className="w-full rounded border px-3 py-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Save Member</button>
      </form>
    </div>
  );
}
