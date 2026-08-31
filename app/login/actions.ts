'use server';

import { redirect } from 'next/navigation';
import { authenticate, clearSession, setSession } from '@/lib/auth';

export async function login(fd: FormData) {
  const result = await authenticate(String(fd.get('id') || ''));
  if (!result.ok) redirect(`/login?e=${result.reason}`);
  await setSession(result.session);
  redirect('/');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}
