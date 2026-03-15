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
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Database,
  Download,
  FileText,
  Globe,
  HardDrive,
  Info,
  Lock,
  MapPin,
  RefreshCw,
  Settings2,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// AI Moderation Settings Panel
function AIModerationSettingsPanel() {
  const navigate = useNavigate();
  const [sensitivity, setSensitivity] = useState(() => {
    try {
      const s = localStorage.getItem("kaam_mitra_mod_settings");
      return s ? JSON.parse(s).sensitivityLevel : "medium";
    } catch {
      return "medium";
    }
  });
  const [threshold, setThreshold] = useState(() => {
    try {
      const s = localStorage.getItem("kaam_mitra_mod_settings");
      return s ? (JSON.parse(s).blockThreshold ?? 3) : 3;
    } catch {
      return 3;
    }
  });
  const [autoDelete, setAutoDelete] = useState(() => {
    try {
      const s = localStorage.getItem("kaam_mitra_mod_settings");
      return s ? JSON.parse(s).autoDelete === "immediate" : false;
    } catch {
      return false;
    }
  });
  const bannedCount = (() => {
    try {
      const s = localStorage.getItem("kaam_mitra_mod_settings");
      return s ? (JSON.parse(s).bannedWords ?? []).length : 20;
    } catch {
      return 20;
    }
  })();
  const [learningMode, setLearningMode] = useState(() => {
    try {
      const s = localStorage.getItem("kaam_mitra_mod_settings");
      return s ? (JSON.parse(s).aiLearningMode ?? true) : true;
    } catch {
      return true;
    }
  });
  const moduleStatus = (() => {
    try {
      const s = localStorage.getItem("kaam_mitra_ai_modules");
      return s
        ? JSON.parse(s)
        : {
            content_mod: true,
            profile_verify: true,
            payment_mon: true,
            spam_protect: true,
          };
    } catch {
      return {
        content_mod: true,
        profile_verify: true,
        payment_mon: true,
        spam_protect: true,
      };
    }
  })();

  const save = () => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("kaam_mitra_mod_settings") || "{}",
      );
      localStorage.setItem(
        "kaam_mitra_mod_settings",
        JSON.stringify({
          ...existing,
          sensitivityLevel: sensitivity,
          blockThreshold: threshold,
          autoDelete: autoDelete ? "immediate" : "after_review",
        }),
      );
      toast.success("AI Moderation settings saved!");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          Sensitivity Level
        </p>
        <Select value={sensitivity} onValueChange={setSensitivity}>
          <SelectTrigger
            data-ocid="advanced_settings.ai_sensitivity.select"
            className="rounded-xl"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">
              Low — Only block extreme content
            </SelectItem>
            <SelectItem value="medium">
              Medium — Balanced (Recommended)
            </SelectItem>
            <SelectItem value="high">High — Strict moderation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          Block Threshold:{" "}
          <span className="text-foreground font-bold">
            {threshold} violations
          </span>
        </p>
        <input
          data-ocid="advanced_settings.ai_threshold.input"
          type="number"
          min={1}
          max={10}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
        <div>
          <p className="text-sm font-semibold">Auto-Delete</p>
          <p className="text-xs text-muted-foreground">
            {autoDelete ? "Immediate delete" : "After admin review"}
          </p>
        </div>
        <Switch
          data-ocid="advanced_settings.ai_auto_delete.switch"
          checked={autoDelete}
          onCheckedChange={setAutoDelete}
        />
      </div>

      <div className="p-3 bg-muted/40 rounded-xl">
        <p className="text-xs text-muted-foreground">
          Banned Words:{" "}
          <span className="font-bold text-foreground">{bannedCount} words</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Full manager Admin Panel mein available hai
        </p>
      </div>

      {/* AI Learning Mode */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
        <div>
          <p className="text-sm font-semibold">AI Learning Mode</p>
          <p className="text-xs text-muted-foreground">
            {learningMode ? "Active — AI सीख रही है" : "Inactive"}
          </p>
        </div>
        <Switch
          data-ocid="advanced_settings.ai_learning.switch"
          checked={learningMode}
          onCheckedChange={(v) => {
            setLearningMode(v);
            try {
              const ex = JSON.parse(
                localStorage.getItem("kaam_mitra_mod_settings") || "{}",
              );
              localStorage.setItem(
                "kaam_mitra_mod_settings",
                JSON.stringify({ ...ex, aiLearningMode: v }),
              );
            } catch {
              /* ignore */
            }
          }}
        />
      </div>

      {/* Module status */}
      <div className="rounded-xl border border-border p-3 space-y-1.5">
        <p className="text-xs font-bold mb-2">Module Status</p>
        {[
          { label: "Content Moderation", key: "content_mod" },
          { label: "Profile Verification", key: "profile_verify" },
          { label: "Payment Monitoring", key: "payment_mon" },
          { label: "Spam Protection", key: "spam_protect" },
        ].map((m) => (
          <div
            key={m.key}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted-foreground">{m.label}</span>
            <span
              className={`font-bold ${moduleStatus[m.key] ? "text-green-600" : "text-red-500"}`}
            >
              {moduleStatus[m.key] ? "✅ Active" : "❌ Off"}
            </span>
          </div>
        ))}
      </div>

      <Button
        data-ocid="advanced_settings.ai_save.button"
        className="w-full rounded-xl"
        size="sm"
        onClick={save}
      >
        Save AI Settings
      </Button>

      <button
        type="button"
        onClick={() => navigate({ to: "/ai-moderation" })}
        className="w-full text-xs text-primary underline py-1"
      >
        Open Full AI Moderation Dashboard →
      </button>
    </div>
  );
}

