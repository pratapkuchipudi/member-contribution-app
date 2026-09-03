import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import ReferralList from './referral-list';

export default async function Page() {
  await requireAdmin();
  const s = await createClient();
  const { data: members } = await s.from('member_financial_summary').select('*').order('name');
  const { data: sponsors } = await s.from('sponsor_financial_summary').select('*').order('name');
  const memberList = members ?? [];
  const sponsorList = sponsors ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Sponsors by Member</h1>
        <p className="text-sm text-slate-500">Click a member to see their sponsors, expected, earned and status</p>
      </div>
      <ReferralList
        members={memberList.map((m: any) => ({
          id: m.id,
          name: m.name,
          phone: m.phone,
          sponsors: sponsorList.filter((x: any) => String(x.member_id) === String(m.id)),
        }))}
        unassigned={sponsorList.filter((x: any) => !x.member_id)}
      />
    </div>
  );
}
