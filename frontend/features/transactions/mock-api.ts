import type {
  Transaction,
  TransactionFilters,
  UpdateTransactionPayload,
  BulkRecategorizePayload,
  Category,
  TransactionType,
  TransactionStatus,
} from "./types";
import { CATEGORIES } from "./types";

const COUNTERPARTIES = [
  "Saudi Aramco", "SABIC", "Al Rajhi Bank", "STC", "Mobily",
  "Jarir Bookstore", "Panda Retail", "Careem", "Noon", "Amazon SA",
  "Ministry of Finance", "GOSI", "Zain KSA", "Riyad Bank", "NCB",
];

const ACCOUNTS = [
  { id: "acc-001", name: "Al Rajhi Current" },
  { id: "acc-002", name: "Riyad Bank Savings" },
  { id: "acc-003", name: "NCB Business" },
];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransactions(): Transaction[] {
  const txns: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 120; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 90));
    const isInflow = Math.random() > 0.45;
    const amount = isInflow
      ? Math.round((Math.random() * 180000 + 5000) * 100) / 100
      : -Math.round((Math.random() * 95000 + 1000) * 100) / 100;
    const account = randomItem(ACCOUNTS);
    const category = randomItem(CATEGORIES);
    const types: TransactionType[] = ["inflow", "outflow", "transfer"];
    const statuses: TransactionStatus[] = ["cleared", "pending", "reconciled"];

    txns.push({
      id: `txn-${String(i + 1).padStart(4, "0")}`,
      tenant_id: "tenant-001",
      txn_date: d.toISOString().slice(0, 10),
      amount,
      currency: "SAR",
      type: isInflow ? "inflow" : Math.random() > 0.9 ? "transfer" : "outflow",
      status: randomItem(statuses),
      description: `${isInflow ? "Payment from" : "Payment to"} ${randomItem(COUNTERPARTIES)}`,
      counterparty: randomItem(COUNTERPARTIES),
      category,
      account_id: account.id,
      account_name: account.name,
      reference: `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      notes: Math.random() > 0.7 ? "Reviewed and approved" : undefined,
      created_at: d.toISOString(),
      updated_at: d.toISOString(),
    });
  }

  return txns.sort((a, b) => b.txn_date.localeCompare(a.txn_date));
}

let _store: Transaction[] = generateTransactions();

function delay(ms = 350) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchTransactions(
  _tenantId: string | undefined,
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  await delay();
  let rows = [..._store];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q)
    );
  }
  if (filters.category) rows = rows.filter((t) => t.category === filters.category);
  if (filters.type) rows = rows.filter((t) => t.type === filters.type);
  if (filters.status) rows = rows.filter((t) => t.status === filters.status);
  if (filters.from) rows = rows.filter((t) => t.txn_date >= filters.from!);
  if (filters.to) rows = rows.filter((t) => t.txn_date <= filters.to!);
  if (filters.account_id) rows = rows.filter((t) => t.account_id === filters.account_id);

  return rows;
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload
): Promise<Transaction> {
  await delay(400);
  const idx = _store.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Transaction not found");
  _store[idx] = { ..._store[idx], ...payload, updated_at: new Date().toISOString() };
  return _store[idx];
}

export async function bulkRecategorize(
  payload: BulkRecategorizePayload
): Promise<Transaction[]> {
  await delay(500);
  const updated: Transaction[] = [];
  for (const id of payload.ids) {
    const idx = _store.findIndex((t) => t.id === id);
    if (idx !== -1) {
      _store[idx] = {
        ..._store[idx],
        category: payload.category,
        updated_at: new Date().toISOString(),
      };
      updated.push(_store[idx]);
    }
  }
  return updated;
}

export async function deleteTransaction(id: string): Promise<void> {
  await delay(300);
  _store = _store.filter((t) => t.id !== id);
}

export const ACCOUNTS_LIST = ACCOUNTS;
