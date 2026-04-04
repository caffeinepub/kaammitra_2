// ─── ASSOCIATED COMPANIES (PERMANENT — DO NOT REMOVE) ──────────────────────────
// Default partner companies always visible.
export interface Company {
  id: string;
  name: string;
  tagline: string;
  category: string;
  logoBase64?: string;
}

export const DEFAULT_COMPANIES: Company[] = [
  {
    id: "ahluwalia",
    name: "Ahluwalia Contracts (India) Limited",
    tagline: "Engineering | Design | Construction",
    category: "Construction Company",
  },
  {
    id: "wagad",
    name: "Wagad Infraproject Pvt Ltd",
    tagline: "Infrastructure & Development",
    category: "Infrastructure Company",
  },
];

const COMPANIES_KEY = "kaam_mitra_companies";

export function loadCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(COMPANIES_KEY);
    if (!raw) return DEFAULT_COMPANIES;
    const parsed = JSON.parse(raw) as Company[];
    const ids = new Set(parsed.map((c) => c.id));
    const merged = [...parsed];
    for (const def of DEFAULT_COMPANIES) {
      if (!ids.has(def.id)) merged.unshift(def);
    }
    return merged;
  } catch {
    return DEFAULT_COMPANIES;
  }
}

export function saveCompanies(companies: Company[]): void {
  try {
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  } catch {
    /* ignore */
  }
}

// ─── REGISTERED COMPANIES (Dynamic — self-registration system) ───────────────

export type CompanyType =
  | "Pvt Ltd"
  | "Contractor"
  | "Builder"
  | "Developer"
  | "Partnership"
  | "Proprietorship"
  | "Other";
export type CompanyStatus = "pending" | "approved" | "rejected";

export interface RegisteredCompany {
  id: string;
  name: string;
  type: CompanyType;
  gstNumber?: string;
  location: string;
  contactPhone: string;
  logoBase64?: string;
  status: CompanyStatus;
  registeredAt: number;
  isPremium?: boolean;
  description?: string;
  website?: string;
}

const REGISTERED_COMPANIES_KEY = "kaam_mitra_registered_companies";

export const SEED_REGISTERED_COMPANIES: RegisteredCompany[] = [
  {
    id: "reg_ahluwalia",
    name: "Ahluwalia Contracts (India) Limited",
    type: "Pvt Ltd",
    location: "New Delhi",
    contactPhone: "9876543210",
    status: "approved",
    registeredAt: Date.now() - 86400000 * 30,
    isPremium: true,
    description: "Engineering | Design | Construction",
  },
  {
    id: "reg_wagad",
    name: "Wagad Infraproject Pvt Ltd",
    type: "Pvt Ltd",
    location: "Mumbai",
    contactPhone: "9876543211",
    status: "approved",
    registeredAt: Date.now() - 86400000 * 20,
    isPremium: false,
    description: "Infrastructure & Development",
  },
  {
    id: "reg_demo1",
    name: "Sharma Constructions Pvt Ltd",
    type: "Pvt Ltd",
    location: "Pune",
    contactPhone: "9811223344",
    status: "pending",
    registeredAt: Date.now() - 86400000 * 2,
    description: "Residential & Commercial Construction",
  },
  {
    id: "reg_demo2",
    name: "Delhi Road Builders",
    type: "Contractor",
    location: "Delhi",
    contactPhone: "9922334455",
    status: "approved",
    registeredAt: Date.now() - 86400000 * 10,
    description: "Road & Highway Construction",
  },
];

export function loadRegisteredCompanies(): RegisteredCompany[] {
  try {
    const raw = localStorage.getItem(REGISTERED_COMPANIES_KEY);
    if (!raw) {
      // Seed on first load
      localStorage.setItem(
        REGISTERED_COMPANIES_KEY,
        JSON.stringify(SEED_REGISTERED_COMPANIES),
      );
      return SEED_REGISTERED_COMPANIES;
    }
    return JSON.parse(raw) as RegisteredCompany[];
  } catch {
    return SEED_REGISTERED_COMPANIES;
  }
}

export function saveRegisteredCompanies(list: RegisteredCompany[]): void {
  try {
    localStorage.setItem(REGISTERED_COMPANIES_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function registerCompany(
  data: Omit<RegisteredCompany, "id" | "status" | "registeredAt">,
): RegisteredCompany {
  const newCompany: RegisteredCompany = {
    ...data,
    id: `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "pending",
    registeredAt: Date.now(),
  };
  const all = loadRegisteredCompanies();
  all.push(newCompany);
  saveRegisteredCompanies(all);
  return newCompany;
}

export function approveCompany(id: string): void {
  const all = loadRegisteredCompanies();
  const idx = all.findIndex((c) => c.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], status: "approved" };
    saveRegisteredCompanies(all);
  }
}

export function rejectCompany(id: string): void {
  const all = loadRegisteredCompanies();
  const idx = all.findIndex((c) => c.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], status: "rejected" };
    saveRegisteredCompanies(all);
  }
}

export function deleteRegisteredCompany(id: string): void {
  const all = loadRegisteredCompanies().filter((c) => c.id !== id);
  saveRegisteredCompanies(all);
}

export function toggleCompanyPremium(id: string): void {
  const all = loadRegisteredCompanies();
  const idx = all.findIndex((c) => c.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], isPremium: !all[idx].isPremium };
    saveRegisteredCompanies(all);
  }
}

export function getApprovedCompanies(): RegisteredCompany[] {
  return loadRegisteredCompanies().filter((c) => c.status === "approved");
}

export function getPendingCompanies(): RegisteredCompany[] {
  return loadRegisteredCompanies().filter((c) => c.status === "pending");
}

export function searchCompanies(
  query: string,
  type?: string,
  location?: string,
): RegisteredCompany[] {
  const q = query.toLowerCase();
  return getApprovedCompanies().filter((c) => {
    const matchQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);
    const matchType = !type || type === "all" || c.type === type;
    const matchLoc =
      !location || c.location.toLowerCase().includes(location.toLowerCase());
    return matchQuery && matchType && matchLoc;
  });
}

export function getCompanyNames(): string[] {
  const approved = getApprovedCompanies().map((c) => c.name);
  const defaults = DEFAULT_COMPANIES.map((c) => c.name);
  const unique = Array.from(new Set([...approved, ...defaults]));
  return [...unique, "Other"];
}
