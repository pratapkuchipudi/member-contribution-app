import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type Row = Record<string, any>;
type Store = {
  members: Row[];
  payments: Row[];
  member_notes: Row[];
  sponsors: Row[];
  app_roles: Row[];
};

const dataDir = join(process.cwd(), 'data');
const dbPath = join(dataDir, 'local-db.json');

function emptyStore(): Store {
  return { members: [], payments: [], member_notes: [], sponsors: [], app_roles: [] };
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

function rowsFor(table: string, store: Store): Row[] {
  if (table === 'member_financial_summary') return summaries(store);
  if (table === 'sponsors') return sponsorsWithMembers(store);
  return (store[table as keyof Store] || []).map((r) => ({ ...r }));
}

class Query {
  private table: string;
  private filters: Array<[string, any]> = [];
  private sort: { column: string; ascending: boolean } | null = null;
  private wantSingle = false;

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

  then<T>(resolve: (value: { data: any; error: null }) => T, reject?: (reason: any) => T) {
    try {
      return Promise.resolve(resolve(this.execute()));
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
