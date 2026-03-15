// ── AI Moderation Engine ───────────────────────────────────────────────────
// Client-side content moderation for KaamMitra

export const DEFAULT_BANNED_WORDS = [
  // English
  "spam",
  "fake",
  "scam",
  "fraud",
  "nude",
  "xxx",
  "abuse",
  "cheat",
  "swindle",
  "hack",
  "exploit",
  // Hindi (transliterated)
  "gali",
  "bewkoof",
  "bakwas",
  "harami",
  "kamine",
  "besharam",
  // Hindi (Devanagari)
  "गाली",
  "बेइज्जत",
  "धोखा",
  "फर्जी",
  "स्पैम",
  "गंदा",
  "अश्लील",
  "बेशर्म",
  "कमीना",
  "बेवकूफ",
  "बकवास",
];

export interface ModerationSettings {
  sensitivityLevel: "low" | "medium" | "high";
  blockThreshold: number; // violations before auto-block
  autoDelete: "immediate" | "after_review";
  bannedWords: string[];
  blacklistedUserIds: string[];
}

export interface ModerationResult {
  action: "allow" | "flag" | "delete" | "block";
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  violations: string[];
  reason: string;
}

export interface FlaggedItem {
  id: string;
  type: "post" | "comment" | "profile" | "image" | "complaint" | "job";
  content: string;
  userId: string;
  userName: string;
  userMobile: string;
  section: string;
  flaggedAt: string;
  violations: string[];
  riskLevel: "low" | "medium" | "high";
  action: "flag" | "delete" | "block";
  status: "pending" | "resolved" | "dismissed";
  violationCount: number;
}

export function getDefaultSettings(): ModerationSettings {
  const stored = localStorage.getItem("kaam_mitra_mod_settings");
  if (stored) {
    try {
      return JSON.parse(stored) as ModerationSettings;
    } catch {
      // fall through to defaults
    }
  }
  return {
    sensitivityLevel: "medium",
    blockThreshold: 3,
    autoDelete: "after_review",
    bannedWords: [...DEFAULT_BANNED_WORDS],
    blacklistedUserIds: [],
  };
}

export function saveSettings(settings: ModerationSettings): void {
  localStorage.setItem("kaam_mitra_mod_settings", JSON.stringify(settings));
}

// ── Core moderation logic ──────────────────────────────────────────────────

function containsBannedWord(text: string, bannedWords: string[]): string[] {
  const lower = text.toLowerCase();
  return bannedWords.filter((w) => lower.includes(w.toLowerCase()));
}

function detectSpamPatterns(text: string): string[] {
  const found: string[] = [];
  // Repeated characters (e.g. "aaaaaa")
  if (/(..)\1{3,}/.test(text)) found.push("Repeated characters (spam)");
  // ALL CAPS long text
  if (text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text))
    found.push("All caps text");
  // Multiple phone numbers
  const phones = text.match(/\b[6-9]\d{9}\b/g) || [];
  if (phones.length > 2) found.push("Multiple phone numbers in post");
  // URL spam
  const urls = (text.match(/https?:\/\/|www\./gi) || []).length;
  if (urls > 3) found.push("Excessive links");
  // Excessive rupee/money mentions (potential scam)
  const moneyMentions = (text.match(/₹|rs\.?\s*\d|lakh|crore/gi) || []).length;
  if (moneyMentions > 5) found.push("Suspicious money claims");
  return found;
}

function detectFakeIdPatterns(text: string): string[] {
  const found: string[] = [];
  // Fake/duplicate keyword combos
  const lower = text.toLowerCase();
  if (
    (lower.includes("id") ||
      lower.includes("aadhaar") ||
      lower.includes("license")) &&
    (lower.includes("fake") ||
      lower.includes("fark") ||
      lower.includes("farzi") ||
      lower.includes("फर्जी"))
  ) {
    found.push("Fake ID indicators");
  }
  // Unverified claim patterns
  if (lower.includes("100%") && lower.includes("guarantee")) {
    found.push("Unverified guarantee claim");
  }
  return found;
}

