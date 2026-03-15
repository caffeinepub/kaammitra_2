import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Bookmark,
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Facebook,
  Gift,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Settings2,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  User,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CATEGORIES,
  getMyExtendedProfile,
  saveMyExtendedProfile,
} from "../lib/constants";

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────
const INDIA_STATES: Record<string, string[]> = {
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Meerut",
    "Allahabad",
    "Noida",
    "Ghaziabad",
  ],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
  Delhi: ["New Delhi", "Dwarka", "Rohini", "Saket", "Lajpat Nagar"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol"],
};

function loadProfile(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem("workerProfile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(data: Record<string, string>) {
  localStorage.setItem("workerProfile", JSON.stringify(data));
  const webhookUrl = localStorage.getItem("sheetsWebhookUrl");
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_PROFILE", data }),
    }).catch(() => {});
  }
}

const MOCK_LOGIN_HISTORY = [
  {
    device: "Samsung Galaxy A52",
    date: "14 Mar 2026, 10:32 AM",
    location: "Lucknow, UP",
  },
  {
    device: "Chrome on Windows",
    date: "12 Mar 2026, 06:15 PM",
    location: "Delhi",
  },
  {
    device: "Samsung Galaxy A52",
    date: "10 Mar 2026, 08:45 AM",
    location: "Lucknow, UP",
  },
];

// ──────────────────────────────────────────────
//  Row helper
// ──────────────────────────────────────────────
function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  ocid,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  ocid: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        data-ocid={ocid}
        className="shrink-0"
      />
    </div>
  );
}