export function AdvancedSettings() {
  const navigate = useNavigate();

  // Language
  const [language, setLanguage] = useState("hindi");

  // Notification toggles
  const [notifJobAlert, setNotifJobAlert] = useState(true);
  const [notifMessage, setNotifMessage] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [notifPayment, setNotifPayment] = useState(true);

  // Location
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [nearbyJobs, setNearbyJobs] = useState(true);
  const [currentCity, setCurrentCity] = useState("");

  // Privacy
  const [showPhone, setShowPhone] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [whoCanContact, setWhoCanContact] = useState("verified");

  return (
    <div
      data-ocid="advanced_settings.page"
      className="page-container pt-4 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          data-ocid="advanced_settings.back_button"
          onClick={() => navigate({ to: "/settings" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display font-black">Advanced Settings</h1>
        </div>
        <Badge variant="outline" className="ml-auto text-xs">
          v3.7
        </Badge>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {/* 1. Language */}
        <AccordionItem
          value="language"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.language_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Language / भाषा</p>
                <p className="text-xs text-muted-foreground">
                  {language === "hindi" ? "हिंदी" : "English"}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <RadioGroup
              data-ocid="advanced_settings.language_radio"
              value={language}
              onValueChange={setLanguage}
              className="space-y-2"
            >
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                <RadioGroupItem
                  value="hindi"
                  id="lang-hindi"
                  data-ocid="advanced_settings.language.radio"
                />
                <Label
                  htmlFor="lang-hindi"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-lg">🇮🇳</span>
                  <div>
                    <p className="font-medium text-sm">हिंदी</p>
                    <p className="text-xs text-muted-foreground">Hindi</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                <RadioGroupItem
                  value="english"
                  id="lang-english"
                  data-ocid="advanced_settings.language.radio"
                />
                <Label
                  htmlFor="lang-english"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-lg">🇬🇧</span>
                  <div>
                    <p className="font-medium text-sm">English</p>
                    <p className="text-xs text-muted-foreground">अंग्रेज़ी</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            <Button
              data-ocid="advanced_settings.language_save_button"
              size="sm"
              className="w-full mt-3"
              onClick={() =>
                toast.success(
                  language === "hindi"
                    ? "भाषा बदली गई ✓"
                    : "Language changed ✓",
                )
              }
            >
              Save Language
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Notification Settings */}
        <AccordionItem
          value="notifications"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.notifications_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Notification Settings</p>
                <p className="text-xs text-muted-foreground">
                  Alert preferences
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            {[
              {
                id: "job-alert",
                label: "Job Alert Notification",
                sub: "Nayi jobs ke liye alert",
                value: notifJobAlert,
                set: setNotifJobAlert,
                ocid: "advanced_settings.job_alert.switch",
              },
              {
                id: "message",
                label: "Message Notification",
                sub: "Naye messages",
                value: notifMessage,
                set: setNotifMessage,
                ocid: "advanced_settings.message_notif.switch",
              },
              {
                id: "community",
                label: "Community Post Notification",
                sub: "Group updates",
                value: notifCommunity,
                set: setNotifCommunity,
                ocid: "advanced_settings.community_notif.switch",
              },
              {
                id: "payment",
                label: "Payment Alert Notification",
                sub: "Payment status alerts",
                value: notifPayment,
                set: setNotifPayment,
                ocid: "advanced_settings.payment_notif.switch",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-muted/40 rounded-xl p-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <Switch
                  data-ocid={item.ocid}
                  checked={item.value}
                  onCheckedChange={(v) => {
                    item.set(v);
                    toast.success(v ? "Notifications on" : "Notifications off");
                  }}
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 3. Location Settings */}
        <AccordionItem
          value="location"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.location_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Location Settings</p>
                <p className="text-xs text-muted-foreground">GPS and city</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium">Enable Location</p>
                <p className="text-xs text-muted-foreground">
                  GPS location share karo
                </p>
              </div>
              <Switch
                data-ocid="advanced_settings.location.switch"
                checked={locationEnabled}
                onCheckedChange={setLocationEnabled}
              />
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium">Show Nearby Jobs</p>
                <p className="text-xs text-muted-foreground">
                  Aas-paas ki jobs dikhao
                </p>
              </div>
              <Switch
                data-ocid="advanced_settings.nearby_jobs.switch"
                checked={nearbyJobs}
                onCheckedChange={setNearbyJobs}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city-update" className="text-xs font-medium">
                Update Current City
              </Label>
              <div className="flex gap-2">
                <Input
                  data-ocid="advanced_settings.city.input"
                  id="city-update"
                  placeholder="Eg: Lucknow"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="h-10 text-sm"
                />
                <Button
                  data-ocid="advanced_settings.city_save_button"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    if (currentCity.trim()) {
                      toast.success(`City updated: ${currentCity}`);
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Privacy Control */}
        <AccordionItem
          value="privacy"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.privacy_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Privacy Control</p>
                <p className="text-xs text-muted-foreground">
                  Profile visibility
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium">Show Phone Number</p>
                <p className="text-xs text-muted-foreground">
                  Profile mein number dikhai de
                </p>
              </div>
              <Switch
                data-ocid="advanced_settings.show_phone.switch"
                checked={showPhone}
                onCheckedChange={setShowPhone}
              />
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium">Show Profile</p>
                <p className="text-xs text-muted-foreground">
                  Search results mein dikhao
                </p>
              </div>
              <Switch
                data-ocid="advanced_settings.show_profile.switch"
                checked={showProfile}
                onCheckedChange={setShowProfile}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Who Can Contact Me</Label>
              <Select value={whoCanContact} onValueChange={setWhoCanContact}>
                <SelectTrigger
                  data-ocid="advanced_settings.contact_permission.select"
                  className="h-10 text-sm"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone / Sabhi</SelectItem>
                  <SelectItem value="verified">Verified Users Only</SelectItem>
                  <SelectItem value="contractors">Contractors Only</SelectItem>
                  <SelectItem value="nobody">Nobody / Koi Nahi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Document Manager */}
        <AccordionItem
          value="documents"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.documents_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Document Manager</p>
                <p className="text-xs text-muted-foreground">
                  Upload & manage docs
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            {[
              {
                label: "Upload Driving License",
                icon: "🪪",
                ocid: "advanced_settings.license.upload_button",
              },
              {
                label: "Upload ID Proof (Aadhaar/Voter)",
                icon: "📄",
                ocid: "advanced_settings.id_proof.upload_button",
              },
              {
                label: "Update Documents",
                icon: "🔄",
                ocid: "advanced_settings.docs.upload_button",
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                data-ocid={item.ocid}
                onClick={() => toast.info(`${item.label} — coming soon`)}
                className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <Upload className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 6. Worker Verification */}
        <AccordionItem
          value="verification"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.verification_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Worker Verification</p>
                <p className="text-xs text-muted-foreground">
                  Profile verify karo
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            <button
              type="button"
              data-ocid="advanced_settings.verify_profile.button"
              onClick={() => navigate({ to: "/worker-verification" })}
              className="w-full flex items-center gap-3 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl p-3 transition-colors text-left"
            >
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-teal-800">
                  Verify Profile
                </p>
                <p className="text-xs text-teal-700">Verified badge paao</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-teal-600 rotate-180" />
            </button>
            {[
              {
                label: "Upload Experience Proof",
                icon: "📋",
                ocid: "advanced_settings.experience_proof.upload_button",
              },
              {
                label: "Skill Verification",
                icon: "🛠️",
                ocid: "advanced_settings.skill_verify.button",
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                data-ocid={item.ocid}
                onClick={() => toast.info(`${item.label} — coming soon`)}
                className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-medium">{item.label}</p>
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 7. Community Settings */}
        <AccordionItem
          value="community"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.community_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Community Settings</p>
                <p className="text-xs text-muted-foreground">
                  Groups and community
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            {[
              {
                label: "Join State Groups",
                icon: "➕",
                ocid: "advanced_settings.join_group.button",
              },
              {
                label: "Leave Group",
                icon: "🚪",
                ocid: "advanced_settings.leave_group.button",
              },
              {
                label: "Community Rules",
                icon: "📜",
                ocid: "advanced_settings.community_rules.button",
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                data-ocid={item.ocid}
                onClick={() => toast.info(`${item.label} — opening...`)}
                className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-medium">{item.label}</p>
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 8. Complaint & Safety */}
        <AccordionItem
          value="safety"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.safety_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Complaint &amp; Safety</p>
                <p className="text-xs text-muted-foreground">Report issues</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            {[
              {
                label: "Submit Payment Complaint",
                icon: "⚠️",
                ocid: "advanced_settings.payment_complaint.button",
              },
              {
                label: "Report Fake Job",
                icon: "🚫",
                ocid: "advanced_settings.fake_job.button",
              },
              {
                label: "Report User",
                icon: "🔴",
                ocid: "advanced_settings.report_user.button",
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                data-ocid={item.ocid}
                onClick={() => toast.info(`${item.label} — coming soon`)}
                className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-3 transition-colors text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-medium text-red-800">{item.label}</p>
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 9. Data & Storage */}
        <AccordionItem
          value="storage"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.storage_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Data &amp; Storage</p>
                <p className="text-xs text-muted-foreground">Cache and data</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            <button
              type="button"
              data-ocid="advanced_settings.clear_cache.button"
              onClick={() => toast.success("Cache cleared ✓")}
              className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
            >
              <RefreshCw className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium">Clear App Cache</p>
                <p className="text-xs text-muted-foreground">
                  Storage free karo
                </p>
              </div>
            </button>
            <button
              type="button"
              data-ocid="advanced_settings.download_data.button"
              onClick={() => toast.info("Data download starting...")}
              className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
            >
              <Download className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium">Download My Data</p>
                <p className="text-xs text-muted-foreground">
                  Profile data export karo
                </p>
              </div>
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  data-ocid="advanced_settings.delete_account.button"
                  className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-3 transition-colors text-left"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Delete Account
                    </p>
                    <p className="text-xs text-red-600">
                      Permanent — wapas nahi hoga
                    </p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="advanced_settings.delete_account.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Account Delete Karein?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Aapka profile, documents, aur sab data permanently delete ho
                    jayega. Yeh action wapas nahi hoga.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="advanced_settings.delete_account.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="advanced_settings.delete_account.confirm_button"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => toast.error("Account deletion requested")}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </AccordionContent>
        </AccordionItem>

        {/* 10. App Information */}
        <AccordionItem
          value="app-info"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.app_info_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Info className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">App Information</p>
                <p className="text-xs text-muted-foreground">
                  Version and policies
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            <div className="bg-muted/40 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">App Version</p>
                <p className="text-xs text-muted-foreground">Current version</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                v3.7.0
              </Badge>
            </div>
            <button
              type="button"
              data-ocid="advanced_settings.update_app.button"
              onClick={() => toast.info("Checking for updates...")}
              className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Update App</p>
            </button>
            <button
              type="button"
              data-ocid="advanced_settings.privacy_policy.button"
              onClick={() => toast.info("Opening Privacy Policy...")}
              className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
            >
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Privacy Policy</p>
            </button>
            <button
              type="button"
              data-ocid="advanced_settings.terms.button"
              onClick={() => toast.info("Opening Terms & Conditions...")}
              className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
            >
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Terms &amp; Conditions</p>
            </button>
            <button
              type="button"
              data-ocid="advanced_settings.database_info.button"
              onClick={() => toast.info("Firebase Firestore — Secure Cloud")}
              className="w-full flex items-center gap-3 bg-muted/40 hover:bg-muted rounded-xl p-3 transition-colors text-left"
            >
              <Database className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Database Info</p>
            </button>
          </AccordionContent>
        </AccordionItem>

        {/* AI Moderation Settings */}
        <AccordionItem
          value="ai_moderation"
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <AccordionTrigger
            data-ocid="advanced_settings.ai_moderation_panel"
            className="px-4 py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">AI Moderation Settings</p>
                <p className="text-xs text-muted-foreground">
                  Content control & safety
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <AIModerationSettingsPanel />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer */}
      <div className="text-center mt-8 pb-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
