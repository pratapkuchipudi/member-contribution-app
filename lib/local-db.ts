import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type Row = Record<string, any>;
type Store = {
  members: Row[];
  payments: Row[];
  member_notes: Row[];
  sponsors: Row[];
  sponsor_payments: Row[];
  sponsor_notes: Row[];
  app_roles: Row[];
};

const dataDir = join(process.cwd(), 'data');
const dbPath = join(dataDir, 'local-db.json');

function emptyStore(): Store {
  return { members: [], payments: [], member_notes: [], sponsors: [], sponsor_payments: [], sponsor_notes: [], app_roles: [] };
}

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function read(): Store {
  if (!existsSync(dbPath)) return emptyStore();
  try {
    return { ...emptyStore(), ...JSON.parse(readFileSync(dbPath, 'utf8')) };
  } catch {
    return emptyStore();
  }
}

function write(store: Store) {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(dbPath, JSON.stringify(store, null, 2));
}

function paymentStatus(proposed: number, paid: number) {
  if (paid <= 0) return 'Not Paid';
  if (paid < proposed) return 'Partial';
  return 'Fully Paid';
}

function summaries(store: Store) {
  return store.members.map((m) => {
    const paid = store.payments
      .filter((p) => p.member_id === m.id)
      .reduce((a, p) => a + Number(p.amount || 0), 0);
    const proposed = Number(m.proposed_amount || 0);
    return {
      ...m,
      total_paid: paid,
      pending_amount: Math.max(proposed - paid, 0),
      payment_status: paymentStatus(proposed, paid),
    };
  });
}

function sponsorsWithMembers(store: Store) {
  return store.sponsors.map((s) => {
    const member = store.members.find((m) => m.id === s.member_id);
    return { ...s, members: member ? { name: member.name } : null };
  });
}

function sponsorSummaries(store: Store) {
  return store.sponsors.map((s) => {
    const paid = store.sponsor_payments
      .filter((p) => p.sponsor_id === s.id)
      .reduce((a, p) => a + Number(p.amount || 0), 0);
    const expected = Number(s.expected_amount || 0);
    const member = store.members.find((m) => m.id === s.member_id);
    return {
      ...s,
      total_paid: paid,
      pending_amount: Math.max(expected - paid, 0),
      payment_status: paymentStatus(expected, paid),
      referred_by: member?.name || '-',
      members: member ? { name: member.name } : null,
    };
  });
}

function rowsFor(table: string, store: Store): Row[] {
  if (table === 'member_financial_summary') return summaries(store);
  if (table === 'sponsor_financial_summary') return sponsorSummaries(store);
  if (table === 'sponsors') return sponsorsWithMembers(store);
  return (store[table as keyof Store] || []).map((r) => ({ ...r }));
}

function baseTable(table: string): keyof Store | null {
  if (table === 'members' || table === 'member_financial_summary') return 'members';
  if (table === 'sponsors' || table === 'sponsor_financial_summary') return 'sponsors';
  if (table === 'payments' || table === 'member_notes' || table === 'sponsor_payments' || table === 'sponsor_notes' || table === 'app_roles') {
    return table;
  }
  return null;
}

class Query {
  private table: string;
  private filters: Array<[string, any]> = [];
  private sort: { column: string; ascending: boolean } | null = null;
  private wantSingle = false;
  private mode: 'select' | 'update' | 'delete' = 'select';
  private patch: Row = {};

  constructor(table: string) {
    this.table = table;
  }

  select(_columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push([column, value]);
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.sort = { column, ascending: opts?.ascending !== false };
    return this;
  }

  single() {
    this.wantSingle = true;
    return this;
  }

  maybeSingle() {
    this.wantSingle = true;
    return this;
  }

  async insert(row: Row) {
    const store = read();
    const table = this.table as keyof Store;
    const record = {
      id: id(),
      created_at: now(),
      updated_at: now(),
      ...row,
    };
    if (!store[table]) return { error: { message: `Unknown table ${this.table}` } };
    store[table].push(record);
    write(store);
    return { data: record, error: null };
  }

  update(row: Row) {
    this.mode = 'update';
    this.patch = row;
    return this;
  }

  delete() {
    this.mode = 'delete';
    return this;
  }

  private matches(row: Row) {
    return this.filters.every(([column, value]) => String(row[column]) === String(value));
  }

  private runUpdate() {
    const table = baseTable(this.table);
    if (!table) return { data: null, error: { message: `Unknown table ${this.table}` } };
    const store = read();
    store[table] = store[table].map((row) => (this.matches(row) ? { ...row, ...this.patch, updated_at: now() } : row));
    write(store);
    return { data: null, error: null };
  }

  private runDelete() {
    const table = baseTable(this.table);
    if (!table) return { data: null, error: { message: `Unknown table ${this.table}` } };
    const store = read();
    const removed = store[table].filter((row) => this.matches(row)).map((row) => row.id);
    store[table] = store[table].filter((row) => !this.matches(row));
    if (table === 'members') {
      store.payments = store.payments.filter((row) => !removed.includes(row.member_id));
      store.member_notes = store.member_notes.filter((row) => !removed.includes(row.member_id));
      store.sponsors = store.sponsors.map((row) => (removed.includes(row.member_id) ? { ...row, member_id: null } : row));
    }
    if (table === 'sponsors') {
      store.sponsor_payments = store.sponsor_payments.filter((row) => !removed.includes(row.sponsor_id));
      store.sponsor_notes = store.sponsor_notes.filter((row) => !removed.includes(row.sponsor_id));
    }
    write(store);
    return { data: null, error: null };
  }

  private execute() {
    let rows = rowsFor(this.table, read());
    for (const [column, value] of this.filters) {
      rows = rows.filter((r) => String(r[column]) === String(value));
    }
    if (this.sort) {
      const { column, ascending } = this.sort;
      rows.sort((a, b) => {
        const av = a[column] ?? '';
        const bv = b[column] ?? '';
        return ascending
          ? String(av).localeCompare(String(bv), undefined, { numeric: true })
          : String(bv).localeCompare(String(av), undefined, { numeric: true });
      });
    }
    if (this.wantSingle) return { data: rows[0] ?? null, error: null };
    return { data: rows, error: null };
  }

  then<T>(resolve: (value: { data: any; error: any }) => T, reject?: (reason: any) => T) {
    try {
      const result = this.mode === 'update' ? this.runUpdate() : this.mode === 'delete' ? this.runDelete() : this.execute();
      return Promise.resolve(resolve(result));
    } catch (err) {
      if (reject) return Promise.resolve(reject(err));
      return Promise.reject(err);
    }
  }
}

export function createLocalClient() {
  return {
    from(table: string) {
      return new Query(table);
    },
  };
}
