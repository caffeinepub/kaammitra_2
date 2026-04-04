import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  PlusCircle,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type AppStatus,
  type CompanyJobApplication,
  getAllCompanyJobs,
  getApplicationsForCompany,
  updateApplicationStatus,
} from "../lib/companyJobs";
import {
  type AppNotification,
  CATEGORY_EMOJIS,
  type JobApplication,
  loadAllExtendedProfiles,
  loadApplicationsForContractor,
  saveNotification,
} from "../lib/constants";

const POPPINS = "'Poppins', sans-serif";

interface ContractorProfile {
  name: string;
  companyName: string;
  mobile: string;
  city: string;
  category: string;
  registeredAt: string;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(diff / 86400000);
  return `${days} days ago`;
}

function StatusBadge({ status }: { status: JobApplication["status"] }) {
  if (status === "accepted")
    return (
      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
        ✅ Accepted
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

function CompanyAppStatusBadge({ status }: { status: AppStatus }) {
  if (status === "selected")
    return (
      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
        ✅ Selected
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

type ActiveTab = "applications" | "company_applicants";

export function ContractorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [postedJobsCount, setPostedJobsCount] = useState(0);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("applications");
  const [companyApps, setCompanyApps] = useState<CompanyJobApplication[]>([]);

  // Demo company id for contractor — in production would be linked to contractor mobile
  const DEMO_COMPANY_ID = "reg_ahluwalia";

  useEffect(() => {
    const raw = localStorage.getItem("contractorProfile");
    if (!raw) {
      navigate({ to: "/contractor-register" });
      return;
    }
    const p = JSON.parse(raw) as ContractorProfile;
    setProfile(p);

    // Count jobs posted by this contractor
    try {
      const jobsRaw = localStorage.getItem("jobs");
      if (jobsRaw) {
        const jobs = JSON.parse(jobsRaw) as Array<{
          mobile?: string;
          contractorMobile?: string;
        }>;
        const count = jobs.filter(
          (j) => j.mobile === p.mobile || j.contractorMobile === p.mobile,
        ).length;
        setPostedJobsCount(count);
      }
    } catch {
      /* ignore */
    }

    setApplications(loadApplicationsForContractor(p.mobile));
    setCompanyApps(getApplicationsForCompany(DEMO_COMPANY_ID));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("contractorProfile");
    navigate({ to: "/" });
  }

  function handleApprove(app: CompanyJobApplication) {
    updateApplicationStatus(app.id, "selected");
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: "🎉 Select Ho Gaye!",
      mobile: app.workerMobile,
      body: `${app.companyName} ne aapko ${app.jobTitle} ke liye select kar liya!`,
      createdAt: Date.now(),
      read: false,
    };
    saveNotification(notif);
    setCompanyApps(getApplicationsForCompany(DEMO_COMPANY_ID));
  }

  function handleReject(app: CompanyJobApplication) {
    updateApplicationStatus(app.id, "rejected");
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      mobile: app.workerMobile,
      title: "Application Update",
      body: `${app.companyName} me ${app.jobTitle} ke liye aapki application reject ho gayi.`,
      createdAt: Date.now(),
      read: false,
    };
    saveNotification(notif);
    setCompanyApps(getApplicationsForCompany(DEMO_COMPANY_ID));
  }

  if (!profile) return null;

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const registeredDate = new Date(profile.registeredAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  // Smart match: find workers whose category matches most-posted job category
  const allCompanyJobs = getAllCompanyJobs().filter(
    (j) => j.companyId === DEMO_COMPANY_ID,
  );
  const categoryCount: Record<string, number> = {};
  for (const j of allCompanyJobs) {
    categoryCount[j.category] = (categoryCount[j.category] ?? 0) + 1;
  }
  const topCategory =
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  // biome-ignore lint/suspicious/noExplicitAny: extended profiles have dynamic fields
  const allProfiles: any[] = Object.values(loadAllExtendedProfiles());
  const smartMatches: any[] = allProfiles
    .filter(
      (w: any) =>
        w.category &&
        topCategory &&
        String(w.category).toLowerCase().includes(topCategory.toLowerCase()),
    )
    .slice(0, 3);

  return (
    <div className="page-container pb-24" data-ocid="contractor_dashboard.page">
      {/* Hero welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 text-white -mx-4 px-6 pt-8 pb-10 mb-6 rounded-b-3xl"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-6 w-28 h-28 rounded-full bg-white" />
          <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center text-2xl font-black font-display border-2 border-white/30 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-0.5">
              ✅ Registered Contractor
            </p>
            <h1 className="text-2xl font-display font-black leading-tight truncate">
              {profile.name}
            </h1>
            {profile.companyName && (
              <p className="text-indigo-200 text-sm font-body flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                {profile.companyName}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {profile.city}
              </span>
              <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                {CATEGORY_EMOJIS[profile.category] || "🏗️"} {profile.category}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <Card className="rounded-2xl border-border shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-black font-display text-indigo-600">
              {postedJobsCount}
            </div>
            <div className="text-xs text-muted-foreground font-body mt-1">
              Posted Jobs
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-black font-display text-orange-500">
              {applications.length + companyApps.length}
            </div>
            <div className="text-xs text-muted-foreground font-body mt-1">
              Applications
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <motion.button
          data-ocid="contractor_dashboard.post_job_button"
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/post-job" })}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white p-5 flex flex-col items-start gap-3 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-base font-display font-black leading-tight">
              Job Post Karo
            </div>
            <div className="text-xs opacity-80 font-body mt-0.5">
              New job post karein
            </div>
          </div>
        </motion.button>

        <motion.button
          data-ocid="contractor_dashboard.find_worker_button"
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/find-worker" })}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-5 flex flex-col items-start gap-3 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-base font-display font-black leading-tight">
              Worker Dhundho
            </div>
            <div className="text-xs opacity-80 font-body mt-0.5">
              Verified workers search
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Tab Selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="flex gap-2 mb-4"
      >
        <button
          type="button"
          data-ocid="contractor_dashboard.applications.tab"
          onClick={() => setActiveTab("applications")}
          style={{
            flex: 1,
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: "13px",
            padding: "9px",
            borderRadius: "12px",
            border:
              activeTab === "applications" ? "none" : "1.5px solid #E65100",
            background:
              activeTab === "applications"
                ? "linear-gradient(90deg,#FF6F00,#e53935)"
                : "#fff",
            color: activeTab === "applications" ? "#fff" : "#E65100",
            cursor: "pointer",
          }}
        >
          📊 Job Applications
          {applications.length > 0 && (
            <span
              style={{
                marginLeft: "6px",
                background:
                  activeTab === "applications"
                    ? "rgba(255,255,255,0.3)"
                    : "#FF6F00",
                color: "#fff",
                borderRadius: "20px",
                padding: "1px 7px",
                fontSize: "11px",
              }}
            >
              {applications.length}
            </span>
          )}
        </button>
        <button
          type="button"
          data-ocid="contractor_dashboard.company_applicants.tab"
          onClick={() => setActiveTab("company_applicants")}
          style={{
            flex: 1,
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: "13px",
            padding: "9px",
            borderRadius: "12px",
            border:
              activeTab === "company_applicants"
                ? "none"
                : "1.5px solid #E65100",
            background:
              activeTab === "company_applicants"
                ? "linear-gradient(90deg,#FF6F00,#e53935)"
                : "#fff",
            color: activeTab === "company_applicants" ? "#fff" : "#E65100",
            cursor: "pointer",
          }}
        >
          🏢 Job Applicants
          {companyApps.length > 0 && (
            <span
              style={{
                marginLeft: "6px",
                background:
                  activeTab === "company_applicants"
                    ? "rgba(255,255,255,0.3)"
                    : "#FF6F00",
                color: "#fff",
                borderRadius: "20px",
                padding: "1px 7px",
                fontSize: "11px",
              }}
            >
              {companyApps.length}
            </span>
          )}
        </button>
      </motion.div>

      {/* Tab content */}
      {activeTab === "applications" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-ocid="contractor_dashboard.applications_section"
          className="mb-6"
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Applications
            {applications.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {applications.length}
              </span>
            )}
          </h2>

          {applications.length === 0 ? (
            <Card className="rounded-2xl border-border shadow-card">
              <CardContent
                data-ocid="contractor_dashboard.applications_section.empty_state"
                className="p-8 text-center"
              >
                <div className="text-3xl mb-2">📥</div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Abhi koi application nahi aayi
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jab worker apply karega, yahan dikhega
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app, idx) => (
                <Card
                  key={app.id}
                  data-ocid={`contractor_dashboard.application_item.${idx + 1}`}
                  className="rounded-2xl border-border shadow-card overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {app.workerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-display font-black text-foreground text-sm">
                            {app.workerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {timeAgo(app.appliedAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="bg-indigo-50 rounded-lg px-3 py-1.5 mb-3">
                      <p className="text-xs font-semibold text-indigo-700">
                        📋 {app.jobTitle}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {app.workerCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_EMOJIS[app.workerCategory] || "👷"}{" "}
                          {app.workerCategory}
                        </Badge>
                      )}
                      {app.workerCity && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {app.workerCity}
                        </span>
                      )}
                    </div>
                    {app.workerMobile && (
                      <div className="flex gap-2">
                        <a
                          href={`tel:${app.workerMobile}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-full transition-colors"
                        >
                          <Phone className="w-3 h-3" /> 📞 Call
                        </a>
                        <a
                          href={`https://wa.me/91${app.workerMobile.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5C] text-white text-xs font-bold px-3 py-2 rounded-full transition-colors"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "company_applicants" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          {/* Smart Match section */}
          {smartMatches.length > 0 && (
            <div
              style={{
                background: "#E8F5E9",
                border: "1px solid #A5D6A7",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 800,
                  fontSize: "13px",
                  color: "#2E7D32",
                  marginBottom: "10px",
                }}
              >
                💡 Smart Match — Top Workers for "{topCategory}"
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {smartMatches.map((w, i) => (
                  <div
                    key={w.mobile ?? i}
                    style={{
                      background: "#fff",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: POPPINS,
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#1a1a1a",
                        }}
                      >
                        {String(w.name ?? "")}
                      </p>
                      <p
                        style={{
                          fontFamily: POPPINS,
                          fontSize: "11px",
                          color: "#888",
                        }}
                      >
                        {String(w.category ?? "")} • {String(w.city ?? "")}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/91${String(w.mobile ?? "")}`}
                      target="_blank"
                      rel="noreferrer"
                      data-ocid={`contractor_dashboard.smart_match_contact.${i + 1}`}
                      style={{
                        background: "#25D366",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "5px 12px",
                        fontFamily: POPPINS,
                        fontWeight: 600,
                        fontSize: "11px",
                        cursor: "pointer",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Contact
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            🏢 Company Job Applicants
            {companyApps.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {companyApps.length}
              </span>
            )}
          </h2>

          {companyApps.length === 0 ? (
            <Card className="rounded-2xl border-border shadow-card">
              <CardContent
                data-ocid="contractor_dashboard.company_applicants.empty_state"
                className="p-8 text-center"
              >
                <div className="text-3xl mb-2">🏢</div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Koi applicant nahi abhi
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jab workers company jobs ke liye apply karenge, yahan dikhega
                </p>
              </CardContent>
            </Card>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {companyApps.map((app, idx) => (
                <div
                  key={app.id}
                  data-ocid={`contractor_dashboard.company_applicant.${idx + 1}`}
                  style={{
                    background: "#fff",
                    border: "1px solid #FFE0B2",
                    borderRadius: "14px",
                    padding: "14px",
                    boxShadow: "0 2px 8px rgba(255,111,0,0.07)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg,#FF6F00,#e53935)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "16px",
                          flexShrink: 0,
                        }}
                      >
                        {app.workerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: POPPINS,
                            fontWeight: 800,
                            fontSize: "13px",
                            color: "#1a1a1a",
                          }}
                        >
                          {app.workerName}
                        </p>
                        <p
                          style={{
                            fontFamily: POPPINS,
                            fontSize: "11px",
                            color: "#888",
                          }}
                        >
                          {app.workerMobile} • {app.workerCategory}
                        </p>
                      </div>
                    </div>
                    <CompanyAppStatusBadge status={app.status} />
                  </div>

                  <div
                    style={{
                      background: "#FFF3E0",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      marginBottom: "10px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: POPPINS,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#E65100",
                      }}
                    >
                      📋 {app.jobTitle} • {app.salary}
                    </p>
                    <p
                      style={{
                        fontFamily: POPPINS,
                        fontSize: "11px",
                        color: "#888",
                      }}
                    >
                      Applied:{" "}
                      {new Date(app.appliedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  {app.status === "pending" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        data-ocid={`contractor_dashboard.approve_button.${idx + 1}`}
                        onClick={() => handleApprove(app)}
                        style={{
                          flex: 1,
                          background: "#4CAF50",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          padding: "9px",
                          fontFamily: POPPINS,
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        ✅ Select
                      </button>
                      <button
                        type="button"
                        data-ocid={`contractor_dashboard.reject_button.${idx + 1}`}
                        onClick={() => handleReject(app)}
                        style={{
                          flex: 1,
                          background: "#f44336",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          padding: "9px",
                          fontFamily: POPPINS,
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Profile Details */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Aapki Profile
        </h2>
        <Card className="rounded-2xl border-border shadow-card mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Naam</span>
              <span className="text-sm font-semibold text-foreground">
                {profile.name}
              </span>
            </div>
            {profile.companyName && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Company</span>
                <span className="text-sm font-semibold text-foreground">
                  {profile.companyName}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mobile</span>
              <span className="text-sm font-semibold text-foreground">
                {profile.mobile}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">City</span>
              <span className="text-sm font-semibold text-foreground">
                {profile.city}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Category</span>
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_EMOJIS[profile.category] || "🏗️"} {profile.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Registered</span>
              <span className="text-sm text-muted-foreground">
                {registeredDate}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            data-ocid="contractor_dashboard.edit_profile_button"
            variant="outline"
            onClick={() => navigate({ to: "/contractor-register" })}
            className="flex-1 h-12 rounded-xl border-border font-semibold flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button
            data-ocid="contractor_dashboard.logout_button"
            variant="destructive"
            onClick={handleLogout}
            className="flex-1 h-12 rounded-xl font-semibold flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.div>

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
