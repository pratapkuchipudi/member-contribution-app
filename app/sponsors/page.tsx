import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, requireSession } from '@/lib/auth';
import { deleteSponsor } from './[id]/actions';
import ConfirmButton from '@/app/confirm-button';
import { Money } from '@/app/money';

export default async function Page() {
  const session = await requireSession();
  const admin = isAdmin(session);
  const s = await createClient();
  const { data } = await s.from('sponsor_financial_summary').select('*').order('name');
  const rows = (data ?? []).filter((x: any) => admin || x.member_id === session.memberId);
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">{admin ? 'Sponsors' : 'My sponsors'}</h1>
          <p className="text-sm text-slate-500">Referrals, expected amounts and payments</p>
        </div>
        {admin ? (
          <Link className="rounded-lg bg-slate-900 px-4 py-2 text-white" href="/sponsors/new">
            Add Sponsor
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[...(admin ? ['Name', 'Phone', 'Address', 'Referrer', 'Expected', 'Paid', 'Pending', 'Meeting Date', 'Status', 'Actions'] : ['Name', 'Phone', 'Address', 'Expected', 'Paid', 'Pending', 'Meeting Date', 'Status'])].map((h) => (
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
                  <Link className="underline" href={`/sponsors/${x.id}`}>
                    {x.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{x.phone}</td>
                <td className="max-w-xs px-3 py-2">{x.address || '-'}</td>
                {admin ? (
                <td className="px-3 py-2">
                  {x.member_id && x.referred_by && x.referred_by !== '-' ? (
                    <Link className="underline" href={`/members/${x.member_id}`}>
                      {x.referred_by}
                    </Link>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                ) : null}
                <td className="px-3 py-2">
                  <Money value={x.expected_amount} tone="expected" />
                </td>
                <td className="px-3 py-2">
                  <Money value={x.total_paid} tone="paid" />
                </td>
                <td className="px-3 py-2">
                  <Money value={x.pending_amount} tone="pending" />
                </td>
                <td className="px-3 py-2">{x.meeting_date || '-'}</td>
                <td className="px-3 py-2">{x.status}</td>
                {admin ? (
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Link className="underline" href={`/sponsors/${x.id}/edit`}>
                      Edit
                    </Link>
                    <ConfirmButton
                      action={deleteSponsor.bind(null, x.id)}
                      message={`Delete ${x.name}? This also removes their payments and notes.`}
                      className="text-red-600 underline"
                    >
                      Delete
                    </ConfirmButton>
                  </div>
                </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
