export const MAIN_CATEGORIES = [
  {
    id: "construction",
    name: "Construction Workers",
    emoji: "🏗️",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800",
    subcategories: [
      "JCB Operator",
      "Excavator Operator",
      "Bulldozer Operator",
      "Crane Operator",
      "Mason",
      "Helper / Labour",
      "Electrician",
      "Plumber",
      "Carpenter",
      "Welder",
      "Painter",
      "Mechanic",
    ],
  },
  {
    id: "office",
    name: "Office Staff",
    emoji: "🏢",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    subcategories: [
      "HR Manager",
      "Accountant",
      "Account Manager",
      "Office Assistant",
      "Supervisor",
      "Foreman",
      "Site Engineer",
      "Project Manager",
    ],
  },
  {
    id: "mechanical",
    name: "Mechanical & Technical",
    emoji: "⚙️",
    color: "from-gray-600 to-slate-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-800",
    subcategories: [
      "Machine Mechanic",
      "Workshop Mechanic",
      "Machine Incharge",
      "Maintenance Engineer",
      "Equipment Supervisor",
    ],
  },
  {
    id: "driver",
    name: "Driver Category",
    emoji: "🚛",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    subcategories: [
      "Car Driver",
      "Bolero Driver",
      "Pickup Driver",
      "Truck Driver",
      "Tipper Driver",
      "Trailer Driver",
      "Dumper Driver",
      "Tractor Driver",
      "Bus Driver",
    ],
  },
] as const;

// Flat list for dropdowns - JCB Operator always first
export const CATEGORIES: string[] = [
  "JCB Operator",
  ...MAIN_CATEGORIES.flatMap((g) =>
    g.subcategories.filter((s) => s !== "JCB Operator"),
  ),
];

export const CATEGORY_EMOJIS: Record<string, string> = {
  "JCB Operator": "🚜",
  "Excavator Operator": "🚧",
  "Bulldozer Operator": "🏗️",
  "Crane Operator": "🏗️",
  Mason: "🧱",
  "Helper / Labour": "💪",
  Electrician: "⚡",
  Plumber: "🔧",
  Carpenter: "🪚",
  Welder: "🔥",
  Painter: "🎨",
  Mechanic: "🔩",
  "HR Manager": "👔",
  Accountant: "📊",
  "Account Manager": "📋",
  "Office Assistant": "🗂️",
  Supervisor: "📋",
  Foreman: "👷",
  "Site Engineer": "📐",
  "Project Manager": "📌",
  "Machine Mechanic": "⚙️",
  "Workshop Mechanic": "🔧",
  "Machine Incharge": "🏭",
  "Maintenance Engineer": "🛠️",
  "Equipment Supervisor": "🏗️",
  "Car Driver": "🚗",
  "Bolero Driver": "🚙",
  "Pickup Driver": "🛻",
  "Truck Driver": "🚚",
  "Tipper Driver": "🚛",
  "Trailer Driver": "🚛",
  "Dumper Driver": "🚛",
  "Tractor Driver": "🚜",
  "Bus Driver": "🚌",
  // legacy aliases
  Labour: "💪",
  Driver: "🚗",
};

