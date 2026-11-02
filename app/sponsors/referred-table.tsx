import Link from 'next/link';
import { Money } from '@/app/money';

export function sponsorTotals(sponsors: any[]) {
  return {
    count: sponsors.length,
    expected: sponsors.reduce((a, x) => a + Number(x.expected_amount || 0), 0),
    earned: sponsors.reduce((a, x) => a + Number(x.total_paid || 0), 0),
    pending: sponsors.reduce((a, x) => a + Number(x.pending_amount || 0), 0),
  };
}

export default function ReferredSponsorsTable({ sponsors }: { sponsors: any[] }) {
  if (!sponsors.length) {
    return <p className="px-3 py-4 text-sm text-slate-500">No sponsors referred yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {['Sponsor', 'Date of Meet', 'Expected', 'Earned', 'Pending', 'Payment', 'Status'].map((h) => (
              <th className="px-3 py-2 text-left" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sponsors.map((x: any) => (
            <tr className="border-t" key={x.id}>
              <td className="px-3 py-2">
                <Link className="underline" href={`/sponsors/${x.id}`}>
                  {x.name}
                </Link>
              </td>
              <td className="px-3 py-2">{x.meeting_date || '-'}</td>
              <td className="px-3 py-2">
                <Money value={x.expected_amount} tone="expected" />
              </td>
              <td className="px-3 py-2">
                <Money value={x.total_paid} tone="paid" />
              </td>
              <td className="px-3 py-2">
                <Money value={x.pending_amount} tone="pending" />
              </td>
              <td className="px-3 py-2">{x.payment_status}</td>
              <td className="px-3 py-2">{x.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