export function moderateContent(
  text: string,
  settings: ModerationSettings,
): ModerationResult {
  const violations: string[] = [];
  let riskScore = 0;

  // 1. Banned words
  const bannedFound = containsBannedWord(text, settings.bannedWords);
  if (bannedFound.length > 0) {
    violations.push(`Banned words: ${bannedFound.join(", ")}`);
    riskScore += Math.min(bannedFound.length * 25, 60);
  }

  // 2. Spam patterns
  const spamFound = detectSpamPatterns(text);
  for (const s of spamFound) {
    violations.push(s);
    riskScore += 20;
  }

  // 3. Fake ID
  const fakeFound = detectFakeIdPatterns(text);
  for (const f of fakeFound) {
    violations.push(f);
    riskScore += 30;
  }

  // 4. Very short suspicious content
  if (text.trim().length < 5 && text.trim().length > 0) {
    riskScore += 5;
  }

  riskScore = Math.min(riskScore, 100);

  const riskLevel: "low" | "medium" | "high" =
    riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";

  // Determine action based on sensitivity
  let action: "allow" | "flag" | "delete" | "block" = "allow";
  const { sensitivityLevel } = settings;

  if (sensitivityLevel === "low") {
    if (riskScore > 80) action = "block";
    else if (riskScore > 60) action = "delete";
    else if (riskScore > 40) action = "flag";
  } else if (sensitivityLevel === "medium") {
    if (riskScore > 75) action = "block";
    else if (riskScore > 55) action = "delete";
    else if (riskScore > 30) action = "flag";
  } else {
    // high
    if (riskScore > 60) action = "block";
    else if (riskScore > 40) action = "delete";
    else if (riskScore > 20) action = "flag";
  }

  const reason =
    violations.length > 0
      ? violations[0]
      : riskScore > 0
        ? "Suspicious content pattern"
        : "Content is clean";

  return { action, riskScore, riskLevel, violations, reason };
}

// ── Flagged items store (localStorage) ────────────────────────────────────

const FLAGGED_KEY = "kaam_mitra_flagged_items";

export function loadFlaggedItems(): FlaggedItem[] {
  try {
    const stored = localStorage.getItem(FLAGGED_KEY);
    return stored
      ? (JSON.parse(stored) as FlaggedItem[])
      : getSampleFlaggedItems();
  } catch {
    return getSampleFlaggedItems();
  }
}

export function saveFlaggedItems(items: FlaggedItem[]): void {
  localStorage.setItem(FLAGGED_KEY, JSON.stringify(items));
}

export function addFlaggedItem(item: Omit<FlaggedItem, "id">): FlaggedItem {
  const items = loadFlaggedItems();
  const newItem: FlaggedItem = { ...item, id: `flag_${Date.now()}` };
  items.unshift(newItem);
  saveFlaggedItems(items);
  return newItem;
}

// -- AI Learning --
// Note: ModerationSettings already defined above; aiLearningMode is stored separately

export let aiLearningEnabled: boolean = (() => {
  try {
    const s = localStorage.getItem("kaam_mitra_mod_settings");
    return s ? (JSON.parse(s).aiLearningMode ?? true) : true;
  } catch {
    return true;
  }
})();

export function setAiLearningEnabled(val: boolean): void {
  aiLearningEnabled = val;
  try {
    const existing = JSON.parse(
      localStorage.getItem("kaam_mitra_mod_settings") || "{}",
    );
    localStorage.setItem(
      "kaam_mitra_mod_settings",
      JSON.stringify({ ...existing, aiLearningMode: val }),
    );
  } catch {
    /* ignore */
  }
}

// -- AI Learning --

const LEARNED_PATTERNS_KEY = "kaam_mitra_learned_patterns";

