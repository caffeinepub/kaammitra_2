import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  Lock,
  LogOut,
  Shield,
  Tag,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import {
  OWNER_CONFIG,
  clearOwnerSession,
  isOwnerSessionActive,
} from "../utils/ownerAuth";

// ─────────────── Mock Data ───────────────
const MOCK_WORKERS = [
  {
    id: "w1",
    name: "Ramesh Kumar",
    category: "JCB Operator",
    city: "Delhi",
    status: "pending",
    verified: false,
  },
  {
    id: "w2",
    name: "Suresh Yadav",
    category: "Electrician",
    city: "Lucknow",
    status: "approved",
    verified: true,
  },
  {
    id: "w3",
    name: "Priya Sharma",
    category: "Office Assistant",
    city: "Mumbai",
    status: "approved",
    verified: true,
  },
  {
    id: "w4",
    name: "Mohan Das",
    category: "Driver",
    city: "Jaipur",
    status: "pending",
    verified: false,
  },
  {
    id: "w5",
    name: "Geeta Devi",
    category: "Nurse",
    city: "Patna",
    status: "blocked",
    verified: false,
  },
];

const MOCK_JOBS = [
  {
    id: "j1",
    title: "JCB Operator Needed",
    company: "Sharma Constructions",
    location: "Delhi",
    status: "pending",
    wage: "₹1,200/day",
  },
  {
    id: "j2",
    title: "Driver Required",
    company: "Metro Logistics",
    location: "Noida",
    status: "approved",
    wage: "₹15,000/mo",
  },
  {
    id: "j3",
    title: "Female Office Staff",
    company: "TechStart Pvt Ltd",
    location: "Bengaluru",
    status: "pending",
    wage: "₹18,000/mo",
  },
  {
    id: "j4",
    title: "Mason Worker",
    company: "BuildRight Co.",
    location: "Lucknow",
    status: "approved",
    wage: "₹900/day",
  },
];

const MOCK_PAYMENTS = [
  {
    id: "p1",
    worker: "Ramesh Kumar",
    amount: "₹1,200",
    status: "Paid",
    date: "15 Mar 2026",
  },
  {
    id: "p2",
    worker: "Suresh Yadav",
    amount: "₹3,600",
    status: "Pending",
    date: "14 Mar 2026",
  },
  {
    id: "p3",
    worker: "Priya Sharma",
    amount: "₹18,000",
    status: "Paid",
    date: "13 Mar 2026",
  },
  {
    id: "p4",
    worker: "Mohan Das",
    amount: "₹1,500",
    status: "Failed",
    date: "12 Mar 2026",
  },
  {
    id: "p5",
    worker: "Raj Transport",
    amount: "₹5,000",
    status: "Paid",
    date: "11 Mar 2026",
  },
];

const MOCK_CATEGORIES = [
  { id: "c1", name: "Construction Workers", roles: 12, active: true },
  { id: "c2", name: "Office Staff", roles: 8, active: true },
  { id: "c3", name: "Driver / Transport", roles: 10, active: true },
  { id: "c4", name: "Mechanical / Factory", roles: 9, active: true },
  { id: "c5", name: "Healthcare", roles: 7, active: true },
  { id: "c6", name: "Retail / Sales", roles: 6, active: false },
  { id: "c7", name: "Agriculture", roles: 5, active: true },
];

