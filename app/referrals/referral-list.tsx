'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReferredSponsorsTable, { sponsorTotals } from '@/app/sponsors/referred-table';
import { Money } from '@/app/money';

type MemberRow = {
  id: string;
  name: string;
  phone: string;
  sponsors: any[];
};

export default function ReferralList({ members, unassigned }: { members: MemberRow[]; unassigned: any[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const rows = [
    ...members,
    ...(unassigned.length ? [{ id: 'unassigned', name: 'Unassigned sponsors', phone: 'No referring member', sponsors: unassigned }] : []),
  ];

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {rows.map((m) => {
        const t = sponsorTotals(m.sponsors);
        const isOpen = open === m.id;
        return (
          <div key={m.id} className="border-b last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-slate-50"
              onClick={() => setOpen(isOpen ? null : m.id)}
            >
              <span className="w-3 shrink-0 text-slate-400">{isOpen ? '▾' : '▸'}</span>
              <span className="min-w-[12rem] shrink-0 font-semibold">{m.name}</span>
              <span className="hidden min-w-[8rem] shrink-0 text-sm text-slate-500 sm:inline">{m.phone}</span>
              <span className="ml-auto flex shrink-0 items-center gap-5 whitespace-nowrap text-sm">
                <span className="text-slate-600">{t.count} sponsors</span>
                <span>
                  <span className="mr-1 text-slate-500">Expected</span>
                  <Money value={t.expected} tone="expected" />
                </span>
                <span>
                  <span className="mr-1 text-slate-500">Earned</span>
                  <Money value={t.earned} tone="paid" />
                </span>
                <span>
                  <span className="mr-1 text-slate-500">Pending</span>
                  <Money value={t.pending} tone="pending" />
                </span>
              </span>
            </button>
            {isOpen ? (
              <div className="border-t bg-slate-50/70 px-4 py-3">
                {m.id !== 'unassigned' ? (
                  <Link className="mb-2 inline-block text-sm underline" href={`/members/${m.id}`}>
                    Open member
                  </Link>
                ) : null}
                <ReferredSponsorsTable sponsors={m.sponsors} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
