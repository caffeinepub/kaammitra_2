// Company job listings and application system
export interface CompanyJob {
  id: string;
  companyId: string;
  title: string;
  location: string;
  salary: string;
  workType: "Full Time" | "Contract" | "Daily Wage" | "Part Time";
  duration: string;
  category: string;
  postedAt: number;
}

export const COMPANY_JOBS_SEED: CompanyJob[] = [
  // reg_ahluwalia
  {
    id: "cj_ahl_1",
    companyId: "reg_ahluwalia",
    title: "JCB Operator",
    location: "New Delhi",
    salary: "₹1,100/day",
    workType: "Contract",
    duration: "6 months",
    category: "JCB Operator",
    postedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "cj_ahl_2",
    companyId: "reg_ahluwalia",
    title: "Civil Engineer",
    location: "New Delhi",
    salary: "₹35,000/month",
    workType: "Full Time",
    duration: "Permanent",
    category: "Site Engineer",
    postedAt: Date.now() - 86400000 * 4,
  },
  {
    id: "cj_ahl_3",
    companyId: "reg_ahluwalia",
    title: "Site Supervisor",
    location: "Noida",
    salary: "₹25,000/month",
    workType: "Full Time",
    duration: "1 year",
    category: "Supervisor",
    postedAt: Date.now() - 86400000 * 7,
  },
  {
    id: "cj_ahl_4",
    companyId: "reg_ahluwalia",
    title: "Mason / Raj Mistri",
    location: "Gurugram",
    salary: "₹900/day",
    workType: "Daily Wage",
    duration: "3 months",
    category: "Mason",
    postedAt: Date.now() - 86400000 * 3,
  },
  // reg_wagad
  {
    id: "cj_wag_1",
    companyId: "reg_wagad",
    title: "Excavator Operator",
    location: "Mumbai",
    salary: "₹1,200/day",
    workType: "Contract",
    duration: "4 months",
    category: "Excavator Operator",
    postedAt: Date.now() - 86400000 * 1,
  },
  {
    id: "cj_wag_2",
    companyId: "reg_wagad",
    title: "Crane Operator",
    location: "Pune",
    salary: "₹1,400/day",
    workType: "Full Time",
    duration: "Permanent",
    category: "Crane Operator",
    postedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "cj_wag_3",
    companyId: "reg_wagad",
    title: "Helper / Labour",
    location: "Mumbai",
    salary: "₹650/day",
    workType: "Daily Wage",
    duration: "2 months",
    category: "Helper / Labour",
    postedAt: Date.now() - 86400000 * 0,
  },
  // reg_demo2
  {
    id: "cj_dem_1",
    companyId: "reg_demo2",
    title: "Road Labour",
    location: "Delhi",
    salary: "₹700/day",
    workType: "Daily Wage",
    duration: "2 months",
    category: "Helper / Labour",
    postedAt: Date.now(),
  },
  {
    id: "cj_dem_2",
    companyId: "reg_demo2",
    title: "Truck Driver",
    location: "Delhi NCR",
    salary: "₹20,000/month",
    workType: "Full Time",
    duration: "Permanent",
    category: "Truck Driver",
    postedAt: Date.now() - 86400000 * 2,
  },
];

export function getJobsForCompany(companyId: string): CompanyJob[] {
  const all = getAllCompanyJobs();
  const found = all.filter((j) => j.companyId === companyId);
  return found.length > 0
    ? found
    : [
        {
          id: `default_${companyId}`,
          companyId,
          title: "General Labour",
          location: "Contact for location",
          salary: "Negotiable",
          workType: "Daily Wage",
          duration: "As required",
          category: "Helper / Labour",
          postedAt: Date.now(),
        },
      ];
}

export function getAllCompanyJobs(): CompanyJob[] {
  try {
    const raw = localStorage.getItem("kaam_mitra_extra_jobs");
    const extra: CompanyJob[] = raw ? JSON.parse(raw) : [];
    return [...COMPANY_JOBS_SEED, ...extra];
  } catch {
    return COMPANY_JOBS_SEED;
  }
}

// ── Application system ──────────────────────────────────────────────────────
export type AppStatus = "pending" | "selected" | "rejected";

export interface CompanyJobApplication {
  id: string;
  workerId: string;
  workerName: string;
  workerMobile: string;
  workerCategory: string;
  companyId: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  salary: string;
  appliedAt: number;
  status: AppStatus;
}

const KEY = "kaam_mitra_company_applications";

export function loadAllCompanyApplications(): CompanyJobApplication[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(apps: CompanyJobApplication[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(apps));
  } catch {
    /* ignore */
  }
}

export function applyToCompanyJob(
  data: Omit<CompanyJobApplication, "id" | "appliedAt" | "status">,
): { success: boolean; alreadyApplied: boolean } {
  const all = loadAllCompanyApplications();
  if (all.some((a) => a.workerId === data.workerId && a.jobId === data.jobId)) {
    return { success: false, alreadyApplied: true };
  }
  const newApp: CompanyJobApplication = {
    ...data,
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    appliedAt: Date.now(),
    status: "pending",
  };
  saveAll([...all, newApp]);
  return { success: true, alreadyApplied: false };
}

export function getApplicationsForWorker(
  workerId: string,
): CompanyJobApplication[] {
  return loadAllCompanyApplications().filter((a) => a.workerId === workerId);
}

export function getApplicationsForCompany(
  companyId: string,
): CompanyJobApplication[] {
  return loadAllCompanyApplications().filter((a) => a.companyId === companyId);
}

export function updateApplicationStatus(
  appId: string,
  status: AppStatus,
): void {
  const all = loadAllCompanyApplications();
  saveAll(all.map((a) => (a.id === appId ? { ...a, status } : a)));
}

export function hasWorkerApplied(workerId: string, jobId: string): boolean {
  return loadAllCompanyApplications().some(
    (a) => a.workerId === workerId && a.jobId === jobId,
  );
}
