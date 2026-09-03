import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { addSponsorPayment, addSponsorNote, deleteSponsor } from './actions';
import ConfirmButton from '@/app/confirm-button';
import { Money } from '@/app/money';
import { isAdmin, requireSponsorAccess } from '@/lib/auth';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await createClient();
  const { data: m } = await s.from('sponsor_financial_summary').select('*').eq('id', id).maybeSingle();
  if (!m) notFound();
  const session = await requireSponsorAccess(m.member_id);
  const admin = isAdmin(session);
  const { data: payments } = await s.from('sponsor_payments').select('*').eq('sponsor_id', id).order('payment_date', { ascending: false });
  const { data: notes } = await s.from('sponsor_notes').select('*').eq('sponsor_id', id).order('created_at', { ascending: false });
  const p = payments ?? [];
  const n = notes ?? [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{m.name}</h1>
          <p>{m.phone}</p>
          {m.address ? <p className="text-sm text-slate-600">{m.address}</p> : null}
          <p className="text-sm text-slate-500">
            Referred by{' '}
            {m.member_id && m.referred_by && m.referred_by !== '-' ? (
              <Link className="underline" href={`/members/${m.member_id}`}>
                {m.referred_by}
              </Link>
            ) : (
              '-'
            )}
          </p>
        </div>
        {admin ? (
        <div className="flex items-center gap-3 text-sm">
          <Link className="rounded bg-slate-900 px-3 py-2 text-white" href={`/sponsors/${id}/edit`}>
            Edit
          </Link>
          <ConfirmButton
            action={deleteSponsor.bind(null, id)}
            message={`Delete ${m.name}? This also removes their payments and notes.`}
            className="rounded border border-red-300 px-3 py-2 text-red-600"
          >
            Delete
          </ConfirmButton>
        </div>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Expected</div>
          <b>
            <Money value={m.expected_amount} tone="expected" />
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
          <b>{m.status}</b>
        </div>
      </div>
      {admin ? <div className="grid gap-5 lg:grid-cols-2">
        <form action={addSponsorPayment.bind(null, id)} className="space-y-2 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Add Payment</h2>
          <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Amount" className="w-full rounded border px-3 py-2" />
          <input name="payment_date" type="date" required className="w-full rounded border px-3 py-2" />
          <input name="payment_method" placeholder="Payment Method" className="w-full rounded border px-3 py-2" />
          <textarea name="notes" placeholder="Payment Note" className="w-full rounded border px-3 py-2" />
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Add Payment</button>
        </form>
        <form action={addSponsorNote.bind(null, id)} className="space-y-2 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Add Note</h2>
          <textarea name="note" required rows={5} className="w-full rounded border px-3 py-2" />
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Add Note</button>
        </form>
      </div> : null}
      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Payment History</h2>
        {p.map((x: any) => (
          <div className="border-b py-2 text-sm" key={x.id}>
            <Money value={x.amount} tone="paid" /> • {x.payment_date} • {x.payment_method || 'Method not set'}
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