export const CATEGORY_COLORS: Record<string, string> = {
  "JCB Operator": "bg-orange-100 text-orange-800",
  "Excavator Operator": "bg-orange-100 text-orange-800",
  "Bulldozer Operator": "bg-orange-100 text-orange-800",
  "Crane Operator": "bg-orange-100 text-orange-800",
  Mason: "bg-stone-100 text-stone-800",
  "Helper / Labour": "bg-red-100 text-red-800",
  Electrician: "bg-yellow-100 text-yellow-800",
  Plumber: "bg-blue-100 text-blue-800",
  Carpenter: "bg-amber-100 text-amber-800",
  Welder: "bg-red-100 text-red-800",
  Painter: "bg-purple-100 text-purple-800",
  Mechanic: "bg-gray-100 text-gray-800",
  "HR Manager": "bg-blue-100 text-blue-800",
  Accountant: "bg-indigo-100 text-indigo-800",
  "Account Manager": "bg-indigo-100 text-indigo-800",
  "Office Assistant": "bg-sky-100 text-sky-800",
  Supervisor: "bg-blue-100 text-blue-800",
  Foreman: "bg-blue-100 text-blue-800",
  "Site Engineer": "bg-cyan-100 text-cyan-800",
  "Project Manager": "bg-violet-100 text-violet-800",
  "Machine Mechanic": "bg-gray-100 text-gray-800",
  "Workshop Mechanic": "bg-gray-100 text-gray-800",
  "Machine Incharge": "bg-slate-100 text-slate-800",
  "Maintenance Engineer": "bg-zinc-100 text-zinc-800",
  "Equipment Supervisor": "bg-stone-100 text-stone-800",
  "Car Driver": "bg-green-100 text-green-800",
  "Bolero Driver": "bg-green-100 text-green-800",
  "Pickup Driver": "bg-emerald-100 text-emerald-800",
  "Truck Driver": "bg-teal-100 text-teal-800",
  "Tipper Driver": "bg-teal-100 text-teal-800",
  "Trailer Driver": "bg-teal-100 text-teal-800",
  "Dumper Driver": "bg-teal-100 text-teal-800",
  "Tractor Driver": "bg-lime-100 text-lime-800",
  "Bus Driver": "bg-green-100 text-green-800",
  // legacy
  Labour: "bg-red-100 text-red-800",
  Driver: "bg-green-100 text-green-800",
};

export type DocGroup =
  | "driver"
  | "machine_operator"
  | "construction"
  | "helper"
  | "mechanic"
  | "office_staff"
  | "builder"
  | "general";

export const PROFESSION_DOC_GROUPS: Record<string, DocGroup> = {
  // Drivers
  "Car Driver": "driver",
  "Bolero Driver": "driver",
  "Pickup Driver": "driver",
  "Truck Driver": "driver",
  "Tipper Driver": "driver",
  "Trailer Driver": "driver",
  "Dumper Driver": "driver",
  "Tractor Driver": "driver",
  "Bus Driver": "driver",
  // Machine Operators
  "JCB Operator": "machine_operator",
  "Excavator Operator": "machine_operator",
  "Bulldozer Operator": "machine_operator",
  "Crane Operator": "machine_operator",
  // Construction
  Mason: "construction",
  Carpenter: "construction",
  Painter: "construction",
  Welder: "construction",
  Electrician: "construction",
  Plumber: "construction",
  // Helper
  "Helper / Labour": "helper",
  // Mechanic
  Mechanic: "mechanic",
  "Machine Mechanic": "mechanic",
  "Workshop Mechanic": "mechanic",
  "Machine Incharge": "mechanic",
  "Maintenance Engineer": "mechanic",
  "Equipment Supervisor": "mechanic",
  // Office Staff
  "HR Manager": "office_staff",
  Accountant: "office_staff",
  "Account Manager": "office_staff",
  "Office Assistant": "office_staff",
  Supervisor: "office_staff",
  Foreman: "office_staff",
  "Site Engineer": "office_staff",
  "Project Manager": "office_staff",
  // Builder/Contractor
  "Builder / Contractor": "builder",
};

