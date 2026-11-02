export default function MeetingDateForm({
  action,
  defaultValue,
  compact = false,
}: {
  action: (fd: FormData) => void | Promise<void>;
  defaultValue?: string | null;
  compact?: boolean;
}) {
  return (
    <form action={action} className={compact ? 'flex items-center gap-1' : 'flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4'}>
      {compact ? null : (
        <div>
          <label className="block text-xs text-slate-500">Date of Meet</label>
          <input
            name="meeting_date"
            type="date"
            defaultValue={String(defaultValue || '').slice(0, 10)}
            className="rounded border px-3 py-2"
          />
        </div>
      )}
      {compact ? (
        <input
          name="meeting_date"
          type="date"
          defaultValue={String(defaultValue || '').slice(0, 10)}
          className="rounded border px-2 py-1"
        />
      ) : null}
      <button className={compact ? 'rounded bg-slate-900 px-2 py-1 text-xs text-white' : 'rounded bg-slate-900 px-4 py-2 text-white'}>
        Save
      </button>
    </form>
  );
}
