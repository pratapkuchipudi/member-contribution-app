import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { Money } from '@/app/money';

function meetDate(row: any) {
  return String(row.meeting_date || '').slice(0, 10);
}

function contactedOnOrBefore(rows: any[], today: string) {
  return rows.filter((row) => {
    const date = meetDate(row);
    return date && date <= today;
  });
}

function sum(rows: any[], key: string) {
  return rows.reduce((a: number, x: any) => a + Number(x[key] || 0), 0);
}

function SummaryCards({
  countLabel,
  count,
  total,
  proposed,
  given,
  pending,
}: {
  countLabel: string;
  count: number;
  total: number;
  proposed: number;
  given: number;
  pending: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-500">{countLabel}</div>
        <div className="mt-1 text-2xl font-bold">{count}</div>
        <div className="text-xs text-slate-500">of {total}</div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-500">Proposed amount</div>
        <div className="mt-1 text-2xl font-bold">
          <Money value={proposed} tone="expected" />
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-500">Given amount</div>
        <div className="mt-1 text-2xl font-bold">
          <Money value={given} tone="paid" />
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-500">Pending</div>
        <div className="mt-1 text-2xl font-bold">
          <Money value={pending} tone="pending" />
        </div>
      </div>
    </div>
  );
}

function ContactTable({
  rows,
  href,
  extra,
  empty,
}: {
  rows: any[];
  href: (row: any) => string;
  extra?: { label: string; value: (row: any) => string }[];
  empty: string;
}) {
  const extraCols = extra ?? [];
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {['Name', ...extraCols.map((c) => c.label), 'Phone', 'Date of Meet', 'Proposed Amount', 'Given Amount', 'Pending', 'Status'].map((h) => (
              <th className="px-3 py-2 text-left" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((x: any) => (
            <tr className="border-t" key={x.id}>
              <td className="px-3 py-2">
                <Link className="underline" href={href(x)}>
                  {x.name}
                </Link>
              </td>
              {extraCols.map((c) => (
                <td className="px-3 py-2" key={c.label}>
                  {c.value(x)}
                </td>
              ))}
              <td className="px-3 py-2">{x.phone}</td>
              <td className="px-3 py-2">{meetDate(x) || '-'}</td>
              <td className="px-3 py-2">
                <Money value={x.proposed_amount ?? x.expected_amount} tone="expected" />
              </td>
              <td className="px-3 py-2">
                <Money value={x.total_paid} tone="paid" />
              </td>
              <td className="px-3 py-2">
                <Money value={x.pending_amount} tone="pending" />
              </td>
              <td className="px-3 py-2">{x.payment_status || x.status}</td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td className="px-3 py-4 text-slate-500" colSpan={7 + extraCols.length}>
                {empty}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default async function Page() {
  await requireAdmin();
  const s = await createClient();
  const { data: memberData } = await s.from('member_financial_summary').select('*').order('name');
  const { data: sponsorData } = await s.from('sponsor_financial_summary').select('*').order('name');
  const members = memberData ?? [];
  const sponsors = sponsorData ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const asOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const contactedMembers = contactedOnOrBefore(members, today);
  const contactedSponsors = contactedOnOrBefore(sponsors, today);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contact report</h1>
          <p className="text-sm text-slate-500">Members and sponsors contacted so far, with date of meet, proposed amount and given amount.</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-slate-500">As on today</div>
          <div className="text-lg font-semibold">{asOn}</div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Members</h2>
        <SummaryCards
          countLabel="Members contacted"
          count={contactedMembers.length}
          total={members.length}
          proposed={sum(contactedMembers, 'proposed_amount')}
          given={sum(contactedMembers, 'total_paid')}
          pending={sum(contactedMembers, 'pending_amount')}
        />
        <ContactTable
          rows={contactedMembers}
          href={(x) => `/members/${x.id}`}
          extra={[{ label: 'Login ID', value: (x) => x.login_id || '-' }]}
          empty="No members contacted as on today. Add a Date of Meet on the member."
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Sponsors</h2>
        <SummaryCards
          countLabel="Sponsors contacted"
          count={contactedSponsors.length}
          total={sponsors.length}
          proposed={sum(contactedSponsors, 'expected_amount')}
          given={sum(contactedSponsors, 'total_paid')}
          pending={sum(contactedSponsors, 'pending_amount')}
        />
        <ContactTable
          rows={contactedSponsors}
          href={(x) => `/sponsors/${x.id}`}
          extra={[{ label: 'Referrer', value: (x) => (x.referred_by && x.referred_by !== '-' ? x.referred_by : '-') }]}
          empty="No sponsors contacted as on today. Add a Date of Meet on the sponsor."
        />
      </section>
    </div>
  );
}
