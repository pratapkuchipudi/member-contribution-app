import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Money } from '@/app/money';
import { TARGET_FUND, fundTotals } from '@/lib/fund';

function countStatus(rows: any[], status: string) {
  return rows.filter((row) => row.payment_status === status).length;
}

export default async function Page() {
  const s = await createClient();
  const { data: members, error: memberError } = await s.from('member_financial_summary').select('*');
  const { data: sponsors, error: sponsorError } = await s.from('sponsor_financial_summary').select('*');
  const m = members ?? [];
  const sp = sponsors ?? [];
  const t = fundTotals(m, sp);
  const today = new Date().toISOString().slice(0, 10);
  const dueMembers = m.filter((x: any) => x.proposed_date && x.proposed_date <= today && Number(x.pending_amount) > 0);
  const dueSponsors = sp.filter((x: any) => x.meeting_date && x.meeting_date <= today && Number(x.pending_amount) > 0);
  const error = memberError || sponsorError;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          {error.message}. If tables are missing, run <code>supabase/schema.sql</code> in the Supabase SQL Editor.
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 font-semibold">Overall</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Target Fund</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={TARGET_FUND} tone="expected" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Required Still</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.requiredStill} tone="pending" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">All Received</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.received} tone="paid" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">All Pending</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.pending} tone="pending" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Pending vs Target</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.pendingVsTarget} tone="pending" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">People</div>
            <div className="mt-1 text-2xl font-bold">{m.length + sp.length}</div>
            <div className="text-xs text-slate-500">
              {m.length} members · {sp.length} sponsors
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Fully Paid</div>
            <div className="mt-1 text-2xl font-bold">{countStatus(m, 'Fully Paid') + countStatus(sp, 'Fully Paid')}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Members</h2>
          <Link className="text-sm underline" href="/members">
            View members
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Members</div>
            <div className="mt-1 text-2xl font-bold">{m.length}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Proposed</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.memberProposed} tone="expected" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Received</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.memberPaid} tone="paid" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Pending</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.memberPending} tone="pending" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Fully Paid</div>
            <div className="mt-1 text-2xl font-bold">{countStatus(m, 'Fully Paid')}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Partial</div>
            <div className="mt-1 text-2xl font-bold">{countStatus(m, 'Partial')}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Due/Overdue</div>
            <div className="mt-1 text-2xl font-bold">{dueMembers.length}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Sponsors</h2>
          <Link className="text-sm underline" href="/sponsors">
            View sponsors
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Sponsors</div>
            <div className="mt-1 text-2xl font-bold">{sp.length}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Expected</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.sponsorExpected} tone="expected" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Received</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.sponsorPaid} tone="paid" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Pending</div>
            <div className="mt-1 text-2xl font-bold">
              <Money value={t.sponsorPending} tone="pending" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Fully Paid</div>
            <div className="mt-1 text-2xl font-bold">{countStatus(sp, 'Fully Paid')}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Partial</div>
            <div className="mt-1 text-2xl font-bold">{countStatus(sp, 'Partial')}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-slate-500">Due/Overdue</div>
            <div className="mt-1 text-2xl font-bold">{dueSponsors.length}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Due / Overdue Members</h2>
          {dueMembers.map((x: any) => (
            <div key={x.id} className="flex justify-between border-b py-2 text-sm">
              <Link className="underline" href={`/members/${x.id}`}>
                {x.name}
              </Link>
              <span>
                <Money value={x.pending_amount} tone="pending" /> pending • {x.proposed_date}
              </span>
            </div>
          ))}
          {!dueMembers.length ? <p className="mt-2 text-sm text-slate-500">No overdue members.</p> : null}
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Due / Overdue Sponsors</h2>
          {dueSponsors.map((x: any) => (
            <div key={x.id} className="flex justify-between border-b py-2 text-sm">
              <Link className="underline" href={`/sponsors/${x.id}`}>
                {x.name}
              </Link>
              <span>
                <Money value={x.pending_amount} tone="pending" /> pending • {x.meeting_date}
              </span>
            </div>
          ))}
          {!dueSponsors.length ? <p className="mt-2 text-sm text-slate-500">No overdue sponsors.</p> : null}
        </div>
      </div>
    </div>
  );
}
