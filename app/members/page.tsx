import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { ensureMemberLoginIds } from '@/lib/login-id';
import { deleteMember } from './[id]/actions';
import ConfirmButton from '@/app/confirm-button';
import { Money } from '@/app/money';

export default async function Page() {
  await requireAdmin();
  await ensureMemberLoginIds();
  const s = await createClient();
  const { data } = await s.from('member_financial_summary').select('*').order('name');
  const { data: sponsors } = await s.from('sponsor_financial_summary').select('*');
  const m = data ?? [];
  const sponsorList = sponsors ?? [];
  const byMember = (id: string) => sponsorList.filter((x: any) => String(x.member_id) === String(id));
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-slate-500">Contribution commitments, payments and referred sponsors</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-lg border px-4 py-2" href="/referrals">
            View by member
          </Link>
          <Link className="rounded-lg bg-slate-900 px-4 py-2 text-white" href="/members/new">
            Add Member
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Login ID', 'Phone', 'Proposed', 'Paid', 'Pending', 'Sponsors', 'Earned', 'Promised Date', 'Status', 'Actions'].map((h) => (
                <th className="px-3 py-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.map((x: any) => {
              const referred = byMember(x.id);
              const earned = referred.reduce((a: number, s: any) => a + Number(s.total_paid || 0), 0);
              return (
              <tr className="border-t" key={x.id}>
                <td className="px-3 py-2">
                  <Link className="underline" href={`/members/${x.id}`}>
                    {x.name}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono">{x.login_id || '-'}</td>
                <td className="px-3 py-2">{x.phone}</td>
                <td className="px-3 py-2">
                  <Money value={x.proposed_amount} tone="expected" />
                </td>
                <td className="px-3 py-2">
                  <Money value={x.total_paid} tone="paid" />
                </td>
                <td className="px-3 py-2">
                  <Money value={x.pending_amount} tone="pending" />
                </td>
                <td className="px-3 py-2">
                  <Link className="underline" href={`/members/${x.id}#sponsors`}>
                    {referred.length}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Money value={earned} tone="paid" />
                </td>
                <td className="px-3 py-2">{x.proposed_date || '-'}</td>
                <td className="px-3 py-2">{x.payment_status}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Link className="underline" href={`/members/${x.id}/edit`}>
                      Edit
                    </Link>
                    <ConfirmButton
                      action={deleteMember.bind(null, x.id)}
                      message={`Delete ${x.name}? This also removes their payments and notes.`}
                      className="text-red-600 underline"
                    >
                      Delete
                    </ConfirmButton>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
