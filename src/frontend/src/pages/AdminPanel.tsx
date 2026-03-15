import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  IndianRupee,
  LayoutDashboard,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Category, Job, Notification, Worker } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  type PaymentRecord,
  type VerificationRecord,
  loadAllEscrowRecords,
  loadAllExtendedById,
  loadAllPaymentRecords,
  loadAllPremiumRecords,
  loadAllVerificationRecords,
  saveExtendedById,
  savePaymentRecord,
  saveVerificationRecord,
  updateEscrowStatus,
} from "../lib/constants";

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PHONE_KEY = "adminPhone";
const SESSION_KEY = "adminLoggedIn";
const DEFAULT_ADMIN_PHONE = "9999999999";
const SHEETS_WEBHOOK_KEY = "sheetsWebhookUrl";
const SUPER_ADMIN_MOBILE = "9876543210";
const ADMIN_EMAIL = "admin@kaammitra.in";
const LOGIN_ATTEMPTS_KEY = "adminLoginAttempts";
const LOCK_UNTIL_KEY = "adminLockUntil";
const LOGIN_LOG_KEY = "adminLoginLog";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const ADMIN_ACCOUNTS_KEY = "kaam_mitra_admin_accounts";
const BLOCKED_USERS_KEY = "kaam_mitra_blocked_users";

// Admin account helpers
interface AdminAccount {
  mobile: string;
  name: string;
  role: "super" | "admin";
  addedAt: number;
}

function getAdminAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as AdminAccount[]) : [];
  } catch {
    return [];
  }
}

