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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  Link2,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Category, Job, Notification, Worker } from "../backend.d";
import { useActor } from "../hooks/useActor";

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PHONE_KEY = "adminPhone";
const SESSION_KEY = "adminLoggedIn";
const DEFAULT_ADMIN_PHONE = "9999999999";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Login Steps ──────────────────────────────────────────────────────────────
// ─── Login Steps ──────────────────────────────────────────────────────────────
type LoginStep = "login" | "forgot_phone" | "forgot_otp" | "forgot_newpwd";

function UsernamePasswordStep({
  actor,
  onLoggedIn,
  onForgotPassword,
  onSkipLogin,
}: {
  actor: any;
  onLoggedIn: () => void;
  onForgotPassword: () => void;
  onSkipLogin: () => void;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    try {
      const ok = await actor.checkAdminCredentials(username, password);
      if (ok) {
        sessionStorage.setItem(SESSION_KEY, "true");
        onLoggedIn();
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Login failed. Please try again.");
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
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
          <ShieldCheck className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Admin Login
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          KaamMitra Control Panel
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-username" className="text-sm font-semibold">
            Username
          </Label>
          <Input
            id="admin-username"
            data-ocid="admin.username_input"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl h-12 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password" className="text-sm font-semibold">
            Password
          </Label>
          <Input
            id="admin-password"
            data-ocid="admin.password_input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl h-12 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {error && (
          <div
            data-ocid="admin.login_error_state"
            className="text-destructive text-sm font-medium flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button
          data-ocid="admin.login_button"
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={handleLogin}
          disabled={loading || !username || !password}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Logging in..." : "Login"}
        </Button>

        <button
          type="button"
          data-ocid="admin.forgot_password_button"
          onClick={onForgotPassword}
          className="w-full text-center text-sm text-primary font-semibold hover:underline mt-1"
        >
          Forgot Password?
        </button>

        {/* Reset credentials to default */}
        <button
          type="button"
          data-ocid="admin.reset_default_button"
          onClick={async () => {
            try {
              await actor.resetAdminToDefault();
              toast.success("Credentials reset to admin / 1234. Please login.");
            } catch {
              toast.error("Reset failed. Try Skip Login below.");
            }
          }}
          className="w-full text-center text-xs text-amber-600 font-semibold hover:underline mt-1"
        >
          Reset to Default (admin / 1234)
        </button>

        {/* Temporary skip login for emergency access */}
        <Button
          type="button"
          data-ocid="admin.skip_login_button"
          variant="outline"
          className="w-full h-10 rounded-xl text-sm font-semibold border-dashed border-orange-400 text-orange-600 hover:bg-orange-50 mt-2"
          onClick={onSkipLogin}
        >
          ⚡ Skip Login (Temporary Access)
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

  const handleReset = async () => {
    setError("");
    if (!newPwd) {
      setError("Enter a new password");
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
            placeholder="New password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="rounded-xl h-12"
          />
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
          disabled={loading || !newPwd || !confirmPwd}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </motion.div>
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
          <Input
            type="password"
            placeholder="New password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="rounded-xl"
          />
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
            disabled={pwdSaving}
          >
            {pwdSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Update Password
          </Button>
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
      <Card className="card-elevated">
        <CardContent className="pt-6 space-y-4">
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
              placeholder="Type your message to all users..."
            />
          </div>
          <Button
            data-ocid="notifications.send_button"
            className="w-full h-12 rounded-xl font-semibold"
            onClick={handleSend}
            disabled={sending}
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

      {loading ? (
        <div
          data-ocid="notifications.loading_state"
          className="flex justify-center py-8"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Past Notifications ({notifications.length})
          </h3>
          {notifications.length === 0 && (
            <div
              data-ocid="notifications.empty_state"
              className="text-center py-8 text-muted-foreground text-sm"
            >
              No notifications sent yet
            </div>
          )}
          {notifications.map((n, i) => (
            <Card
              key={n.id.toString()}
              data-ocid={`notifications.item.${i + 1}`}
              className="card-elevated"
            >
              <CardContent className="pt-3 pb-3">
                <p className="font-semibold text-sm text-foreground">
                  {n.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(n.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

// ── Google Sheets Webhook Section ────────────────────────────────────────────
const SHEETS_WEBHOOK_KEY = "sheetsWebhookUrl";

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

export default function AdminPanel() {
  const { actor, isFetching } = useActor();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true",
  );
  const [loginStep, setLoginStep] = useState<LoginStep>("login");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setLoginStep("login");
    setForgotPhone("");
    setForgotOtp("");
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
                {loginStep === "login" && (
                  <UsernamePasswordStep
                    key="login"
                    actor={actor}
                    onLoggedIn={() => setIsLoggedIn(true)}
                    onForgotPassword={() => setLoginStep("forgot_phone")}
                    onSkipLogin={() => {
                      sessionStorage.setItem(SESSION_KEY, "true");
                      setIsLoggedIn(true);
                      setActiveTab("sheets");
                    }}
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
                    onBack={() => setLoginStep("login")}
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
                    onDone={() => setLoginStep("login")}
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
  ];

  const sectionTitles: Record<string, string> = {
    profile: "My Profile",
    settings: "App Settings",
    categories: "Category Management",
    workers: "Worker Management",
    jobs: "Job Management",
    notifications: "Notifications",
    sheets: "Google Sheets Connect",
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
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg">
        <div className="max-w-[520px] mx-auto grid grid-cols-7">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`admin.${id}.tab`}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === id ? "" : ""}`} />
              <span className="text-[10px] font-medium leading-tight">
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
