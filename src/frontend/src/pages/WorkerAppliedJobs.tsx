import { useNavigate } from "@tanstack/react-router";
import { Building2, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  type AppStatus,
  type CompanyJobApplication,
  getApplicationsForWorker,
} from "../lib/companyJobs";
import { getMyExtendedProfile } from "../lib/constants";

const POPPINS = "'Poppins', sans-serif";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: AppStatus }) {
  if (status === "selected")
    return (
      <span
        style={{
          background: "#E8F5E9",
          color: "#2E7D32",
          fontWeight: 700,
          fontSize: "11px",
          padding: "3px 10px",
          borderRadius: "20px",
          fontFamily: POPPINS,
        }}
      >
        ✅ Selected!
      </span>
    );
  if (status === "rejected")
    return (
      <span
        style={{
          background: "#FFEBEE",
          color: "#c62828",
          fontWeight: 700,
          fontSize: "11px",
          padding: "3px 10px",
          borderRadius: "20px",
          fontFamily: POPPINS,
        }}
      >
        ❌ Rejected
      </span>
    );
  return (
    <span
      style={{
        background: "#FFF9C4",
        color: "#F9A825",
        fontWeight: 700,
        fontSize: "11px",
        padding: "3px 10px",
        borderRadius: "20px",
        fontFamily: POPPINS,
      }}
    >
      ⏳ Pending
    </span>
  );
}

type FilterTab = AppStatus | "all";

export function WorkerAppliedJobs() {
  const navigate = useNavigate();
  const profile = getMyExtendedProfile();
  const workerId = profile?.mobile ?? "";
  const allApps = workerId ? getApplicationsForWorker(workerId) : [];

  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all"
      ? allApps
      : allApps.filter((a) => a.status === activeTab);

  const stats = {
    total: allApps.length,
    pending: allApps.filter((a) => a.status === "pending").length,
    selected: allApps.filter((a) => a.status === "selected").length,
    rejected: allApps.filter((a) => a.status === "rejected").length,
  };

  const tabs: Array<{ key: FilterTab; label: string; color: string }> = [
    { key: "all", label: "All", color: "#FF6F00" },
    { key: "pending", label: "Pending", color: "#F9A825" },
    { key: "selected", label: "Selected", color: "#4CAF50" },
    { key: "rejected", label: "Rejected", color: "#f44336" },
  ];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#fff8f0",
        fontFamily: POPPINS,
      }}
      className="pb-28"
      data-ocid="worker_applications.page"
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg,#FF6F00,#e53935)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="worker_applications.back_button"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={20} style={{ color: "#fff" }} />
        </button>
        <span style={{ color: "#fff", fontSize: "17px", fontWeight: 800 }}>
          📋 Meri Applications
        </span>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {[
            {
              label: "Total",
              count: stats.total,
              color: "#FF6F00",
              bg: "#FFF3E0",
            },
            {
              label: "Pending",
              count: stats.pending,
              color: "#F9A825",
              bg: "#FFF9C4",
            },
            {
              label: "Selected",
              count: stats.selected,
              color: "#4CAF50",
              bg: "#E8F5E9",
            },
            {
              label: "Rejected",
              count: stats.rejected,
              color: "#f44336",
              bg: "#FFEBEE",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: s.bg,
                borderRadius: "12px",
                padding: "10px 6px",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontWeight: 800, fontSize: "18px", color: s.color }}
              >
                {s.count}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: s.color,
                  opacity: 0.85,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
            marginBottom: "14px",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              data-ocid={`worker_applications.${t.key}.tab`}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: activeTab === t.key ? t.color : "#fff",
                color: activeTab === t.key ? "#fff" : t.color,
                border: `1.5px solid ${t.color}`,
                borderRadius: "20px",
                padding: "5px 14px",
                fontFamily: POPPINS,
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Application cards */}
        {filtered.length === 0 ? (
          <div
            data-ocid="worker_applications.empty_state"
            style={{ textAlign: "center", padding: "50px 20px", color: "#888" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
            <p
              style={{
                fontWeight: 700,
                fontSize: "15px",
                marginBottom: "6px",
                color: "#444",
              }}
            >
              Koi application nahi
            </p>
            <p style={{ fontSize: "13px", marginBottom: "20px" }}>
              Company jobs ke liye Apply karein!
            </p>
            <button
              type="button"
              data-ocid="worker_applications.primary_button"
              onClick={() => navigate({ to: "/companies" })}
              style={{
                background: "linear-gradient(90deg,#FF6F00,#e53935)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontFamily: POPPINS,
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              🏢 Companies Dekhein
            </button>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filtered.map((app: CompanyJobApplication, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                data-ocid={`worker_applications.item.${i + 1}`}
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
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Logo placeholder */}
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg,#FF6F00,#e53935)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "18px",
                    }}
                  >
                    {app.companyName.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: "14px",
                        color: "#1a1a1a",
                        marginBottom: "2px",
                      }}
                    >
                      {app.jobTitle}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#FF6F00",
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      {app.companyName}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#2E7D32",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      {app.salary}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#aaa" }}>
                        Applied: {formatDate(app.appliedAt)}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    {app.status === "selected" && (
                      <a
                        href={`https://wa.me/91${app.workerMobile}`}
                        target="_blank"
                        rel="noreferrer"
                        data-ocid={`worker_applications.contact_button.${i + 1}`}
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          background: "#25D366",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontFamily: POPPINS,
                          fontWeight: 600,
                          fontSize: "12px",
                          textDecoration: "none",
                        }}
                      >
                        📞 Company Contact
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {filtered.length > 0 && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              type="button"
              data-ocid="worker_applications.secondary_button"
              onClick={() => navigate({ to: "/companies" })}
              style={{
                background: "transparent",
                border: "2px solid #FF6F00",
                color: "#FF6F00",
                borderRadius: "12px",
                padding: "10px 24px",
                fontFamily: POPPINS,
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              🏢 More Companies Dekhein
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
