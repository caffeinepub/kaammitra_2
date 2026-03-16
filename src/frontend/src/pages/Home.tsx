import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Mic } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useScreenshot } from "../hooks/useScreenshot";
import { CATEGORY_EMOJIS, MAIN_CATEGORIES } from "../lib/constants";

const ACTIONS = [
  {
    path: "/find-work" as const,
    emoji: "💼",
    label: "Kaam Dhundho",
    ocid: "home.find_work_button",
  },
  {
    path: "/find-worker" as const,
    emoji: "👷",
    label: "Worker Dhundho",
    ocid: "home.find_worker_button",
  },
  {
    path: "/post-job" as const,
    emoji: "📝",
    label: "Job Do",
    ocid: "home.post_job_button",
  },
  {
    path: "/contact" as const,
    emoji: "📞",
    label: "Sampark Karo",
    ocid: "home.contact_button",
  },
];

const ACTION_CARDS = [
  {
    emoji: "👷",
    label: "Apni Profile Banayein",
    sublabel: "Worker registration",
    path: "/create-profile" as const,
    ocid: "home.create_profile_button",
    iconBg: "#4CAF50",
    contractorCheck: false,
  },
  {
    emoji: "🏗️",
    label: "Contractor Panel",
    sublabel: "Job post karein",
    path: null,
    ocid: "home.contractor_register_button",
    iconBg: "#1565C0",
    contractorCheck: true,
  },
  {
    emoji: "🗺️",
    label: "Map Mein Dhundho",
    sublabel: "Nearby workers",
    path: "/worker-map" as const,
    ocid: "home.map_button",
    iconBg: "#00897B",
    contractorCheck: false,
  },
  {
    emoji: "📍",
    label: "Nearby Jobs",
    sublabel: "Aas-paas ka kaam",
    path: "/nearby-jobs" as const,
    ocid: "home.nearby_jobs_button",
    iconBg: "#E91E63",
    contractorCheck: false,
  },
  {
    emoji: "🚖",
    label: "Transport Services",
    sublabel: "Auto • Bike • Taxi",
    path: "/transport-services" as const,
    ocid: "home.transport_services_button",
    iconBg: "#FF6F00",
    contractorCheck: false,
  },
  {
    emoji: "📋",
    label: "Long Term Hiring",
    sublabel: "Monthly contracts",
    path: "/long-term-hiring" as const,
    ocid: "home.long_term_hiring_button",
    iconBg: "#1976D2",
    contractorCheck: false,
  },
  {
    emoji: "🇮🇳",
    label: "Operator Rate Card",
    sublabel: "Bharat manak rate",
    path: "/operator-poster" as const,
    ocid: "home.operator_poster_button",
    iconBg: "#388E3C",
    contractorCheck: false,
  },
  {
    emoji: "⚖️",
    label: "Min. Wage Info",
    sublabel: "Sarkari wage rates",
    path: "/min-wage" as const,
    ocid: "home.min_wage_button",
    iconBg: "#F4511E",
    contractorCheck: false,
  },
  {
    emoji: "👩\u200d💼",
    label: "Female Job Hub",
    sublabel: "Maids, Staff, Office",
    path: "/female-hub" as const,
    ocid: "home.female_hub_button",
    iconBg: "#E91E63",
    contractorCheck: false,
  },
  {
    emoji: "🤖",
    label: "Mitra AI Assistant",
    sublabel: "AI se job dhundhein",
    path: "/mitra-ai" as const,
    ocid: "home.mitra_ai_button",
    iconBg: "#7B1FA2",
    contractorCheck: false,
  },
];

// Per-category accent — card bg, left border, chip colors, header text
const CATEGORY_STYLE: Record<
  string,
  {
    cardBg: string;
    borderColor: string;
    chipBorder: string;
    chipColor: string;
    headerColor: string;
  }
> = {
  construction: {
    cardBg: "#fff3e0",
    borderColor: "#ff9800",
    chipBorder: "rgba(255,152,0,0.3)",
    chipColor: "#a0522d",
    headerColor: "#e65100",
  },
  office: {
    cardBg: "#e3f2fd",
    borderColor: "#2196f3",
    chipBorder: "rgba(33,150,243,0.25)",
    chipColor: "#1565c0",
    headerColor: "#1565c0",
  },
  mechanical: {
    cardBg: "#f3f3f3",
    borderColor: "#607d8b",
    chipBorder: "rgba(96,125,139,0.25)",
    chipColor: "#37474f",
    headerColor: "#37474f",
  },
  driver: {
    cardBg: "#e8f5e9",
    borderColor: "#4caf50",
    chipBorder: "rgba(76,175,80,0.25)",
    chipColor: "#2e7d32",
    headerColor: "#2e7d32",
  },
  transport: {
    cardBg: "#e0f2f1",
    borderColor: "#009688",
    chipBorder: "rgba(0,150,136,0.25)",
    chipColor: "#00695c",
    headerColor: "#00695c",
  },
};