// ─── INDIA STATES & CITIES ────────────────────────────────────────────────────
export const INDIA_STATES_CITIES: Record<string, string[]> = {
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Prayagraj",
    "Meerut",
    "Ghaziabad",
    "Noida",
    "Mathura",
    "Gorakhpur",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Thane",
    "Navi Mumbai",
    "Kolhapur",
    "Amravati",
  ],
  Delhi: [
    "New Delhi",
    "Dwarka",
    "Rohini",
    "Saket",
    "Lajpat Nagar",
    "Janakpuri",
    "Karol Bagh",
    "Nehru Place",
    "Gurugram",
    "Faridabad",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Bikaner",
    "Ajmer",
    "Alwar",
    "Bhilwara",
    "Sikar",
    "Tonk",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Purnia",
    "Darbhanga",
    "Ara",
    "Begusarai",
    "Katihar",
    "Munger",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Anand",
    "Morbi",
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Gwalior",
    "Jabalpur",
    "Ujjain",
    "Sagar",
    "Dewas",
    "Satna",
    "Ratlam",
    "Rewa",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
    "Bardhaman",
    "Malda",
    "Baharampur",
    "Habra",
    "Kharagpur",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Tiruppur",
    "Vellore",
    "Erode",
    "Thoothukudi",
  ],
  Karnataka: [
    "Bengaluru",
    "Mysuru",
    "Hubli",
    "Mangaluru",
    "Belagavi",
    "Davangere",
    "Ballari",
    "Vijayapura",
    "Shivamogga",
    "Tumkur",
  ],
  Haryana: [
    "Gurugram",
    "Faridabad",
    "Panipat",
    "Ambala",
    "Yamunanagar",
    "Rohtak",
    "Hisar",
    "Karnal",
    "Sonipat",
    "Panchkula",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Pathankot",
    "Hoshiarpur",
    "Moga",
    "Firozpur",
    "Mohali",
  ],
  Jharkhand: [
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
    "Deoghar",
    "Phusro",
    "Hazaribag",
    "Giridih",
    "Ramgarh",
    "Medininagar",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Brahmapur",
    "Sambalpur",
    "Puri",
    "Balasore",
    "Bhadrak",
    "Baripada",
    "Jharsuguda",
  ],
  Chhattisgarh: [
    "Raipur",
    "Bhilai",
    "Bilaspur",
    "Korba",
    "Rajnandgaon",
    "Durg",
    "Jagdalpur",
    "Raigarh",
    "Ambikapur",
    "Chirmiri",
  ],
};

export type AvailabilityStatus = "available" | "busy";
export type WorkType = "daily" | "monthly" | "contract";

export interface WorkerExtended {
  mobile: string;
  whatsapp?: string;
  state?: string;
  city?: string;
  availability: AvailabilityStatus;
  workType?: WorkType;
  profilePhotoName?: string;
  aadhaarUploaded?: boolean;
  licenceUploaded?: boolean;
  experiencePhotoUploaded?: boolean;
  lat?: number;
  lng?: number;
  lastUpdated?: number;
  mobileVerified?: boolean;
  emailVerified?: boolean;
  onlineStatus?: boolean;
  lastSeen?: number;
  profilePhotoBase64?: string;
  dailyWageRate?: string;
  gender?: string;
  blockedStatus?: boolean;
}

export const EXTENDED_PROFILE_KEY = "kaam_mitra_extended_profiles";

