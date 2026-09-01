'use client';

export default function ConfirmButton({
  action,
  message,
  children,
  className,
}: {
  action: (fd: FormData) => void | Promise<void>;
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button className={className}>{children}</button>
    </form>
  );
}
