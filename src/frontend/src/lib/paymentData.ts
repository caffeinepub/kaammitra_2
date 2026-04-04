// ─── PAYMENT DATA LIBRARY (Permanent — do not remove) ─────────────────────

// ── REFERRAL SYSTEM ───────────────────────────────────────────────────────────
export interface ReferralRecord {
  code: string; // unique 8-char referral code for this user
  mobile: string; // owner's mobile
  referredMobiles: string[]; // who joined using this code
  totalEarnings: number; // ₹ earned
  rewardPerReferral: number; // default ₹10
  createdAt: number;
}

const REFERRAL_KEY = "kaam_mitra_referral";

export function generateReferralCode(mobile: string): string {
  return `KM${mobile.slice(-4)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function getMyReferral(mobile: string): ReferralRecord {
  try {
    const raw = localStorage.getItem(`${REFERRAL_KEY}_${mobile}`);
    if (raw) return JSON.parse(raw) as ReferralRecord;
  } catch {
    /* ignore */
  }
  // Create new record
  const rec: ReferralRecord = {
    code: generateReferralCode(mobile),
    mobile,
    referredMobiles: [],
    totalEarnings: 0,
    rewardPerReferral: 10,
    createdAt: Date.now(),
  };
  localStorage.setItem(`${REFERRAL_KEY}_${mobile}`, JSON.stringify(rec));
  return rec;
}

export function addReferral(ownerMobile: string, newUserMobile: string): void {
  const rec = getMyReferral(ownerMobile);
  if (!rec.referredMobiles.includes(newUserMobile)) {
    rec.referredMobiles.push(newUserMobile);
    rec.totalEarnings += rec.rewardPerReferral;
    localStorage.setItem(`${REFERRAL_KEY}_${ownerMobile}`, JSON.stringify(rec));
  }
}

// ── WORK PAYMENT REPORT SYSTEM ────────────────────────────────────────────────
export interface WorkPaymentEntry {
  id: string;
  date: string; // ISO date string
  amount: number;
  note?: string;
}

export interface WorkPaymentRecord {
  id: string;
  workerName: string;
  workerMobile?: string;
  workType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalAmount: number;
  payments: WorkPaymentEntry[];
  createdBy: string; // contractor mobile or "admin"
  createdAt: number;
}

const WORK_PAYMENT_KEY = "kaam_mitra_work_payments";

export function loadWorkPaymentRecords(): WorkPaymentRecord[] {
  try {
    const raw = localStorage.getItem(WORK_PAYMENT_KEY);
    if (!raw) return SEED_WORK_RECORDS;
    return JSON.parse(raw) as WorkPaymentRecord[];
  } catch {
    return SEED_WORK_RECORDS;
  }
}

export function saveWorkPaymentRecord(record: WorkPaymentRecord): void {
  const all = loadWorkPaymentRecords();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx !== -1) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  localStorage.setItem(WORK_PAYMENT_KEY, JSON.stringify(all));
}

export function deleteWorkPaymentRecord(id: string): void {
  const all = loadWorkPaymentRecords().filter((r) => r.id !== id);
  localStorage.setItem(WORK_PAYMENT_KEY, JSON.stringify(all));
}

export function calculateWorkDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, diff);
}

export function getPaidAmount(record: WorkPaymentRecord): number {
  return record.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function getPendingAmount(record: WorkPaymentRecord): number {
  return Math.max(0, record.totalAmount - getPaidAmount(record));
}

export function addPaymentEntry(
  recordId: string,
  entry: Omit<WorkPaymentEntry, "id">,
): void {
  const all = loadWorkPaymentRecords();
  const idx = all.findIndex((r) => r.id === recordId);
  if (idx !== -1) {
    all[idx].payments.push({ ...entry, id: `pay_${Date.now()}` });
    localStorage.setItem(WORK_PAYMENT_KEY, JSON.stringify(all));
  }
}

// Seed data for demo
const SEED_WORK_RECORDS: WorkPaymentRecord[] = [
  {
    id: "wr_001",
    workerName: "Ramlal Sharma",
    workerMobile: "9811001122",
    workType: "JCB Operator",
    startDate: "2026-03-01",
    endDate: "2026-03-15",
    totalAmount: 16500,
    payments: [
      { id: "p1", date: "2026-03-05", amount: 5000, note: "Advance" },
      { id: "p2", date: "2026-03-10", amount: 7500, note: "Mid payment" },
    ],
    createdBy: "9876543210",
    createdAt: Date.now() - 86400000 * 14,
  },
  {
    id: "wr_002",
    workerName: "Suresh Kumar",
    workerMobile: "9822334455",
    workType: "Mason",
    startDate: "2026-03-10",
    endDate: "2026-03-20",
    totalAmount: 9000,
    payments: [{ id: "p3", date: "2026-03-12", amount: 3000, note: "Advance" }],
    createdBy: "9876543210",
    createdAt: Date.now() - 86400000 * 9,
  },
];

// ── PAYMENT REMINDER SYSTEM ───────────────────────────────────────────────────
export interface PaymentReminder {
  id: string;
  workerName: string;
  pendingAmount: number;
  workType: string;
  isRead: boolean;
  createdAt: number;
}

const REMINDERS_KEY = "kaam_mitra_payment_reminders";

export function getPaymentReminders(): PaymentReminder[] {
  // Auto-generate reminders from pending work payment records
  const records = loadWorkPaymentRecords();
  return records
    .filter((r) => getPendingAmount(r) > 0)
    .map((r) => ({
      id: `rem_${r.id}`,
      workerName: r.workerName,
      pendingAmount: getPendingAmount(r),
      workType: r.workType,
      isRead: isReminderRead(`rem_${r.id}`),
      createdAt: r.createdAt,
    }));
}

export function isReminderRead(id: string): boolean {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return false;
    const read: string[] = JSON.parse(raw);
    return read.includes(id);
  } catch {
    return false;
  }
}

export function markReminderRead(id: string): void {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    const read: string[] = raw ? JSON.parse(raw) : [];
    if (!read.includes(id)) {
      read.push(id);
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(read));
    }
  } catch {
    /* ignore */
  }
}

export function getUnreadReminderCount(): number {
  return getPaymentReminders().filter((r) => !r.isRead).length;
}
