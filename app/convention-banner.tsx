import { createClient } from '@/lib/supabase/server';
import { getSession, isAdmin } from '@/lib/auth';
import { TARGET_FUND, fundTotals } from '@/lib/fund';

const money = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default async function ConventionBanner() {
  const session = await getSession();
  if (!isAdmin(session)) return null;
  const s = await createClient();
  const { data: members } = await s.from('member_financial_summary').select('proposed_amount,total_paid,pending_amount');
  const { data: sponsors } = await s.from('sponsor_financial_summary').select('expected_amount,total_paid,pending_amount');
  const t = fundTotals(members ?? [], sponsors ?? []);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-indigo-200">58_National_Convention_2027</div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Vijayawada</h2>
          <p className="mt-1 text-sm text-indigo-100">Finance Committee</p>
        </div>
        <div className="grid min-w-[18rem] grid-cols-2 gap-3 rounded-xl bg-white/10 p-4 ring-1 ring-white/20 sm:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-indigo-200">Target Fund</div>
            <div className="mt-1 text-xl font-bold text-blue-300">{money(TARGET_FUND)}</div>
          </div>
          <div>
            <div className="text-xs uppercase leading-tight tracking-wide text-indigo-200">All Proposed</div>
            <div className="text-[10px] text-indigo-200">(members and sponsors)</div>
            <div className="mt-1 text-xl font-bold text-blue-300">{money(t.proposed)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-indigo-200">Required Still</div>
            <div className="mt-1 text-xl font-bold text-red-400">{money(t.requiredStill)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-indigo-200">Pending</div>
            <div className="mt-1 text-xl font-bold text-red-400">{money(t.pendingVsTarget)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
