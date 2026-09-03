import { login } from './actions';

const messages: Record<string, string> = {
  missing: 'Enter an ID.',
  denied: 'This ID was not recognized.',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold">Enter your ID</h1>
          <p className="mt-1 text-sm text-slate-500">Admins use their ID. Members use the 5-character ID given to them.</p>
        </div>
        <form action={login} className="space-y-3">
          <input name="id" required autoFocus placeholder="Your ID" className="w-full rounded border px-3 py-2" />
          {e && messages[e] ? <p className="text-sm text-red-600">{messages[e]}</p> : null}
          <button className="w-full rounded bg-slate-900 px-4 py-2 text-white">Continue</button>
        </form>
      </div>
    </div>
  );
}
