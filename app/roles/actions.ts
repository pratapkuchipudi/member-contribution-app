'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, saveRole } from '@/lib/auth';

export async function addRole(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get('id') || '').trim();
  const name = String(fd.get('name') || '').trim();
  if (!id) return;
  await saveRole(id, name, 'admin');
  revalidatePath('/roles');
}
