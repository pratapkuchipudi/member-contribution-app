import type { Role } from '@/lib/session';

export type AdminRecord = { id: string; name: string; role: Role };

export const STARTER_ADMINS: AdminRecord[] = [
  { id: '8191', name: 'Ratnakumar', role: 'admin' },
  { id: '45190', name: 'Sudhakar', role: 'admin' },
  { id: '5795', name: 'Dr.Joe', role: 'admin' },
  { id: '60783', name: 'Pratap', role: 'admin' },
  { id: '9414', name: 'Dr.Paul', role: 'admin' },
];