function getLearnedPatterns(): string[] {
  try {
    const s = localStorage.getItem(LEARNED_PATTERNS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function learnFromFlagged(
  content: string,
  confirmedViolation: boolean,
): void {
  if (!aiLearningEnabled || !confirmedViolation) return;
  const words = content
    .toLowerCase()
    .split(/[\s,!?.;:\/]+/)
    .filter(
      (w) =>
        w.length > 4 &&
        !/^(karo|nahi|mein|aur|hai|tha|hoga|kiya|wala)$/.test(w),
    );
  const patterns = getLearnedPatterns();
  const updated = Array.from(new Set([...patterns, ...words.slice(0, 3)]));
  localStorage.setItem(
    LEARNED_PATTERNS_KEY,
    JSON.stringify(updated.slice(0, 200)),
  );
}

// -- Profile Verification --

export interface ProfileVerificationResult {
  isValid: boolean;
  isDuplicate: boolean;
  isFake: boolean;
  confidence: number;
  issues: string[];
  recommendation: "approve" | "flag" | "block";
}

const FAKE_NAME_PATTERNS = [
  /test/i,
  /fake/i,
  /dummy/i,
  /sample/i,
  /xxx/i,
  /aaa+/i,
  /123+/,
];

export function verifyProfile(
  name: string,
  mobile: string,
  userId: string,
): ProfileVerificationResult {
  const issues: string[] = [];
  let riskScore = 0;

  // Name checks
  if (name.trim().length < 3) {
    issues.push("Name too short");
    riskScore += 30;
  }
  for (const p of FAKE_NAME_PATTERNS) {
    if (p.test(name)) {
      issues.push("Suspicious name pattern");
      riskScore += 40;
      break;
    }
  }
  if (/\d{4,}/.test(name)) {
    issues.push("Name contains too many numbers");
    riskScore += 25;
  }

  // Mobile checks
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    issues.push("Invalid mobile number format");
    riskScore += 35;
  }

  // Duplicate check (simple localStorage check)
  try {
    const allProfiles = JSON.parse(
      localStorage.getItem("kaam_mitra_profiles") || "[]",
    ) as Array<{ userId: string; mobile: string }>;
    const dup = allProfiles.filter(
      (p) => p.mobile === mobile && p.userId !== userId,
    );
    if (dup.length > 0) {
      issues.push("Duplicate mobile number detected");
      riskScore += 60;
    }
  } catch {
    /* ignore */
  }

  // Learned patterns check
  const learned = getLearnedPatterns();
  if (learned.some((p) => name.toLowerCase().includes(p))) {
    issues.push("Matches previously flagged pattern");
    riskScore += 20;
  }

  riskScore = Math.min(riskScore, 100);
  const confidence = Math.max(0, 100 - riskScore);
  const isFake = riskScore >= 60;
  const isDuplicate = issues.some((i) => i.includes("Duplicate"));
  const isValid = riskScore < 30;

  let recommendation: ProfileVerificationResult["recommendation"] = "approve";
  if (riskScore >= 60) recommendation = "block";
  else if (riskScore >= 30) recommendation = "flag";

  return { isValid, isDuplicate, isFake, confidence, issues, recommendation };
}

// -- Payment Monitoring --

export interface PaymentFlag {
  type: "delayed" | "suspicious" | "fraud_attempt" | "normal";
  riskLevel: "low" | "medium" | "high";
  reason: string;
  alertUser: boolean;
  alertAdmin: boolean;
}

export function monitorPayment(
  amount: number,
  description: string,
  userId: string,
): PaymentFlag {
  const desc = description.toLowerCase();

  // Check blacklist
  try {
    const settings = JSON.parse(
      localStorage.getItem("kaam_mitra_mod_settings") || "{}",
    ) as Partial<ModerationSettings>;
    if ((settings.blacklistedUserIds ?? []).includes(userId)) {
      return {
        type: "fraud_attempt",
        riskLevel: "high",
        reason: "Blacklisted user payment attempt",
        alertUser: true,
        alertAdmin: true,
      };
    }
  } catch {
    /* ignore */
  }

  // Large round-number amounts with suspicious descriptions
  if (amount > 50000 && /advance|urgent|immediately|abhi/i.test(desc)) {
    return {
      type: "suspicious",
      riskLevel: "high",
      reason: "Large urgent payment — possible scam",
      alertUser: true,
      alertAdmin: true,
    };
  }

  // Fraud keywords
  if (/refund|cheat|fraud|dhokha|paisa wapas/i.test(desc)) {
    return {
      type: "fraud_attempt",
      riskLevel: "high",
      reason: "Fraud-related keywords detected",
      alertUser: true,
      alertAdmin: true,
    };
  }

  // Multiple rapid payments (simulated)
  if (amount < 100 && /test|dummy/i.test(desc)) {
    return {
      type: "suspicious",
      riskLevel: "medium",
      reason: "Test transaction pattern detected",
      alertUser: false,
      alertAdmin: true,
    };
  }

  if (amount === 0) {
    return {
      type: "delayed",
      riskLevel: "low",
      reason: "Zero amount payment recorded",
      alertUser: false,
      alertAdmin: true,
    };
  }

  return {
    type: "normal",
    riskLevel: "low",
    reason: "Payment appears normal",
    alertUser: false,
    alertAdmin: false,
  };
}

// -- Spam and Phishing Detection --

const PHISHING_INDICATORS = [
  "click here",
  "verify your account",
  "urgent action",
  "login immediately",
  "account suspended",
  "confirm your details",
  "bit.ly",
  "tinyurl",
  "free recharge",
  "congratulations you won",
  "prize money",
  "lottery",
];

export function detectSpam(text: string): {
  isSpam: boolean;
  isPhishing: boolean;
  confidence: number;
  reason: string;
} {
  const lower = text.toLowerCase();
  let spamScore = 0;
  let phishingScore = 0;

  // Spam signals
  const urls = (lower.match(/https?:\/\/|www\./g) ?? []).length;
  if (urls > 2) spamScore += 30;
  const phoneNums = (text.match(/[6-9]\d{9}/g) ?? []).length;
  if (phoneNums > 2) spamScore += 25;
  if (/(.)\1{5,}/.test(text)) spamScore += 20;
  if (text.length > 10 && text === text.toUpperCase() && /[A-Z]/.test(text))
    spamScore += 15;
  const moneyMentions =
    (lower.match(/lakh|crore|inr/g) ?? []).length +
    (text.match(/\u20b9/g) ?? []).length;
  if (moneyMentions > 3) spamScore += 20;

  // Phishing signals
  for (const indicator of PHISHING_INDICATORS) {
    if (lower.includes(indicator)) {
      phishingScore += 25;
      break;
    }
  }
  if (/login|password|otp|bank account|aadhar number/i.test(lower))
    phishingScore += 30;
  if (/urgent|immediately|within 24 hours/i.test(lower)) phishingScore += 15;

  // Learned patterns
  const learned = getLearnedPatterns();
  if (learned.some((p) => lower.includes(p))) spamScore += 20;

  const isSpam = spamScore >= 40;
  const isPhishing = phishingScore >= 40;
  const confidence = Math.min(Math.max(spamScore, phishingScore), 100);

  let reason = "Content appears clean";
  if (isPhishing)
    reason =
      "Phishing attempt detected \u2014 suspicious links/credentials request";
  else if (isSpam)
    reason = "Spam pattern detected \u2014 repeated/bulk promotional content";

  return { isSpam, isPhishing, confidence, reason };
}

// ── Sample realistic data ──────────────────────────────────────────────────

function getSampleFlaggedItems(): FlaggedItem[] {
  return [
    {
      id: "flag_001",
      type: "post",
      content:
        "यह एक फर्जी JCB operator profile है! मुझसे ₹5000 ले लिए और काम नहीं किया। FRAUD ALERT!",
      userId: "user_a1b2",
      userName: "Ramesh Yadav",
      userMobile: "9812345678",
      section: "Operator Ekta",
      flaggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      violations: ["Banned words: फर्जी, fraud", "All caps text"],
      riskLevel: "high",
      action: "flag",
      status: "pending",
      violationCount: 2,
    },
    {
      id: "flag_002",
      type: "comment",
      content:
        "Call me for easy money 99999999999999 guaranteed 100% income from home. Click: www.scam-link.com",
      userId: "user_c3d4",
      userName: "Unknown User",
      userMobile: "9876543210",
      section: "Female Hub",
      flaggedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      violations: [
        "Banned words: scam",
        "Excessive links",
        "Unverified guarantee claim",
      ],
      riskLevel: "high",
      action: "delete",
      status: "pending",
      violationCount: 3,
    },
    {
      id: "flag_003",
      type: "profile",
      content:
        "Driver - 20 years experience. Aadhaar fake hai but real looking. Hire karo.",
      userId: "user_e5f6",
      userName: "Suresh Kumar",
      userMobile: "8765432109",
      section: "Job Post",
      flaggedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      violations: ["Fake ID indicators", "Banned words: fake"],
      riskLevel: "high",
      action: "block",
      status: "pending",
      violationCount: 4,
    },
    {
      id: "flag_004",
      type: "complaint",
      content:
        "Spam spam spam ₹₹₹ पैसा कमाओ घर बैठे! Join करो! फ्री में lakh rupees!",
      userId: "user_g7h8",
      userName: "Priya Devi",
      userMobile: "7654321098",
      section: "Payment Complaint",
      flaggedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      violations: ["Banned words: spam", "Suspicious money claims"],
      riskLevel: "medium",
      action: "flag",
      status: "pending",
      violationCount: 1,
    },
    {
      id: "flag_005",
      type: "post",
      content:
        "AAAAAAAAAAAAA JCB available BBBBBBBBB contact now 99887766 99887766 99887766",
      userId: "user_i9j0",
      userName: "Operator XYZ",
      userMobile: "6543210987",
      section: "Operator Ekta",
      flaggedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      violations: [
        "Repeated characters (spam)",
        "Multiple phone numbers in post",
      ],
      riskLevel: "medium",
      action: "flag",
      status: "resolved",
      violationCount: 2,
    },
    {
      id: "flag_006",
      type: "job",
      content:
        "Urgent! Driver needed. No experience required. Salary ₹50,000/month guaranteed. WhatsApp only.",
      userId: "user_k1l2",
      userName: "ABC Company",
      userMobile: "5432109876",
      section: "Job Post",
      flaggedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      violations: ["Unverified guarantee claim", "Suspicious money claims"],
      riskLevel: "medium",
      action: "flag",
      status: "dismissed",
      violationCount: 1,
    },
    {
      id: "flag_007",
      type: "comment",
      content: "बकवास post mat karo. यह group kaam ke liye hai.",
      userId: "user_m3n4",
      userName: "Mohan Singh",
      userMobile: "4321098765",
      section: "Operator Ekta",
      flaggedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      violations: ["Banned words: बकवास"],
      riskLevel: "low",
      action: "flag",
      status: "dismissed",
      violationCount: 1,
    },
    {
      id: "flag_008",
      type: "profile",
      content: "Electrician - Expert. ID proof: [Aadhaar farzi copy uploaded]",
      userId: "user_o5p6",
      userName: "Fake Electrician",
      userMobile: "3210987654",
      section: "Job Post",
      flaggedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      violations: ["Fake ID indicators"],
      riskLevel: "high",
      action: "delete",
      status: "resolved",
      violationCount: 3,
    },
  ];
}
