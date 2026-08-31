import { listRoles, requireAdmin } from '@/lib/auth';
import { addRole } from './actions';

export default async function Page() {
  await requireAdmin();
  const roles = await listRoles();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Roles</h1>
        <p className="text-sm text-slate-500">These IDs have admin access and can do everything.</p>
      </div>
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
                <td className="px-3 py-2">{row.id}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 capitalize">{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
