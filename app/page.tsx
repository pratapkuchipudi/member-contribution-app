import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getSession, isAdmin } from '@/lib/auth';
import { Money } from '@/app/money';
import { TARGET_FUND, fundTotals } from '@/lib/fund';
import ReferredSponsorsTable from '@/app/sponsors/referred-table';

function countStatus(rows: any[], status: string) {
  return rows.filter((row) => row.payment_status === status).length;
}

function Panel({
  title,
  action,
  accent,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm ${accent}`}>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{children}</div>
    </div>
  );
}

export default async function Page() {
  const session = await getSession();
  const s = await createClient();
  const { data: members, error: memberError } = await s.from('member_financial_summary').select('*');
  const { data: sponsors, error: sponsorError } = await s.from('sponsor_financial_summary').select('*');
  const allMembers = members ?? [];
  const allSponsors = sponsors ?? [];
  const mine = !isAdmin(session);
  const m = mine ? allMembers.filter((row: any) => row.id === session?.memberId) : allMembers;
  const sp = mine ? allSponsors.filter((row: any) => row.member_id === session?.memberId) : allSponsors;
  const t = fundTotals(m, sp);
  const today = new Date().toISOString().slice(0, 10);
  const dueMembers = m.filter((x: any) => x.proposed_date && x.proposed_date <= today && Number(x.pending_amount) > 0);
  const dueSponsors = sp.filter((x: any) => x.meeting_date && x.meeting_date <= today && Number(x.pending_amount) > 0);
  const error = memberError || sponsorError;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{mine ? 'My dashboard' : 'Dashboard'}</h1>
      {error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          {error.message}. If tables are missing, run <code>supabase/schema.sql</code> in the Supabase SQL Editor.
        </div>
      ) : null}

      {!mine ? (
        <Panel title="Overall" accent="border-l-4 border-l-slate-800">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card label="Target Fund">
              <Money value={TARGET_FUND} tone="expected" />
            </Card>
            <Card label="Required Still">
              <Money value={t.requiredStill} tone="pending" />
            </Card>
            <Card label="All Received">
              <Money value={t.received} tone="paid" />
            </Card>
            <Card label="All Pending">
              <Money value={t.pending} tone="pending" />
            </Card>
            <Card label="Pending vs Target">
              <Money value={t.pendingVsTarget} tone="pending" />
            </Card>
            <Card label="People">
              {m.length + sp.length}
              <div className="text-xs font-normal text-slate-500">
                {m.length} members · {sp.length} sponsors
              </div>
            </Card>
            <Card label="Fully Paid">{countStatus(m, 'Fully Paid') + countStatus(sp, 'Fully Paid')}</Card>
          </div>
        </Panel>
      ) : null}

      <Panel
        title={mine ? 'My contribution' : 'Members'}
        accent="border-l-4 border-l-blue-600"
        action={
          !mine ? (
            <Link className="text-sm underline" href="/members">
              View members
            </Link>
          ) : m[0] ? (
            <Link className="text-sm underline" href={`/members/${m[0].id}`}>
              My details
            </Link>
          ) : null
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label={mine ? 'Login ID' : 'Members'}>{mine ? session?.id : m.length}</Card>
          <Card label="Proposed">
            <Money value={t.memberProposed} tone="expected" />
          </Card>
          <Card label="Received">
            <Money value={t.memberPaid} tone="paid" />
          </Card>
          <Card label="Pending">
            <Money value={t.memberPending} tone="pending" />
          </Card>
          <Card label="Fully Paid">{countStatus(m, 'Fully Paid')}</Card>
          <Card label="Partial">{countStatus(m, 'Partial')}</Card>
          <Card label="Due/Overdue">{dueMembers.length}</Card>
        </div>
        {!mine ? (
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Due / Overdue Members</h3>
            {dueMembers.map((x: any) => (
              <div key={x.id} className="flex justify-between border-b py-2 text-sm last:border-b-0">
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
        ) : null}
      </Panel>

      <Panel
        title={mine ? 'My sponsors' : 'Sponsors'}
        accent="border-l-4 border-l-emerald-600"
        action={
          <Link className="text-sm underline" href="/sponsors">
            {mine ? 'View my sponsors' : 'View sponsors'}
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Sponsors">{sp.length}</Card>
          <Card label="Expected">
            <Money value={t.sponsorExpected} tone="expected" />
          </Card>
          <Card label="Received">
            <Money value={t.sponsorPaid} tone="paid" />
          </Card>
          <Card label="Pending">
            <Money value={t.sponsorPending} tone="pending" />
          </Card>
          <Card label="Fully Paid">{countStatus(sp, 'Fully Paid')}</Card>
          <Card label="Partial">{countStatus(sp, 'Partial')}</Card>
          <Card label="Due/Overdue">{dueSponsors.length}</Card>
        </div>
        {mine ? (
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Sponsor details</h3>
            </div>
            <ReferredSponsorsTable sponsors={sp} />
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Due / Overdue Sponsors</h3>
            {dueSponsors.map((x: any) => (
              <div key={x.id} className="flex justify-between border-b py-2 text-sm last:border-b-0">
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
        )}
      </Panel>
    </div>
  );
}
