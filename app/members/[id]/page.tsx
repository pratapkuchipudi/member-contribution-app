import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { addPayment, addNote, deleteMember, deletePayment } from './actions';
import ConfirmButton from '@/app/confirm-button';
import DeleteReasonForm from '@/app/delete-reason-form';
import ReferredSponsorsTable, { sponsorTotals } from '@/app/sponsors/referred-table';
import { Money } from '@/app/money';
import { isAdmin, requireMemberAccess } from '@/lib/auth';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMemberAccess(id);
  const admin = isAdmin(session);
  const s = await createClient();
  const { data: m } = await s.from('member_financial_summary').select('*').eq('id', id).maybeSingle();
  if (!m) notFound();
  const { data: payments } = await s.from('payments').select('*').eq('member_id', id).order('payment_date', { ascending: false });
  const { data: notes } = await s.from('member_notes').select('*').eq('member_id', id).order('created_at', { ascending: false });
  const { data: sponsors } = await s.from('sponsor_financial_summary').select('*').eq('member_id', id).order('name');
  const p = payments ?? [];
  const n = notes ?? [];
  const referred = sponsors ?? [];
  const t = sponsorTotals(referred);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{m.name}</h1>
          <p>{m.phone}</p>
          {m.login_id ? <p className="text-sm text-slate-500">Login ID <span className="font-mono font-semibold text-slate-800">{m.login_id}</span></p> : null}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link className="rounded bg-slate-900 px-3 py-2 text-white" href={`/members/${id}/edit`}>
            Edit
          </Link>
          {admin ? (
            <ConfirmButton
              action={deleteMember.bind(null, id)}
              message={`Delete ${m.name}? This also removes their payments and notes.`}
              className="rounded border border-red-300 px-3 py-2 text-red-600"
            >
              Delete
            </ConfirmButton>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Proposed</div>
          <b>
            <Money value={m.proposed_amount} tone="expected" />
          </b>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Paid</div>
          <b>
            <Money value={m.total_paid} tone="paid" />
          </b>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Pending</div>
          <b>
            <Money value={m.pending_amount} tone="pending" />
          </b>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Status</div>
          <b>{m.payment_status}</b>
        </div>
      </div>
      <div id="sponsors" className="rounded-xl border bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="font-semibold">Sponsors referred</h2>
            <p className="text-sm text-slate-500">Expected, earned and status for each sponsor</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <div className="text-xs text-slate-500">Sponsors</div>
              <b>{t.count}</b>
            </div>
            <div>
              <div className="text-xs text-slate-500">Expected</div>
              <b>
                <Money value={t.expected} tone="expected" />
              </b>
            </div>
            <div>
              <div className="text-xs text-slate-500">Earned</div>
              <b>
                <Money value={t.earned} tone="paid" />
              </b>
            </div>
            <div>
              <div className="text-xs text-slate-500">Pending</div>
              <b>
                <Money value={t.pending} tone="pending" />
              </b>
            </div>
          </div>
        </div>
        <ReferredSponsorsTable sponsors={referred} />
      </div>
      {admin ? <div className="grid gap-5 lg:grid-cols-2">
        <form action={addPayment.bind(null, id)} className="space-y-2 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Add Payment</h2>
          <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Amount" className="w-full rounded border px-3 py-2" />
          <input name="payment_date" type="date" required className="w-full rounded border px-3 py-2" />
          <input name="payment_method" placeholder="Payment Method" className="w-full rounded border px-3 py-2" />
          <textarea name="notes" placeholder="Payment Note" className="w-full rounded border px-3 py-2" />
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Add Payment</button>
        </form>
        <form action={addNote.bind(null, id)} className="space-y-2 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Add Note</h2>
          <textarea name="note" required rows={5} className="w-full rounded border px-3 py-2" />
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Add Note</button>
        </form>
      </div> : null}
      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Payment History</h2>
        {p.map((x: any) => (
          <div className="border-b py-2 text-sm" key={x.id}>
            <div>
              <Money value={x.amount} tone="paid" /> • {x.payment_date} • {x.payment_method || 'Method not set'}
              {x.notes ? <span className="text-slate-500"> • {x.notes}</span> : null}
            </div>
            {admin ? (
              <DeleteReasonForm
                action={deletePayment.bind(null, id, x.id)}
                confirmText={`Delete this ${Number(x.amount || 0).toLocaleString('en-IN')} payment?`}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Notes</h2>
        {n.map((x: any) => (
          <div className="border-b py-2 text-sm" key={x.id}>
            {x.note}
          </div>
        ))}
      </div>
    </div>
  );
}
