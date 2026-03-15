import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type FlaggedItem,
  type ModerationSettings,
  aiLearningEnabled,
  getDefaultSettings,
  learnFromFlagged,
  loadFlaggedItems,
  saveFlaggedItems,
  saveSettings,
  setAiLearningEnabled,
} from "@/lib/moderationEngine";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Ban,
  BarChart3,
  Bot,
  CheckCircle,
  CreditCard,
  Eye,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserX,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ── Helpers ────────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: FlaggedItem["riskLevel"] }) {
  const map = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };
  const label = { high: "⚠️ High", medium: "🔶 Medium", low: "✅ Low" };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[level]}`}
    >
      {label[level]}
    </span>
  );
}

function SectionBadge({ section }: { section: string }) {
  const colors: Record<string, string> = {
    "Operator Ekta": "bg-blue-100 text-blue-700",
    "Female Hub": "bg-pink-100 text-pink-700",
    "Payment Complaint": "bg-orange-100 text-orange-700",
    "Job Post": "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        colors[section] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {section}
    </span>
  );
}

function ActionBadge({ action }: { action: FlaggedItem["action"] }) {
  const map = {
    flag: "bg-yellow-100 text-yellow-700",
    delete: "bg-red-100 text-red-700",
    block: "bg-orange-100 text-orange-700",
  };
  const label = {
    flag: "🚩 Flagged",
    delete: "🗑️ Deleted",
    block: "🚫 Blocked",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[action]}`}
    >
      {label[action]}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "< 1 hour ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Flagged Content Tab ────────────────────────────────────────────────────