export function saveExtendedProfile(data: WorkerExtended): void {
  try {
    const all = loadAllExtendedProfiles();
    all[data.mobile] = data;
    localStorage.setItem(EXTENDED_PROFILE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function loadAllExtendedProfiles(): Record<string, WorkerExtended> {
  try {
    const raw = localStorage.getItem(EXTENDED_PROFILE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WorkerExtended>;
  } catch {
    return {};
  }
}

export function getMyExtendedProfile(): WorkerExtended | null {
  try {
    const raw = localStorage.getItem("kaam_mitra_my_extended");
    if (!raw) return null;
    return JSON.parse(raw) as WorkerExtended;
  } catch {
    return null;
  }
}

export function saveMyExtendedProfile(data: WorkerExtended): void {
  try {
    localStorage.setItem("kaam_mitra_my_extended", JSON.stringify(data));
    saveExtendedProfile(data);
  } catch {
    /* ignore */
  }
}

export function saveExtendedById(workerId: string, data: WorkerExtended): void {
  try {
    const all = loadAllExtendedById();
    all[workerId] = data;
    localStorage.setItem("kaam_mitra_ext_by_id", JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function loadAllExtendedById(): Record<string, WorkerExtended> {
  try {
    const raw = localStorage.getItem("kaam_mitra_ext_by_id");
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WorkerExtended>;
  } catch {
    return {};
  }
}

// ─── EXTENDED JOB DATA ────────────────────────────────────────────────────────
export const EXTENDED_JOBS_KEY = "kaam_mitra_extended_jobs";

export interface ExtendedJob {
  jobTitle: string;
  workersNeeded: string;
  salaryType: "daily" | "monthly";
  workDuration: string;
  contactNumber: string;
}

export function saveExtendedJob(jobId: string, data: ExtendedJob): void {
  try {
    const all = loadAllExtendedJobs();
    all[jobId] = data;
    localStorage.setItem(EXTENDED_JOBS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function loadAllExtendedJobs(): Record<string, ExtendedJob> {
  try {
    const raw = localStorage.getItem(EXTENDED_JOBS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ExtendedJob>;
  } catch {
    return {};
  }
}

// ─── WORKER VERIFIED HELPER ────────────────────────────────────────────────────
export function isWorkerVerified(ext: WorkerExtended): boolean {
  return !!(ext.mobileVerified && ext.emailVerified);
}

// ─── JOB APPLICATIONS ─────────────────────────────────────────────────────────
export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  contractorMobile: string;
  workerName: string;
  workerMobile: string;
  workerCategory: string;
  workerExperience: string;
  workerCity: string;
  workerSalary: string;
  appliedAt: number;
  status: "pending" | "accepted" | "rejected";
}

const JOB_APPLICATIONS_KEY = "kaam_mitra_job_applications";

export function saveJobApplication(app: JobApplication): void {
  try {
    const all = loadJobApplications();
    const exists = all.find(
      (a) => a.jobId === app.jobId && a.workerMobile === app.workerMobile,
    );
    if (exists) return;
    all.push(app);
    localStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function loadJobApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(JOB_APPLICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JobApplication[];
  } catch {
    return [];
  }
}

export function loadApplicationsForContractor(
  contractorMobile: string,
): JobApplication[] {
  return loadJobApplications().filter(
    (a) => a.contractorMobile === contractorMobile,
  );
}

// ─── VERIFICATION RECORDS (duplicate blocking) ─────────────────────────────
const USED_DOC_NUMBERS_KEY = "kaam_mitra_used_doc_numbers";

export function isDocNumberUsed(
  docNumber: string,
  excludeMobile?: string,
): boolean {
  try {
    const raw = localStorage.getItem(USED_DOC_NUMBERS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    const owner = map[docNumber.toUpperCase().trim()];
    if (!owner) return false;
    if (excludeMobile && owner === excludeMobile) return false;
    return true;
  } catch {
    return false;
  }
}

export function registerDocNumber(
  docNumber: string,
  ownerMobile: string,
): void {
  try {
    const raw = localStorage.getItem(USED_DOC_NUMBERS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[docNumber.toUpperCase().trim()] = ownerMobile;
    localStorage.setItem(USED_DOC_NUMBERS_KEY, JSON.stringify(map));
  } catch {}
}

// ─── WORKER VERIFICATION SUBMISSIONS ──────────────────────────────────────
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface VerificationRecord {
  mobile: string;
  fullName: string;
  category: string;
  city: string;
  docType: "aadhaar" | "driving_licence" | "voter_id";
  docNumber: string;
  docImageBase64?: string;
  status: VerificationStatus;
  submittedAt: number;
  reviewedAt?: number;
}

const VERIFICATION_RECORDS_KEY = "kaam_mitra_verification_records";

export function saveVerificationRecord(record: VerificationRecord): void {
  try {
    const all = loadAllVerificationRecords();
    const idx = all.findIndex((r) => r.mobile === record.mobile);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    localStorage.setItem(VERIFICATION_RECORDS_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllVerificationRecords(): VerificationRecord[] {
  try {
    const raw = localStorage.getItem(VERIFICATION_RECORDS_KEY);
    return raw ? (JSON.parse(raw) as VerificationRecord[]) : [];
  } catch {
    return [];
  }
}

export function getVerificationRecord(
  mobile: string,
): VerificationRecord | null {
  return loadAllVerificationRecords().find((r) => r.mobile === mobile) ?? null;
}

// ─── ONLINE/OFFLINE STATUS ─────────────────────────────────────────────────
const ONLINE_STATUS_KEY = "kaam_mitra_online_status";

export interface OnlineStatus {
  mobile: string;
  isOnline: boolean;
  lastSeen: number;
}

export function setOnlineStatus(mobile: string, isOnline: boolean): void {
  try {
    const raw = localStorage.getItem(ONLINE_STATUS_KEY);
    const map: Record<string, OnlineStatus> = raw ? JSON.parse(raw) : {};
    map[mobile] = { mobile, isOnline, lastSeen: Date.now() };
    localStorage.setItem(ONLINE_STATUS_KEY, JSON.stringify(map));
  } catch {}
}

export function getOnlineStatus(mobile: string): OnlineStatus | null {
  try {
    const raw = localStorage.getItem(ONLINE_STATUS_KEY);
    const map: Record<string, OnlineStatus> = raw ? JSON.parse(raw) : {};
    return map[mobile] ?? null;
  } catch {
    return null;
  }
}

export function formatLastSeen(lastSeen: number): string {
  const diff = Date.now() - lastSeen;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

// ─── WORKER RATING ─────────────────────────────────────────────────────────
export interface WorkerRating {
  workerId: string;
  contractorMobile: string;
  stars: number;
  reviewText?: string;
  ratedAt: number;
}

const RATINGS_KEY = "kaam_mitra_ratings";

export function saveRating(rating: WorkerRating): void {
  try {
    const all = loadAllRatings();
    const idx = all.findIndex(
      (r) =>
        r.workerId === rating.workerId &&
        r.contractorMobile === rating.contractorMobile,
    );
    if (idx >= 0) all[idx] = rating;
    else all.push(rating);
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllRatings(): WorkerRating[] {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? (JSON.parse(raw) as WorkerRating[]) : [];
  } catch {
    return [];
  }
}

export function getWorkerRatingStats(workerId: string): {
  avg: number;
  count: number;
} {
  const ratings = loadAllRatings().filter((r) => r.workerId === workerId);
  if (ratings.length === 0) return { avg: 0, count: 0 };
  const avg = ratings.reduce((s, r) => s + r.stars, 0) / ratings.length;
  return { avg: Math.round(avg * 10) / 10, count: ratings.length };
}

// ─── DAILY WAGE RATE ─────────────────────────────────────────────────────────
// dailyWageRate is added to WorkerExtended interface above (added below via code)

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export type BookingStatus = "Pending" | "Accepted" | "Rejected" | "Completed";

export interface Booking {
  id: string;
  workerId: string;
  workerName: string;
  workerMobile: string;
  workerCategory: string;
  contractorMobile: string;
  contractorName: string;
  startDate: string; // ISO date string YYYY-MM-DD
  numDays: number;
  dailyRate: number;
  totalAmount: number;
  advancePaid: boolean;
  advanceAmount: number;
  status: BookingStatus;
  location: string;
  note?: string;
  createdAt: number;
  respondedAt?: number;
}

const BOOKINGS_KEY = "kaam_mitra_bookings";

export function saveBooking(booking: Booking): void {
  try {
    const all = loadAllBookings();
    const idx = all.findIndex((b) => b.id === booking.id);
    if (idx >= 0) all[idx] = booking;
    else all.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

export function getBookingsForWorker(workerMobile: string): Booking[] {
  return loadAllBookings().filter((b) => b.workerMobile === workerMobile);
}

export function getBookingsForContractor(contractorMobile: string): Booking[] {
  return loadAllBookings().filter(
    (b) => b.contractorMobile === contractorMobile,
  );
}

export function getBookedDatesForWorker(workerId: string): string[] {
  const bookings = loadAllBookings().filter(
    (b) =>
      b.workerId === workerId &&
      (b.status === "Accepted" || b.status === "Pending"),
  );
  const dates: string[] = [];
  for (const b of bookings) {
    const start = new Date(b.startDate);
    for (let i = 0; i < b.numDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
  }
  return dates;
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  mobile: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

const NOTIFICATIONS_KEY = "kaam_mitra_notifications";

export function saveNotification(notif: AppNotification): void {
  try {
    const all = loadAllNotifications();
    all.unshift(notif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all.slice(0, 50)));
  } catch {}
}

export function loadAllNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

export function getNotificationsForUser(mobile: string): AppNotification[] {
  return loadAllNotifications().filter((n) => n.mobile === mobile);
}

export function markNotificationsRead(mobile: string): void {
  try {
    const all = loadAllNotifications();
    const updated = all.map((n) =>
      n.mobile === mobile ? { ...n, read: true } : n,
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch {}
}

export function getUnreadCount(mobile: string): number {
  return loadAllNotifications().filter((n) => n.mobile === mobile && !n.read)
    .length;
}

// ─── CATEGORY FEES ─────────────────────────────────────────────────────────────
// Default fees per category (simulates Firestore category_fees collection)
export const CATEGORY_FEES: Record<string, number> = {
  "JCB Operator": 50,
  "Excavator Operator": 50,
  "Bulldozer Operator": 50,
  "Crane Operator": 100,
  Mason: 40,
  "Helper / Labour": 30,
  Electrician: 60,
  Plumber: 60,
  Carpenter: 60,
  Welder: 60,
  Painter: 40,
  Mechanic: 60,
  "HR Manager": 150,
  Accountant: 150,
  "Account Manager": 150,
  "Office Assistant": 100,
  Supervisor: 120,
  Foreman: 100,
  "Site Engineer": 150,
  "Project Manager": 200,
  "Machine Mechanic": 80,
  "Workshop Mechanic": 80,
  "Machine Incharge": 100,
  "Maintenance Engineer": 120,
  "Equipment Supervisor": 120,
  "Car Driver": 80,
  "Bolero Driver": 80,
  "Pickup Driver": 80,
  "Truck Driver": 100,
  "Tipper Driver": 100,
  "Trailer Driver": 100,
  "Dumper Driver": 100,
  "Tractor Driver": 80,
  "Bus Driver": 100,
};

export const ADMIN_UPI_ID = "kaammitra@upi";
const CATEGORY_FEES_KEY = "kaam_mitra_category_fees_override";

export function getCategoryFee(category: string): number {
  try {
    const raw = localStorage.getItem(CATEGORY_FEES_KEY);
    const overrides: Record<string, number> = raw ? JSON.parse(raw) : {};
    if (overrides[category] !== undefined) return overrides[category];
  } catch {}
  return CATEGORY_FEES[category] ?? 50;
}

export function saveCategoryFeeOverride(category: string, fee: number): void {
  try {
    const raw = localStorage.getItem(CATEGORY_FEES_KEY);
    const overrides: Record<string, number> = raw ? JSON.parse(raw) : {};
    overrides[category] = fee;
    localStorage.setItem(CATEGORY_FEES_KEY, JSON.stringify(overrides));
  } catch {}
}

export function getAllCategoryFees(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CATEGORY_FEES_KEY);
    const overrides: Record<string, number> = raw ? JSON.parse(raw) : {};
    const merged: Record<string, number> = { ...CATEGORY_FEES };
    for (const [k, v] of Object.entries(overrides)) merged[k] = v;
    return merged;
  } catch {
    return { ...CATEGORY_FEES };
  }
}

// ─── PAYMENT RECORDS ────────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PaymentRecord {
  workerId: string;
  mobile: string;
  workerName: string;
  category: string;
  feeAmount: number;
  screenshotBase64?: string;
  screenshotName?: string;
  status: PaymentStatus;
  submittedAt: number;
  reviewedAt?: number;
  rejectionReason?: string;
}

const PAYMENT_RECORDS_KEY = "kaam_mitra_payment_records";

export function savePaymentRecord(record: PaymentRecord): void {
  try {
    const all = loadAllPaymentRecords();
    const idx = all.findIndex((r) => r.workerId === record.workerId);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    localStorage.setItem(PAYMENT_RECORDS_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllPaymentRecords(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENT_RECORDS_KEY);
    return raw ? (JSON.parse(raw) as PaymentRecord[]) : [];
  } catch {
    return [];
  }
}

export function getPaymentRecord(workerId: string): PaymentRecord | null {
  return loadAllPaymentRecords().find((r) => r.workerId === workerId) ?? null;
}

export function isWorkerPaymentApproved(workerId: string): boolean {
  const record = getPaymentRecord(workerId);
  return record?.status === "approved";
}

// ─── TRANSACTION ID GENERATOR ──────────────────────────────────────────────────
export function generateTxnId(): string {
  return `KM-TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ─── ESCROW RECORDS ──────────────────────────────────────────────────────────
export interface EscrowRecord {
  escrowId: string;
  bookingId: string;
  contractorMobile: string;
  workerMobile: string;
  workerName: string;
  totalAmount: number;
  advanceAmount: number;
  status: "held" | "released" | "disputed" | "refunded";
  createdAt: number;
  resolvedAt?: number;
  disputeReason?: string;
}

const ESCROW_KEY = "kaam_mitra_escrow";

export function saveEscrowRecord(r: EscrowRecord): void {
  try {
    const all = loadAllEscrowRecords();
    const idx = all.findIndex((e) => e.escrowId === r.escrowId);
    if (idx >= 0) all[idx] = r;
    else all.push(r);
    localStorage.setItem(ESCROW_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllEscrowRecords(): EscrowRecord[] {
  try {
    const raw = localStorage.getItem(ESCROW_KEY);
    return raw ? (JSON.parse(raw) as EscrowRecord[]) : [];
  } catch {
    return [];
  }
}

export function getEscrowByBookingId(bookingId: string): EscrowRecord | null {
  return loadAllEscrowRecords().find((e) => e.bookingId === bookingId) ?? null;
}

export function updateEscrowStatus(
  escrowId: string,
  status: EscrowRecord["status"],
  extra?: Partial<EscrowRecord>,
): void {
  const all = loadAllEscrowRecords();
  const idx = all.findIndex((e) => e.escrowId === escrowId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], status, ...extra };
    localStorage.setItem(ESCROW_KEY, JSON.stringify(all));
  }
}

// ─── WALLET TRANSACTIONS ──────────────────────────────────────────────────────
export interface WalletTransaction {
  id: string;
  mobile: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  bookingId?: string;
  escrowId?: string;
  createdAt: number;
}

const WALLET_TXN_KEY = "kaam_mitra_wallet_txns";

export function addWalletTransaction(txn: WalletTransaction): void {
  try {
    const all = getAllWalletTransactions();
    all.push(txn);
    localStorage.setItem(WALLET_TXN_KEY, JSON.stringify(all));
  } catch {}
}

function getAllWalletTransactions(): WalletTransaction[] {
  try {
    const raw = localStorage.getItem(WALLET_TXN_KEY);
    return raw ? (JSON.parse(raw) as WalletTransaction[]) : [];
  } catch {
    return [];
  }
}

export function getWalletTransactions(mobile: string): WalletTransaction[] {
  return getAllWalletTransactions().filter((t) => t.mobile === mobile);
}

export function getWalletBalance(mobile: string): number {
  return getWalletTransactions(mobile).reduce(
    (sum, t) => (t.type === "credit" ? sum + t.amount : sum - t.amount),
    0,
  );
}

// ─── WITHDRAWAL RECORDS ──────────────────────────────────────────────────────
export interface WithdrawalRecord {
  id: string;
  mobile: string;
  method: "bank" | "upi";
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;
  amount: number;
  status: "pending" | "processed";
  createdAt: number;
}

const WITHDRAWAL_KEY = "kaam_mitra_withdrawals";

export function saveWithdrawalRecord(r: WithdrawalRecord): void {
  try {
    const allRaw: WithdrawalRecord[] = (() => {
      try {
        return JSON.parse(localStorage.getItem(WITHDRAWAL_KEY) ?? "[]");
      } catch {
        return [];
      }
    })();
    allRaw.push(r);
    localStorage.setItem(WITHDRAWAL_KEY, JSON.stringify(allRaw));
  } catch {}
}

export function getWithdrawals(mobile: string): WithdrawalRecord[] {
  try {
    const raw = localStorage.getItem(WITHDRAWAL_KEY);
    const all: WithdrawalRecord[] = raw ? JSON.parse(raw) : [];
    return all.filter((r) => r.mobile === mobile);
  } catch {
    return [];
  }
}