// ─────────────── Stat Card ───────────────
function StatCard({
  icon,
  label,
  value,
  color,
}: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}30`,
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ color, display: "flex", alignItems: "center", gap: "8px" }}>
        {icon}
        <span
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          color: "white",
          fontSize: "22px",
          fontWeight: 800,
          fontFamily: "'Poppins', sans-serif",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─────────────── Status Badge ───────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    approved: { color: "#4ADE80", bg: "rgba(74,222,128,0.15)" },
    pending: { color: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
    blocked: { color: "#F87171", bg: "rgba(248,113,113,0.15)" },
    Paid: { color: "#4ADE80", bg: "rgba(74,222,128,0.15)" },
    Pending: { color: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
    Failed: { color: "#F87171", bg: "rgba(248,113,113,0.15)" },
  };
  const c = config[status] ?? {
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.15)",
  };
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        color: c.color,
        background: c.bg,
        borderRadius: "20px",
        padding: "2px 8px",
      }}
    >
      {status}
    </span>
  );
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState(MOCK_WORKERS);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");

  // Real backend stats
  const [backendStats, setBackendStats] = useState<{
    totalWorkers: number;
    totalJobs: number;
    totalCategories: number;
    totalNotifications: number;
    pendingApprovals: number;
    totalContacts: number;
  } | null>(null);

  useEffect(() => {
    if (!isOwnerSessionActive()) {
      navigate({ to: "/" });
      return;
    }
    // Fetch real stats from backend
    createActorWithConfig()
      .then((actor: any) => {
        actor
          .getOwnerStats()
          .then((stats: any) => {
            setBackendStats({
              totalWorkers: Number(stats.totalWorkers),
              totalJobs: Number(stats.totalJobs),
              totalCategories: Number(stats.totalCategories),
              totalNotifications: Number(stats.totalNotifications),
              pendingApprovals: Number(stats.pendingApprovals),
              totalContacts: Number(stats.totalContacts),
            });
          })
          .catch(() => {
            /* use mock data if backend fails */
          });
      })
      .catch(() => {});
  }, [navigate]);

  function handleLogout() {
    clearOwnerSession();
    toast.success("Owner session closed.");
    navigate({ to: "/" });
  }

  function approveWorker(id: string) {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: "approved", verified: true } : w,
      ),
    );
    toast.success("Worker approved ✅");
  }

  function blockWorker(id: string) {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "blocked" } : w)),
    );
    toast.error("Worker blocked 🚫");
  }

  function approveJob(id: string) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "approved" } : j)),
    );
    toast.success("Job post approved ✅");
  }

  function deleteJob(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    toast.error("Job post deleted 🗑️");
  }

  function toggleCategory(id: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  }

  function sendNotification() {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error("Title aur message required hain");
      return;
    }
    toast.success(`📢 Notification sent to all users: "${notifTitle}"`);
    setNotifTitle("");
    setNotifMessage("");
  }

  const pendingWorkers = workers.filter((w) => w.status === "pending");
  const pendingJobs = jobs.filter((j) => j.status === "pending");

  return (
    <div
      data-ocid="super_admin.page"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #000000 0%, #0D0500 50%, #1A0800 100%)",
        fontFamily: "'Poppins', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ─── Header ─── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,111,0,0.2)",
          padding: "12px 16px",
        }}
      >
        <div
          className="w-full"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              data-ocid="super_admin.back_button"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1
                style={{
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                🛡️ Super Admin Panel
              </h1>
              <p
                style={{
                  color: "rgba(255,111,0,0.8)",
                  fontSize: "10px",
                  margin: 0,
                }}
              >
                Owner: +91-{OWNER_CONFIG.mobile.slice(0, 5)}XXXXX
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            data-ocid="super_admin.logout_button"
            size="sm"
            style={{
              background: "rgba(220,38,38,0.2)",
              border: "1px solid rgba(220,38,38,0.4)",
              color: "#FCA5A5",
              borderRadius: "10px",
              fontSize: "12px",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <LogOut size={14} style={{ marginRight: "4px" }} /> Logout
          </Button>
        </div>
      </header>

      <div className="w-full" style={{ padding: "16px 16px 100px 16px" }}>
        {/* ─── Stats Grid ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}
          data-ocid="super_admin.stats.section"
        >
          <StatCard
            icon={<Users size={16} />}
            label="Total Workers"
            value={backendStats ? String(backendStats.totalWorkers) : "—"}
            color="#60A5FA"
          />
          <StatCard
            icon={<Briefcase size={16} />}
            label="Total Job Posts"
            value={backendStats ? String(backendStats.totalJobs) : "—"}
            color="#34D399"
          />
          <StatCard
            icon={<Wallet size={16} />}
            label="Active Payments"
            value={
              backendStats ? `${backendStats.totalContacts} contacts` : "—"
            }
            color="#FBBF24"
          />
          <StatCard
            icon={<AlertTriangle size={16} />}
            label="Pending Approvals"
            value={
              backendStats
                ? String(backendStats.pendingApprovals + pendingWorkers.length)
                : String(pendingWorkers.length + pendingJobs.length)
            }
            color="#F87171"
          />
        </div>

        {/* ─── Main Tabs ─── */}
        <Tabs defaultValue="workers" data-ocid="super_admin.tabs">
          <TabsList
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "12px",
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              height: "auto",
              padding: "4px",
              marginBottom: "16px",
            }}
          >
            {[
              { value: "workers", label: "👷" },
              { value: "jobs", label: "💼" },
              { value: "payments", label: "💰" },
              { value: "categories", label: "🏷️" },
              { value: "approvals", label: "✅" },
              { value: "notify", label: "📢" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid={`super_admin.${tab.value}.tab`}
                style={{
                  borderRadius: "8px",
                  padding: "8px 4px",
                  fontSize: "16px",
                }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── Workers Tab ─── */}
          <TabsContent value="workers">
            <SectionTitle
              icon={<Users size={15} />}
              title="Workers Management"
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              data-ocid="super_admin.workers.list"
            >
              {workers.map((w, i) => (
                <div
                  key={w.id}
                  data-ocid={`super_admin.workers.item.${i + 1}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {w.name}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "11px",
                          margin: "2px 0",
                        }}
                      >
                        {w.category} • {w.city}
                      </p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  {w.status === "pending" && (
                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "10px" }}
                    >
                      <Button
                        size="sm"
                        onClick={() => approveWorker(w.id)}
                        data-ocid={`super_admin.workers.approve_button.${i + 1}`}
                        style={{
                          background: "rgba(74,222,128,0.2)",
                          border: "1px solid rgba(74,222,128,0.4)",
                          color: "#4ADE80",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      >
                        <CheckCircle size={12} style={{ marginRight: "4px" }} />{" "}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => blockWorker(w.id)}
                        data-ocid={`super_admin.workers.delete_button.${i + 1}`}
                        style={{
                          background: "rgba(248,113,113,0.2)",
                          border: "1px solid rgba(248,113,113,0.4)",
                          color: "#F87171",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      >
                        <AlertTriangle
                          size={12}
                          style={{ marginRight: "4px" }}
                        />{" "}
                        Block
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Jobs Tab ─── */}
          <TabsContent value="jobs">
            <SectionTitle
              icon={<Briefcase size={15} />}
              title="Job Posts Management"
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              data-ocid="super_admin.jobs.list"
            >
              {jobs.map((j, i) => (
                <div
                  key={j.id}
                  data-ocid={`super_admin.jobs.item.${i + 1}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {j.title}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "11px",
                          margin: "2px 0",
                        }}
                      >
                        {j.company} • {j.location} • {j.wage}
                      </p>
                    </div>
                    <StatusBadge status={j.status} />
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "10px" }}
                  >
                    {j.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => approveJob(j.id)}
                        data-ocid={`super_admin.jobs.approve_button.${i + 1}`}
                        style={{
                          background: "rgba(74,222,128,0.2)",
                          border: "1px solid rgba(74,222,128,0.4)",
                          color: "#4ADE80",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      >
                        <CheckCircle size={12} style={{ marginRight: "4px" }} />{" "}
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => deleteJob(j.id)}
                      data-ocid={`super_admin.jobs.delete_button.${i + 1}`}
                      style={{
                        background: "rgba(248,113,113,0.2)",
                        border: "1px solid rgba(248,113,113,0.4)",
                        color: "#F87171",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    >
                      <Trash2 size={12} style={{ marginRight: "4px" }} /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Payments Tab ─── */}
          <TabsContent value="payments">
            <SectionTitle icon={<Wallet size={15} />} title="Payments Status" />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              data-ocid="super_admin.payments.list"
            >
              {MOCK_PAYMENTS.map((p, i) => (
                <div
                  key={p.id}
                  data-ocid={`super_admin.payments.item.${i + 1}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {p.worker}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "10px",
                        margin: "2px 0",
                      }}
                    >
                      {p.date}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        color: "#FBBF24",
                        fontSize: "14px",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {p.amount}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Categories Tab ─── */}
          <TabsContent value="categories">
            <SectionTitle icon={<Tag size={15} />} title="Job Categories" />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              data-ocid="super_admin.categories.list"
            >
              {categories.map((c, i) => (
                <div
                  key={c.id}
                  data-ocid={`super_admin.categories.item.${i + 1}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {c.name}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "10px",
                        margin: "2px 0",
                      }}
                    >
                      {c.roles} roles
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    data-ocid={`super_admin.categories.toggle.${i + 1}`}
                    style={{
                      background: c.active
                        ? "rgba(74,222,128,0.2)"
                        : "rgba(248,113,113,0.15)",
                      border: `1px solid ${c.active ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.3)"}`,
                      borderRadius: "20px",
                      padding: "4px 12px",
                      color: c.active ? "#4ADE80" : "#F87171",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Approvals Tab ─── */}
          <TabsContent value="approvals">
            <SectionTitle
              icon={<CheckCircle size={15} />}
              title="Pending Approvals"
            />
            {pendingWorkers.length === 0 && pendingJobs.length === 0 ? (
              <div
                data-ocid="super_admin.approvals.empty_state"
                style={{ textAlign: "center", padding: "40px 20px" }}
              >
                <p style={{ fontSize: "32px", marginBottom: "8px" }}>✅</p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Koi pending approval nahi hai!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
                data-ocid="super_admin.approvals.list"
              >
                {pendingWorkers.map((w, i) => (
                  <div
                    key={w.id}
                    data-ocid={`super_admin.approvals.item.${i + 1}`}
                    style={{
                      background: "rgba(251,191,36,0.06)",
                      border: "1px solid rgba(251,191,36,0.2)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "white",
                            fontSize: "13px",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          👷 {w.name}
                        </p>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "11px",
                            margin: "2px 0",
                          }}
                        >
                          {w.category} Worker Approval
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Button
                          size="sm"
                          onClick={() => approveWorker(w.id)}
                          style={{
                            background: "rgba(74,222,128,0.2)",
                            border: "1px solid rgba(74,222,128,0.4)",
                            color: "#4ADE80",
                            borderRadius: "8px",
                            fontSize: "10px",
                            padding: "4px 10px",
                          }}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => blockWorker(w.id)}
                          style={{
                            background: "rgba(248,113,113,0.2)",
                            border: "1px solid rgba(248,113,113,0.4)",
                            color: "#F87171",
                            borderRadius: "8px",
                            fontSize: "10px",
                            padding: "4px 10px",
                          }}
                        >
                          ✗ Block
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingJobs.map((j, i) => (
                  <div
                    key={j.id}
                    data-ocid={`super_admin.approvals.item.${pendingWorkers.length + i + 1}`}
                    style={{
                      background: "rgba(96,165,250,0.06)",
                      border: "1px solid rgba(96,165,250,0.2)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "white",
                            fontSize: "13px",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          💼 {j.title}
                        </p>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "11px",
                            margin: "2px 0",
                          }}
                        >
                          {j.company} Job Approval
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => approveJob(j.id)}
                        style={{
                          background: "rgba(74,222,128,0.2)",
                          border: "1px solid rgba(74,222,128,0.4)",
                          color: "#4ADE80",
                          borderRadius: "8px",
                          fontSize: "10px",
                          padding: "4px 10px",
                        }}
                      >
                        ✓ Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── Notification Tab ─── */}
          <TabsContent value="notify">
            <SectionTitle
              icon={<Bell size={15} />}
              title="Notification System"
            />
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "16px",
              }}
              data-ocid="super_admin.notify.panel"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    htmlFor="notif-title"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "'Poppins', sans-serif",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    📌 Notification Title
                  </label>
                  <Input
                    placeholder="e.g., New Feature Available!"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    id="notif-title"
                    data-ocid="super_admin.notify.title_input"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,111,0,0.3)",
                      color: "white",
                      borderRadius: "10px",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="notif-message"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "'Poppins', sans-serif",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    💬 Message
                  </label>
                  <Textarea
                    placeholder="Sabhi users ko message bhejein..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    id="notif-message"
                    data-ocid="super_admin.notify.textarea"
                    rows={4}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,111,0,0.3)",
                      color: "white",
                      borderRadius: "10px",
                      fontFamily: "'Poppins', sans-serif",
                      resize: "none",
                    }}
                  />
                </div>
                <Button
                  onClick={sendNotification}
                  data-ocid="super_admin.notify.submit_button"
                  style={{
                    background: "linear-gradient(135deg, #FF6F00, #E65100)",
                    border: "none",
                    borderRadius: "12px",
                    height: "48px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <Bell size={16} style={{ marginRight: "8px" }} />📢 Send to
                  All Users
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ─── Security Status ─── */}
        <div
          style={{ marginTop: "20px" }}
          data-ocid="super_admin.security.section"
        >
          <SectionTitle icon={<Lock size={15} />} title="Security Status" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              {
                label: "Single Owner Lock",
                status: "ACTIVE 🔒",
                color: "#4ADE80",
              },
              {
                label: "Admin Role Protection",
                status: "ON",
                color: "#4ADE80",
              },
              {
                label: "Duplicate Session Block",
                status: "ON",
                color: "#4ADE80",
              },
              {
                label: "Feature Content Lock",
                status: "PERMANENT",
                color: "#60A5FA",
              },
            ].map((item, i) => (
              <div
                key={item.label}
                data-ocid={`super_admin.security.item.${i + 1}`}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "13px",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  🔐 {item.label}
                </p>
                <span
                  style={{
                    color: item.color,
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: { icon: React.ReactNode; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
      }}
    >
      <span style={{ color: "#FF6F00" }}>{icon}</span>
      <h3
        style={{
          color: "white",
          fontSize: "14px",
          fontWeight: 700,
          margin: 0,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {title}
      </h3>
    </div>
  );
}

export default SuperAdminDashboard;
