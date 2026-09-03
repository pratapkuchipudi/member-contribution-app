import Link from 'next/link';
import { listRoles, requireAdmin } from '@/lib/auth';
import { ensureMemberLoginIds } from '@/lib/login-id';
import { createClient } from '@/lib/supabase/server';
import { addRole } from './actions';
import { resetMemberLoginId } from '@/app/members/[id]/actions';
import ConfirmButton from '@/app/confirm-button';

export default async function Page() {
  await requireAdmin();
  await ensureMemberLoginIds();
  const roles = await listRoles();
  const s = await createClient();
  const { data } = await s.from('members').select('id,name,phone,login_id').order('name');
  const members = data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Roles</h1>
        <p className="text-sm text-slate-500">Admin IDs and member login IDs. If a member forgets their ID, give them the ID from this list.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Admins</h2>
        <form action={addRole} className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
          <input name="id" required placeholder="ID" className="rounded border px-3 py-2" />
          <input name="name" placeholder="Name" className="rounded border px-3 py-2" />
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Add admin</button>
        </form>
        <div className="rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((row) => (
                <tr className="border-t" key={row.id}>
                  <td className="px-3 py-2 font-mono">{row.id}</td>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2 capitalize">{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Members</h2>
        <p className="text-sm text-slate-500">Each member logs in with this 5-character ID. Share it with them if they forget it.</p>
        <div className="rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Login ID</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((row: any) => (
                <tr className="border-t" key={row.id}>
                  <td className="px-3 py-2 font-mono text-base font-semibold">{row.login_id || '-'}</td>
                  <td className="px-3 py-2">
                    <Link className="underline" href={`/members/${row.id}`}>
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{row.phone}</td>
                  <td className="px-3 py-2">
                    <ConfirmButton
                      action={resetMemberLoginId.bind(null, row.id)}
                      message={`Create a new login ID for ${row.name}? Their current ID will stop working.`}
                      className="text-slate-700 underline"
                    >
                      New ID
                    </ConfirmButton>
                  </td>
                </tr>
              ))}
              {!members.length ? (
                <tr>
                  <td className="px-3 py-3 text-sm text-slate-500" colSpan={4}>
                    No members yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
