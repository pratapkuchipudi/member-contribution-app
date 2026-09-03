'use client';

export default function DeleteReasonForm({
  action,
  confirmText,
}: {
  action: (fd: FormData) => void | Promise<void>;
  confirmText: string;
}) {
  return (
    <form
      action={action}
      className="mt-2 flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        const reason = new FormData(e.currentTarget).get('reason');
        if (!String(reason || '').trim()) {
          e.preventDefault();
          return;
        }
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input
        name="reason"
        required
        placeholder="Reason to delete"
        className="min-w-[12rem] flex-1 rounded border px-2 py-1 text-sm"
      />
      <button className="text-sm text-red-600 underline">Delete</button>
    </form>
  );
}
