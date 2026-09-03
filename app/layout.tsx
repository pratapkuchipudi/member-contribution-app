import './globals.css';
import Link from 'next/link';
import { getSession, isAdmin, sessionLabel } from '@/lib/auth';
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

  const admin = isAdmin(session);

  return (
    <html>
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div>
              <b>Member Contribution Tracker</b>
              <div className="text-xs text-slate-500">
                {admin ? 'Members • Payments • Sponsors' : 'My details • My sponsors'}
                {isLocalDb() ? ' • Local test DB' : ''}
              </div>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/">Dashboard</Link>
              {admin ? (
                <>
                  <Link href="/members">Members</Link>
                  <Link href="/referrals">Referrals</Link>
                  <Link href="/sponsors">Sponsors</Link>
                  <Link href="/roles">Roles</Link>
                </>
              ) : (
                <>
                  <Link href={`/members/${session.memberId}`}>My details</Link>
                  <Link href="/sponsors">My sponsors</Link>
                </>
              )}
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
