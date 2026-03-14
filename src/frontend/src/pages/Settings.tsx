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
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  History,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  MAIN_CATEGORIES,
  getMyExtendedProfile,
  saveMyExtendedProfile,
} from "../lib/constants";

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
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum"],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
  ],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
};

function loadProfile() {
  try {
    const raw = localStorage.getItem("workerProfile");
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, string>;
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
      body: JSON.stringify({ ...data, type: "profile_update" }),
    }).catch(() => {});
  }
}

interface SectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

function Section({
  icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
  badge,
}: SectionProps) {
  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors active:bg-muted/60"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-sm">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
        <div className="shrink-0 text-muted-foreground ml-1">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4">
          {children}
        </div>
      )}
    </Card>
  );
}

const MOCK_LOGIN_HISTORY = [
  {
    date: "14 Mar 2026, 10:32 AM",
    device: "Chrome on Android",
    location: "Delhi",
  },
  {
    date: "12 Mar 2026, 06:15 PM",
    device: "Firefox on Android",
    location: "Noida",
  },
  {
    date: "10 Mar 2026, 09:00 AM",
    device: "Chrome on Android",
    location: "Lucknow",
  },
];

const MOCK_ACTIVITY = [
  { action: "Profile Updated", time: "14 Mar 2026, 10:35 AM" },
  {
    action: "Job Applied – JCB Operator (Delhi)",
    time: "13 Mar 2026, 04:20 PM",
  },
  { action: "Booking Confirmed – 3 Days", time: "12 Mar 2026, 02:10 PM" },
  { action: "Payment Made – ₹50 Registration", time: "11 Mar 2026, 11:00 AM" },
  { action: "Worker Verified ✅", time: "10 Mar 2026, 09:15 AM" },
];