function getCatStyle(id: string) {
  return (
    CATEGORY_STYLE[id] || {
      cardBg: "#fff8e1",
      borderColor: "#ff9800",
      chipBorder: "rgba(0,0,0,0.08)",
      chipColor: "#e65100",
      headerColor: "#e65100",
    }
  );
}

export function Home() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const { downloadScreenshot, isCapturing } = useScreenshot();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: appContent } = useQuery({
    queryKey: ["appContent"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAppContent();
    },
    enabled: !!actor && !isFetching,
  });

  const announcement =
    appContent?.announcement ||
    "🔔 KaamMitra is now live! Apna kaam aaj hi dhundhein.";

  const hasContractorProfile = !!localStorage.getItem("contractorProfile");

  function handleCardNav(card: (typeof ACTION_CARDS)[0]) {
    if (card.contractorCheck) {
      navigate({
        to: hasContractorProfile
          ? "/contractor-dashboard"
          : "/contractor-register",
      });
    } else if (card.path) {
      navigate({ to: card.path });
    }
  }

  async function handleScreenshot() {
    const ok = await downloadScreenshot("kaammitra-screenshot.png");
    if (ok) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    }
  }

  return (
    <div className="page-container pt-0 pb-28">
      {/* ── Main Header — #ff4e50 → #f9d423 gradient, rounded bottom corners ─ */}
      <motion.header
        className="main-header -mx-4 mb-3"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "linear-gradient(135deg, #ff4e50, #f9d423)",
          color: "white",
          padding: "20px",
          textAlign: "left",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            opacity: 0.8,
            fontFamily: "'Poppins', sans-serif",
            marginBottom: "4px",
          }}
        >
          🇮🇳 INDIA&apos;S OWN
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 900,
            fontFamily: "'Poppins', sans-serif",
            lineHeight: 1.1,
          }}
        >
          KaamMitra
        </h1>
        <p
          style={{
            margin: "5px 0 0",
            fontSize: "12px",
            opacity: 0.9,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          KaamMitra — Apka Vishwas, Hamari Zimmedari
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "11px",
            opacity: 0.75,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Sankalp Bharat, Shrestha Bharat
        </p>
      </motion.header>

      {/* ── Announcement Banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="-mx-4 mb-3 px-4 py-2.5 bg-amber-50 border-y border-amber-200 flex items-start gap-2"
        data-ocid="home.announcement_banner"
      >
        <span className="text-amber-600 text-base leading-none mt-0.5">📢</span>
        <p
          className="text-amber-800 text-sm font-medium"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {announcement}
        </p>
      </motion.div>

      {/* ── Quick Actions — 4-column grid ───────────────────────────────── */}
      <div
        className="quick-actions"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          padding: "15px 0",
          marginBottom: "4px",
        }}
      >
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.path}
            data-ocid={action.ocid}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate({ to: action.path })}
            className="action-card"
            style={{
              background: "white",
              padding: "10px 5px",
              textAlign: "center",
              borderRadius: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              fontSize: "10px",
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: "#333",
            }}
          >
            <span
              className="icon"
              style={{
                display: "block",
                fontSize: "20px",
                marginBottom: "5px",
                lineHeight: 1,
              }}
            >
              {action.emoji}
            </span>
            <span>{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ── Voice Search Banner ───────────────────────────────────────── */}
      <motion.button
        data-ocid="home.voice_search_button"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/voice-search" })}
        className="w-full mb-4 text-white flex items-center gap-3 text-left"
        style={{
          background: "linear-gradient(135deg, #FF6F00, #e53935)",
          borderRadius: "14px",
          padding: "14px 16px",
          boxShadow: "0 4px 14px rgba(255,111,0,0.3)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "15px",
              fontWeight: 900,
            }}
          >
            🎤 Bolkar Kaam Dhundo
          </div>
          <div style={{ fontSize: "11px", opacity: 0.85 }}>
            Aawaaz se job dhundhein — Hindi, Hinglish, English
          </div>
        </div>
        <span style={{ fontSize: "18px", fontWeight: 700, opacity: 0.7 }}>
          ›
        </span>
      </motion.button>

      {/* ── Services — 10 action cards, 2-col grid ───────────────────────── */}
      <div className="mb-4">
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "10px",
          }}
        >
          Services
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {ACTION_CARDS.map((card, i) => (
            <motion.button
              key={card.ocid}
              data-ocid={card.ocid}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleCardNav(card)}
              style={{
                background: "#ffffff",
                border: "1px solid #f0f0f0",
                borderRadius: "12px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: card.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                {card.emoji}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#222",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.3,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "10px",
                    color: "#999",
                    marginTop: "2px",
                  }}
                >
                  {card.sublabel}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── KaamMitra Premium Banner ───────────────────────────────────── */}
      <motion.button
        data-ocid="home.go_premium_button"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/premium-plans" })}
        className="w-full mb-5 text-white flex items-center gap-3 text-left"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          borderRadius: "14px",
          padding: "13px 16px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(124,58,237,0.25)",
        }}
      >
        <span style={{ fontSize: "22px" }}>👑</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            KaamMitra Premium
          </div>
          <div style={{ fontSize: "11px", opacity: 0.85 }}>
            Priority listing + unlimited jobs – ₹299/mo
          </div>
        </div>
        <span style={{ fontSize: "14px", fontWeight: 700, opacity: 0.7 }}>
          ›
        </span>
      </motion.button>

      {/* ── Job Categories — chip/tag style ─────────────────────────────── */}
      <div className="mb-8">
        <div
          className="section-title"
          style={{
            padding: "10px 0",
            fontWeight: "bold",
            color: "#666",
            fontSize: "14px",
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          JOB CATEGORIES
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {MAIN_CATEGORIES.map((group, i) => {
            const s = getCatStyle(group.id);
            return (
              <motion.div
                key={group.id}
                className="category-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 + i * 0.05, duration: 0.32 }}
                style={{
                  margin: "10px 0",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  outline: "1px solid rgba(0,0,0,0.04)",
                  backgroundColor: s.cardBg,
                  borderLeft: `5px solid ${s.borderColor}`,
                }}
              >
                {/* Category Header */}
                <div
                  className="category-header"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "13px",
                    color: s.headerColor,
                  }}
                >
                  <span>
                    {group.emoji} {group.name}
                  </span>
                  <span
                    className="count"
                    style={{ fontSize: "10px", color: "#888", fontWeight: 500 }}
                  >
                    {group.subcategories.length} roles
                  </span>
                </div>

                {/* Chips Container */}
                <div
                  className="chips-container"
                  style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  data-ocid={`${group.id}.list`}
                >
                  {group.subcategories.map((sub, idx) => (
                    <button
                      key={sub}
                      type="button"
                      className="chip"
                      data-ocid={
                        idx < 9
                          ? `${group.id}.item.${idx + 1}`
                          : `${group.id}.item.9`
                      }
                      onClick={() => navigate({ to: "/find-work" })}
                      style={{
                        background: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        border: `1px solid ${s.chipBorder}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        cursor: "pointer",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        color: s.chipColor,
                        whiteSpace: "nowrap",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        transition: "box-shadow 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: "13px", lineHeight: 1 }}>
                        {CATEGORY_EMOJIS[sub] || "👷"}
                      </span>
                      {sub}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4">
        <p>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* ── Screenshot FAB ──────────────────────────────────────────────── */}
      <motion.button
        data-ocid="screenshot.button"
        type="button"
        onClick={handleScreenshot}
        disabled={isCapturing}
        aria-label="Screenshot lein"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: "fixed",
          bottom: "76px",
          right: "16px",
          zIndex: 999,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: isCapturing
            ? "#ccc"
            : "linear-gradient(135deg, #FF6F00, #E65100)",
          color: "white",
          border: "none",
          cursor: isCapturing ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(230,81,0,0.45)",
          transition: "background 0.2s",
        }}
      >
        {isCapturing ? (
          <span style={{ fontSize: "20px" }}>⏳</span>
        ) : (
          <Camera size={22} strokeWidth={2} />
        )}
      </motion.button>

      {/* ── Screenshot Success Toast ─────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            data-ocid="screenshot.success_state"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              position: "fixed",
              bottom: "138px",
              right: "12px",
              zIndex: 1000,
              background: "#1b5e20",
              color: "white",
              borderRadius: "12px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "'Poppins', sans-serif",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              maxWidth: "220px",
            }}
          >
            <span style={{ fontSize: "16px" }}>✅</span>
            Screenshot save ho gaya!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
