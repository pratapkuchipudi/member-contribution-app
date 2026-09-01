import './globals.css';
import Link from 'next/link';
import { getSession, sessionLabel } from '@/lib/auth';
import { isLocalDb } from '@/lib/supabase/server';
import { logout } from './login/actions';
import ConventionBanner from './convention-banner';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const name = session ? await sessionLabel(session) : '';
  if (!session) {
    return (
      <html>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html>
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div>
              <b>Member Contribution Tracker</b>
              <div className="text-xs text-slate-500">
                Members • Payments • Sponsors
                {isLocalDb() ? ' • Local test DB' : ''}
              </div>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/">Dashboard</Link>
              <Link href="/members">Members</Link>
              <Link href="/referrals">Referrals</Link>
              <Link href="/sponsors">Sponsors</Link>
              <Link href="/roles">Roles</Link>
              <span className="text-slate-500">
                {name} · {session.id}
              </span>
              <form action={logout}>
                <button className="text-slate-700 underline">Sign out</button>
              </form>
            </nav>
          </div>
        </header>
        <ConventionBanner />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