// ──────────────────────────────────────────────
//  Main Component
// ──────────────────────────────────────────────
export function Settings() {
  const navigate = useNavigate();
  const profile = loadProfile();
  const extProfile = getMyExtendedProfile();

  // ── Profile ──
  const [epName, setEpName] = useState(profile?.name || "");
  const [epCategory, setEpCategory] = useState(profile?.category || "");
  const [epExperience, setEpExperience] = useState(profile?.experience || "");
  const [epState, setEpState] = useState(profile?.state || "");
  const [epCity, setEpCity] = useState(profile?.city || "");
  const [epPhotoPreview, setEpPhotoPreview] = useState<string | null>(
    profile?.photo || extProfile?.profilePhotoBase64 || null,
  );
  const [epEmail, setEpEmail] = useState(profile?.email || "");
  const photoRef = useRef<HTMLInputElement>(null);

  // ── Mobile OTP ──
  const [mobileNum, setMobileNum] = useState(profile?.mobile || "");
  const [mobileOtp, setMobileOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(
    profile?.mobileVerified === "true",
  );

  // ── Email ──
  const [emailSent, setEmailSent] = useState(false);

  // ── Location ──
  const [locState, setLocState] = useState(profile?.state || "");
  const [locCity, setLocCity] = useState(profile?.city || "");
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── Availability ──
  const [availability, setAvailability] = useState<
    "available" | "busy" | "offline"
  >((profile?.availability as "available" | "busy" | "offline") || "available");

  // ── Password ──
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Security ──
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private" | "contacts"
  >("public");

  // ── Notifications ──
  const [notifJobAlerts, setNotifJobAlerts] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifBooking, setNotifBooking] = useState(true);

  // ── Job Preferences ──
  const [jobPrefCategory, setJobPrefCategory] = useState("");
  const [jobPrefSalary, setJobPrefSalary] = useState("");
  const [jobPrefLocation, setJobPrefLocation] = useState("");
  const [jobAvailType, setJobAvailType] = useState<"fulltime" | "parttime">(
    "fulltime",
  );
  const [workRadius, setWorkRadius] = useState("25");

  // ── Feedback / Rate ──
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  // ── Help ──
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportCategory, setReportCategory] = useState("");

  // ── Theme & Language ──
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("Hindi");

  // ── Account Deletion ──
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deactivated, setDeactivated] = useState(false);

  // ── Referral ──
  const userId =
    profile?.mobile ||
    `USER${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const referralLink = `https://kaammitra.app/invite/${userId}`;

  // Load persisted settings
  useEffect(() => {
    const savedTheme = (localStorage.getItem("kaam_mitra_theme") || "light") as
      | "light"
      | "dark";
    const saved2FA = localStorage.getItem("kaam_mitra_2fa_enabled") === "true";
    const savedVisibility = (localStorage.getItem(
      "kaam_mitra_profile_visibility",
    ) || "public") as "public" | "private" | "contacts";
    const savedNotifs = JSON.parse(
      localStorage.getItem("kaam_mitra_notifications") || "{}",
    );
    const savedLanguage =
      localStorage.getItem("kaam_mitra_language") || "Hindi";
    const savedJobPrefs = JSON.parse(
      localStorage.getItem("kaam_mitra_job_prefs") || "{}",
    );
    const savedDeactivated =
      localStorage.getItem("kaam_mitra_account_deactivated") === "true";

    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
    setTwoFAEnabled(saved2FA);
    setProfileVisibility(savedVisibility);
    if (savedNotifs.jobAlerts !== undefined)
      setNotifJobAlerts(savedNotifs.jobAlerts);
    if (savedNotifs.messages !== undefined)
      setNotifMessages(savedNotifs.messages);
    if (savedNotifs.community !== undefined)
      setNotifCommunity(savedNotifs.community);
    if (savedNotifs.payment !== undefined) setNotifPayment(savedNotifs.payment);
    if (savedNotifs.booking !== undefined) setNotifBooking(savedNotifs.booking);
    setLanguage(savedLanguage);
    if (savedJobPrefs.category) setJobPrefCategory(savedJobPrefs.category);
    if (savedJobPrefs.salary) setJobPrefSalary(savedJobPrefs.salary);
    if (savedJobPrefs.location) setJobPrefLocation(savedJobPrefs.location);
    if (savedJobPrefs.availType) setJobAvailType(savedJobPrefs.availType);
    if (savedJobPrefs.radius) setWorkRadius(savedJobPrefs.radius);
    setDeactivated(savedDeactivated);
  }, []);

  // Password rules
  const pwRules = {
    length: cpNew.length >= 10,
    upper: /[A-Z]/.test(cpNew),
    lower: /[a-z]/.test(cpNew),
    number: /[0-9]/.test(cpNew),
    special: /[^A-Za-z0-9]/.test(cpNew),
  };
  const pwValid = Object.values(pwRules).every(Boolean);

  // ── Handlers ──
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEpPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleEditProfileSave() {
    const current = loadProfile() || {};
    const updated = {
      ...current,
      name: epName,
      email: epEmail,
      category: epCategory,
      experience: epExperience,
      state: epState,
      city: epCity,
      photo: epPhotoPreview || current.photo,
    };
    saveProfile(updated);
    const ext = getMyExtendedProfile();
    if (ext)
      saveMyExtendedProfile({
        ...ext,
        profilePhotoBase64: epPhotoPreview || ext.profilePhotoBase64 || "",
      });
    toast.success("Profile update ho gaya! ✅");
  }

  function handleSendOtp() {
    if (!/^[0-9]{10}$/.test(mobileNum)) {
      toast.error("10 digit ka mobile number daalo");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    toast.success(`OTP bheja gaya (Demo): ${otp}`);
  }

  function handleVerifyOtp() {
    if (mobileOtp === generatedOtp) {
      const current = loadProfile() || {};
      saveProfile({ ...current, mobile: mobileNum, mobileVerified: "true" });
      setMobileVerified(true);
      const ext = getMyExtendedProfile();
      if (ext) saveMyExtendedProfile({ ...ext, mobileVerified: true });
      toast.success("Mobile Number Verified! ✅");
    } else {
      toast.error("Galat OTP! Dobara try karein");
    }
  }

  function handleEmailSend() {
    if (!epEmail.includes("@")) {
      toast.error("Valid email daalo");
      return;
    }
    const current = loadProfile() || {};
    saveProfile({ ...current, email: epEmail, emailVerified: "true" });
    setEmailSent(true);
    toast.success("Verification link bhej diya! (Demo)");
  }

  function handleLocationSave() {
    if (!locState || !locCity) {
      toast.error("State aur City chunein");
      return;
    }
    const current = loadProfile() || {};
    saveProfile({ ...current, state: locState, city: locCity });
    setEpState(locState);
    setEpCity(locCity);
    toast.success("Location update ho gaya! 📍");
  }

  function handleGpsDetect() {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setGpsLoading(false);
        toast.success("GPS location detect ho gaya");
      },
      () => {
        setGpsLoading(false);
        toast.error("GPS access nahi mila");
      },
    );
  }

  function handleAvailabilityChange(val: "available" | "busy" | "offline") {
    setAvailability(val);
    const current = loadProfile() || {};
    saveProfile({ ...current, availability: val });
    const msgs = {
      available: "Ab aap Available hain 🟢",
      busy: "Status Busy set ho gaya 🔴",
      offline: "Status Offline set ho gaya ⚫",
    };
    toast.success(msgs[val]);
  }

  function handleChangePassword() {
    if (!cpCurrent) {
      toast.error("Current password daalo");
      return;
    }
    if (!pwValid) {
      toast.error("Password requirements poore nahi hain");
      return;
    }
    if (cpNew !== cpConfirm) {
      toast.error("Passwords match nahi kar rahe");
      return;
    }
    toast.success("Password change ho gaya! 🔐");
    setCpCurrent("");
    setCpNew("");
    setCpConfirm("");
  }

  function handle2FAToggle(checked: boolean) {
    setTwoFAEnabled(checked);
    localStorage.setItem("kaam_mitra_2fa_enabled", checked.toString());
    toast.success(checked ? "2FA Enable ho gaya 🔐" : "2FA Disable ho gaya");
  }

  function handleDownloadData() {
    const data = {
      profile: loadProfile(),
      extProfile: getMyExtendedProfile(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kaammitra_profile.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data download ho raha hai 📥");
  }

  function handleSaveNotifications() {
    localStorage.setItem(
      "kaam_mitra_notifications",
      JSON.stringify({
        jobAlerts: notifJobAlerts,
        messages: notifMessages,
        community: notifCommunity,
        payment: notifPayment,
        booking: notifBooking,
      }),
    );
    toast.success("Notification settings save ho gaye ✅");
  }

  function handleSaveJobPrefs() {
    localStorage.setItem(
      "kaam_mitra_job_prefs",
      JSON.stringify({
        category: jobPrefCategory,
        salary: jobPrefSalary,
        location: jobPrefLocation,
        availType: jobAvailType,
        radius: workRadius,
      }),
    );
    toast.success("Job preferences save ho gaye ✅");
  }

  function handleCopyReferral() {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => toast.success("Referral link copy ho gaya! 🔗"))
      .catch(() => toast.error("Copy nahi ho paya"));
  }

  function handleShareWhatsApp() {
    const msg = encodeURIComponent(
      `KaamMitra App se kaam dhundho ya workers hire karo! Join karein: ${referralLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function handleShareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      "_blank",
    );
  }

  function handleShareTelegram() {
    const msg = encodeURIComponent(
      `KaamMitra App - India ka Best Labour Marketplace! Join karein: ${referralLink}`,
    );
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${msg}`,
      "_blank",
    );
  }

  function handleShareAvailability() {
    const statusMap = {
      available: "Available for Work 🟢",
      busy: "Busy 🔴",
      offline: "Offline ⚫",
    };
    const msg = encodeURIComponent(
      `Main ab ${statusMap[availability]} hoon. KaamMitra par mujhe hire karein: ${referralLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function handleThemeToggle(checked: boolean) {
    const t = checked ? "dark" : "light";
    setTheme(t);
    localStorage.setItem("kaam_mitra_theme", t);
    if (t === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    toast.success(checked ? "Dark Mode On 🌙" : "Light Mode On ☀️");
  }

  function handleLanguageChange(val: string) {
    setLanguage(val);
    localStorage.setItem("kaam_mitra_language", val);
    toast.success(`Language ${val} set ho gayi`);
  }

  function handleContactSupport() {
    if (!contactName || !contactMessage) {
      toast.error("Naam aur message daalo");
      return;
    }
    toast.success("Message bhej diya gaya! Hum jaldi contact karenge 📩");
    setContactName("");
    setContactMessage("");
  }

  function handleReportProblem() {
    if (!reportDescription) {
      toast.error("Problem describe karein");
      return;
    }
    toast.success("Report submit ho gayi! Admin review karega ✅");
    setReportDescription("");
    setReportCategory("");
  }

  function handleDeactivateToggle(checked: boolean) {
    setDeactivated(checked);
    localStorage.setItem("kaam_mitra_account_deactivated", checked.toString());
    toast.success(
      checked ? "Account deactivate ho gaya" : "Account activate ho gaya",
    );
  }

  function handleDeleteAccount() {
    if (!deleteEmail.includes("@")) {
      toast.error("Valid email daalo");
      return;
    }
    localStorage.clear();
    toast.success("Account delete ho gaya. App band ho raha hai...");
    setTimeout(() => navigate({ to: "/" }), 2000);
  }

  function handleLogout() {
    localStorage.removeItem("workerProfile");
    toast.success("Logout ho gaye! 👋");
    navigate({ to: "/" });
  }

  const availBadge = {
    available: (
      <Badge className="bg-green-500 text-white text-xs px-2">
        🟢 Available
      </Badge>
    ),
    busy: <Badge className="bg-red-500 text-white text-xs px-2">🔴 Busy</Badge>,
    offline: (
      <Badge className="bg-gray-500 text-white text-xs px-2">⚫ Offline</Badge>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </button>
        <div>
          <h1 className="font-bold text-lg leading-tight">Settings</h1>
          <p className="text-xs opacity-80">
            Apni profile aur preferences manage karein
          </p>
        </div>
        <div className="ml-auto">{availBadge[availability]}</div>
      </div>

      {/* Quick action cards */}
      <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
        {[
          {
            label: "Worker Verify",
            icon: ShieldCheck,
            to: "/worker-verification",
            color: "bg-blue-50 border-blue-200 text-blue-700",
          },
          {
            label: "ID Card",
            icon: Bookmark,
            to: "/worker-id-card",
            color: "bg-green-50 border-green-200 text-green-700",
          },
          {
            label: "Verify & Pay",
            icon: Zap,
            to: "/verify-and-pay",
            color: "bg-orange-50 border-orange-200 text-orange-700",
          },
          {
            label: "Scan Worker",
            icon: Users,
            to: "/scan-worker",
            color: "bg-purple-50 border-purple-200 text-purple-700",
          },
        ].map(({ label, icon: Icon, to, color }) => (
          <button
            type="button"
            key={to}
            onClick={() => navigate({ to })}
            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${color} active:scale-95 transition-transform`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Main Accordion */}
      <div className="px-4 pb-6">
        <Accordion type="single" collapsible className="space-y-2">
          {/* ── SECTION 1: Profile Settings ── */}
          <AccordionItem
            value="profile"
            data-ocid="settings.profile_section"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Profile Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Photo, name, contact, location
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-5">
              {/* Photo */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted border-2 border-primary/30 overflow-hidden flex items-center justify-center">
                    {epPhotoPreview ? (
                      <img
                        src={epPhotoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-muted-foreground">
                  Photo tap karke change karein
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Poora Naam</Label>
                <Input
                  value={epName}
                  onChange={(e) => setEpName(e.target.value)}
                  placeholder="Aapka naam"
                  data-ocid="settings.profile.input"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email ID</Label>
                <div className="flex gap-2">
                  <Input
                    value={epEmail}
                    onChange={(e) => setEpEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEmailSend}
                    className="shrink-0 text-xs"
                  >
                    {emailSent ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {emailSent && (
                  <p className="text-xs text-green-600">
                    ✅ Verification link bheja gaya (Demo)
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Work Category</Label>
                <Select value={epCategory} onValueChange={setEpCategory}>
                  <SelectTrigger data-ocid="settings.profile.select">
                    <SelectValue placeholder="Category chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.slice(0, 30).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Experience</Label>
                <Select value={epExperience} onValueChange={setEpExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Fresher (0 saal)",
                      "1 saal",
                      "2 saal",
                      "3 saal",
                      "4 saal",
                      "5 saal",
                      "6-10 saal",
                      "10+ saal",
                    ].map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile OTP */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-2">
                  Mobile Number
                  {mobileVerified && (
                    <Badge className="bg-green-500 text-white text-xs py-0">
                      Verified
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={mobileNum}
                    onChange={(e) => setMobileNum(e.target.value)}
                    placeholder="10 digit number"
                    maxLength={10}
                    className="flex-1"
                    data-ocid="settings.profile.input"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendOtp}
                    className="shrink-0 text-xs"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1" /> OTP
                  </Button>
                </div>
                {otpSent && (
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleVerifyOtp}
                      className="shrink-0 text-xs"
                    >
                      Verify
                    </Button>
                  </div>
                )}
                {otpSent && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    Demo OTP check karein: {generatedOtp}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Location (State / City)
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={locState}
                    onValueChange={(v) => {
                      setLocState(v);
                      setLocCity("");
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(INDIA_STATES).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={locCity}
                    onValueChange={setLocCity}
                    disabled={!locState}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {(INDIA_STATES[locState] || []).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGpsDetect}
                    disabled={gpsLoading}
                    className="flex-1 text-xs"
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1" />{" "}
                    {gpsLoading ? "Detecting..." : "GPS Use Karein"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleLocationSave}
                    className="flex-1 text-xs"
                  >
                    Save Location
                  </Button>
                </div>
              </div>

              {/* Availability */}
              <div
                className="space-y-2"
                data-ocid="settings.availability_toggle"
              >
                <Label className="text-xs font-medium">
                  Availability Status
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["available", "busy", "offline"] as const).map((s) => {
                    const cfg = {
                      available: {
                        label: "Available",
                        color: "bg-green-500",
                        ring: "ring-green-400",
                      },
                      busy: {
                        label: "Busy",
                        color: "bg-red-500",
                        ring: "ring-red-400",
                      },
                      offline: {
                        label: "Offline",
                        color: "bg-gray-500",
                        ring: "ring-gray-400",
                      },
                    };
                    const c = cfg[s];
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => handleAvailabilityChange(s)}
                        className={`py-2.5 rounded-xl text-xs font-semibold text-white transition-all ${c.color} ${availability === s ? `ring-2 ${c.ring} ring-offset-2 scale-105` : "opacity-60"}`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleEditProfileSave}
                className="w-full"
                data-ocid="settings.save_button"
              >
                Profile Save Karein ✅
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 2: Security & Privacy ── */}
          <AccordionItem
            value="security"
            data-ocid="settings.security_section"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Security & Privacy</p>
                  <p className="text-xs text-muted-foreground">
                    Password, 2FA, privacy controls
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-5">
              {/* Change Password */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Password Change
                </p>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      value={cpCurrent}
                      onChange={(e) => setCpCurrent(e.target.value)}
                      placeholder="Current password"
                      data-ocid="settings.security.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={cpNew}
                      onChange={(e) => setCpNew(e.target.value)}
                      placeholder="New password (min 10 chars)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={cpConfirm}
                      onChange={(e) => setCpConfirm(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {cpNew && (
                    <div className="space-y-1 p-3 bg-muted rounded-xl text-xs">
                      {Object.entries({
                        length: "Min 10 characters",
                        upper: "Uppercase letter",
                        lower: "Lowercase letter",
                        number: "Number",
                        special: "Special character",
                      }).map(([k, label]) => (
                        <div
                          key={k}
                          className={`flex items-center gap-1.5 ${pwRules[k as keyof typeof pwRules] ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {pwRules[k as keyof typeof pwRules] ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-current" />
                          )}
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    className="w-full text-sm"
                    disabled={!pwValid && cpNew.length > 0}
                  >
                    <Lock className="h-4 w-4 mr-2" /> Password Change Karein
                  </Button>
                </div>
              </div>

              {/* 2FA */}
              <SwitchRow
                label="Two-Factor Authentication (2FA)"
                description="Login par extra security ke liye OTP"
                checked={twoFAEnabled}
                onCheckedChange={handle2FAToggle}
                ocid="settings.two_factor_switch"
              />

              {/* Login History */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Login History
                </p>
                {MOCK_LOGIN_HISTORY.map((log) => (
                  <div
                    key={log.date}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{log.device}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.date} · {log.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Visibility */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Profile Visibility
                </p>
                <RadioGroup
                  value={profileVisibility}
                  onValueChange={(v) => {
                    setProfileVisibility(
                      v as "public" | "private" | "contacts",
                    );
                    localStorage.setItem("kaam_mitra_profile_visibility", v);
                  }}
                  className="space-y-2"
                >
                  {[
                    {
                      value: "public",
                      label: "Public",
                      desc: "Sabhi dekh sakte hain",
                    },
                    {
                      value: "private",
                      label: "Private",
                      desc: "Sirf aap dekh sakte hain",
                    },
                    {
                      value: "contacts",
                      label: "Contacts Only",
                      desc: "Sirf saved contacts",
                    },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center gap-3 p-3 border border-border rounded-xl"
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`vis-${opt.value}`}
                        data-ocid="settings.security.radio"
                      />
                      <Label
                        htmlFor={`vis-${opt.value}`}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {opt.desc}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Show/Hide Phone */}
              <SwitchRow
                label="Phone Number Dikhayein"
                description="Contractors ko number visible rahega"
                checked={showPhoneNumber}
                onCheckedChange={(v) => {
                  setShowPhoneNumber(v);
                  localStorage.setItem("kaam_mitra_show_phone", v.toString());
                }}
                ocid="settings.security.switch"
              />

              {/* Block Users */}
              <button
                type="button"
                onClick={() => toast.info("Blocked users list coming soon")}
                className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" /> Blocked
                  Users
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Download Data */}
              <Button
                variant="outline"
                onClick={handleDownloadData}
                className="w-full text-sm"
              >
                <Download className="h-4 w-4 mr-2" /> Mera Data Download Karein
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 3: Notifications ── */}
          <AccordionItem
            value="notifications"
            data-ocid="settings.notifications_section"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">
                    Notification Preferences
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Job alerts, messages, payments
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-0 pt-2">
                <SwitchRow
                  label="Job Alert Notifications"
                  description="Nayi naukri ke alerts"
                  checked={notifJobAlerts}
                  onCheckedChange={setNotifJobAlerts}
                  ocid="settings.job_alert_switch"
                />
                <SwitchRow
                  label="Message Notifications"
                  description="Naye messages ka notification"
                  checked={notifMessages}
                  onCheckedChange={setNotifMessages}
                  ocid="settings.notifications.switch"
                />
                <SwitchRow
                  label="Community Post Notifications"
                  description="Community posts aur updates"
                  checked={notifCommunity}
                  onCheckedChange={setNotifCommunity}
                  ocid="settings.notifications.switch"
                />
                <SwitchRow
                  label="Payment Alert Notifications"
                  description="Payment aur escrow alerts"
                  checked={notifPayment}
                  onCheckedChange={setNotifPayment}
                  ocid="settings.notifications.switch"
                />
                <SwitchRow
                  label="Booking Request Notifications"
                  description="New booking requests"
                  checked={notifBooking}
                  onCheckedChange={setNotifBooking}
                  ocid="settings.notifications.switch"
                />
              </div>
              <Button
                onClick={handleSaveNotifications}
                className="w-full mt-4 text-sm"
                data-ocid="settings.save_button"
              >
                Notification Settings Save Karein
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 4: Job Preferences ── */}
          <AccordionItem
            value="job-prefs"
            data-ocid="settings.job_prefs_section"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Job Preferences</p>
                  <p className="text-xs text-muted-foreground">
                    Category, salary, work radius
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Preferred Work Category
                </Label>
                <Select
                  value={jobPrefCategory}
                  onValueChange={setJobPrefCategory}
                >
                  <SelectTrigger data-ocid="settings.job_prefs_section.select">
                    <SelectValue placeholder="Category chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.slice(0, 30).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Salary Expectation (per day ₹)
                </Label>
                <Input
                  type="number"
                  value={jobPrefSalary}
                  onChange={(e) => setJobPrefSalary(e.target.value)}
                  placeholder="e.g. 800"
                  data-ocid="settings.job_prefs_section.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Preferred Work Location
                </Label>
                <Input
                  value={jobPrefLocation}
                  onChange={(e) => setJobPrefLocation(e.target.value)}
                  placeholder="e.g. Lucknow, Delhi, All India"
                  data-ocid="settings.job_prefs_section.input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Availability Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "fulltime", label: "Full Time" },
                      { value: "parttime", label: "Part Time" },
                    ] as const
                  ).map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setJobAvailType(opt.value)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${jobAvailType === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-foreground"}`}
                      data-ocid="settings.job_prefs_section.radio"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Work Radius</Label>
                <Select value={workRadius} onValueChange={setWorkRadius}>
                  <SelectTrigger data-ocid="settings.job_prefs_section.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 KM</SelectItem>
                    <SelectItem value="10">10 KM</SelectItem>
                    <SelectItem value="25">25 KM</SelectItem>
                    <SelectItem value="50">50 KM</SelectItem>
                    <SelectItem value="all">All India</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSaveJobPrefs}
                className="w-full text-sm"
                data-ocid="settings.save_button"
              >
                Job Preferences Save Karein ✅
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 5: Theme & Language ── */}
          <AccordionItem
            value="theme-lang"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-violet-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Theme & Language</p>
                  <p className="text-xs text-muted-foreground">
                    Dark mode, Hindi/English
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <SwitchRow
                label="Dark Mode"
                description={
                  theme === "dark"
                    ? "Dark mode on hai 🌙"
                    : "Light mode on hai ☀️"
                }
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
                ocid="settings.theme.switch"
              />
              <div className="space-y-2">
                <Label className="text-xs font-medium">Language</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Hindi", "English"].map((lang) => (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${language === lang ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-foreground"}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 6: About App ── */}
          <AccordionItem
            value="about"
            data-ocid="settings.about_section"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <Info className="h-4 w-4 text-sky-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">About App</p>
                  <p className="text-xs text-muted-foreground">
                    Version, terms, feedback
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Version */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <span className="text-sm font-medium">App Version</span>
                <Badge variant="outline">v2.0</Badge>
              </div>

              {/* About */}
              <div className="p-3 bg-primary/5 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-primary">
                  KaamMitra के बारे में
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  KaamMitra India ka sabse bada labour marketplace hai jahan
                  construction workers, drivers, domestic workers aur bahut se
                  professionals apna kaam dhundh sakte hain. Hum contractors aur
                  workers ko directly connect karte hain — bina kisi beech waale
                  ke.
                </p>
              </div>

              {/* Links */}
              {[
                { label: "Terms & Conditions", icon: Lock },
                { label: "Privacy Policy", icon: Shield },
                { label: "Community Guidelines", icon: Users },
              ].map(({ label, icon: Icon }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => toast.info(`${label} - Coming soon`)}
                  className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}

              {/* Rate App */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  App ko Rate Karein
                </p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => {
                        setRating(star);
                        toast.success(`${star} star diya! Shukriya 🙏`);
                      }}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Feedback Bhejein
                </p>
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Apna experience share karein ya naya feature suggest karein..."
                  rows={3}
                  data-ocid="settings.about_section.textarea"
                />
                <Button
                  onClick={() => {
                    if (!feedbackText.trim()) {
                      toast.error("Feedback likhein");
                      return;
                    }
                    toast.success("Feedback bhej diya! Shukriya 🙏");
                    setFeedbackText("");
                  }}
                  className="w-full text-sm"
                >
                  <Send className="h-4 w-4 mr-2" /> Feedback Submit Karein
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 7: Bonus Tools / Share ── */}
          <AccordionItem
            value="bonus"
            data-ocid="settings.bonus_tools_section"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Gift className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Bonus Tools & Share</p>
                  <p className="text-xs text-muted-foreground">
                    Referral, share app, quick links
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Referral Link */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Mera Referral Link
                </p>
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-xs text-primary flex-1 truncate font-mono">
                    {referralLink}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyReferral}
                    className="shrink-0"
                    data-ocid="settings.referral_copy_button"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Invite karein aur ₹10 wallet bonus paayein 💰
                </p>
              </div>

              {/* Share App */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  KaamMitra Share Karein
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-2 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 text-sm"
                    data-ocid="settings.share_whatsapp_button"
                  >
                    <MessageSquare className="h-4 w-4" /> WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShareFacebook}
                    className="flex items-center gap-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 text-sm"
                  >
                    <Facebook className="h-4 w-4" /> Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShareTelegram}
                    className="flex items-center gap-2 text-sky-600 border-sky-200 bg-sky-50 hover:bg-sky-100 text-sm"
                  >
                    <Send className="h-4 w-4" /> Telegram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyReferral}
                    className="flex items-center gap-2 text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm"
                  >
                    <Copy className="h-4 w-4" /> Copy Link
                  </Button>
                </div>
              </div>

              {/* Worker Availability Share */}
              <Button
                variant="outline"
                onClick={handleShareAvailability}
                className="w-full flex items-center gap-2 text-sm text-green-700 border-green-200"
              >
                <Share2 className="h-4 w-4" /> Apni Availability WhatsApp par
                Share Karein
              </Button>

              {/* Quick Links */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Quick Links
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Nearby Jobs",
                      to: "/find-work",
                      icon: MapPin,
                      color: "text-blue-600",
                    },
                    {
                      label: "Rate Card",
                      to: "/operator-poster",
                      icon: Star,
                      color: "text-yellow-600",
                    },
                    {
                      label: "Operator Community",
                      to: "/operator-poster",
                      icon: Users,
                      color: "text-purple-600",
                    },
                    {
                      label: "Premium Plans",
                      to: "/premium-plans",
                      icon: Zap,
                      color: "text-orange-600",
                    },
                  ].map(({ label, to, icon: Icon, color }) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => navigate({ to })}
                      className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION: Government Rules ── */}
          {/* ── SECTION: Operator Ekta (Community) ── */}
          <AccordionItem
            value="operator-ekta"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">
                    Operator Ekta (Community)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    State groups, community posts
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                Apne state ke operators se connect karein aur ek-doosre ki madad
                karein.
              </p>
              {[
                {
                  label: "Join State Group",
                  emoji: "🏛️",
                  ocid: "settings.ekta.join_group_button",
                },
                {
                  label: "All India Operator Group",
                  emoji: "🇮🇳",
                  ocid: "settings.ekta.all_india_button",
                },
                {
                  label: "Community Posts",
                  emoji: "📝",
                  ocid: "settings.ekta.community_button",
                },
                {
                  label: "Worker Discussions",
                  emoji: "💬",
                  ocid: "settings.ekta.discussions_button",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  data-ocid={item.ocid}
                  onClick={() => toast.info(`${item.label} — opening...`)}
                  className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <p className="text-sm font-medium">{item.label}</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION: Payment Complaint ── */}
          <AccordionItem
            value="payment-complaint"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Payment Complaint</p>
                  <p className="text-xs text-muted-foreground">
                    Contractor alerts, warning list
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                Agar kisi contractor ne payment nahi di to yahan report karein.
              </p>
              {[
                {
                  label: "Submit Complaint",
                  emoji: "📋",
                  ocid: "settings.complaint.submit_button",
                },
                {
                  label: "View Complaints",
                  emoji: "👁️",
                  ocid: "settings.complaint.view_button",
                },
                {
                  label: "Payment Alert List",
                  emoji: "⚠️",
                  ocid: "settings.complaint.alert_button",
                },
                {
                  label: "Contractor Warning",
                  emoji: "🚫",
                  ocid: "settings.complaint.warning_button",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  data-ocid={item.ocid}
                  onClick={() => toast.info(`${item.label} — opening...`)}
                  className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-3 transition-colors text-left"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <p className="text-sm font-medium text-red-800">
                    {item.label}
                  </p>
                  <ChevronRight className="w-4 h-4 text-red-400 ml-auto" />
                </button>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="govt-rules"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <span className="text-base">⚖️</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Government Rules</p>
                  <p className="text-xs text-muted-foreground">
                    Minimum Wage, Labour Law, Worker Rights
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Sarkari niyam aur adhikar ki jankari yahan se prapt karein.
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/min-wage" })}
                className="w-full flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                data-ocid="settings.govt.min_wage_button"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇮🇳</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm">न्यूनतम मजदूरी – भारत</p>
                    <p className="text-xs text-muted-foreground">
                      Government Minimum Wage Notification
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">→</span>
              </button>
              <a
                href="https://clc.gov.in/clc/min-wages"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-colors"
                data-ocid="settings.govt.clc_link"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏛️</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm">
                      Chief Labour Commissioner
                    </p>
                    <p className="text-xs text-muted-foreground">
                      clc.gov.in – Official Source
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">↗</span>
              </a>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 8: Help & Support ── */}
          <AccordionItem
            value="help"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-teal-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Help & Support</p>
                  <p className="text-xs text-muted-foreground">
                    Contact, FAQ, report a problem
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Contact Support */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact Support
                </p>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Aapka naam"
                />
                <Textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Kya problem hai? Batayein..."
                  rows={3}
                  data-ocid="settings.help.textarea"
                />
                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  className="w-full text-sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Support ko Message
                  Bhejein
                </Button>
              </div>

              {/* FAQ */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  FAQ
                </p>
                {[
                  {
                    q: "Profile activate kaise hogi?",
                    a: "Registration fee bharo, payment verify hone ke baad profile active ho jayegi.",
                  },
                  {
                    q: "Verified badge kaise milega?",
                    a: "Worker Verification page par jaao aur documents upload karo.",
                  },
                  {
                    q: "Payment nahi aayi contractor se?",
                    a: "Blacklist Contractor section mein complaint darj karein.",
                  },
                ].map((item) => (
                  <div
                    key={item.q}
                    className="p-3 bg-muted/50 rounded-xl space-y-1"
                  >
                    <p className="text-xs font-semibold">{item.q}</p>
                    <p className="text-xs text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>

              {/* Report Problem */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Report a Problem
                </p>
                <Select
                  value={reportCategory}
                  onValueChange={setReportCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Problem category chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "App crash",
                      "Payment issue",
                      "Fake profile",
                      "Harassment",
                      "Other",
                    ].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Problem detail mein batayein..."
                  rows={3}
                />
                <Button
                  onClick={handleReportProblem}
                  variant="outline"
                  className="w-full text-sm"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" /> Report Submit
                  Karein
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 9: Account ── */}
          <AccordionItem
            value="account"
            className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Account</p>
                  <p className="text-xs text-muted-foreground">
                    Logout, deactivate, delete
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {/* Deactivate */}
              <SwitchRow
                label="Account Deactivate Karein"
                description="Temporarily profile hide kar dein"
                checked={deactivated}
                onCheckedChange={handleDeactivateToggle}
                ocid="settings.account.switch"
              />
              {deactivated && (
                <Card className="p-3 bg-yellow-50 border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Aapka account abhi deactivate hai. Aap search results mein
                    nahi dikhenge.
                  </p>
                </Card>
              )}

              {/* Logout */}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-sm border-destructive/30 text-destructive hover:bg-destructive/5"
                data-ocid="settings.logout_button"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>

              {/* Delete Account */}
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full text-sm"
                    data-ocid="settings.delete_account_button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Account Permanently
                    Delete Karein
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="settings.account.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">
                      Account Delete?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Yeh action permanent hai aur undo nahi ho sakta. Saara
                      data delete ho jayega.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    placeholder="Confirm karne ke liye email daalo"
                    type="email"
                    className="mt-2"
                    data-ocid="settings.account.input"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="settings.account.cancel_button">
                      Ruk Jao
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                      data-ocid="settings.account.confirm_button"
                    >
                      Haan, Delete Karo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-xs text-center text-muted-foreground">
                Help ke liye{" "}
                <a
                  href="mailto:support@kaammitra.app"
                  className="text-primary underline"
                >
                  support@kaammitra.app
                </a>{" "}
                par contact karein
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Advanced Settings Button */}
        <button
          type="button"
          data-ocid="settings.advanced_settings_button"
          onClick={() => navigate({ to: "/advanced-settings" })}
          className="w-full flex items-center justify-between bg-muted/50 hover:bg-muted border border-border rounded-2xl px-4 py-4 transition-colors mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-slate-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Advanced Settings</p>
              <p className="text-xs text-muted-foreground">
                Language, privacy, storage, docs
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Prominent Logout */}
        <Button
          data-ocid="settings.main_logout_button"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 rounded-2xl text-sm mb-4"
          onClick={() => {
            localStorage.clear();
            toast.success("Logout ho gaye! 👋");
            navigate({ to: "/" });
          }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout / Bahar Jaayein
        </Button>

        {/* Footer */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            KaamMitra v2.0 · India ka Labour Marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