function FlaggedContentTab({
  items,
  onUpdate,
}: {
  items: FlaggedItem[];
  onUpdate: (items: FlaggedItem[]) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);

  const filtered = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (sectionFilter !== "all" && item.section !== sectionFilter) return false;
    return true;
  });

  const updateItem = (id: string, patch: Partial<FlaggedItem>) => {
    const updated = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    onUpdate(updated);
  };

  return (
    <div className="space-y-3">
      {/* Violation notification banner */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 text-xs">
          <strong>नोट:</strong> आपकी पोस्ट नीति उल्लंघन के कारण ब्लॉक की जा सकती है।
          Community Guidelines का पालन करें।
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s === "all"
              ? "सभी"
              : s === "pending"
                ? "Pending"
                : s === "resolved"
                  ? "Resolved"
                  : "Dismissed"}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[
          "all",
          "Operator Ekta",
          "Female Hub",
          "Payment Complaint",
          "Job Post",
        ].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSectionFilter(s)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              sectionFilter === s
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s === "all" ? "All Sections" : s}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div
          data-ocid="ai_mod.flagged.empty_state"
          className="text-center py-12 text-muted-foreground text-sm"
        >
          <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
          कोई flagged content नहीं
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card
                data-ocid={`ai_mod.flagged.item.${idx + 1}`}
                className={`border ${
                  item.riskLevel === "high"
                    ? "border-red-200 bg-red-50/30"
                    : item.riskLevel === "medium"
                      ? "border-yellow-200 bg-yellow-50/20"
                      : "border-border"
                }`}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <RiskBadge level={item.riskLevel} />
                      <SectionBadge section={item.section} />
                      <ActionBadge action={item.action} />
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(item.flaggedAt)}
                      </span>
                    </div>
                    {item.status === "pending" && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        Review
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {item.userName}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      {item.userMobile}
                    </span>
                  </p>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {item.content}
                  </p>

                  {item.violations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.violations.map((v) => (
                        <span
                          key={v}
                          className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      data-ocid={`ai_mod.allow.button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50 rounded-lg"
                      onClick={() => {
                        updateItem(item.id, { status: "dismissed" });
                        toast.success("Content allowed");
                      }}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Allow
                    </Button>
                    <Button
                      data-ocid={`ai_mod.delete_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50 rounded-lg"
                      onClick={() => {
                        updateItem(item.id, {
                          status: "resolved",
                          action: "delete",
                        });
                        toast.success("Content deleted");
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                    <Button
                      data-ocid={`ai_mod.block.button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-orange-700 border-orange-200 hover:bg-orange-50 rounded-lg"
                      onClick={() => {
                        updateItem(item.id, {
                          status: "resolved",
                          action: "block",
                        });
                        toast.success("User blocked");
                      }}
                    >
                      <Ban className="w-3 h-3 mr-1" /> Block User
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs rounded-lg"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      {selectedItem && (
        <div
          data-ocid="ai_mod.flagged.dialog"
          className="fixed inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setSelectedItem(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedItem(null)}
        >
          <div
            className="w-full max-w-[520px] mx-auto bg-background rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">संदिग्ध सामग्री विवरण</h3>
              <button
                type="button"
                data-ocid="ai_mod.flagged.close_button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                <RiskBadge level={selectedItem.riskLevel} />
                <SectionBadge section={selectedItem.section} />
                <ActionBadge action={selectedItem.action} />
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <strong>User:</strong> {selectedItem.userName} (
                  {selectedItem.userMobile})
                </p>
                <p>
                  <strong>Type:</strong> {selectedItem.type}
                </p>
                <p>
                  <strong>Section:</strong> {selectedItem.section}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(selectedItem.flaggedAt).toLocaleString("en-IN")}
                </p>
                <p>
                  <strong>Violations:</strong> {selectedItem.violationCount}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs font-semibold mb-1">Content:</p>
                <p className="text-xs text-muted-foreground">
                  {selectedItem.content}
                </p>
              </div>
              {selectedItem.violations.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2"
                >
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ───────────────────────────────────────────────────────────

function SettingsTab({
  settings,
  onSave,
}: {
  settings: ModerationSettings;
  onSave: (s: ModerationSettings) => void;
}) {
  const [draft, setDraft] = useState<ModerationSettings>({ ...settings });
  const [learningMode, setLearningMode] = useState(() => aiLearningEnabled);

  const sensitivityOptions: Array<{
    value: ModerationSettings["sensitivityLevel"];
    label: string;
    desc: string;
    color: string;
  }> = [
    {
      value: "low",
      label: "Low",
      desc: "केवल बहुत खतरनाक content block होगा (score > 80)",
      color: "border-green-300 bg-green-50",
    },
    {
      value: "medium",
      label: "Medium",
      desc: "मध्यम और उच्च risk content flag/delete होगा",
      color: "border-yellow-300 bg-yellow-50",
    },
    {
      value: "high",
      label: "High",
      desc: "कम risk content भी flag होगा — strict moderation",
      color: "border-red-300 bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sensitivity */}
      <div>
        <Label className="text-sm font-bold mb-3 block">
          Sensitivity Level
        </Label>
        <div className="space-y-2">
          {sensitivityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-ocid="ai_mod.sensitivity.radio"
              onClick={() =>
                setDraft((d) => ({ ...d, sensitivityLevel: opt.value }))
              }
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                draft.sensitivityLevel === opt.value
                  ? `${opt.color} border-current`
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    draft.sensitivityLevel === opt.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {draft.sensitivityLevel === opt.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Block threshold */}
      <div>
        <Label className="text-sm font-bold mb-1 block">
          Block Threshold:{" "}
          <span className="text-primary">
            {draft.blockThreshold} violations
          </span>
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          {draft.blockThreshold} violations के बाद user automatically block होगा
        </p>
        <Slider
          data-ocid="ai_mod.block_threshold.input"
          min={1}
          max={10}
          step={1}
          value={[draft.blockThreshold]}
          onValueChange={([v]) =>
            setDraft((d) => ({ ...d, blockThreshold: v }))
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1 (Strict)</span>
          <span>10 (Lenient)</span>
        </div>
      </div>

      {/* Auto-delete */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
        <div>
          <p className="text-sm font-semibold">Auto-Delete Immediately</p>
          <p className="text-xs text-muted-foreground">
            {draft.autoDelete === "immediate"
              ? "High-risk content तुरंत delete होगा"
              : "Admin review के बाद delete होगा"}
          </p>
        </div>
        <Switch
          data-ocid="ai_mod.auto_delete.toggle"
          checked={draft.autoDelete === "immediate"}
          onCheckedChange={(v) =>
            setDraft((d) => ({
              ...d,
              autoDelete: v ? "immediate" : "after_review",
            }))
          }
        />
      </div>

      {/* AI Learning Mode */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
        <div>
          <p className="text-sm font-semibold">AI Learning Mode</p>
          <p className="text-xs text-muted-foreground">
            AI flagged content से सीखकर detection improve करेगा
          </p>
        </div>
        <Switch
          data-ocid="ai_mod.learning_mode.toggle"
          checked={learningMode}
          onCheckedChange={(v) => {
            setLearningMode(v);
            setAiLearningEnabled(v);
          }}
        />
      </div>

      <Button
        data-ocid="ai_mod.save_settings.button"
        className="w-full rounded-xl h-11"
        onClick={() => {
          onSave(draft);
          toast.success("Settings saved!");
        }}
      >
        <Shield className="w-4 h-4 mr-2" />
        Settings Save करें
      </Button>

      {/* Run Full Scan */}
      <RunAIScanButton />
    </div>
  );
}

// ── Blacklist Manager Tab ──────────────────────────────────────────────────

function BlacklistTab({
  settings,
  onSave,
}: {
  settings: ModerationSettings;
  onSave: (s: ModerationSettings) => void;
}) {
  const [draft, setDraft] = useState<ModerationSettings>({ ...settings });
  const [newWord, setNewWord] = useState("");
  const [newUser, setNewUser] = useState("");

  const addWord = () => {
    const w = newWord.trim().toLowerCase();
    if (!w || draft.bannedWords.includes(w)) return;
    const updated = { ...draft, bannedWords: [...draft.bannedWords, w] };
    setDraft(updated);
    onSave(updated);
    setNewWord("");
    toast.success(`"${w}" blacklist mein add kiya`);
  };

  const removeWord = (word: string) => {
    const updated = {
      ...draft,
      bannedWords: draft.bannedWords.filter((w) => w !== word),
    };
    setDraft(updated);
    onSave(updated);
  };

  const addUser = () => {
    const u = newUser.trim();
    if (!u || draft.blacklistedUserIds.includes(u)) return;
    const updated = {
      ...draft,
      blacklistedUserIds: [...draft.blacklistedUserIds, u],
    };
    setDraft(updated);
    onSave(updated);
    setNewUser("");
    toast.success(`User ID "${u}" blacklist mein add kiya`);
  };

  const removeUser = (uid: string) => {
    const updated = {
      ...draft,
      blacklistedUserIds: draft.blacklistedUserIds.filter((u) => u !== uid),
    };
    setDraft(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-6">
      {/* Banned Words */}
      <div>
        <h3 className="font-bold text-sm mb-2">
          🚫 Banned Words ({draft.bannedWords.length})
        </h3>
        <div className="flex gap-2 mb-3">
          <Input
            data-ocid="ai_mod.banned_word.input"
            placeholder="New banned word..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWord()}
            className="rounded-xl text-sm"
          />
          <Button
            data-ocid="ai_mod.add_banned_word.button"
            size="sm"
            onClick={addWord}
            className="rounded-xl flex-shrink-0"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {draft.bannedWords.map((w) => (
            <span
              key={w}
              className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-lg"
            >
              {w}
              <button
                type="button"
                onClick={() => removeWord(w)}
                className="hover:text-red-900 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Blacklisted Users */}
      <div>
        <h3 className="font-bold text-sm mb-2">
          🚫 अवरुद्ध उपयोगकर्ता ({draft.blacklistedUserIds.length})
        </h3>
        <div className="flex gap-2 mb-3">
          <Input
            data-ocid="ai_mod.blacklist_user.input"
            placeholder="User mobile or ID..."
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUser()}
            className="rounded-xl text-sm"
          />
          <Button
            size="sm"
            onClick={addUser}
            className="rounded-xl flex-shrink-0"
          >
            Block
          </Button>
        </div>
        {draft.blacklistedUserIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            कोई blacklisted user नहीं
          </p>
        ) : (
          <div className="space-y-2">
            {draft.blacklistedUserIds.map((uid) => (
              <div
                key={uid}
                className="flex items-center justify-between bg-muted rounded-xl px-3 py-2"
              >
                <span className="text-xs font-mono">{uid}</span>
                <button
                  type="button"
                  onClick={() => removeUser(uid)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Moderation Log Tab ─────────────────────────────────────────────────────

const LOG_ENTRIES = [
  {
    time: "10:32 AM",
    user: "Ramesh Yadav",
    type: "Post",
    action: "Auto-Flagged",
    section: "Operator Ekta",
  },
  {
    time: "09:15 AM",
    user: "Unknown User",
    type: "Comment",
    action: "Auto-Deleted",
    section: "Female Hub",
  },
  {
    time: "08:44 AM",
    user: "Suresh Kumar",
    type: "Profile",
    action: "User Blocked",
    section: "Job Post",
  },
  {
    time: "07:20 AM",
    user: "Priya Devi",
    type: "Complaint",
    action: "Flagged for Review",
    section: "Payment Complaint",
  },
  {
    time: "Yesterday",
    user: "Operator XYZ",
    type: "Post",
    action: "Admin Dismissed",
    section: "Operator Ekta",
  },
  {
    time: "Yesterday",
    user: "ABC Company",
    type: "Job",
    action: "Admin Approved",
    section: "Job Post",
  },
  {
    time: "2 days ago",
    user: "Mohan Singh",
    type: "Comment",
    action: "Dismissed",
    section: "Operator Ekta",
  },
  {
    time: "2 days ago",
    user: "Fake Electrician",
    type: "Profile",
    action: "Deleted",
    section: "Job Post",
  },
];

function ModerationLogTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        सभी moderation actions का timeline
      </p>
      {LOG_ENTRIES.map((entry) => (
        <div
          key={entry.user + entry.time}
          className="flex gap-3 items-start p-3 bg-muted/40 rounded-xl"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold truncate">{entry.user}</p>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {entry.time}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {entry.type} in {entry.section}
            </p>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${
                entry.action.includes("Block") ||
                entry.action.includes("Delete")
                  ? "bg-red-100 text-red-700"
                  : entry.action.includes("Flag")
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {entry.action}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Run AI Scan Button ────────────────────────────────────────────────────

function RunAIScanButton() {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const runScan = () => {
    setScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
      toast.success("AI Scan complete! 42 items checked, 3 flagged.");
      learnFromFlagged("sample scan completed", false);
    }, 2800);
  };

  return (
    <Button
      data-ocid="ai_mod.run_scan.button"
      variant="outline"
      className="w-full rounded-xl h-11 border-primary text-primary hover:bg-primary/5"
      onClick={runScan}
      disabled={scanning}
    >
      {scanning ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Scanning content...
        </>
      ) : scanComplete ? (
        <>
          <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
          Scan Complete ✓
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Run Full AI Scan Now
        </>
      )}
    </Button>
  );
}

// ── AI Automation Tab ─────────────────────────────────────────────────────

interface ModuleCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  stats: { label: string; value: string | number }[];
  color: string;
}

const MODULE_DEFAULTS: ModuleCard[] = [
  {
    id: "content_mod",
    icon: <Shield className="w-5 h-5 text-green-600" />,
    title: "Content Moderation",
    desc: "Posts, comments aur images automatically scan karta hai",
    stats: [
      { label: "Scans today", value: 347 },
      { label: "Last scan", value: "2 min ago" },
    ],
    color: "border-green-200 bg-green-50/40",
  },
  {
    id: "profile_verify",
    icon: <UserX className="w-5 h-5 text-blue-600" />,
    title: "Profile Verification",
    desc: "Fake profiles aur duplicate accounts detect karta hai",
    stats: [
      { label: "Fake detected", value: 12 },
      { label: "Docs verified", value: 89 },
    ],
    color: "border-blue-200 bg-blue-50/40",
  },
  {
    id: "payment_mon",
    icon: <CreditCard className="w-5 h-5 text-orange-600" />,
    title: "Payment Monitoring",
    desc: "Suspicious transactions aur fraud attempts flag karta hai",
    stats: [
      { label: "Suspicious txns", value: 4 },
      { label: "Alerts sent", value: 11 },
    ],
    color: "border-orange-200 bg-orange-50/40",
  },
  {
    id: "spam_protect",
    icon: <Bot className="w-5 h-5 text-purple-600" />,
    title: "Spam & Phishing Protection",
    desc: "Spam messages aur phishing links automatically block karta hai",
    stats: [
      { label: "Spam blocked", value: 67 },
      { label: "Phishing caught", value: 8 },
    ],
    color: "border-purple-200 bg-purple-50/40",
  },
];

function AIAutomationTab() {
  const [modules, setModules] = useState<Record<string, boolean>>(() => {
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
  });
  const [learningMode, setLearningMode] = useState(() => aiLearningEnabled);

  const toggleModule = (id: string) => {
    const updated = { ...modules, [id]: !modules[id] };
    setModules(updated);
    localStorage.setItem("kaam_mitra_ai_modules", JSON.stringify(updated));
    toast.success(
      `${id.replace("_", " ")} ${updated[id] ? "activated" : "deactivated"}`,
    );
  };

  return (
    <div className="space-y-3">
      {MODULE_DEFAULTS.map((mod) => (
        <div
          key={mod.id}
          className={`rounded-2xl border p-4 ${mod.color} transition-opacity ${modules[mod.id] ? "opacity-100" : "opacity-60"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                {mod.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{mod.title}</p>
                  {modules[mod.id] ? (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {mod.desc}
                </p>
                <div className="flex gap-3 mt-2">
                  {mod.stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-xs font-bold text-foreground">
                        {s.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Switch
              checked={!!modules[mod.id]}
              onCheckedChange={() => toggleModule(mod.id)}
            />
          </div>
        </div>
      ))}

      {/* AI Learning Mode */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">AI Learning Mode</p>
                {learningMode && (
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI flagged content से सीखकर detection continuously improve करता है
              </p>
            </div>
          </div>
          <Switch
            data-ocid="ai_mod.learning_mode_tab.toggle"
            checked={learningMode}
            onCheckedChange={(v) => {
              setLearningMode(v);
              setAiLearningEnabled(v);
              toast.success(`AI Learning ${v ? "enabled" : "disabled"}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Analytics & Reports Tab ───────────────────────────────────────────────

const VIOLATION_TYPES = [
  { label: "Abusive Language", count: 34, total: 100, color: "bg-red-500" },
  { label: "Spam", count: 67, total: 100, color: "bg-orange-500" },
  { label: "Fake Profile", count: 18, total: 100, color: "bg-yellow-500" },
  {
    label: "Inappropriate Media",
    count: 8,
    total: 100,
    color: "bg-purple-500",
  },
  { label: "Payment Fraud", count: 12, total: 100, color: "bg-blue-500" },
];

const REPEAT_OFFENDERS = [
  {
    name: "Unknown User",
    mobile: "9876XXXXXX",
    violations: 7,
    status: "blocked",
  },
  {
    name: "Suresh Kumar",
    mobile: "8765XXXXXX",
    violations: 4,
    status: "warned",
  },
  {
    name: "Fake Electrician",
    mobile: "3210XXXXXX",
    violations: 3,
    status: "blocked",
  },
  {
    name: "Ramesh Yadav",
    mobile: "9812XXXXXX",
    violations: 2,
    status: "warned",
  },
];

const RECENT_ACTIVITY = [
  {
    time: "10:32 AM",
    type: "Post",
    result: "Flagged",
    section: "Operator Ekta",
    color: "text-yellow-600",
  },
  {
    time: "10:18 AM",
    type: "Profile",
    result: "Verified OK",
    section: "Job Post",
    color: "text-green-600",
  },
  {
    time: "09:55 AM",
    type: "Payment",
    result: "Flagged",
    section: "Payment System",
    color: "text-orange-600",
  },
  {
    time: "09:41 AM",
    type: "Comment",
    result: "Deleted",
    section: "Female Hub",
    color: "text-red-600",
  },
  {
    time: "09:20 AM",
    type: "Spam",
    result: "Blocked",
    section: "Community",
    color: "text-red-600",
  },
  {
    time: "08:55 AM",
    type: "Profile",
    result: "Blocked",
    section: "Job Post",
    color: "text-red-600",
  },
  {
    time: "08:33 AM",
    type: "Post",
    result: "Allowed",
    section: "Operator Ekta",
    color: "text-green-600",
  },
  {
    time: "08:14 AM",
    type: "Payment",
    result: "Normal",
    section: "Payment System",
    color: "text-green-600",
  },
];

function AnalyticsTab() {
  const [safety, setSafety] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setSafety(84), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-blue-700">2,431</p>
          <p className="text-[11px] text-blue-600 font-semibold">
            Total Scans (Week)
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-orange-700">139</p>
          <p className="text-[11px] text-orange-600 font-semibold">
            Auto-Actions Taken
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-yellow-700">23</p>
          <p className="text-[11px] text-yellow-600 font-semibold">
            Admin Reviews Needed
          </p>
        </div>
        <div className="relative bg-green-50 border border-green-200 rounded-2xl p-3 text-center overflow-hidden">
          <p className="text-xl font-black text-green-700">{safety}%</p>
          <p className="text-[11px] text-green-600 font-semibold">
            Community Safety Score
          </p>
          <div
            className="absolute bottom-0 left-0 h-1 bg-green-400 transition-all duration-1000 ease-out rounded-b-2xl"
            style={{ width: `${safety}%` }}
          />
        </div>
      </div>

      {/* Violations by type */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold">Violations by Type</p>
        </div>
        <div className="space-y-3">
          {VIOLATION_TYPES.map((v) => (
            <div key={v.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-foreground">{v.label}</span>
                <span className="text-xs font-bold text-foreground">
                  {v.count}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${v.color} transition-all duration-700`}
                  style={{ width: `${v.count}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Repeat offenders */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold">Top Repeat Offenders</p>
        </div>
        <div className="space-y-2">
          {REPEAT_OFFENDERS.map((u, i) => (
            <div
              key={u.name}
              className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">
                  {i + 1}.
                </span>
                <div>
                  <p className="text-xs font-semibold">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {u.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-600">
                  {u.violations} violations
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "blocked" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold">Recent AI Activity</p>
        </div>
        <div className="space-y-2">
          {RECENT_ACTIVITY.map((a) => (
            <div
              key={`${a.time}-${a.type}`}
              className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground flex-shrink-0 w-16">
                {a.time}
              </p>
              <p className="text-xs flex-1 truncate">
                {a.type} — {a.section}
              </p>
              <span
                className={`text-[10px] font-bold ${a.color} flex-shrink-0`}
              >
                {a.result}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function AIModerationDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FlaggedItem[]>(() => loadFlaggedItems());
  const [settings, setSettings] = useState<ModerationSettings>(() =>
    getDefaultSettings(),
  );

  const handleUpdateItems = (updated: FlaggedItem[]) => {
    setItems(updated);
    saveFlaggedItems(updated);
  };

  const handleSaveSettings = (s: ModerationSettings) => {
    setSettings(s);
    saveSettings(s);
  };

  const pending = items.filter((i) => i.status === "pending").length;
  const highRisk = items.filter((i) => i.riskLevel === "high").length;
  const autoDeleted = items.filter(
    (i) => i.action === "delete" && i.status === "resolved",
  ).length;
  const blocked = items.filter((i) => i.action === "block").length;

  return (
    <div data-ocid="ai_mod.page" className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            data-ocid="ai_mod.back_button"
            onClick={() => navigate({ to: "/admin" })}
            className="p-1 rounded-lg hover:bg-primary-foreground/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ShieldAlert className="w-5 h-5" />
          <div>
            <h1 className="font-bold text-base leading-tight">AI Moderation</h1>
            <p className="text-[10px] opacity-80">
              KaamMitra Content Control System
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            data-ocid="ai_mod.flagged.card"
            className="border-red-200 bg-red-50/40"
          >
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-black text-red-600">{highRisk}</p>
              <p className="text-[11px] font-semibold text-red-700">
                ⚠️ High Risk Today
              </p>
            </CardContent>
          </Card>
          <Card
            data-ocid="ai_mod.deleted.card"
            className="border-orange-200 bg-orange-50/40"
          >
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-black text-orange-600">
                {autoDeleted}
              </p>
              <p className="text-[11px] font-semibold text-orange-700">
                🗑️ Auto-Deleted
              </p>
            </CardContent>
          </Card>
          <Card
            data-ocid="ai_mod.pending.card"
            className="border-yellow-200 bg-yellow-50/40"
          >
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-black text-yellow-600">{pending}</p>
              <p className="text-[11px] font-semibold text-yellow-700">
                🔶 Pending Review
              </p>
            </CardContent>
          </Card>
          <Card
            data-ocid="ai_mod.blocked.card"
            className="border-purple-200 bg-purple-50/40"
          >
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-black text-purple-600">{blocked}</p>
              <p className="text-[11px] font-semibold text-purple-700">
                🚫 अवरुद्ध उपयोगकर्ता
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current sensitivity badge */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">
            Sensitivity:{" "}
            <strong className="text-foreground capitalize">
              {settings.sensitivityLevel}
            </strong>
            {" · "}
            Block after{" "}
            <strong className="text-foreground">
              {settings.blockThreshold}
            </strong>{" "}
            violations
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="flagged">
          <TabsList className="w-full rounded-xl grid grid-cols-3 mb-1">
            <TabsTrigger
              data-ocid="ai_mod.tab"
              value="flagged"
              className="rounded-lg text-[10px]"
            >
              संदिग्ध
            </TabsTrigger>
            <TabsTrigger
              data-ocid="ai_mod.tab"
              value="settings"
              className="rounded-lg text-[10px]"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger
              data-ocid="ai_mod.tab"
              value="blacklist"
              className="rounded-lg text-[10px]"
            >
              Blacklist
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full rounded-xl grid grid-cols-3">
            <TabsTrigger
              data-ocid="ai_mod.tab"
              value="log"
              className="rounded-lg text-[10px]"
            >
              Log
            </TabsTrigger>
            <TabsTrigger
              data-ocid="ai_mod.tab"
              value="automation"
              className="rounded-lg text-[10px]"
            >
              🤖 AI Auto
            </TabsTrigger>
            <TabsTrigger
              data-ocid="ai_mod.tab"
              value="analytics"
              className="rounded-lg text-[10px]"
            >
              📊 Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged" className="mt-4">
            <FlaggedContentTab items={items} onUpdate={handleUpdateItems} />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <SettingsTab settings={settings} onSave={handleSaveSettings} />
          </TabsContent>
          <TabsContent value="blacklist" className="mt-4">
            <BlacklistTab settings={settings} onSave={handleSaveSettings} />
          </TabsContent>
          <TabsContent value="log" className="mt-4">
            <ModerationLogTab />
          </TabsContent>
          <TabsContent value="automation" className="mt-4">
            <AIAutomationTab />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 px-4">
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