export function Settings() {
  const navigate = useNavigate();
  const profile = loadProfile();
  const extProfile = getMyExtendedProfile();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // ── Profile Management ──
  const [epName, setEpName] = useState(profile?.name || "");
  const [epCategory, _setEpCategory] = useState(profile?.category || "");
  const [epExperience, _setEpExperience] = useState(profile?.experience || "");
  const [epState, _setEpState] = useState(profile?.state || "");
  const [epCity, _setEpCity] = useState(profile?.city || "");
  const [epPhotoPreview, setEpPhotoPreview] = useState(
    profile?.profilePhoto || "",
  );
  const [epGender, _setEpGender] = useState(extProfile?.gender || "");
  const photoRef = useRef<HTMLInputElement>(null);

  const [mobileNum, setMobileNum] = useState(profile?.mobile || "");
  const [mobileOtp, setMobileOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(
    profile?.mobileVerified === "true",
  );

  const [emailInput, setEmailInput] = useState(profile?.email || "");
  const [emailSent, setEmailSent] = useState(false);

  const [locState, setLocState] = useState(profile?.state || "");
  const [locCity, setLocCity] = useState(profile?.city || "");
  const [gpsLoading, setGpsLoading] = useState(false);

  const [availability, setAvailability] = useState(
    profile?.availability || "available",
  );

  // ── Account & Security ──
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // ── Privacy ──
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private"
  >("public");
  const [dataExpanded, setDataExpanded] = useState(false);

  // ── Payments ──
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingPincode, setBillingPincode] = useState("");

  // ── Notifications ──
  const [notifJobAlerts, setNotifJobAlerts] = useState(true);
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);

  // ── Theme & Language ──
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("Hindi");

  // ── Activity ──
  const [activityLog, _setActivityLog] = useState(MOCK_ACTIVITY);
  const [historyCleared, setHistoryCleared] = useState(false);

  // ── Help ──
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportCategory, setReportCategory] = useState("");

  // ── Account Deletion ──
  const [deactivated, setDeactivated] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const toggle = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem("kaam_mitra_theme") || "light") as
      | "light"
      | "dark";
    const saved2FA = localStorage.getItem("kaam_mitra_2fa_enabled") === "true";
    const savedVisibility = (localStorage.getItem(
      "kaam_mitra_profile_visibility",
    ) || "public") as "public" | "private";
    const savedNotifs = JSON.parse(
      localStorage.getItem("kaam_mitra_notifications") || "{}",
    );
    const savedLanguage =
      localStorage.getItem("kaam_mitra_language") || "Hindi";
    const savedPayment = JSON.parse(
      localStorage.getItem("kaam_mitra_payment_methods") || "{}",
    );
    const savedBilling = JSON.parse(
      localStorage.getItem("kaam_mitra_billing_address") || "{}",
    );
    const savedActivity = JSON.parse(
      localStorage.getItem("kaam_mitra_activity_log") || "[]",
    );
    const savedDeactivated =
      localStorage.getItem("kaam_mitra_account_deactivated") === "true";

    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
    setTwoFAEnabled(saved2FA);
    setProfileVisibility(savedVisibility);
    if (savedNotifs.jobAlerts !== undefined)
      setNotifJobAlerts(savedNotifs.jobAlerts);
    if (savedNotifs.booking !== undefined) setNotifBooking(savedNotifs.booking);
    if (savedNotifs.payment !== undefined) setNotifPayment(savedNotifs.payment);
    if (savedNotifs.updates !== undefined) setNotifUpdates(savedNotifs.updates);
    setLanguage(savedLanguage);
    if (savedPayment.upiId) setUpiId(savedPayment.upiId);
    if (savedPayment.cardNumber) setCardNumber(savedPayment.cardNumber);
    if (savedPayment.cardName) setCardName(savedPayment.cardName);
    if (savedBilling.name) setBillingName(savedBilling.name);
    if (savedBilling.address) setBillingAddress(savedBilling.address);
    if (savedBilling.city) setBillingCity(savedBilling.city);
    if (savedBilling.pincode) setBillingPincode(savedBilling.pincode);
    if (savedActivity.length > 0) _setActivityLog(savedActivity);
    setDeactivated(savedDeactivated);
  }, []);

  // Password rules
  const pwRules = {
    length: cpNew.length >= 12,
    upper: /[A-Z]/.test(cpNew),
    lower: /[a-z]/.test(cpNew),
    number: /[0-9]/.test(cpNew),
    special: /[^A-Za-z0-9]/.test(cpNew),
  };
  const pwValid = Object.values(pwRules).every(Boolean);

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
      category: epCategory,
      experience: epExperience,
      state: epState,
      city: epCity,
      profilePhoto: epPhotoPreview,
    };
    saveProfile(updated);
    const ext = getMyExtendedProfile();
    if (ext) saveMyExtendedProfile({ ...ext, gender: epGender || undefined });
    toast.success("Profile update ho gaya! ✅");
  }

  function handleChangePassword() {
    const stored = localStorage.getItem("workerPassword") || "1234";
    if (cpCurrent !== stored) {
      toast.error("Current password galat hai");
      return;
    }
    if (!pwValid) {
      toast.error("Naya password rules follow nahi kar raha");
      return;
    }
    if (cpNew !== cpConfirm) {
      toast.error("Passwords match nahi karte");
      return;
    }
    localStorage.setItem("workerPassword", cpNew);
    setCpCurrent("");
    setCpNew("");
    setCpConfirm("");
    toast.success("Password badal gaya! 🔒");
  }

  function handleSendOtp() {
    if (!/^[0-9]{10}$/.test(mobileNum)) {
      toast.error("10 digit ka mobile number daalo");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    toast.success("OTP bhej diya gaya (demo)");
  }

  function handleVerifyOtp() {
    if (mobileOtp === generatedOtp) {
      const current = loadProfile() || {};
      saveProfile({ ...current, mobile: mobileNum, mobileVerified: "true" });
      setMobileVerified(true);
      const ext = getMyExtendedProfile();
      if (ext) saveMyExtendedProfile({ ...ext, mobileVerified: true });
      toast.success("Mobile Number Verified Successfully ✅");
    } else {
      toast.error("Galat OTP! Dobara try karein");
    }
  }

  function handleEmailSend() {
    if (!emailInput.includes("@")) {
      toast.error("Valid email daalo");
      return;
    }
    const current = loadProfile() || {};
    saveProfile({ ...current, email: emailInput, emailVerified: "true" });
    // email verified state removed
    setEmailSent(true);
    const ext = getMyExtendedProfile();
    if (ext) saveMyExtendedProfile({ ...ext, emailVerified: true });
    toast.success("Verification link bhej diya! (Demo)");
  }

  function handleLocationSave() {
    if (!locState || !locCity) {
      toast.error("State aur City chunein");
      return;
    }
    const current = loadProfile() || {};
    saveProfile({ ...current, state: locState, city: locCity });
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

  function handleAvailabilityToggle(checked: boolean) {
    const newVal = checked ? "available" : "busy";
    setAvailability(newVal);
    const current = loadProfile() || {};
    saveProfile({ ...current, availability: newVal });
    toast.success(
      checked ? "Ab aap Available hain 🟢" : "Status Busy set ho gaya 🔴",
    );
  }

  function handle2FAToggle(checked: boolean) {
    setTwoFAEnabled(checked);
    localStorage.setItem("kaam_mitra_2fa_enabled", checked.toString());
    toast.success(checked ? "2FA Enable ho gaya 🔐" : "2FA Disable ho gaya");
  }

  function handleVisibilityToggle(checked: boolean) {
    const val = checked ? "public" : "private";
    setProfileVisibility(val);
    localStorage.setItem("kaam_mitra_profile_visibility", val);
    toast.success(checked ? "Profile ab Public hai" : "Profile ab Private hai");
  }

  function handleDownloadData() {
    const data = {
      profile: loadProfile(),
      extProfile: getMyExtendedProfile(),
      notifications: {
        jobAlerts: notifJobAlerts,
        booking: notifBooking,
        payment: notifPayment,
        updates: notifUpdates,
      },
      language,
      theme,
      profileVisibility,
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

  function handleSavePaymentMethods() {
    localStorage.setItem(
      "kaam_mitra_payment_methods",
      JSON.stringify({ upiId, cardNumber, cardName }),
    );
    toast.success("Payment methods save ho gaye ✅");
  }

  function handleSaveBilling() {
    localStorage.setItem(
      "kaam_mitra_billing_address",
      JSON.stringify({
        name: billingName,
        address: billingAddress,
        city: billingCity,
        pincode: billingPincode,
      }),
    );
    toast.success("Billing address save ho gaya ✅");
  }

  function handleSaveNotifications() {
    localStorage.setItem(
      "kaam_mitra_notifications",
      JSON.stringify({
        jobAlerts: notifJobAlerts,
        booking: notifBooking,
        payment: notifPayment,
        updates: notifUpdates,
      }),
    );
    toast.success("Notification settings save ho gaye ✅");
  }

  function applyTheme(t: "light" | "dark") {
    setTheme(t);
    localStorage.setItem("kaam_mitra_theme", t);
    if (t === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    toast.success(t === "dark" ? "Dark mode on 🌙" : "Light mode on ☀️");
  }

  function handleLanguageChange(val: string) {
    setLanguage(val);
    localStorage.setItem("kaam_mitra_language", val);
    toast.success(`Language set: ${val}`);
  }

  function handleClearSearchHistory() {
    localStorage.removeItem("kaam_mitra_search_history");
    setHistoryCleared(true);
    toast.success("Search history clear ho gaya ✅");
  }

  function handleContactSupport() {
    if (!contactName.trim() || !contactMessage.trim()) {
      toast.error("Naam aur message dono daalo");
      return;
    }
    setContactName("");
    setContactMessage("");
    toast.success("Support request bhej di! Jald hi jawab milega 📩");
  }

  function handleReportProblem() {
    if (!reportDescription.trim() || !reportCategory) {
      toast.error("Description aur category chunein");
      return;
    }
    setReportDescription("");
    setReportCategory("");
    toast.success("Problem report ho gaya ✅ Hum check karenge");
  }

  function handleDeactivateToggle(checked: boolean) {
    setDeactivated(checked);
    localStorage.setItem("kaam_mitra_account_deactivated", checked.toString());
    toast.success(
      checked
        ? "Account deactivate ho gaya ⚠️"
        : "Account reactivate ho gaya ✅",
    );
  }

  function handleDeleteAccount() {
    const p = loadProfile();
    const expectedEmail = p?.email || "";
    if (deleteEmail !== expectedEmail) {
      toast.error("Email match nahi karta");
      return;
    }
    // Clear all kaam_mitra_* keys
    const keys = Object.keys(localStorage).filter(
      (k) =>
        k.startsWith("kaam_mitra_") ||
        k === "workerProfile" ||
        k === "contractorProfile" ||
        k === "workerPassword",
    );
    for (const k of keys) {
      localStorage.removeItem(k);
    }
    setDeleteDialogOpen(false);
    toast.success("Account permanently delete ho gaya");
    navigate({ to: "/" });
  }

  function handleLogout() {
    localStorage.removeItem("workerProfile");
    localStorage.removeItem("contractorProfile");
    navigate({ to: "/" });
  }

  const isAvailable = availability === "available";

  const loginHistory: { date: string; device: string; location: string }[] =
    (() => {
      try {
        const raw = localStorage.getItem("kaam_mitra_login_history");
        if (!raw) return MOCK_LOGIN_HISTORY;
        const parsed = JSON.parse(raw);
        return parsed.length > 0 ? parsed : MOCK_LOGIN_HISTORY;
      } catch {
        return MOCK_LOGIN_HISTORY;
      }
    })();

  return (
    <div className="page-container pt-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-display font-black text-foreground">
          Settings
        </h1>
        {profile?.name && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Namaste,{" "}
            <span className="font-semibold text-foreground">
              {profile.name}
            </span>{" "}
            👋
          </p>
        )}
      </div>

      <div className="space-y-3">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            data-ocid="settings.worker_verification_button"
            onClick={() => navigate({ to: "/worker-verification" })}
            className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-left hover:bg-green-100 transition-colors active:bg-green-200"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-bold text-green-800 text-sm leading-tight">
                Worker
              </p>
              <p className="font-bold text-green-800 text-sm leading-tight">
                Verification
              </p>
            </div>
          </button>
          <button
            type="button"
            data-ocid="settings.id_card_button"
            onClick={() => navigate({ to: "/worker-id-card" })}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition-colors active:bg-blue-200"
          >
            <span className="text-2xl">🪪</span>
            <div>
              <p className="font-bold text-blue-800 text-sm leading-tight">
                My ID
              </p>
              <p className="font-bold text-blue-800 text-sm leading-tight">
                Card
              </p>
            </div>
          </button>
        </div>

        {/* ── SECTION 1: Profile Management ── */}
        <Section
          id="profile_management"
          icon={<User className="w-5 h-5" />}
          title="Profile Management"
          subtitle="Naam, photo, mobile, email, location"
          isOpen={openSection === "profile_management"}
          onToggle={() => toggle("profile_management")}
        >
          <div className="space-y-5">
            {/* Update Name */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                📝 Naam Update Karein
              </p>
              <Label className="text-xs font-semibold mb-1 block">
                Apna Naam
              </Label>
              <Input
                data-ocid="settings.profile.name_input"
                value={epName}
                onChange={(e) => setEpName(e.target.value)}
                placeholder="Apna pura naam daalo"
              />
              <Button
                data-ocid="settings.profile.save_button"
                className="w-full mt-2"
                onClick={handleEditProfileSave}
              >
                Naam Save Karein ✅
              </Button>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                📸 Profile Photo Change Karein
              </p>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  className="w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => photoRef.current?.click()}
                  aria-label="Profile photo upload"
                >
                  {epPhotoPreview ? (
                    <img
                      src={epPhotoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </button>
                <Button
                  type="button"
                  data-ocid="settings.profile.photo_upload"
                  variant="outline"
                  size="sm"
                  onClick={() => photoRef.current?.click()}
                >
                  Photo Change Karein
                </Button>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                📱 Mobile Number Update Karein
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Mobile Number
                  </Label>
                  <Input
                    data-ocid="settings.profile.mobile_input"
                    type="tel"
                    value={mobileNum}
                    onChange={(e) => setMobileNum(e.target.value)}
                    placeholder="10 digit mobile number"
                    maxLength={10}
                  />
                </div>
                {mobileVerified ? (
                  <div
                    data-ocid="settings.mobile_verify.success_state"
                    className="flex items-center gap-2 py-1"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      ✅ Mobile Verified
                    </span>
                  </div>
                ) : !otpSent ? (
                  <Button
                    data-ocid="settings.profile.send_otp_button"
                    className="w-full"
                    onClick={handleSendOtp}
                  >
                    OTP Bhejo 📱
                  </Button>
                ) : (
                  <>
                    {generatedOtp && (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-center">
                        <p className="text-xs text-amber-700 font-medium mb-1">
                          Aapka OTP (Demo):
                        </p>
                        <p className="text-2xl font-bold text-amber-800 tracking-widest">
                          {generatedOtp}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">
                        OTP Daalo
                      </Label>
                      <Input
                        data-ocid="settings.profile.otp_input"
                        type="number"
                        value={mobileOtp}
                        onChange={(e) => setMobileOtp(e.target.value)}
                        placeholder="6 digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <Button
                      data-ocid="settings.profile.verify_otp_button"
                      className="w-full"
                      onClick={handleVerifyOtp}
                    >
                      OTP Verify Karein ✅
                    </Button>
                    <button
                      type="button"
                      className="text-xs text-primary text-center w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setMobileOtp("");
                        setGeneratedOtp("");
                      }}
                    >
                      Dobara bhejo
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                📧 Email Update Karein
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Email Address
                  </Label>
                  <Input
                    data-ocid="settings.profile.email_input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="aapka@email.com"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-700">
                    ℹ️ Email verification demo mode mein hai. Real verification
                    ke liye paid plan chahiye.
                  </p>
                </div>
                {emailSent && (
                  <div
                    data-ocid="settings.email_verify.success_state"
                    className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"
                  >
                    <p className="text-sm text-green-700 font-semibold">
                      📧 Verification bhej di! (Demo)
                    </p>
                  </div>
                )}
                <Button
                  data-ocid="settings.profile.send_email_button"
                  className="w-full"
                  onClick={handleEmailSend}
                >
                  Verification Send Karein 📧
                </Button>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                📍 Location Update Karein
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    State
                  </Label>
                  <Select
                    value={locState}
                    onValueChange={(v) => {
                      setLocState(v);
                      setLocCity("");
                    }}
                  >
                    <SelectTrigger data-ocid="settings.profile.state_select">
                      <SelectValue placeholder="State chunein" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(INDIA_STATES).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {locState && (
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">
                      City
                    </Label>
                    <Select value={locCity} onValueChange={setLocCity}>
                      <SelectTrigger data-ocid="settings.profile.city_select">
                        <SelectValue placeholder="City chunein" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIA_STATES[locState]?.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={gpsLoading}
                  onClick={handleGpsDetect}
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  {gpsLoading ? "Detecting..." : "GPS Se Detect Karein 📍"}
                </Button>
                <Button className="w-full" onClick={handleLocationSave}>
                  Location Save Karein 📍
                </Button>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                🟢 Availability Status
              </p>
              <div
                className={`rounded-xl border-2 p-4 transition-colors ${isAvailable ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className={`font-bold text-sm ${isAvailable ? "text-green-800" : "text-red-800"}`}
                    >
                      {isAvailable
                        ? "🟢 Available for Work"
                        : "🔴 Busy / Not Available"}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${isAvailable ? "text-green-700" : "text-red-700"}`}
                    >
                      {isAvailable
                        ? "Contractors aapko dekh sakte hain"
                        : "Abhi kaam available nahi hai"}
                    </p>
                  </div>
                  <Switch
                    data-ocid="settings.profile.availability_toggle"
                    checked={isAvailable}
                    onCheckedChange={handleAvailabilityToggle}
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 2: Account & Security ── */}
        <Section
          id="account_security"
          icon={<ShieldCheck className="w-5 h-5" />}
          title="Account & Security"
          subtitle="Password, 2FA, login history"
          isOpen={openSection === "account_security"}
          onToggle={() => toggle("account_security")}
        >
          <div className="space-y-5">
            {/* Change Password */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🔒 Password Change Karein
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      data-ocid="settings.security.current_password_input"
                      type={showCurrent ? "text" : "password"}
                      value={cpCurrent}
                      onChange={(e) => setCpCurrent(e.target.value)}
                      placeholder="Current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowCurrent((p) => !p)}
                    >
                      {showCurrent ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      data-ocid="settings.security.new_password_input"
                      type={showNew ? "text" : "password"}
                      value={cpNew}
                      onChange={(e) => setCpNew(e.target.value)}
                      placeholder="Naya password (12+ characters)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowNew((p) => !p)}
                    >
                      {showNew ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {cpNew.length > 0 && (
                  <div className="bg-muted/50 rounded-xl p-3 space-y-1">
                    {[
                      { key: "length", label: "12+ characters" },
                      { key: "upper", label: "Ek Uppercase letter (A-Z)" },
                      { key: "lower", label: "Ek Lowercase letter (a-z)" },
                      { key: "number", label: "Ek Number (0-9)" },
                      { key: "special", label: "Ek Special character (!@#$)" },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className={
                            pwRules[key as keyof typeof pwRules]
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          {pwRules[key as keyof typeof pwRules] ? "✅" : "⭕"}
                        </span>
                        <span
                          className={
                            pwRules[key as keyof typeof pwRules]
                              ? "text-green-700 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      data-ocid="settings.security.confirm_password_input"
                      type={showConfirm ? "text" : "password"}
                      value={cpConfirm}
                      onChange={(e) => setCpConfirm(e.target.value)}
                      placeholder="Password dobara daalo"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  data-ocid="settings.security.change_password_button"
                  className="w-full"
                  disabled={!pwValid || cpNew !== cpConfirm || !cpCurrent}
                  onClick={handleChangePassword}
                >
                  Password Badlein 🔒
                </Button>
              </div>
            </div>

            {/* 2FA */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🔐 Two-Factor Authentication (2FA / MFA)
              </p>
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
                <div>
                  <p className="font-semibold text-sm">Enable 2FA / MFA</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Login par extra security layer
                  </p>
                </div>
                <Switch
                  data-ocid="settings.security.2fa_toggle"
                  checked={twoFAEnabled}
                  onCheckedChange={handle2FAToggle}
                />
              </div>
              {twoFAEnabled && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-xs text-green-700 font-medium">
                    ✅ 2FA Active hai. Har login par OTP verify hoga.
                  </p>
                </div>
              )}
            </div>

            {/* Login History */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                📋 Login History
              </p>
              <div className="space-y-2">
                {loginHistory.slice(0, 3).map((entry, i) => (
                  <div
                    key={entry.date}
                    data-ocid={`settings.security.login_history.item.${i + 1}`}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30"
                  >
                    <History className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {entry.date}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.device}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        📍 {entry.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 3: Privacy & Data Usage ── */}
        <Section
          id="privacy_data"
          icon={<Shield className="w-5 h-5" />}
          title="Privacy & Data Usage"
          subtitle="Profile visibility, data info, download"
          isOpen={openSection === "privacy_data"}
          onToggle={() => toggle("privacy_data")}
        >
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                👁️ Profile Visibility
              </p>
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
                <div>
                  <p className="font-semibold text-sm">
                    {profileVisibility === "public"
                      ? "🌐 Public Profile"
                      : "🔒 Private Profile"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profileVisibility === "public"
                      ? "Sabhi contractors aapka profile dekh sakte hain"
                      : "Sirf approved contractors dekh sakte hain"}
                  </p>
                </div>
                <Switch
                  data-ocid="settings.privacy.visibility_toggle"
                  checked={profileVisibility === "public"}
                  onCheckedChange={handleVisibilityToggle}
                />
              </div>
            </div>

            {/* Data Usage Info */}
            <div className="border-t border-border/40 pt-4">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left"
                onClick={() => setDataExpanded((p) => !p)}
              >
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  📊 Data Usage Information
                </p>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform ${dataExpanded ? "rotate-90" : ""}`}
                />
              </button>
              {dataExpanded && (
                <div className="mt-3 bg-muted/30 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-foreground font-semibold">
                    Aapka data kaise use hota hai:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      • Aapka data <strong>Firebase Firestore</strong> mein
                      securely store hota hai
                    </li>
                    <li>
                      • Kisi third party ke saath data share nahi kiya jaata
                    </li>
                    <li>
                      • Profile info contractors ko job search ke liye dikhta
                      hai
                    </li>
                    <li>
                      • Location data nearby job matching ke liye use hota hai
                    </li>
                    <li>
                      • Payment records encrypted format mein store hote hain
                    </li>
                    <li>
                      • Aap kabhi bhi apna data download ya delete kar sakte
                      hain
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Download Data */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                📥 Apna Data Download Karein
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Apna poora profile data JSON format mein download karein
              </p>
              <Button
                data-ocid="settings.privacy.download_button"
                variant="outline"
                className="w-full"
                onClick={handleDownloadData}
              >
                <Download className="w-4 h-4 mr-2" />
                Data Download Karein
              </Button>
            </div>
          </div>
        </Section>

        {/* ── SECTION 4: Payments & Orders ── */}
        <Section
          id="payments_orders"
          icon={<CreditCard className="w-5 h-5" />}
          title="Payments & Orders"
          subtitle="Payment history, methods, billing address"
          isOpen={openSection === "payments_orders"}
          onToggle={() => toggle("payments_orders")}
        >
          <div className="space-y-4">
            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-ocid="settings.payments.payment_history_link"
                onClick={() => navigate({ to: "/payment-history" })}
                className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left"
              >
                <History className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Payment History</p>
                  <p className="text-xs text-muted-foreground">
                    Transactions dekhein
                  </p>
                </div>
              </button>
              <button
                type="button"
                data-ocid="settings.payments.wallet_link"
                onClick={() => navigate({ to: "/worker-wallet" })}
                className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left"
              >
                <CreditCard className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold">My Wallet</p>
                  <p className="text-xs text-muted-foreground">
                    Balance dekhein
                  </p>
                </div>
              </button>
            </div>

            {/* Saved Payment Methods */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                💳 Payment Methods Save Karein
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    UPI ID
                  </Label>
                  <Input
                    data-ocid="settings.payments.upi_input"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                  />
                  <Button
                    data-ocid="settings.payments.save_upi_button"
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => {
                      localStorage.setItem(
                        "kaam_mitra_payment_methods",
                        JSON.stringify({ upiId, cardNumber, cardName }),
                      );
                      toast.success("UPI ID save ho gaya ✅");
                    }}
                  >
                    UPI Save Karein
                  </Button>
                </div>
                <div className="border-t border-border/40 pt-3">
                  <Label className="text-xs font-semibold mb-1 block">
                    Card (Last 4 digits)
                  </Label>
                  <Input
                    data-ocid="settings.payments.card_input"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="**** **** **** 1234"
                    maxLength={4}
                  />
                  <Label className="text-xs font-semibold mb-1 block mt-2">
                    Cardholder Name
                  </Label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Naam jaise card par hai"
                  />
                  <Button
                    data-ocid="settings.payments.save_card_button"
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={handleSavePaymentMethods}
                  >
                    Card Save Karein
                  </Button>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🏠 Billing Address
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Naam
                  </Label>
                  <Input
                    data-ocid="settings.payments.billing_name_input"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    placeholder="Poora naam"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Address Line 1
                  </Label>
                  <Input
                    data-ocid="settings.payments.billing_address_input"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Ghar/mohalla/gali"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">
                      City
                    </Label>
                    <Input
                      data-ocid="settings.payments.billing_city_input"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      placeholder="Shehar"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">
                      Pincode
                    </Label>
                    <Input
                      data-ocid="settings.payments.billing_pincode_input"
                      value={billingPincode}
                      onChange={(e) => setBillingPincode(e.target.value)}
                      placeholder="6 digits"
                      maxLength={6}
                    />
                  </div>
                </div>
                <Button
                  data-ocid="settings.payments.save_billing_button"
                  className="w-full"
                  onClick={handleSaveBilling}
                >
                  Address Save Karein 🏠
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 5: Time Management / Notifications ── */}
        <Section
          id="time_management"
          icon={<Bell className="w-5 h-5" />}
          title="Time Management & Notifications"
          subtitle="Job alerts, reminders, updates"
          isOpen={openSection === "time_management"}
          onToggle={() => toggle("time_management")}
        >
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">
              Kaunsi notifications receive karni hain choose karein:
            </p>
            {[
              {
                key: "job_alerts",
                ocid: "settings.notifications.job_alerts_toggle",
                label: "Job Alerts",
                desc: "Nearby new jobs ki notifications",
                value: notifJobAlerts,
                setter: setNotifJobAlerts,
              },
              {
                key: "booking",
                ocid: "settings.notifications.booking_toggle",
                label: "Booking Reminders",
                desc: "Aane wali bookings ka reminder",
                value: notifBooking,
                setter: setNotifBooking,
              },
              {
                key: "payment",
                ocid: "settings.notifications.payment_toggle",
                label: "Payment Reminders",
                desc: "Pending payments aur wallet updates",
                value: notifPayment,
                setter: setNotifPayment,
              },
              {
                key: "updates",
                ocid: "settings.notifications.updates_toggle",
                label: "App Updates & Announcements",
                desc: "KaamMitra ke naye features",
                value: notifUpdates,
                setter: setNotifUpdates,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <Switch
                  data-ocid={item.ocid}
                  checked={item.value}
                  onCheckedChange={(checked) => {
                    item.setter(checked);
                  }}
                />
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleSaveNotifications}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications Save Karein
            </Button>
          </div>
        </Section>

        {/* ── SECTION 6: Theme & Language ── */}
        <Section
          id="theme_language"
          icon={<Globe className="w-5 h-5" />}
          title="Theme & Language"
          subtitle="Dark mode, preferred language"
          isOpen={openSection === "theme_language"}
          onToggle={() => toggle("theme_language")}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🎨 Theme Choose Karein
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  data-ocid="settings.theme.light_button"
                  variant={theme === "light" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => applyTheme("light")}
                >
                  ☀️ Light
                </Button>
                <Button
                  data-ocid="settings.theme.dark_button"
                  variant={theme === "dark" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => applyTheme("dark")}
                >
                  🌙 Dark
                </Button>
              </div>
            </div>
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🗣️ Language Select Karein
              </p>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger data-ocid="settings.theme.language_select">
                  <SelectValue placeholder="Language chunein" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
                  <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Selected: <strong>{language}</strong>
              </p>
            </div>
          </div>
        </Section>

        {/* ── SECTION 7: Activity & History ── */}
        <Section
          id="activity_history"
          icon={<Activity className="w-5 h-5" />}
          title="Activity & History"
          subtitle="Recent activity, search history"
          isOpen={openSection === "activity_history"}
          onToggle={() => toggle("activity_history")}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🕐 Recent Activity
              </p>
              {activityLog.length === 0 ? (
                <p
                  data-ocid="settings.activity.empty_state"
                  className="text-xs text-muted-foreground text-center py-4"
                >
                  Koi activity nahi mili
                </p>
              ) : (
                <div className="space-y-2">
                  {activityLog.slice(0, 5).map((item) => (
                    <div
                      key={item.action}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {item.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                🗑️ Search History Clear Karein
              </p>
              {historyCleared ? (
                <div
                  data-ocid="settings.activity.success_state"
                  className="flex items-center gap-2 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-semibold">
                    Search history clear ho gaya ✅
                  </span>
                </div>
              ) : (
                <Button
                  data-ocid="settings.activity.clear_history_button"
                  variant="outline"
                  className="w-full"
                  onClick={handleClearSearchHistory}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Search History Clear Karein
                </Button>
              )}
            </div>
          </div>
        </Section>

        {/* ── SECTION 8: Help & Support ── */}
        <Section
          id="help_support"
          icon={<HelpCircle className="w-5 h-5" />}
          title="Help & Support"
          subtitle="FAQ, contact support, report a problem"
          isOpen={openSection === "help_support"}
          onToggle={() => toggle("help_support")}
        >
          <div className="space-y-5">
            {/* FAQ */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                ❓ Aksar Puche Jaane Wale Sawal (FAQ)
              </p>
              <Accordion type="single" collapsible className="space-y-1">
                <AccordionItem
                  value="q1"
                  className="border border-border/50 rounded-xl overflow-hidden px-3"
                >
                  <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                    Profile activate kaise hogi?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3">
                    Profile activate hone ke liye aapko apni category ke hisaab
                    se registration fee pay karni hogi (UPI ya Razorpay).
                    Payment verify hone ke baad profile automatically active ho
                    jaati hai aur search results mein dikhne lagti hai.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="q2"
                  className="border border-border/50 rounded-xl overflow-hidden px-3"
                >
                  <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                    OTP nahi aaya?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3">
                    KaamMitra abhi demo OTP mode mein hai. OTP screen par hi
                    dikh jaata hai (amber box mein). Real SMS delivery ke liye
                    paid plan ki zaroorat hai. Agar OTP nahi dikh raha toh page
                    refresh karein.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="q3"
                  className="border border-border/50 rounded-xl overflow-hidden px-3"
                >
                  <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                    Profile search mein nahi dikh rahi?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3">
                    Search mein dikhne ke liye yeh zaroori hai: (1) Mobile
                    verify ho, (2) Payment complete ho, (3) Profile public ho
                    (Privacy settings mein check karein). Teeno steps complete
                    karne ke baad profile search mein aane lagti hai.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="q4"
                  className="border border-border/50 rounded-xl overflow-hidden px-3"
                >
                  <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                    Payment kaise karte hain?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3">
                    Do tarike hain: (1) UPI QR Code – Admin ka QR scan karein,
                    payment karein, screenshot upload karein, admin verify
                    karega. (2) Razorpay – Direct UPI/Card se pay karein,
                    profile automatically active ho jaati hai.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="q5"
                  className="border border-border/50 rounded-xl overflow-hidden px-3"
                >
                  <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                    Account kaise delete karein?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3">
                    Settings mein "Account Deletion" section mein jaayein. Wahan
                    aap account deactivate ya permanently delete kar sakte hain.
                    Delete karne ke liye email confirmation zaroori hai.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Contact Support */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                💬 Contact Support
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Aapka Naam
                  </Label>
                  <Input
                    data-ocid="settings.support.contact_name_input"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Apna naam daalo"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Message
                  </Label>
                  <Textarea
                    data-ocid="settings.support.contact_message_textarea"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Apni problem ya query likhein..."
                    rows={3}
                  />
                </div>
                <Button
                  data-ocid="settings.support.contact_submit_button"
                  className="w-full"
                  onClick={handleContactSupport}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Support Ko Bhejein
                </Button>
              </div>
            </div>

            {/* Report a Problem */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🚨 Problem Report Karein
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Category
                  </Label>
                  <Select
                    value={reportCategory}
                    onValueChange={setReportCategory}
                  >
                    <SelectTrigger data-ocid="settings.support.report_category_select">
                      <SelectValue placeholder="Problem ki category chunein" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">
                        🐛 Bug / Technical Issue
                      </SelectItem>
                      <SelectItem value="fraud">
                        ⚠️ Fraud / Fake Account
                      </SelectItem>
                      <SelectItem value="payment">💳 Payment Issue</SelectItem>
                      <SelectItem value="other">📝 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">
                    Problem Describe Karein
                  </Label>
                  <Textarea
                    data-ocid="settings.support.report_description_textarea"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Problem detail mein likhein..."
                    rows={3}
                  />
                </div>
                <Button
                  data-ocid="settings.support.report_submit_button"
                  variant="outline"
                  className="w-full"
                  onClick={handleReportProblem}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Submit Karein
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 9: Account Deletion ── */}
        <Section
          id="account_deletion"
          icon={<Trash2 className="w-5 h-5" />}
          title="Account Deletion"
          subtitle="Deactivate ya permanently delete"
          isOpen={openSection === "account_deletion"}
          onToggle={() => toggle("account_deletion")}
          badge={
            deactivated ? (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                ⚠️ Deactivated
              </Badge>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {/* Deactivate */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                ⏸️ Account Deactivate Karein
              </p>
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div>
                  <p className="font-semibold text-sm text-amber-800">
                    Account Temporarily Deactivate
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Profile search mein nahi dikhega, baad mein wapas activate
                    kar sakte hain
                  </p>
                </div>
                <Switch
                  data-ocid="settings.deletion.deactivate_toggle"
                  checked={deactivated}
                  onCheckedChange={handleDeactivateToggle}
                />
              </div>
              {deactivated && (
                <div className="mt-2 bg-amber-50 border border-amber-300 rounded-lg p-2">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ Account deactivated hai. Profile search results mein nahi
                    dikhega. Dobara toggle karke activate karein.
                  </p>
                </div>
              )}
            </div>

            {/* Permanent Delete */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                🗑️ Account Permanently Delete Karein
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                <p className="text-xs text-red-700 font-semibold">
                  ⚠️ Yeh action permanent hai!
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Ek baar delete karne ke baad aapka poora data, profile,
                  payment history — sab permanently remove ho jaayega. Yeh wapas
                  nahi ho sakta.
                </p>
              </div>
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    data-ocid="settings.deletion.delete_account_button"
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Account Permanently Delete Karein
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">
                      ⚠️ Account Delete Karna Chahte Hain?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Yeh action undo nahi ho sakta. Aapka poora data
                      permanently delete ho jaayega.
                      <br />
                      <br />
                      Confirm karne ke liye apna registered email address neeche
                      daalo:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-2">
                    <Input
                      data-ocid="settings.deletion.delete_email_input"
                      type="email"
                      value={deleteEmail}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                      placeholder="Registered email address"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      data-ocid="settings.deletion.delete_cancel_button"
                      onClick={() => setDeleteEmail("")}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-ocid="settings.deletion.delete_confirm_button"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteAccount}
                    >
                      Haan, Permanently Delete Karein
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Section>

        {/* ── Logout ── */}
        <Card className="overflow-hidden border border-destructive/30 shadow-sm">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                data-ocid="settings.logout.open_modal_button"
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-destructive/5 transition-colors active:bg-destructive/10"
              >
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-destructive text-sm">
                    Logout
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Account se bahar jaao
                  </div>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Logout karna chahte hain?</AlertDialogTitle>
                <AlertDialogDescription>
                  Aapka profile aur contractor account remove ho jaayega. Kya
                  aap confirm karte hain?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="settings.logout.cancel_button">
                  Nahi, Raho
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="settings.logout.confirm_button"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleLogout}
                >
                  Haan, Logout Karein
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6 mt-4">
        <p>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