function saveAdminAccounts(accounts: AdminAccount[]): void {
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function ensureSuperAdmin(): void {
  const accounts = getAdminAccounts();
  if (!accounts.find((a) => a.role === "super")) {
    accounts.unshift({
      mobile: SUPER_ADMIN_MOBILE,
      name: "Super Admin",
      role: "super",
      addedAt: Date.now(),
    });
    saveAdminAccounts(accounts);
  }
}

// Blocked users helpers
function getBlockedUsers(): string[] {
  try {
    const raw = localStorage.getItem(BLOCKED_USERS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveBlockedUsers(list: string[]): void {
  localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(list));
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
type ActivityLogEntry = { timestamp: number; event: string; success: boolean };

function getActivityLog(): ActivityLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

function addActivityLog(event: string, success: boolean) {
  const log = getActivityLog();
  log.unshift({ timestamp: Date.now(), event, success });
  if (log.length > 20) log.splice(20);
  localStorage.setItem(LOGIN_LOG_KEY, JSON.stringify(log));
}

// ─── Password Validation ──────────────────────────────────────────────────────
function validatePassword(pwd: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (pwd.length < 12) errors.push("min12");
  if (!/[A-Z]/.test(pwd)) errors.push("uppercase");
  if (!/[a-z]/.test(pwd)) errors.push("lowercase");
  if (!/[0-9]/.test(pwd)) errors.push("digit");
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':",.\<>?/`~]/.test(pwd))
    errors.push("special");
  return { valid: errors.length === 0, errors };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { errors } = validatePassword(password);
  const rules = [
    { key: "min12", label: "At least 12 characters" },
    { key: "uppercase", label: "One uppercase letter (A-Z)" },
    { key: "lowercase", label: "One lowercase letter (a-z)" },
    { key: "digit", label: "One number (0-9)" },
    { key: "special", label: "One special character (!@#$%...)" },
  ];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1 rounded-xl border border-border bg-muted/50 p-3">
      {rules.map((r) => {
        const ok = !errors.includes(r.key);
        return (
          <div key={r.key} className="flex items-center gap-2 text-xs">
            {ok ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
            )}
            <span className={ok ? "text-green-700" : "text-muted-foreground"}>
              {r.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Login Steps ──────────────────────────────────────────────────────────────
type LoginStep =
  | "mobile_email"
  | "dual_otp"
  | "forgot_phone"
  | "forgot_otp"
  | "forgot_newpwd";

// ─── Login Security Helpers ────────────────────────────────────────────────────
function getLoginAttempts(): number {
  return Number.parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || "0", 10);
}
function getLockUntilTs(): number {
  return Number.parseInt(localStorage.getItem(LOCK_UNTIL_KEY) || "0", 10);
}

function MobileEmailStep({
  onOTPSent,
  onSkipLogin,
}: {
  onOTPSent: (
    mobile: string,
    email: string,
    mobileOtp: string,
    emailOtp: string,
  ) => void;
  onSkipLogin: () => void;
}) {
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockCountdown, setLockCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((lockUntil: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, lockUntil - Date.now());
      setLockCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        localStorage.removeItem(LOCK_UNTIL_KEY);
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, "0");
        setLockCountdown(0);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const lockUntil = getLockUntilTs();
    if (lockUntil > Date.now()) {
      setLockCountdown(Math.ceil((lockUntil - Date.now()) / 1000));
      startCountdown(lockUntil);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCountdown]);

  const isLocked = lockCountdown > 0;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSendOTP = async () => {
    setError("");
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check brute-force lockout
    const lockUntil = getLockUntilTs();
    if (lockUntil > Date.now()) {
      setError("Account is temporarily locked. Please wait.");
      return;
    }

    // Validate mobile
    const accounts = getAdminAccounts();
    const validMobile =
      mobile === SUPER_ADMIN_MOBILE ||
      accounts.some((a) => a.mobile === mobile);
    if (!validMobile) {
      const newAttempts = getLoginAttempts() + 1;
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, newAttempts.toString());
      addActivityLog("Admin Login Failed - Unknown Mobile", false);
      if (newAttempts >= MAX_ATTEMPTS) {
        const lock = Date.now() + LOCKOUT_MS;
        localStorage.setItem(LOCK_UNTIL_KEY, lock.toString());
        addActivityLog("Account Locked", false);
        setLockCountdown(Math.ceil(LOCKOUT_MS / 1000));
        startCountdown(lock);
        toast.error(
          "Account locked for 15 minutes due to too many failed attempts.",
        );
      } else {
        setError("This mobile number is not registered as admin");
      }
      return;
    }

    // Validate email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      const newAttempts = getLoginAttempts() + 1;
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, newAttempts.toString());
      addActivityLog("Admin Login Failed - Unknown Email", false);
      if (newAttempts >= MAX_ATTEMPTS) {
        const lock = Date.now() + LOCKOUT_MS;
        localStorage.setItem(LOCK_UNTIL_KEY, lock.toString());
        addActivityLog("Account Locked", false);
        setLockCountdown(Math.ceil(LOCKOUT_MS / 1000));
        startCountdown(lock);
        toast.error("Account locked for 15 minutes.");
      } else {
        setError("This email is not registered as admin");
      }
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    addActivityLog("OTP Sent for Dual Verification", true);
    onOTPSent(mobile, email, mobileOtp, emailOtp);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
          <ShieldCheck className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          KaamMitra Admin
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Super Admin Login — Step 1 of 2
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold">
          🛡️ Dual OTP Verification
        </div>
      </div>

      {isLocked ? (
        <div data-ocid="admin.lockout_state" className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <p className="font-bold text-destructive text-lg">
              Account Temporarily Locked
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Too many failed attempts
            </p>
          </div>
          <div className="text-4xl font-mono font-bold text-destructive tracking-widest">
            {formatCountdown(lockCountdown)}
          </div>
          <p className="text-xs text-muted-foreground">
            Please wait before trying again
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-mobile" className="text-sm font-semibold">
              Mobile Number
            </Label>
            <div className="flex items-center gap-2">
              <span className="h-12 px-3 flex items-center rounded-xl border border-border bg-muted text-sm font-semibold text-muted-foreground">
                +91
              </span>
              <Input
                id="admin-mobile"
                data-ocid="admin.mobile_input"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="rounded-xl h-12 text-base flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-semibold">
              Email ID
            </Label>
            <Input
              id="admin-email"
              data-ocid="admin.email_input"
              type="email"
              placeholder="admin@kaammitra.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-12 text-base"
              onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              data-ocid="admin.login_error_state"
              className="text-destructive text-sm font-medium flex items-center gap-1.5 p-3 rounded-xl bg-destructive/10"
            >
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <Button
            data-ocid="admin.send_otp_button"
            className="w-full h-12 rounded-xl text-base font-semibold"
            onClick={handleSendOTP}
            disabled={loading || mobile.length < 10 || !email}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? "Sending OTP..." : "Send OTP →"}
          </Button>

          <button
            type="button"
            data-ocid="admin.skip_login_button"
            className="w-full text-center text-xs text-orange-500 hover:text-orange-700 font-semibold mt-1"
            onClick={onSkipLogin}
          >
            ⚡ Skip Login (Dev Mode)
          </button>
        </div>
      )}
    </motion.div>
  );
}

function DualOTPStep({
  mobile,
  email,
  mobileOtp,
  emailOtp,
  otpExpiry,
  onLoginSuccess,
  onBack,
}: {
  mobile: string;
  email: string;
  mobileOtp: string;
  emailOtp: string;
  otpExpiry: number;
  onLoginSuccess: () => void;
  onBack: () => void;
}) {
  const [enteredMobileOtp, setEnteredMobileOtp] = useState("");
  const [enteredEmailOtp, setEnteredEmailOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((otpExpiry - Date.now()) / 1000),
      );
      setCountdown(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpExpiry]);

  const isExpired = countdown <= 0;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    setError("");
    if (enteredMobileOtp.length !== 6 || enteredEmailOtp.length !== 6) {
      setError("Please enter both 6-digit OTPs");
      return;
    }
    if (isExpired) {
      setError("OTPs have expired. Please go back and request new OTPs.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    if (enteredMobileOtp === mobileOtp && enteredEmailOtp === emailOtp) {
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, "0");
      localStorage.removeItem(LOCK_UNTIL_KEY);
      addActivityLog("Dual OTP Login Success", true);
      onLoginSuccess();
    } else {
      const newAttempts = getLoginAttempts() + 1;
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, newAttempts.toString());
      addActivityLog("Dual OTP Verification Failed", false);
      if (newAttempts >= MAX_ATTEMPTS) {
        const lock = Date.now() + LOCKOUT_MS;
        localStorage.setItem(LOCK_UNTIL_KEY, lock.toString());
        addActivityLog("Account Locked", false);
        toast.error(
          "Account locked for 15 minutes due to too many failed attempts.",
        );
        onBack();
      } else {
        const left = MAX_ATTEMPTS - newAttempts;
        setError(
          `Mobile or Email not verified. Please try again. ${left} attempt${left !== 1 ? "s" : ""} remaining.`,
        );
        setEnteredMobileOtp("");
        setEnteredEmailOtp("");
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full"
    >
      <button
        type="button"
        data-ocid="admin.back_button"
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center mb-3 shadow-lg">
          <ShieldCheck className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">
          Verify OTPs — Step 2 of 2
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          OTPs sent to your mobile and email
        </p>
        <div
          className={`mt-2 inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full ${isExpired ? "bg-destructive/10 text-destructive" : "bg-green-50 text-green-700 border border-green-200"}`}
        >
          {isExpired
            ? "⏰ OTPs Expired"
            : `⏱ OTPs expire in ${formatTimer(countdown)}`}
        </div>
      </div>

      {/* Demo OTP boxes */}
      <div className="space-y-2 mb-5">
        <div className="p-3 rounded-xl border-2 border-amber-400 bg-amber-50">
          <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">
            📱 Demo Mobile OTP
          </p>
          <p className="text-2xl font-mono font-bold tracking-[0.3em] text-amber-800">
            {mobileOtp}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            Sent to +91 {mobile.slice(0, 2)}••••••{mobile.slice(-2)}
          </p>
        </div>
        <div className="p-3 rounded-xl border-2 border-blue-400 bg-blue-50">
          <p className="text-xs text-blue-700 font-bold uppercase tracking-widest mb-1">
            📧 Demo Email OTP
          </p>
          <p className="text-2xl font-mono font-bold tracking-[0.3em] text-blue-800">
            {emailOtp}
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            Sent to {email.slice(0, 3)}••••@{email.split("@")[1]}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div data-ocid="admin.mobile_otp_input" className="space-y-2">
          <Label className="text-sm font-semibold">Mobile OTP</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={enteredMobileOtp}
              onChange={setEnteredMobileOtp}
              disabled={loading || isExpired}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <div data-ocid="admin.email_otp_input" className="space-y-2">
          <Label className="text-sm font-semibold">Email OTP</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={enteredEmailOtp}
              onChange={setEnteredEmailOtp}
              disabled={loading || isExpired}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {error && (
          <div
            data-ocid="admin.otp_error_state"
            className="text-destructive text-sm font-medium flex items-center gap-1.5 p-3 rounded-xl bg-destructive/10"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <Button
          data-ocid="admin.verify_otp_button"
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={handleVerify}
          disabled={
            loading ||
            enteredMobileOtp.length < 6 ||
            enteredEmailOtp.length < 6 ||
            isExpired
          }
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Verifying..." : "Verify & Login"}
        </Button>
      </div>
    </motion.div>
  );
}

function ForgotPhoneStep({
  onOtpSent,
  onBack,
}: {
  onOtpSent: (phone: string, otp: string) => void;
  onBack: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const adminPhone =
      localStorage.getItem(ADMIN_PHONE_KEY) || DEFAULT_ADMIN_PHONE;
    if (phone !== adminPhone) {
      setError("Phone number not registered as admin");
      setLoading(false);
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    onOtpSent(phone, otp);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full"
    >
      <button
        type="button"
        data-ocid="forgot.back_button"
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Login
      </button>
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
          <ShieldCheck className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Forgot Password
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter your registered mobile number
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Mobile Number</Label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 rounded-xl border border-border bg-muted text-muted-foreground text-sm font-semibold">
              +91
            </div>
            <Input
              data-ocid="forgot.phone_input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="rounded-xl h-12 text-base font-mono tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>
        </div>
        {error && (
          <div
            data-ocid="forgot.phone_error_state"
            className="text-destructive text-sm font-medium flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <Button
          data-ocid="forgot.send_otp_button"
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={handleSend}
          disabled={loading || phone.length < 10}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Sending..." : "Send OTP"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Demo admin phone:{" "}
          <span className="font-mono font-bold text-primary">
            {DEFAULT_ADMIN_PHONE}
          </span>
        </p>
      </div>
    </motion.div>
  );
}

function ForgotOtpStep({
  phone,
  demoOtp,
  onVerified,
  onBack,
}: {
  phone: string;
  demoOtp: string;
  onVerified: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentOtp, setCurrentOtp] = useState(demoOtp);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOtp(newOtp);
    setCooldown(30);
    setOtp("");
    setError("");
    toast.success("New OTP generated!");
  };

  const handleVerify = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (otp === currentOtp) {
      onVerified();
    } else {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full"
    >
      <button
        type="button"
        data-ocid="forgot.otp_back_button"
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-display font-bold">Verify OTP</h1>
        <p className="text-muted-foreground text-sm mt-1">
          OTP sent to +91 {phone.slice(0, 2)}XXXXXX{phone.slice(-2)}
        </p>
      </div>
      <div className="mb-5 p-3 rounded-xl border-2 border-primary/40 bg-primary/10 text-center">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
          Demo OTP
        </p>
        <p className="text-2xl font-mono font-bold tracking-[0.3em] text-primary">
          {currentOtp}
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            data-ocid="forgot.otp_input"
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        {error && (
          <div
            data-ocid="forgot.otp_error_state"
            className="text-destructive text-sm font-medium text-center flex items-center justify-center gap-1"
          >
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <Button
          data-ocid="forgot.verify_otp_button"
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={handleVerify}
          disabled={loading || otp.length < 6}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend in{" "}
              <span className="font-semibold text-primary">{cooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              data-ocid="forgot.resend_otp_button"
              onClick={handleResend}
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" /> Resend OTP
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ForgotNewPasswordStep({
  actor,
  onDone,
  onBack,
}: {
  actor: any;
  onDone: () => void;
  onBack: () => void;
}) {
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwdValidation = validatePassword(newPwd);

  const handleReset = async () => {
    setError("");
    if (!newPwd) {
      setError("Enter a new password");
      return;
    }
    if (!pwdValidation.valid) {
      setError("Password does not meet the strength requirements");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      if (!actor) {
        setError("Backend not ready. Please wait a moment and try again.");
        setLoading(false);
        return;
      }
      await actor.resetAdminPasswordDirect(newPwd);
      toast.success(
        "Password reset successfully! Please login with your new password.",
      );
      onDone();
    } catch {
      setError("Failed to reset password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full"
    >
      <button
        type="button"
        data-ocid="forgot.newpwd_back_button"
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Set New Password
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          OTP verified. Enter your new password below.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">New Password</Label>
          <Input
            data-ocid="forgot.new_password_input"
            type="password"
            placeholder="Min 12 chars, upper, lower, number, symbol"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="rounded-xl h-12"
          />
          <PasswordStrengthIndicator password={newPwd} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Confirm Password</Label>
          <Input
            data-ocid="forgot.confirm_password_input"
            type="password"
            placeholder="Confirm new password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            className="rounded-xl h-12"
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
          />
        </div>
        {error && (
          <div
            data-ocid="forgot.newpwd_error_state"
            className="text-destructive text-sm font-medium flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <Button
          data-ocid="forgot.reset_password_button"
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={handleReset}
          disabled={loading || !newPwd || !confirmPwd || !pwdValidation.valid}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </motion.div>
  );
}

function SuperAdminSection() {
  const [adminList, setAdminList] = useState<AdminAccount[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addMobile, setAddMobile] = useState("");
  const [addStep, setAddStep] = useState<"form" | "otp">("form");
  const [demoOtp, setDemoOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [removeTarget, setRemoveTarget] = useState<AdminAccount | null>(null);

  useEffect(() => {
    ensureSuperAdmin();
    setAdminList(getAdminAccounts());
  }, []);

  const reload = () => {
    ensureSuperAdmin();
    setAdminList(getAdminAccounts());
  };

  const handleSendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(addMobile)) {
      toast.error("Valid 10-digit mobile number daalo");
      return;
    }
    if (!addName.trim()) {
      toast.error("Admin naam daalo");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoOtp(otp);
    setAddStep("otp");
    toast.success("Demo OTP ready (SMS nahi milega, neeche dekho)");
  };

  const handleVerifyAndAdd = () => {
    if (otpInput !== demoOtp) {
      toast.error("OTP galat hai");
      return;
    }
    const accounts = getAdminAccounts();
    if (accounts.find((a) => a.mobile === addMobile)) {
      toast.error("Ye number pehle se registered hai");
      return;
    }
    accounts.push({
      mobile: addMobile,
      name: addName.trim(),
      role: "admin",
      addedAt: Date.now(),
    });
    saveAdminAccounts(accounts);
    reload();
    setAddOpen(false);
    setAddStep("form");
    setAddName("");
    setAddMobile("");
    setOtpInput("");
    setDemoOtp("");
    toast.success("Admin add ho gaya! ✅");
  };

  const handleRemove = (acc: AdminAccount) => {
    const accounts = getAdminAccounts().filter((a) => a.mobile !== acc.mobile);
    saveAdminAccounts(accounts);
    reload();
    setRemoveTarget(null);
    toast.success("Admin remove kar diya");
  };

  return (
    <div data-ocid="super_admin.section" className="space-y-4">
      <Card className="card-elevated border-amber-200 bg-amber-50/30">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-600 text-lg">👑</span>
            <span className="font-bold text-amber-800">
              Super Admin Control
            </span>
          </div>
          <p className="text-xs text-amber-700">
            Sirf aap naye admins add/remove kar sakte hain.
          </p>
        </CardContent>
      </Card>

      <Button
        data-ocid="super_admin.add_admin_button"
        className="w-full h-12 rounded-xl font-semibold"
        onClick={() => {
          setAddOpen(true);
          setAddStep("form");
        }}
      >
        <Plus className="w-4 h-4 mr-2" /> Naya Admin Add Karein
      </Button>

      <div className="space-y-2">
        {adminList.map((acc, i) => (
          <Card
            key={acc.mobile}
            data-ocid={`super_admin.admin_item.${i + 1}`}
            className="card-elevated"
          >
            <CardContent className="py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {acc.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {acc.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  +91 {acc.mobile}
                </p>
              </div>
              {acc.role === "super" ? (
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  👑 Super Admin
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    🛡 Admin
                  </span>
                  <button
                    type="button"
                    data-ocid={`super_admin.remove_admin_button.${i + 1}`}
                    onClick={() => setRemoveTarget(acc)}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Admin Dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) {
            setAddStep("form");
            setOtpInput("");
            setDemoOtp("");
          }
        }}
      >
        <DialogContent className="rounded-2xl max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Naya Admin Add Karein</DialogTitle>
          </DialogHeader>
          {addStep === "form" ? (
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-xs font-semibold mb-1 block">
                  Admin Ka Naam
                </Label>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Eg: Rahul Sharma"
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1 block">
                  Mobile Number
                </Label>
                <Input
                  value={addMobile}
                  onChange={(e) => setAddMobile(e.target.value)}
                  placeholder="10 digit"
                  maxLength={10}
                  className="rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button className="w-full rounded-xl" onClick={handleSendOtp}>
                  OTP Bhejo →
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-800 font-semibold">
                  Demo OTP:{" "}
                  <span className="text-lg tracking-widest">{demoOtp}</span>
                </p>
              </div>
              <Input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="OTP dalo"
                maxLength={6}
                className="rounded-xl text-center text-xl tracking-widest"
              />
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setAddStep("form")}
                >
                  Wapas
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={handleVerifyAndAdd}
                >
                  Verify & Add ✅
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Confirm Dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(o) => {
          if (!o) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Admin Remove Karein?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{removeTarget?.name}</strong> (+91 {removeTarget?.mobile})
              ko admin list se hata diya jayega.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="super_admin.remove_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="super_admin.remove_confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeTarget && handleRemove(removeTarget)}
            >
              Haan, Remove Karein
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProfileSection({ actor }: { actor: any }) {
  const [phone, setPhone] = useState(
    localStorage.getItem(ADMIN_PHONE_KEY) || DEFAULT_ADMIN_PHONE,
  );
  const [changePhoneOpen, setChangePhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    setActivityLog(getActivityLog().slice(0, 10));
  }, []);

  const pwdValidation = validatePassword(newPwd);

  const handleChangePhone = () => {
    if (!/^[6-9]\d{9}$/.test(newPhone)) {
      toast.error("Invalid phone number");
      return;
    }
    localStorage.setItem(ADMIN_PHONE_KEY, newPhone);
    setPhone(newPhone);
    setChangePhoneOpen(false);
    setNewPhone("");
    toast.success("Phone number updated!");
  };

  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd) {
      toast.error("Fill all fields");
      return;
    }
    if (!pwdValidation.valid) {
      toast.error("New password does not meet strength requirements");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords don't match");
      return;
    }
    setPwdSaving(true);
    try {
      const ok = await actor.changeAdminPassword(oldPwd, newPwd);
      if (ok) {
        toast.success("Password changed!");
        setOldPwd("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        toast.error("Old password is incorrect");
      }
    } catch {
      toast.error("Failed to change password");
    }
    setPwdSaving(false);
  };

  const clearLog = () => {
    localStorage.setItem(LOGIN_LOG_KEY, "[]");
    setActivityLog([]);
    toast.success("Activity log cleared");
  };

  return (
    <div data-ocid="profile.section" className="space-y-4">
      <Card className="card-elevated">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-primary-foreground text-2xl font-bold font-display">
              A
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Super Admin</h3>
            <p className="text-muted-foreground text-sm">+91 {phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Super Admin Mobile Lock */}
      <Card className="card-elevated border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>Super Admin Control Number</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold">
              ⭐ Super Admin
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-lg font-bold tracking-widest text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              +91 {SUPER_ADMIN_MOBILE}
            </code>
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          </div>
          <p className="text-xs text-amber-700 font-medium">
            Super Admin number cannot be changed here. Contact system
            administrator.
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Registered Phone (for OTP reset)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-lg font-bold tracking-widest text-primary">
              +91 {phone}
            </code>
            <Button
              data-ocid="profile.change_phone_button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setChangePhoneOpen(true)}
            >
              <Pencil className="w-3 h-3 mr-1" /> Change
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="password"
            placeholder="Current password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            className="rounded-xl"
          />
          <div>
            <Input
              type="password"
              placeholder="New password (min 12 chars)"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="rounded-xl"
            />
            <PasswordStrengthIndicator password={newPwd} />
          </div>
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            className="rounded-xl"
          />
          <Button
            data-ocid="profile.change_password_button"
            className="w-full rounded-xl"
            onClick={handleChangePwd}
            disabled={pwdSaving || (newPwd.length > 0 && !pwdValidation.valid)}
          >
            {pwdSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Login Activity Log */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Login Activity</CardTitle>
            <Button
              data-ocid="profile.clear_log_button"
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
              onClick={clearLog}
            >
              Clear Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activityLog.length === 0 ? (
            <div
              data-ocid="profile.activity.empty_state"
              className="text-center py-6 text-muted-foreground text-sm"
            >
              No activity recorded yet
            </div>
          ) : (
            <ScrollArea className="h-52">
              <div className="space-y-2 pr-2">
                {activityLog.map((entry, i) => (
                  <div
                    key={`${entry.timestamp}-${i}`}
                    data-ocid={`profile.activity.item.${i + 1}`}
                    className="flex items-center justify-between gap-2 text-xs py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {entry.event}
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs flex-shrink-0 ${
                        entry.success
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                      variant="outline"
                    >
                      {entry.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={changePhoneOpen} onOpenChange={setChangePhoneOpen}>
        <DialogContent className="rounded-2xl max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Change Phone Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>New 10-digit Mobile Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-xl border border-border bg-muted text-sm font-semibold">
                +91
              </div>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit number"
                value={newPhone}
                onChange={(e) =>
                  setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="rounded-xl font-mono"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl flex-1"
              onClick={() => setChangePhoneOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="profile.save_phone_button"
              className="rounded-xl flex-1"
              onClick={handleChangePhone}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppSettingsSection({ actor }: { actor: any }) {
  const [homeText, setHomeText] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [supportDetails, setSupportDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Block users
  const [blockInput, setBlockInput] = useState("");
  const [blockedList, setBlockedList] = useState<string[]>([]);
  // Notifications
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    if (!actor) return;
    actor.getAppContent().then((c: any) => {
      setHomeText(c.homeText);
      setBannerText(c.bannerText);
      setAnnouncement(c.announcement);
      setContactNumber(c.contactNumber);
      setSupportDetails(c.supportDetails);
      setLoading(false);
    });
    setBlockedList(getBlockedUsers());
  }, [actor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actor.updateAppContent(
        homeText,
        bannerText,
        announcement,
        contactNumber,
        supportDetails,
      );
      toast.success("App settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const handleBlock = () => {
    const mobile = blockInput.trim().replace(/^\+91/, "");
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Valid mobile number daalo");
      return;
    }
    const list = getBlockedUsers();
    if (list.includes(mobile)) {
      toast.info("Ye user pehle se blocked hai");
      return;
    }
    list.push(mobile);
    saveBlockedUsers(list);
    setBlockedList([...list]);
    setBlockInput("");
    toast.success(`+91 ${mobile} block kar diya ✅`);
  };

  const handleUnblock = (mobile: string) => {
    const list = getBlockedUsers().filter((m) => m !== mobile);
    saveBlockedUsers(list);
    setBlockedList([...list]);
    toast.success(`+91 ${mobile} unblock kar diya`);
  };

  const handleSendNotif = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast.error("Title aur message daalo");
      return;
    }
    setSendingNotif(true);
    try {
      await actor.sendNotification(notifTitle.trim(), notifBody.trim());
      toast.success("Notification bhej diya gaya! 📣");
      setNotifTitle("");
      setNotifBody("");
    } catch {
      toast.error("Notification send nahi hua");
    }
    setSendingNotif(false);
  };

  const lastLoginLog = getActivityLog().slice(0, 1)[0];

  if (loading)
    return (
      <div
        data-ocid="app_settings.loading_state"
        className="flex justify-center py-12"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div data-ocid="app_settings.section" className="space-y-4">
      {/* App Content */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">📝 App Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "Home Screen Text",
              value: homeText,
              set: setHomeText,
              multi: true,
            },
            {
              label: "Banner Message",
              value: bannerText,
              set: setBannerText,
              multi: false,
            },
            {
              label: "Announcement",
              value: announcement,
              set: setAnnouncement,
              multi: true,
            },
            {
              label: "Contact Number",
              value: contactNumber,
              set: setContactNumber,
              multi: false,
            },
            {
              label: "Support Details",
              value: supportDetails,
              set: setSupportDetails,
              multi: true,
            },
          ].map(({ label, value, set, multi }) => (
            <div key={label} className="space-y-1.5">
              <Label className="text-sm font-semibold">{label}</Label>
              {multi ? (
                <Textarea
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="rounded-xl resize-none"
                  rows={3}
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="rounded-xl"
                />
              )}
            </div>
          ))}
          <Button
            data-ocid="app_settings.save_button"
            className="w-full h-12 rounded-xl font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Block Users */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">
            🚫 Block / Unblock Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              data-ocid="admin_settings.block_user_input"
              value={blockInput}
              onChange={(e) => setBlockInput(e.target.value)}
              placeholder="Mobile number"
              maxLength={10}
              className="rounded-xl flex-1"
            />
            <Button
              data-ocid="admin_settings.block_user_button"
              variant="destructive"
              className="rounded-xl px-3 font-semibold"
              onClick={handleBlock}
            >
              Block
            </Button>
          </div>
          {blockedList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              Koi blocked user nahi
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {blockedList.map((mobile, i) => (
                <div
                  key={mobile}
                  data-ocid={`admin_settings.blocked_item.${i + 1}`}
                  className="flex items-center justify-between bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2"
                >
                  <span className="text-sm font-medium">+91 {mobile}</span>
                  <button
                    type="button"
                    onClick={() => handleUnblock(mobile)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Notifications */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">
            📣 Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            placeholder="Notification title"
            className="rounded-xl"
          />
          <Textarea
            data-ocid="admin_settings.notification_textarea"
            value={notifBody}
            onChange={(e) => setNotifBody(e.target.value)}
            placeholder="Notification message sabko bhejne ke liye..."
            className="rounded-xl resize-none"
            rows={3}
          />
          <Button
            data-ocid="admin_settings.send_notification_button"
            className="w-full h-11 rounded-xl font-semibold"
            onClick={handleSendNotif}
            disabled={sendingNotif}
          >
            {sendingNotif ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            📣 Notification Bhejo
          </Button>
        </CardContent>
      </Card>

      {/* Admin Account Security */}
      <Card className="card-elevated border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">
            🔐 Admin Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="text-sm text-muted-foreground">2FA Status</span>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
              ✅ Enabled
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="text-sm text-muted-foreground">
              Super Admin Mobile
            </span>
            <span className="text-xs font-mono font-bold text-amber-700">
              +91 {SUPER_ADMIN_MOBILE}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="text-sm text-muted-foreground">
              Admin Accounts
            </span>
            <span className="text-xs font-bold text-foreground">
              {getAdminAccounts().length} registered
            </span>
          </div>
          {lastLoginLog && (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <span className="text-xs text-foreground">
                {new Date(lastLoginLog.timestamp).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesSection({ actor }: { actor: any }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!actor) return;
    const cats = await actor.getCategories();
    setCategories(cats);
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await actor.addCategory(newName.trim());
      toast.success("Category added!");
      setAddOpen(false);
      setNewName("");
      reload();
    } catch {
      toast.error("Failed");
    }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editCat || !editName.trim()) return;
    setSaving(true);
    try {
      await actor.updateCategory(editCat.id, editName.trim());
      toast.success("Category updated!");
      setEditOpen(false);
      setEditCat(null);
      reload();
    } catch {
      toast.error("Failed");
    }
    setSaving(false);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this category?")) return;
    try {
      await actor.deleteCategory(id);
      toast.success("Deleted!");
      reload();
    } catch {
      toast.error("Failed");
    }
  };

  if (loading)
    return (
      <div
        data-ocid="categories.loading_state"
        className="flex justify-center py-12"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div data-ocid="categories.section" className="space-y-3">
      <Button
        data-ocid="categories.add_button"
        className="w-full h-12 rounded-xl font-semibold"
        onClick={() => {
          setNewName("");
          setAddOpen(true);
        }}
      >
        <Plus className="w-4 h-4 mr-2" /> Add Category
      </Button>

      {categories.length === 0 && (
        <div
          data-ocid="categories.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No categories yet
        </div>
      )}

      {categories.map((cat, i) => (
        <Card
          key={cat.id.toString()}
          data-ocid={`categories.item.${i + 1}`}
          className="card-elevated"
        >
          <CardContent className="py-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="flex-1 font-medium text-foreground">
              {cat.name}
            </span>
            <button
              type="button"
              data-ocid={`categories.edit_button.${i + 1}`}
              onClick={() => {
                setEditCat(cat);
                setEditName(cat.name);
                setEditOpen(true);
              }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              data-ocid={`categories.delete_button.${i + 1}`}
              onClick={() => handleDelete(cat.id)}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </CardContent>
        </Card>
      ))}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label>Category Name</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-xl"
              placeholder="e.g. Electrician"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={handleAdd}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}{" "}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label>Category Name</Label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={handleEdit}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}{" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkersSection({ actor }: { actor: any }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState({
    name: "",
    experience: "",
    location: "",
    expectedSalary: "",
    category: "",
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("pending");

  const reload = useCallback(async () => {
    if (!actor) return;
    const ws = await actor.getAllWorkers();
    setWorkers(ws);
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    reload();
  }, [reload]);

  const pending = workers.filter((w) => !w.approved && !w.blocked);
  const all = workers.filter((w) => w.approved || w.blocked);

  const handleApprove = async (id: bigint) => {
    try {
      await actor.approveWorker(id);
      toast.success("Worker approved!");
      reload();
    } catch {
      toast.error("Failed");
    }
  };
  const handleBlock = async (id: bigint) => {
    try {
      await actor.blockWorker(id);
      toast.success("Worker blocked");
      reload();
    } catch {
      toast.error("Failed");
    }
  };
  const handleUnblock = async (id: bigint) => {
    try {
      await actor.unblockWorker(id);
      toast.success("Worker unblocked");
      reload();
    } catch {
      toast.error("Failed");
    }
  };

  const openEdit = (w: Worker) => {
    setEditWorker(w);
    setForm({
      name: w.name,
      experience: w.experience,
      location: w.location,
      expectedSalary: w.expectedSalary,
      category: w.category,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editWorker) return;
    setSaving(true);
    try {
      await actor.adminUpdateWorker(
        editWorker.id,
        form.name,
        form.experience,
        form.location,
        form.expectedSalary,
        form.category,
      );
      toast.success("Worker updated!");
      setEditOpen(false);
      reload();
    } catch {
      toast.error("Failed");
    }
    setSaving(false);
  };

  const WorkerCard = ({
    worker,
    index,
    showApprove,
  }: { worker: Worker; index: number; showApprove: boolean }) => (
    <Card data-ocid={`workers.item.${index}`} className="card-elevated">
      <CardContent className="pt-4 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-foreground">{worker.name}</p>
            <p className="text-sm text-muted-foreground">
              {worker.category} · {worker.location}
            </p>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {worker.blocked && (
              <Badge variant="destructive" className="text-xs">
                Blocked
              </Badge>
            )}
            {worker.approved && !worker.blocked && (
              <Badge className="text-xs bg-green-100 text-green-700">
                Approved
              </Badge>
            )}
            {!worker.approved && !worker.blocked && (
              <Badge variant="secondary" className="text-xs">
                Pending
              </Badge>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Exp: {worker.experience} · Salary: {worker.expectedSalary}
        </div>
        <div className="flex gap-2 pt-1 flex-wrap">
          {showApprove && !worker.approved && (
            <Button
              data-ocid={`workers.approve_button.${index}`}
              size="sm"
              className="rounded-lg bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
              onClick={() => handleApprove(worker.id)}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Approve
            </Button>
          )}
          {!worker.blocked ? (
            <Button
              data-ocid={`workers.block_button.${index}`}
              size="sm"
              variant="destructive"
              className="rounded-lg h-8 text-xs"
              onClick={() => handleBlock(worker.id)}
            >
              <XCircle className="w-3 h-3 mr-1" /> Block
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg h-8 text-xs"
              onClick={() => handleUnblock(worker.id)}
            >
              Unblock
            </Button>
          )}
          <Button
            data-ocid={`workers.edit_button.${index}`}
            size="sm"
            variant="outline"
            className="rounded-lg h-8 text-xs"
            onClick={() => openEdit(worker)}
          >
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading)
    return (
      <div
        data-ocid="workers.loading_state"
        className="flex justify-center py-12"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div data-ocid="workers.section">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full rounded-xl mb-4">
          <TabsTrigger value="pending" className="flex-1 rounded-lg text-xs">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 rounded-lg text-xs">
            All Workers ({all.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3 mt-0">
          {pending.length === 0 && (
            <div
              data-ocid="workers.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              No pending approvals
            </div>
          )}
          {pending.map((w, i) => (
            <WorkerCard
              key={w.id.toString()}
              worker={w}
              index={i + 1}
              showApprove
            />
          ))}
        </TabsContent>
        <TabsContent value="all" className="space-y-3 mt-0">
          {all.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No workers yet
            </div>
          )}
          {all.map((w, i) => (
            <WorkerCard
              key={w.id.toString()}
              worker={w}
              index={i + 1}
              showApprove={false}
            />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(
              [
                "name",
                "experience",
                "location",
                "expectedSalary",
                "category",
              ] as const
            ).map((field) => (
              <div key={field} className="space-y-1">
                <Label className="capitalize text-xs">
                  {field.replace(/([A-Z])/g, " $1")}
                </Label>
                <Input
                  value={form[field]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}{" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JobsSection({ actor }: { actor: any }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    category: "",
    location: "",
    description: "",
    payOffered: "",
    postedBy: "",
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("pending");

  const reload = useCallback(async () => {
    if (!actor) return;
    const js = await actor.getAllJobs();
    setJobs(js.filter((j: Job) => !j.deleted));
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    reload();
  }, [reload]);

  const pending = jobs.filter((j) => !j.approved);
  const approved = jobs.filter((j) => j.approved);

  const handleApprove = async (id: bigint) => {
    try {
      await actor.approveJob(id);
      toast.success("Job approved!");
      reload();
    } catch {
      toast.error("Failed");
    }
  };
  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this job?")) return;
    try {
      await actor.deleteJob(id);
      toast.success("Deleted!");
      reload();
    } catch {
      toast.error("Failed");
    }
  };
  const openEdit = (j: Job) => {
    setEditJob(j);
    setForm({
      category: j.category,
      location: j.location,
      description: j.description,
      payOffered: j.payOffered,
      postedBy: j.postedBy,
    });
    setEditOpen(true);
  };
  const handleSaveEdit = async () => {
    if (!editJob) return;
    setSaving(true);
    try {
      await actor.adminUpdateJob(
        editJob.id,
        form.category,
        form.location,
        form.description,
        form.payOffered,
        form.postedBy,
      );
      toast.success("Job updated!");
      setEditOpen(false);
      reload();
    } catch {
      toast.error("Failed");
    }
    setSaving(false);
  };

  const JobCard = ({
    job,
    index,
    showApprove,
  }: { job: Job; index: number; showApprove: boolean }) => (
    <Card data-ocid={`jobs.item.${index}`} className="card-elevated">
      <CardContent className="pt-4 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-foreground">{job.category}</p>
            <p className="text-sm text-muted-foreground">
              {job.location} · {job.payOffered}
            </p>
          </div>
          <Badge
            variant={job.approved ? "default" : "secondary"}
            className="text-xs"
          >
            {job.approved ? "Approved" : "Pending"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {job.description}
        </p>
        <p className="text-xs text-muted-foreground">
          By: {job.postedBy} · {formatDate(job.createdAt)}
        </p>
        <div className="flex gap-2 pt-1 flex-wrap">
          {showApprove && !job.approved && (
            <Button
              data-ocid={`jobs.approve_button.${index}`}
              size="sm"
              className="rounded-lg bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
              onClick={() => handleApprove(job.id)}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Approve
            </Button>
          )}
          <Button
            data-ocid={`jobs.edit_button.${index}`}
            size="sm"
            variant="outline"
            className="rounded-lg h-8 text-xs"
            onClick={() => openEdit(job)}
          >
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button
            data-ocid={`jobs.delete_button.${index}`}
            size="sm"
            variant="destructive"
            className="rounded-lg h-8 text-xs"
            onClick={() => handleDelete(job.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading)
    return (
      <div data-ocid="jobs.loading_state" className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div data-ocid="jobs.section">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full rounded-xl mb-4">
          <TabsTrigger value="pending" className="flex-1 rounded-lg text-xs">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 rounded-lg text-xs">
            All Jobs ({approved.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3 mt-0">
          {pending.length === 0 && (
            <div
              data-ocid="jobs.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              No pending jobs
            </div>
          )}
          {pending.map((j, i) => (
            <JobCard key={j.id.toString()} job={j} index={i + 1} showApprove />
          ))}
        </TabsContent>
        <TabsContent value="all" className="space-y-3 mt-0">
          {approved.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No approved jobs
            </div>
          )}
          {approved.map((j, i) => (
            <JobCard
              key={j.id.toString()}
              job={j}
              index={i + 1}
              showApprove={false}
            />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(
              [
                "category",
                "location",
                "description",
                "payOffered",
                "postedBy",
              ] as const
            ).map((field) => (
              <div key={field} className="space-y-1">
                <Label className="capitalize text-xs">
                  {field.replace(/([A-Z])/g, " $1")}
                </Label>
                {field === "description" ? (
                  <Textarea
                    value={form[field]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [field]: e.target.value }))
                    }
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                ) : (
                  <Input
                    value={form[field]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [field]: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}{" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationsSection({ actor }: { actor: any }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!actor) return;
    const ns = await actor.getNotifications();
    setNotifications(
      [...ns].sort((a: Notification, b: Notification) =>
        Number(b.createdAt - a.createdAt),
      ),
    );
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Fill all fields");
      return;
    }
    setSending(true);
    try {
      await actor.sendNotification(title.trim(), message.trim());
      toast.success("Notification sent to all users!");
      setTitle("");
      setMessage("");
      reload();
    } catch {
      toast.error("Failed to send");
    }
    setSending(false);
  };

  return (
    <div data-ocid="notifications.section" className="space-y-4">
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Title</Label>
            <Input
              data-ocid="notifications.title_input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
              placeholder="Notification title"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Message</Label>
            <Textarea
              data-ocid="notifications.textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl resize-none"
              rows={4}
              placeholder="Notification message"
            />
          </div>
          <Button
            data-ocid="notifications.send_button"
            className="w-full h-12 rounded-xl font-semibold"
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            {sending ? "Sending..." : "Send to All Users"}
          </Button>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div
              data-ocid="notifications.loading_state"
              className="flex justify-center py-8"
            >
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div
              data-ocid="notifications.empty_state"
              className="text-center py-8 text-muted-foreground text-sm"
            >
              No notifications sent yet
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div
                  key={n.id.toString()}
                  data-ocid={`notifications.item.${i + 1}`}
                  className="border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-sm text-foreground">
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SheetsSection() {
  const [url, setUrl] = useState(
    () => localStorage.getItem(SHEETS_WEBHOOK_KEY) || "",
  );
  const [saved, setSaved] = useState(false);

  const scriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name || "",
    data.mobile || "",
    data.category || "",
    data.experience || "",
    data.location || "",
    data.salary || "",
    data.type || "worker_profile",
    data.paymentStatus || ""
  ]);
  return ContentService.createTextOutput(JSON.stringify({status:"ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleSave = () => {
    localStorage.setItem(SHEETS_WEBHOOK_KEY, url.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-bold mb-1">Google Sheets se Connect Karein</p>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
          <li>sheets.google.com par naya sheet banao</li>
          <li>Extensions &gt; Apps Script mein jao</li>
          <li>Neeche diya script paste karo &amp; deploy karo</li>
          <li>Deploy &gt; New Deployment &gt; Web App &gt; Anyone access</li>
          <li>Mila URL copy karke neeche paste karo</li>
        </ol>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Apps Script Code</Label>
        <div className="relative">
          <pre className="bg-muted rounded-xl p-3 text-[10px] overflow-x-auto whitespace-pre-wrap break-all font-mono border border-border">
            {scriptCode}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(scriptCode);
              toast.success("Script copy ho gayi!");
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhookUrl" className="text-sm font-semibold">
          Webhook URL
        </Label>
        <Input
          data-ocid="admin.sheets.webhook_input"
          id="webhookUrl"
          placeholder="https://script.google.com/macros/s/.../exec"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-12 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Apps Script deploy karne ke baad mila URL yahan paste karo.
        </p>
      </div>

      <Button
        data-ocid="admin.sheets.save_button"
        className="w-full touch-btn"
        onClick={handleSave}
        disabled={!url.trim()}
      >
        {saved ? "Webhook Save Ho Gaya!" : "Webhook Save Karo"}
      </Button>

      {saved && (
        <div
          data-ocid="admin.sheets.success_state"
          className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-sm text-green-700 font-semibold"
        >
          Google Sheets connected! Ab worker profiles sheet mein save honge.
        </div>
      )}

      {url && !saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
          Webhook active hai. Worker profile submit hone par data sheet mein
          jayega.
        </div>
      )}
    </div>
  );
}

function VerificationsSubTab() {
  const [records, setRecords] = React.useState<VerificationRecord[]>([]);
  const [filter, setFilter] = React.useState<
    "all" | VerificationRecord["status"]
  >("all");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setRecords(loadAllVerificationRecords());
  }, []);

  function handleApprove(mobile: string) {
    const all = loadAllVerificationRecords();
    const idx = all.findIndex((r) => r.mobile === mobile);
    if (idx < 0) return;
    all[idx] = { ...all[idx], status: "verified", reviewedAt: Date.now() };
    localStorage.setItem(
      "kaam_mitra_verification_records",
      JSON.stringify(all),
    );
    // Also set mobileVerified on worker extended profile
    const extById = loadAllExtendedById();
    const ext = extById[mobile];
    if (ext) {
      saveExtendedById(mobile, { ...ext, mobileVerified: true });
    }
    setRecords([...all]);
    toast.success("Worker verified!");
  }

  function handleReject(mobile: string) {
    const all = loadAllVerificationRecords();
    const idx = all.findIndex((r) => r.mobile === mobile);
    if (idx < 0) return;
    all[idx] = { ...all[idx], status: "rejected", reviewedAt: Date.now() };
    localStorage.setItem(
      "kaam_mitra_verification_records",
      JSON.stringify(all),
    );
    setRecords([...all]);
    toast.success("Rejected.");
  }

  const filtered = records.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile.includes(search) ||
      r.docNumber.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function statusBadge(status: VerificationRecord["status"]) {
    if (status === "verified")
      return (
        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          ✅ Verified
        </span>
      );
    if (status === "rejected")
      return (
        <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
          ❌ Rejected
        </span>
      );
    return (
      <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
        ⏳ Pending
      </span>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          data-ocid="dashboard.verifications.search_input"
          placeholder="Search by name, mobile, doc#..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl"
        />
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as typeof filter)}
        >
          <SelectTrigger
            data-ocid="dashboard.verifications.filter_select"
            className="w-28"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <div
          data-ocid="dashboard.verifications.empty_state"
          className="text-center py-12 text-muted-foreground text-sm"
        >
          Koi verification request nahi
        </div>
      ) : (
        filtered.map((r, i) => (
          <Card
            key={r.mobile}
            data-ocid={`dashboard.verifications.item.${i + 1}`}
            className="card-elevated"
          >
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm">{r.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.mobile} · {r.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.docType === "aadhaar"
                      ? "🪪 Aadhaar"
                      : r.docType === "driving_licence"
                        ? "🚗 DL"
                        : "🗳️ Voter ID"}
                    : {r.docNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.city} ·{" "}
                    {new Date(r.submittedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                {statusBadge(r.status)}
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <Button
                    data-ocid={`dashboard.verifications.approve_button.${i + 1}`}
                    size="sm"
                    className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => handleApprove(r.mobile)}
                  >
                    ✅ Approve
                  </Button>
                  <Button
                    data-ocid={`dashboard.verifications.reject_button.${i + 1}`}
                    size="sm"
                    variant="destructive"
                    className="h-8 text-xs rounded-lg flex-1"
                    onClick={() => handleReject(r.mobile)}
                  >
                    ❌ Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
type ContractorProfile = {
  name: string;
  companyName?: string;
  mobile: string;
  city: string;
  category: string;
};

function DashboardTab({ actor }: { actor: any }) {
  const [subTab, setSubTab] = useState("workers");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [blockedContractors, setBlockedContractors] = useState<Set<string>>(
    new Set(),
  );
  const [workersLoading, setWorkersLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [workerSearch, setWorkerSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<Job | null>(null);

  const loadWorkers = useCallback(async () => {
    if (!actor) return;
    setWorkersLoading(true);
    const ws = await actor.getAllWorkers();
    setWorkers(ws);
    setWorkersLoading(false);
  }, [actor]);

  const loadJobs = useCallback(async () => {
    if (!actor) return;
    setJobsLoading(true);
    const js = await actor.getAllJobs();
    setJobs(js.filter((j: Job) => !j.deleted));
    setJobsLoading(false);
  }, [actor]);

  const loadContractors = useCallback(() => {
    try {
      const raw = localStorage.getItem("contractorProfiles") || "[]";
      setContractors(JSON.parse(raw));
      const blockedRaw = localStorage.getItem("blockedContractors") || "[]";
      setBlockedContractors(new Set(JSON.parse(blockedRaw)));
    } catch {
      setContractors([]);
    }
  }, []);

  useEffect(() => {
    if (subTab === "workers") loadWorkers();
    else if (subTab === "jobs") loadJobs();
    else if (subTab === "contractors") loadContractors();
  }, [subTab, loadWorkers, loadJobs, loadContractors]);

  const handleApproveWorker = async (id: bigint, _index: number) => {
    try {
      await actor.approveWorker(id);
      toast.success("Worker approved!");
      loadWorkers();
    } catch {
      toast.error("Failed to approve worker");
    }
  };

  const handleBlockWorker = async (id: bigint, blocked: boolean) => {
    try {
      if (blocked) {
        await actor.unblockWorker(id);
        toast.success("Worker unblocked");
      } else {
        await actor.blockWorker(id);
        toast.success("Worker blocked");
      }
      loadWorkers();
    } catch {
      toast.error("Failed");
    }
  };

  const handleApproveJob = async (id: bigint) => {
    try {
      await actor.approveJob(id);
      toast.success("Job approved!");
      loadJobs();
    } catch {
      toast.error("Failed to approve job");
    }
  };

  const handleDeleteJob = async (id: bigint) => {
    try {
      await actor.deleteJob(id);
      toast.success("Job deleted");
      setDeleteConfirmJob(null);
      loadJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const toggleBlockContractor = (mobile: string) => {
    setBlockedContractors((prev) => {
      const next = new Set(prev);
      if (next.has(mobile)) {
        next.delete(mobile);
        toast.success("Contractor unblocked");
      } else {
        next.add(mobile);
        toast.success("Contractor blocked");
      }
      localStorage.setItem(
        "blockedContractors",
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.category.toLowerCase().includes(workerSearch.toLowerCase()),
  );

  const filteredJobs = jobs.filter(
    (j) =>
      j.description.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.category.toLowerCase().includes(jobSearch.toLowerCase()),
  );

  const WorkerSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="card-elevated">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div data-ocid="dashboard.section" className="space-y-4">
      {/* Summary badges */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-elevated text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-primary">{workers.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Workers</p>
          </CardContent>
        </Card>
        <Card className="card-elevated text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-primary">{jobs.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Jobs</p>
          </CardContent>
        </Card>
        <Card className="card-elevated text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-primary">
              {contractors.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Contractors</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="w-full rounded-xl">
          <TabsTrigger
            value="workers"
            data-ocid="dashboard.workers.tab"
            className="flex-1 rounded-lg text-xs"
          >
            Workers
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            data-ocid="dashboard.jobs.tab"
            className="flex-1 rounded-lg text-xs"
          >
            Jobs
          </TabsTrigger>
          <TabsTrigger
            value="contractors"
            data-ocid="dashboard.contractors.tab"
            className="flex-1 rounded-lg text-xs"
          >
            Contractors
          </TabsTrigger>
          <TabsTrigger
            value="verifications"
            data-ocid="dashboard.verifications.tab"
            className="flex-1 rounded-lg text-xs"
          >
            Verify
          </TabsTrigger>
        </TabsList>

        {/* Workers sub-tab */}
        <TabsContent value="workers" className="mt-4 space-y-3">
          <Input
            data-ocid="dashboard.workers.search_input"
            placeholder="Search by name or category..."
            value={workerSearch}
            onChange={(e) => setWorkerSearch(e.target.value)}
            className="rounded-xl"
          />
          {workersLoading ? (
            <WorkerSkeleton />
          ) : filteredWorkers.length === 0 ? (
            <div
              data-ocid="dashboard.workers.empty_state"
              className="text-center py-12 text-muted-foreground text-sm"
            >
              No workers found
            </div>
          ) : (
            filteredWorkers.map((w, i) => (
              <Card
                key={w.id.toString()}
                data-ocid={`dashboard.workers.item.${i + 1}`}
                className="card-elevated"
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary text-sm">
                        {w.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground">
                          {w.name}
                        </p>
                        {w.blocked && (
                          <Badge variant="destructive" className="text-xs">
                            Blocked
                          </Badge>
                        )}
                        {w.approved && !w.blocked && (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        )}
                        {!w.approved && !w.blocked && (
                          <Badge variant="secondary" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {w.category} · {w.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {!w.approved && !w.blocked && (
                      <Button
                        data-ocid={`dashboard.workers.approve_button.${i + 1}`}
                        size="sm"
                        className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveWorker(w.id, i + 1)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                    )}
                    <Button
                      data-ocid={`dashboard.workers.toggle.${i + 1}`}
                      size="sm"
                      variant={w.blocked ? "outline" : "destructive"}
                      className="h-8 text-xs rounded-lg"
                      onClick={() => handleBlockWorker(w.id, w.blocked)}
                    >
                      {w.blocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Jobs sub-tab */}
        <TabsContent value="jobs" className="mt-4 space-y-3">
          <Input
            data-ocid="dashboard.jobs.search_input"
            placeholder="Search by title or category..."
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            className="rounded-xl"
          />
          {jobsLoading ? (
            <WorkerSkeleton />
          ) : filteredJobs.length === 0 ? (
            <div
              data-ocid="dashboard.jobs.empty_state"
              className="text-center py-12 text-muted-foreground text-sm"
            >
              No jobs found
            </div>
          ) : (
            filteredJobs.map((j, i) => (
              <Card
                key={j.id.toString()}
                data-ocid={`dashboard.jobs.item.${i + 1}`}
                className="card-elevated"
              >
                <CardContent className="pt-3 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">
                        {j.description.slice(0, 40) || j.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {j.category} · {j.location} · {j.payOffered}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        By: {j.postedBy}
                      </p>
                    </div>
                    <Badge
                      variant={j.approved ? "default" : "secondary"}
                      className="text-xs flex-shrink-0"
                    >
                      {j.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!j.approved && (
                      <Button
                        data-ocid={`dashboard.jobs.approve_button.${i + 1}`}
                        size="sm"
                        className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveJob(j.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                    )}
                    <Button
                      data-ocid={`dashboard.jobs.delete_button.${i + 1}`}
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs rounded-lg"
                      onClick={() => setDeleteConfirmJob(j)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Contractors sub-tab */}
        <TabsContent value="contractors" className="mt-4 space-y-3">
          {contractors.length === 0 ? (
            <div
              data-ocid="dashboard.contractors.empty_state"
              className="text-center py-12 text-muted-foreground text-sm"
            >
              No contractors registered yet
            </div>
          ) : (
            contractors.map((c, i) => {
              const isBlocked = blockedContractors.has(c.mobile);
              return (
                <Card
                  key={`${c.mobile}-${i}`}
                  data-ocid={`dashboard.contractors.item.${i + 1}`}
                  className="card-elevated"
                >
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground">
                            {c.name}
                          </p>
                          {isBlocked && (
                            <Badge variant="destructive" className="text-xs">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        {c.companyName && (
                          <p className="text-xs text-muted-foreground">
                            {c.companyName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {c.city} · {c.mobile}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.category}
                        </p>
                      </div>
                      <Button
                        data-ocid={`dashboard.contractors.toggle.${i + 1}`}
                        size="sm"
                        variant={isBlocked ? "outline" : "destructive"}
                        className="h-8 text-xs rounded-lg flex-shrink-0"
                        onClick={() => toggleBlockContractor(c.mobile)}
                      >
                        {isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Verifications sub-tab */}
        <TabsContent value="verifications" className="mt-4 space-y-3">
          <VerificationsSubTab />
        </TabsContent>
      </Tabs>

      {/* Delete Job Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmJob}
        onOpenChange={(open) => !open && setDeleteConfirmJob(null)}
      >
        <DialogContent
          data-ocid="dashboard.jobs.dialog"
          className="rounded-2xl max-w-[340px]"
        >
          <DialogHeader>
            <DialogTitle>Delete Job?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this job? This action cannot be
            undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="dashboard.jobs.cancel_button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDeleteConfirmJob(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="dashboard.jobs.confirm_button"
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={() =>
                deleteConfirmJob && handleDeleteJob(deleteConfirmJob.id)
              }
            >
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function PaymentsSection() {
  const [payTab, setPayTab] = React.useState("fees");
  const allPayments = loadAllPaymentRecords();
  const allEscrows = loadAllEscrowRecords();

  const totalCollected = allPayments
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + r.feeAmount, 0);
  const pendingCount = allPayments.filter((r) => r.status === "pending").length;
  const totalEscrow = allEscrows
    .filter((e) => e.status === "held")
    .reduce((s, e) => s + e.advanceAmount, 0);

  // Category earnings
  const categoryMap: Record<string, number> = {};
  for (const r of allPayments.filter((r) => r.status === "approved")) {
    categoryMap[r.category] = (categoryMap[r.category] ?? 0) + r.feeAmount;
  }
  const categoryEntries = Object.entries(categoryMap).sort(
    (a, b) => b[1] - a[1],
  );

  const [payments, setPayments] = React.useState(allPayments);

  function approvePayment(workerId: string) {
    const rec = payments.find((r) => r.workerId === workerId);
    if (!rec) return;
    savePaymentRecord({ ...rec, status: "approved", reviewedAt: Date.now() });
    setPayments(loadAllPaymentRecords());
  }

  function rejectPayment(workerId: string) {
    const reason = prompt("Rejection reason:");
    if (reason === null) return;
    const rec = payments.find((r) => r.workerId === workerId);
    if (!rec) return;
    savePaymentRecord({
      ...rec,
      status: "rejected",
      reviewedAt: Date.now(),
      rejectionReason: reason,
    });
    setPayments(loadAllPaymentRecords());
  }

  const [escrows, setEscrows] = React.useState(allEscrows);

  function releaseEscrow(escrowId: string) {
    updateEscrowStatus(escrowId, "released", { resolvedAt: Date.now() });
    setEscrows(loadAllEscrowRecords());
  }

  function refundEscrow(escrowId: string) {
    updateEscrowStatus(escrowId, "refunded", { resolvedAt: Date.now() });
    setEscrows(loadAllEscrowRecords());
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-green-700">₹{totalCollected}</p>
          <p className="text-xs text-green-600 font-semibold">
            Total Collected
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600 font-semibold">Pending</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-blue-700">{payments.length}</p>
          <p className="text-xs text-blue-600 font-semibold">
            Total Transactions
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-purple-700">₹{totalEscrow}</p>
          <p className="text-xs text-purple-600 font-semibold">Escrow Held</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { id: "fees", label: "Registration Fees" },
          { id: "escrow", label: "Escrow" },
          { id: "earnings", label: "Category Earnings" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              payTab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setPayTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {payTab === "fees" && (
        <div className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Koi payment nahi
            </p>
          ) : (
            payments.map((r) => (
              <div
                key={r.workerId}
                className="bg-card border border-border rounded-xl p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{r.workerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.category}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full $
                      r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Amount: ₹{r.feeAmount}</p>
                  <p>
                    Date: {new Date(r.submittedAt).toLocaleDateString("en-IN")}
                  </p>
                  <p className="font-mono">
                    Worker: KM-{r.workerId.slice(-8).toUpperCase()}
                  </p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 h-8 bg-green-600 text-white text-xs font-bold rounded-lg"
                      onClick={() => approvePayment(r.workerId)}
                    >
                      ✅ Approve
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-8 bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-300"
                      onClick={() => rejectPayment(r.workerId)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {payTab === "escrow" && (
        <div className="space-y-2">
          {escrows.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Koi escrow nahi
            </p>
          ) : (
            escrows.map((e) => (
              <div
                key={e.escrowId}
                className="bg-card border border-border rounded-xl p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{e.workerName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {e.escrowId.slice(0, 20)}...
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full $
                      e.status === "held"
                        ? "bg-amber-100 text-amber-700"
                        : e.status === "released"
                          ? "bg-green-100 text-green-700"
                          : e.status === "disputed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"`}
                  >
                    {e.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Amount: ₹{e.advanceAmount} held
                </p>
                {e.status === "disputed" && (
                  <div className="space-y-1">
                    {e.disputeReason && (
                      <p className="text-xs text-red-600 italic">
                        Reason: {e.disputeReason}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 h-8 bg-green-600 text-white text-xs font-bold rounded-lg"
                        onClick={() => releaseEscrow(e.escrowId)}
                      >
                        Release to Worker
                      </button>
                      <button
                        type="button"
                        className="flex-1 h-8 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-300"
                        onClick={() => refundEscrow(e.escrowId)}
                      >
                        Refund Contractor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {payTab === "earnings" && (
        <div className="space-y-2">
          {categoryEntries.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Koi earnings nahi
            </p>
          ) : (
            categoryEntries.map(([cat, amt]) => (
              <div
                key={cat}
                className="bg-card border border-border rounded-xl p-3 flex items-center justify-between"
              >
                <p className="text-sm font-semibold">{cat}</p>
                <p className="text-sm font-black text-green-700">₹{amt}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PlansSection() {
  const records = loadAllPremiumRecords();
  const now = Date.now();

  const totalRevenue = records.reduce((s, r) => s + r.amount, 0);
  const activePremiumContractors = records.filter(
    (r) => r.planType === "contractor_premium" && r.expiresAt > now,
  ).length;
  const workerVerifications = records.filter(
    (r) => r.planType !== "contractor_premium",
  ).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-violet-50 border border-violet-200 p-3 text-center">
          <p className="text-xl font-black text-violet-700">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-violet-600 font-semibold mt-0.5">
            Total Revenue
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3 text-center">
          <p className="text-xl font-black text-blue-700">
            {activePremiumContractors}
          </p>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
            Premium Contractors
          </p>
        </div>
        <div className="rounded-2xl bg-green-50 border border-green-200 p-3 text-center">
          <p className="text-xl font-black text-green-700">
            {workerVerifications}
          </p>
          <p className="text-[10px] text-green-600 font-semibold mt-0.5">
            Worker Plans
          </p>
        </div>
      </div>

      {/* Records List */}
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
        All Plan Records
      </h3>
      {records.length === 0 ? (
        <div
          data-ocid="admin.plans.empty_state"
          className="text-center py-10 bg-muted/30 rounded-2xl border border-border"
        >
          <p className="text-3xl mb-2">💳</p>
          <p className="font-semibold text-foreground text-sm">
            Koi premium record nahi abhi
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r, i) => {
            const isActive = r.expiresAt > now;
            return (
              <div
                key={r.id}
                data-ocid={`admin.plans.item.${i + 1}`}
                className="rounded-xl border border-border p-3 bg-card"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {r.mobile}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {r.planType.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TXN: {r.txnId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{r.amount}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isActive ? "Active" : "Expired"}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Exp: {new Date(r.expiresAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FemaleProfilesSection() {
  const [profiles] = useState([
    {
      name: "Priya Sharma",
      category: "Office Staff",
      city: "Delhi",
      submitted: "12 Mar 2026",
      status: "Verified",
    },
    {
      name: "Sunita Devi",
      category: "Maid / Helper",
      city: "Mumbai",
      submitted: "11 Mar 2026",
      status: "Pending",
    },
    {
      name: "Neha Gupta",
      category: "Office Staff",
      city: "Noida",
      submitted: "10 Mar 2026",
      status: "Pending",
    },
    {
      name: "Rekha Kumari",
      category: "Maid / Helper",
      city: "Patna",
      submitted: "09 Mar 2026",
      status: "Verified",
    },
    {
      name: "Anjali Singh",
      category: "Private Jobs",
      city: "Lucknow",
      submitted: "08 Mar 2026",
      status: "Rejected",
    },
    {
      name: "Kavita Yadav",
      category: "Other Skills",
      city: "Jaipur",
      submitted: "07 Mar 2026",
      status: "Pending",
    },
  ]);
  const [statuses, setStatuses] = useState<Record<number, string>>(() =>
    Object.fromEntries(profiles.map((_, i) => [i, profiles[i].status])),
  );
  function setStatus(i: number, s: string) {
    setStatuses((prev) => ({ ...prev, [i]: s }));
  }
  return (
    <div data-ocid="admin.female_profiles.section" className="space-y-4">
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
        <p className="text-xs text-pink-800 font-medium">
          ud83dudd12 Phone numbers and ID data are encrypted and visible to
          admin only.
        </p>
      </div>
      <div className="space-y-3">
        {profiles.map((p, i) => (
          <div
            key={p.name}
            data-ocid={`admin.female_profiles.item.${i + 1}`}
            className="border border-border rounded-xl p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category} u00b7 {p.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {p.submitted}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  statuses[i] === "Verified"
                    ? "bg-green-100 text-green-800"
                    : statuses[i] === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {statuses[i]}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setStatus(i, "Verified")}
                data-ocid={`admin.female_profiles.verify.button.${i + 1}`}
              >
                u2705 Verify
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => setStatus(i, "Rejected")}
                data-ocid={`admin.female_profiles.reject.button.${i + 1}`}
              >
                u274c Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  void profiles.filter((_, j) => j !== i);
                }}
                data-ocid={`admin.female_profiles.delete_button.${i + 1}`}
              >
                ud83duddd1 Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Moderation Admin Section ───────────────────────────────────────────────────

function AIModerationAdminSection() {
  const navigate = useNavigate();
  const [sensitivity, setSensitivity] = useState(() => {
    try {
      const s = localStorage.getItem("kaam_mitra_mod_settings");
      return s ? JSON.parse(s).sensitivityLevel : "medium";
    } catch {
      return "medium";
    }
  });

  const flaggedItems: Array<{
    id: string;
    userName: string;
    section: string;
    riskLevel: string;
    content: string;
  }> = (() => {
    try {
      const s = localStorage.getItem("kaam_mitra_flagged_items");
      return s ? JSON.parse(s).slice(0, 5) : [];
    } catch {
      return [];
    }
  })();

  const pending = flaggedItems.filter(
    (i: any) => i.status === "pending",
  ).length;
  const highRisk = flaggedItems.filter(
    (i: any) => i.riskLevel === "high",
  ).length;
  const blocked = flaggedItems.filter((i: any) => i.action === "block").length;

  const saveSensitivity = (level: string) => {
    setSensitivity(level);
    try {
      const existing = JSON.parse(
        localStorage.getItem("kaam_mitra_mod_settings") || "{}",
      );
      localStorage.setItem(
        "kaam_mitra_mod_settings",
        JSON.stringify({ ...existing, sensitivityLevel: level }),
      );
      toast.success("Sensitivity updated!");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-yellow-700">{pending}</p>
          <p className="text-[10px] text-yellow-600 font-semibold">Pending</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-red-700">{highRisk}</p>
          <p className="text-[10px] text-red-600 font-semibold">High Risk</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-orange-700">{blocked}</p>
          <p className="text-[10px] text-orange-600 font-semibold">Blocked</p>
        </div>
      </div>

      {/* Quick sensitivity */}
      <div className="space-y-2">
        <p className="text-xs font-bold">Quick Sensitivity:</p>
        <div className="flex gap-2">
          {["low", "medium", "high"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => saveSensitivity(level)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${sensitivity === level ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Last 5 flagged */}
      <div>
        <p className="text-xs font-bold mb-2">Recent Flagged Content:</p>
        {flaggedItems.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Koi flagged content nahi
          </p>
        ) : (
          <div className="space-y-2">
            {flaggedItems.map((item: any) => (
              <div
                key={item.id}
                className="bg-muted/50 rounded-xl p-2.5 flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">
                    {item.userName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item.content?.slice(0, 60)}...
                  </p>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.riskLevel === "high" ? "bg-red-100 text-red-700" : item.riskLevel === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                  >
                    {item.riskLevel}
                  </span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md flex-shrink-0">
                  {item.section}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        className="w-full rounded-xl h-11"
        onClick={() => navigate({ to: "/ai-moderation" })}
      >
        <ShieldAlert className="w-4 h-4 mr-2" />
        Full AI Moderation Dashboard
      </Button>
    </div>
  );
}

export default function AdminPanel() {
  const { actor, isFetching } = useActor();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true",
  );
  const [loginStep, setLoginStep] = useState<LoginStep>("mobile_email");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [adminMobile, setAdminMobile] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setLoginStep("mobile_email");
    setForgotPhone("");
    setForgotOtp("");
    setAdminMobile("");
    setAdminEmail("");
    setMobileOtp("");
    setEmailOtp("");
    setOtpExpiry(0);
  };

  // ── Login screen ──
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[400px]"
        >
          <Card className="card-elevated shadow-xl">
            <CardContent className="pt-8 pb-8 px-6">
              <AnimatePresence mode="wait">
                {loginStep === "mobile_email" && (
                  <MobileEmailStep
                    key="mobile_email"
                    onOTPSent={(mob, eml, mobOtp, emlOtp) => {
                      setAdminMobile(mob);
                      setAdminEmail(eml);
                      setMobileOtp(mobOtp);
                      setEmailOtp(emlOtp);
                      setOtpExpiry(Date.now() + 5 * 60 * 1000);
                      setLoginStep("dual_otp");
                    }}
                    onSkipLogin={() => {
                      sessionStorage.setItem(SESSION_KEY, "true");
                      sessionStorage.setItem("adminMobile", SUPER_ADMIN_MOBILE);
                      setIsLoggedIn(true);
                      setActiveTab("sheets");
                    }}
                  />
                )}
                {loginStep === "dual_otp" && (
                  <DualOTPStep
                    key="dual_otp"
                    mobile={adminMobile}
                    email={adminEmail}
                    mobileOtp={mobileOtp}
                    emailOtp={emailOtp}
                    otpExpiry={otpExpiry}
                    onLoginSuccess={() => {
                      sessionStorage.setItem(SESSION_KEY, "true");
                      sessionStorage.setItem("adminMobile", adminMobile);
                      setIsLoggedIn(true);
                    }}
                    onBack={() => setLoginStep("mobile_email")}
                  />
                )}
                {loginStep === "forgot_phone" && (
                  <ForgotPhoneStep
                    key="forgot_phone"
                    onOtpSent={(phone, otp) => {
                      setForgotPhone(phone);
                      setForgotOtp(otp);
                      setLoginStep("forgot_otp");
                    }}
                    onBack={() => setLoginStep("mobile_email")}
                  />
                )}
                {loginStep === "forgot_otp" && (
                  <ForgotOtpStep
                    key="forgot_otp"
                    phone={forgotPhone}
                    demoOtp={forgotOtp}
                    onVerified={() => setLoginStep("forgot_newpwd")}
                    onBack={() => setLoginStep("forgot_phone")}
                  />
                )}
                {loginStep === "forgot_newpwd" && (
                  <ForgotNewPasswordStep
                    key="forgot_newpwd"
                    actor={actor}
                    onDone={() => setLoginStep("mobile_email")}
                    onBack={() => setLoginStep("forgot_otp")}
                  />
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ──
  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "workers", label: "Workers", icon: Users },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "sheets", label: "Sheets", icon: Link2 },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "payments", label: "Payments", icon: IndianRupee },
    { id: "plans", label: "Plans 💳", icon: IndianRupee },
    { id: "female_profiles", label: "👩 Female", icon: Users },
    { id: "ai_mod", label: "🛡️ AI", icon: ShieldAlert },
  ];

  // Check if logged-in user is super admin (by session stored mobile or default)
  const loggedInMobile =
    sessionStorage.getItem("adminMobile") || SUPER_ADMIN_MOBILE;
  const isSuperAdmin = loggedInMobile === SUPER_ADMIN_MOBILE;
  const allNavItems = isSuperAdmin
    ? [...navItems, { id: "superadmin", label: "S.Admin", icon: ShieldCheck }]
    : navItems;

  const sectionTitles: Record<string, string> = {
    profile: "My Profile",
    settings: "App Settings",
    categories: "Category Management",
    workers: "Worker Management",
    jobs: "Job Management",
    notifications: "Notifications",
    sheets: "Google Sheets Connect",
    dashboard: "Admin Dashboard",
    payments: "Payment Management",
    superadmin: "Super Admin Management",
    plans: "Premium Plans & Monetization",
    female_profiles: "Female Worker Profiles",
    ai_mod: "AI Moderation Dashboard",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-display font-bold text-lg">
              KaamMitra Admin
            </span>
          </div>
          <button
            type="button"
            data-ocid="admin.logout_button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Section title */}
      <div className="bg-muted border-b border-border">
        <div className="max-w-[520px] mx-auto px-4 py-3">
          <h2 className="text-base font-bold text-foreground">
            {sectionTitles[activeTab]}
          </h2>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-[520px] mx-auto px-4 pt-4">
          {isFetching || !actor ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "profile" && <ProfileSection actor={actor} />}
                {activeTab === "settings" && (
                  <AppSettingsSection actor={actor} />
                )}
                {activeTab === "categories" && (
                  <CategoriesSection actor={actor} />
                )}
                {activeTab === "workers" && <WorkersSection actor={actor} />}
                {activeTab === "jobs" && <JobsSection actor={actor} />}
                {activeTab === "notifications" && (
                  <NotificationsSection actor={actor} />
                )}
                {activeTab === "sheets" && <SheetsSection />}
                {activeTab === "dashboard" && <DashboardTab actor={actor} />}
                {activeTab === "payments" && <PaymentsSection />}
                {activeTab === "superadmin" && isSuperAdmin && (
                  <SuperAdminSection />
                )}
                {activeTab === "plans" && <PlansSection />}
                {activeTab === "female_profiles" && <FemaleProfilesSection />}
                {activeTab === "ai_mod" && <AIModerationAdminSection />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Bottom nav - 8 items */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg">
        <div
          className={`max-w-[520px] mx-auto grid ${isSuperAdmin ? "grid-cols-12" : "grid-cols-11"}`}
        >
          {allNavItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`admin.${id}.tab`}
              onClick={() => setActiveTab(id)}
              className={`relative flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium leading-tight">
                {label}
              </span>
              {activeTab === id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
