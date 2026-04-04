import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronLeft,
  Clock,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { getApprovedCompanies } from "../lib/companies";
import type { RegisteredCompany } from "../lib/companies";
import {
  type CompanyJob,
  applyToCompanyJob,
  getJobsForCompany,
  hasWorkerApplied,
} from "../lib/companyJobs";
import { type AppNotification, saveNotification } from "../lib/constants";

function getWorkerProfile(): {
  name: string;
  mobile: string;
  category: string;
} | null {
  try {
    const raw = localStorage.getItem("kaam_mitra_worker_profile");
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      name: p.name ?? "",
      mobile: p.mobile ?? "",
      category: p.category ?? "",
    };
  } catch {
    return null;
  }
}

const POPPINS = "'Poppins', sans-serif";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const WORK_TYPE_COLORS: Record<string, string> = {
  "Full Time": "#1565C0",
  Contract: "#6A1B9A",
  "Daily Wage": "#E65100",
  "Part Time": "#2E7D32",
};

function ApplyModal({
  job,
  company,
  onClose,
  onSuccess,
}: {
  job: CompanyJob;
  company: RegisteredCompany;
  onClose: () => void;
  onSuccess: (jobId: string) => void;
}) {
  const wProfile = getWorkerProfile();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState(wProfile?.name ?? "");
  const [phone, setPhone] = useState(wProfile?.mobile ?? "");
  const [error, setError] = useState("");

  function handleApply() {
    if (!name.trim()) {
      setError("Naam zaroori hai.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Valid 10-digit mobile number daalen.");
      return;
    }
    setError("");

    const result = applyToCompanyJob({
      workerId: phone.trim(),
      workerName: name.trim(),
      workerMobile: phone.trim(),
      workerCategory: wProfile?.category ?? "General",
      companyId: company.id,
      companyName: company.name,
      jobId: job.id,
      jobTitle: job.title,
      salary: job.salary,
    });

    if (result.alreadyApplied) {
      setError("Aap pehle hi is job ke liye apply kar chuke hain!");
      return;
    }

    // Save notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      mobile: phone.trim(),
      title: "Application Bhej Di! ✅",
      body: `${job.title} ke liye application bhej di! Company jald contact karegi.`,
      createdAt: Date.now(),
      read: false,
    };
    saveNotification(notif);

    setSubmitted(true);
    onSuccess(job.id);
    setTimeout(onClose, 2200);
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop close
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
      data-ocid="apply_modal.modal"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px",
          width: "100%",
          maxWidth: "520px",
          fontFamily: POPPINS,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <CheckCircle
                size={56}
                style={{ color: "#4CAF50", margin: "0 auto 12px" }}
              />
            </motion.div>
            <p style={{ fontWeight: 800, fontSize: "17px", color: "#1a1a1a" }}>
              Application Bhej Di! ✅
            </p>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
              {company.name} jald aapse contact karegi.
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                fontWeight: 800,
                fontSize: "16px",
                color: "#1a1a1a",
                marginBottom: "2px",
              }}
            >
              Apply: {job.title}
            </p>
            <p
              style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}
            >
              {company.name}
            </p>

            {error && (
              <div
                data-ocid="apply_modal.error_state"
                style={{
                  background: "#FFEBEE",
                  color: "#c62828",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "10px",
                }}
              >
                {error}
              </div>
            )}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aapka naam"
              data-ocid="apply_modal.input"
              style={{
                width: "100%",
                border: "1.5px solid #FFE0B2",
                borderRadius: "10px",
                padding: "10px 14px",
                fontFamily: POPPINS,
                fontSize: "14px",
                marginBottom: "10px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number (10 digits)"
              type="tel"
              data-ocid="apply_modal.textarea"
              style={{
                width: "100%",
                border: "1.5px solid #FFE0B2",
                borderRadius: "10px",
                padding: "10px 14px",
                fontFamily: POPPINS,
                fontSize: "14px",
                marginBottom: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={handleApply}
              data-ocid="apply_modal.submit_button"
              style={{
                width: "100%",
                background: "linear-gradient(90deg,#FF6F00,#e53935)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "13px",
                fontFamily: POPPINS,
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              ✅ Apply Now
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

function JobCard({
  job,
  applied,
  onApply,
  isRecommended,
}: {
  job: CompanyJob;
  applied: boolean;
  onApply: (job: CompanyJob) => void;
  isRecommended?: boolean;
}) {
  const typeColor = WORK_TYPE_COLORS[job.workType] ?? "#E65100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        border: "1px solid #FFE0B2",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 2px 8px rgba(255,111,0,0.07)",
        position: "relative",
      }}
    >
      {isRecommended && (
        <span
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#E8F5E9",
            color: "#2E7D32",
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "20px",
            fontFamily: POPPINS,
          }}
        >
          ⭐ Best Match
        </span>
      )}
      <p
        style={{
          fontFamily: POPPINS,
          fontWeight: 800,
          fontSize: "14px",
          color: "#1a1a1a",
          marginBottom: "6px",
          paddingRight: isRecommended ? "80px" : "0",
        }}
      >
        {job.title}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            background: `${typeColor}1a`,
            color: typeColor,
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "20px",
            fontFamily: POPPINS,
          }}
        >
          {job.workType}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <MapPin size={12} style={{ color: "#FF6F00", flexShrink: 0 }} />
          <span
            style={{ fontFamily: POPPINS, fontSize: "12px", color: "#555" }}
          >
            {job.location}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "12px" }}>₹</span>
          <span
            style={{
              fontFamily: POPPINS,
              fontSize: "13px",
              color: "#2E7D32",
              fontWeight: 700,
            }}
          >
            {job.salary}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Clock size={12} style={{ color: "#888", flexShrink: 0 }} />
          <span
            style={{ fontFamily: POPPINS, fontSize: "12px", color: "#888" }}
          >
            {job.duration}
          </span>
        </div>
        <span style={{ fontFamily: POPPINS, fontSize: "11px", color: "#aaa" }}>
          🕐 {relativeTime(job.postedAt)}
        </span>
      </div>

      {applied ? (
        <div
          data-ocid="company_details.success_state"
          style={{
            background: "#E8F5E9",
            color: "#2E7D32",
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: "13px",
            padding: "9px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          ✅ Applied
        </div>
      ) : (
        <button
          type="button"
          data-ocid="company_details.primary_button"
          onClick={() => onApply(job)}
          style={{
            width: "100%",
            background: "linear-gradient(90deg,#FF6F00,#e53935)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px",
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Apply Now →
        </button>
      )}
    </motion.div>
  );
}

export function CompanyDetails() {
  const { companyId } = useParams({ strict: false }) as { companyId: string };
  const navigate = useNavigate();

  const company = useMemo(
    () => getApprovedCompanies().find((c) => c.id === companyId),
    [companyId],
  );

  const jobs = useMemo(
    () => (companyId ? getJobsForCompany(companyId) : []),
    [companyId],
  );

  const workerProf = getWorkerProfile();
  const myCategory = workerProf?.category ?? "";

  const recommendedJobs = useMemo(
    () =>
      myCategory
        ? jobs
            .filter(
              (j) =>
                j.category.toLowerCase().includes(myCategory.toLowerCase()) ||
                myCategory.toLowerCase().includes(j.category.toLowerCase()),
            )
            .slice(0, 2)
        : [],
    [jobs, myCategory],
  );

  const [applyJob, setApplyJob] = useState<CompanyJob | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => {
    const workerId = workerProf?.mobile ?? "";
    if (!workerId) return new Set();
    const all = jobs
      .map((j) => j.id)
      .filter((id) => hasWorkerApplied(workerId, id));
    return new Set(all);
  });

  function handleApplySuccess(jobId: string) {
    setAppliedJobIds((prev) => new Set([...prev, jobId]));
  }

  if (!company) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: POPPINS,
          background: "#fff8f0",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <Building2
          size={56}
          style={{ color: "#FFE0B2", marginBottom: "16px" }}
        />
        <p style={{ fontWeight: 700, fontSize: "16px", color: "#444" }}>
          Company nahi mili
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/companies" })}
          style={{
            marginTop: "16px",
            background: "#FF6F00",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontFamily: POPPINS,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Wapas Companies
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#fff8f0",
        fontFamily: POPPINS,
      }}
      className="pb-28"
      data-ocid="company_details.page"
    >
      {/* Sticky header */}
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
          onClick={() => navigate({ to: "/companies" })}
          data-ocid="company_details.back_button"
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
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={20} style={{ color: "#fff" }} />
        </button>
        <span
          style={{
            color: "#fff",
            fontSize: "17px",
            fontWeight: 800,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {company.name}
        </span>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Company info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            background: "#fff",
            border: "1px solid #FFE0B2",
            borderRadius: "16px",
            padding: "18px",
            boxShadow: "0 4px 18px rgba(255,111,0,0.10)",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              marginBottom: "12px",
            }}
          >
            {/* Logo */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "14px",
                background: company.logoBase64
                  ? "transparent"
                  : "linear-gradient(135deg,#FF6F00,#e53935)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {company.logoBase64 ? (
                <img
                  src={company.logoBase64}
                  alt={company.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Building2 size={28} style={{ color: "#fff" }} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontWeight: 800,
                  fontSize: "15px",
                  color: "#1a1a1a",
                  marginBottom: "6px",
                  lineHeight: 1.3,
                }}
              >
                {company.name}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                <span
                  style={{
                    background: "#FFF3E0",
                    color: "#E65100",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "20px",
                  }}
                >
                  {company.type}
                </span>
                <span
                  style={{
                    background: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "20px",
                  }}
                >
                  ✔ Verified
                </span>
                {company.isPremium && (
                  <span
                    style={{
                      background: "#FFF9C4",
                      color: "#F9A825",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    ⭐ Premium
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "6px",
            }}
          >
            <MapPin size={13} style={{ color: "#FF6F00" }} />
            <span
              style={{ fontFamily: POPPINS, fontSize: "13px", color: "#555" }}
            >
              {company.location}
            </span>
          </div>

          {/* Star rating */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                size={13}
                style={{ color: "#F9A825", fill: "#F9A825" }}
              />
            ))}
            <Star size={13} style={{ color: "#ddd", fill: "#ddd" }} />
            <span
              style={{
                fontFamily: POPPINS,
                fontSize: "12px",
                color: "#888",
                marginLeft: "2px",
              }}
            >
              4.0
            </span>
          </div>

          {company.description && (
            <p
              style={{
                fontFamily: POPPINS,
                fontSize: "13px",
                color: "#555",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            >
              {company.description}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href={`https://wa.me/91${company.contactPhone}`}
              target="_blank"
              rel="noreferrer"
              data-ocid="company_details.secondary_button"
              style={{
                flex: 1,
                background: "#25D366",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "10px",
                fontFamily: POPPINS,
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Phone size={14} /> Contact
            </a>
            <button
              type="button"
              data-ocid="company_details.button"
              onClick={() => navigate({ to: "/my-applications" })}
              style={{
                flex: 1,
                background: "linear-gradient(90deg,#FF6F00,#e53935)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "10px",
                fontFamily: POPPINS,
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              📋 My Applications
            </button>
          </div>
        </motion.div>

        {/* Recommended section */}
        {recommendedJobs.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <h3
              style={{
                fontFamily: POPPINS,
                fontSize: "13px",
                fontWeight: 800,
                color: "#2E7D32",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🎯 Recommended for You
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {recommendedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  applied={appliedJobIds.has(job.id)}
                  onApply={setApplyJob}
                  isRecommended
                />
              ))}
            </div>
          </div>
        )}

        {/* Job listings */}
        <h3
          style={{
            fontFamily: POPPINS,
            fontSize: "13px",
            fontWeight: 800,
            color: "#1a1a1a",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Briefcase size={16} style={{ color: "#FF6F00" }} />
          Job Openings ({jobs.length})
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              data-ocid={`company_details.item.${i + 1}`}
            >
              <JobCard
                job={job}
                applied={appliedJobIds.has(job.id)}
                onApply={setApplyJob}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyJob && (
          <ApplyModal
            job={applyJob}
            company={company}
            onClose={() => setApplyJob(null)}
            onSuccess={handleApplySuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
