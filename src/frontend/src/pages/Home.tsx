import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { CATEGORY_EMOJIS, MAIN_CATEGORIES } from "../lib/constants";

// 4 main action tiles — large rectangular
const ACTIONS = [
  {
    path: "/find-work" as const,
    emoji: "💼",
    label: "Kaam Dhundho",
    sublabel: "Job khojo",
    bg: "#FF6F00",
    ocid: "home.find_work_button",
  },
  {
    path: "/find-worker" as const,
    emoji: "👷",
    label: "Worker Dhundho",
    sublabel: "Worker khojo",
    bg: "#E65100",
    ocid: "home.find_worker_button",
  },
  {
    path: "/post-job" as const,
    emoji: "📋",
    label: "Job Do",
    sublabel: "Job post karo",
    bg: "#F4511E",
    ocid: "home.post_job_button",
  },
  {
    path: "/contact" as const,
    emoji: "📞",
    label: "Sampark Karo",
    sublabel: "Contact karo",
    bg: "#BF360C",
    ocid: "home.contact_button",
  },
];

// 10 unique action cards (no duplicates of above 4)
const ACTION_CARDS = [
  {
    emoji: "👷",
    label: "Apni Profile",
    path: "/create-profile" as const,
    ocid: "home.create_profile_button",
    contractorCheck: false,
  },
  {
    emoji: "🏗️",
    label: "Contractor Panel",
    path: null,
    ocid: "home.contractor_register_button",
    contractorCheck: true,
  },
  {
    emoji: "🗺️",
    label: "Map",
    path: "/worker-map" as const,
    ocid: "home.map_button",
    contractorCheck: false,
  },
  {
    emoji: "📍",
    label: "Nearby Jobs",
    path: "/nearby-jobs" as const,
    ocid: "home.nearby_jobs_button",
    contractorCheck: false,
  },
  {
    emoji: "🚖",
    label: "Transport",
    path: "/transport-services" as const,
    ocid: "home.transport_services_button",
    contractorCheck: false,
  },
  {
    emoji: "📋",
    label: "Long Term Hiring",
    path: "/long-term-hiring" as const,
    ocid: "home.long_term_hiring_button",
    contractorCheck: false,
  },
  {
    emoji: "🇮🇳",
    label: "Operator Rate Card",
    path: "/operator-poster" as const,
    ocid: "home.operator_poster_button",
    contractorCheck: false,
  },
  {
    emoji: "⚖️",
    label: "Min. Wage Info",
    path: "/min-wage" as const,
    ocid: "home.min_wage_button",
    contractorCheck: false,
  },
  {
    emoji: "👩\u200d💼",
    label: "Female Job Hub",
    path: "/female-hub" as const,
    ocid: "home.female_hub_button",
    contractorCheck: false,
  },
  {
    emoji: "🤖",
    label: "Mitra AI Assistant",
    path: "/mitra-ai" as const,
    ocid: "home.mitra_ai_button",
    contractorCheck: false,
  },
];

export function Home() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tapFlash, setTapFlash] = useState(false);

  const { data: appContent } = useQuery({
    queryKey: ["appContent"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAppContent();
    },
    enabled: !!actor && !isFetching,
  });

  function handleTitleTap() {
    tapCount.current += 1;
    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 200);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 3000);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);
      navigate({ to: "/admin" });
    }
  }

  const homeText = appContent?.homeText || "Apna Kaam, Apni Pehchaan";
  const bannerText =
    appContent?.bannerText || "Connect with skilled workers & contractors";
  const announcement = appContent?.announcement || "";

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

  return (
    <div className="page-container pt-0 pb-24">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden -mx-4 px-6 pt-7 pb-10 mb-5"
        style={{
          background: "linear-gradient(135deg, #FF6F00 0%, #D84315 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white" />
          <div className="absolute bottom-0 left-10 w-24 h-24 rounded-full bg-white" />
          <div className="absolute top-1/2 right-12 w-14 h-14 rounded-full bg-white" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-white"
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: hidden admin trigger */}
          <h1
            className={`text-4xl font-black leading-none mb-1 select-none cursor-default transition-opacity duration-200 ${
              tapFlash ? "opacity-60" : "opacity-100"
            }`}
            style={{ fontFamily: "'Poppins', sans-serif" }}
            onClick={handleTitleTap}
          >
            KaamMitra
          </h1>
          <p
            className="text-base font-semibold opacity-90 mb-0.5"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {homeText}
          </p>
          <p className="text-xs opacity-70">{bannerText}</p>
        </motion.div>
      </div>

      {/* Announcement Banner */}
      {announcement && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mx-4 mb-5 px-4 py-2.5 bg-amber-50 border-y border-amber-200 flex items-start gap-2"
        >
          <span className="text-amber-600 text-base leading-none mt-0.5">
            📢
          </span>
          <p className="text-amber-800 text-sm font-medium">{announcement}</p>
        </motion.div>
      )}

      {/* 4 Main Action Tiles — 2x2 rectangular grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.path}
            data-ocid={action.ocid}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.06, duration: 0.35 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate({ to: action.path })}
            className="flex flex-col items-center justify-center gap-2"
            style={{
              background: action.bg,
              border: "none",
              borderRadius: "14px",
              padding: "18px 10px",
              cursor: "pointer",
              minHeight: "90px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            }}
          >
            <span style={{ fontSize: "30px", lineHeight: 1 }}>
              {action.emoji}
            </span>
            <span
              className="text-white font-bold text-center leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px" }}
            >
              {action.label}
            </span>
            <span
              className="text-white opacity-75 text-center"
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px" }}
            >
              {action.sublabel}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Voice Search Banner */}
      <motion.button
        data-ocid="home.voice_search_button"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/voice-search" })}
        className="w-full mb-5 text-white flex items-center gap-3 text-left"
        style={{
          background: "linear-gradient(135deg, #FF6F00, #e53935)",
          borderRadius: "14px",
          padding: "14px 16px",
          boxShadow: "0 4px 14px rgba(255, 111, 0, 0.3)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
          }}
        >
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div
            className="text-base font-black"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            🎤 Bolkar Kaam Dhundo
          </div>
          <div className="text-xs opacity-80">
            Aawaaz se job dhundhein — Hindi, Hinglish, English
          </div>
        </div>
        <span className="text-lg font-bold opacity-70">›</span>
      </motion.button>

      {/* 10 Action Cards — 2-column grid */}
      <div className="mb-5">
        <h2
          className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Services
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ACTION_CARDS.map((card, i) => (
            <motion.button
              key={card.ocid}
              data-ocid={card.ocid}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleCardNav(card)}
              className="flex flex-col items-center gap-2 p-4"
              style={{
                background: "#ffffff",
                border: "1px solid #f0f0f0",
                borderRadius: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "30px", lineHeight: 1 }}>
                {card.emoji}
              </span>
              <span
                className="text-xs font-bold text-gray-700 leading-snug text-center"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {card.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Premium Banner */}
      <motion.button
        data-ocid="home.go_premium_button"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/premium-plans" })}
        className="w-full mb-6 text-white flex items-center gap-3 text-left"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          borderRadius: "14px",
          padding: "13px 16px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
        }}
      >
        <span className="text-2xl">👑</span>
        <div className="flex-1">
          <div
            className="text-sm font-bold"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            KaamMitra Premium
          </div>
          <div className="text-xs opacity-85">
            Priority listing + unlimited jobs – ₹299/mo
          </div>
        </div>
        <span className="text-sm font-bold opacity-70">›</span>
      </motion.button>

      {/* Job Categories — Full Vertical Lists */}
      <div className="mb-8">
        <h2
          className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Job Categories
        </h2>
        <div className="flex flex-col gap-4">
          {MAIN_CATEGORIES.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.35 }}
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #f0f0f0",
              }}
            >
              {/* Group Header */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xl">{group.emoji}</span>
                <span
                  className={`font-bold text-sm ${group.textColor}`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {group.name}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 font-medium">
                  {group.subcategories.length} roles
                </span>
              </div>
              {/* Full vertical list of all role items */}
              <div className="flex flex-col gap-1.5">
                {group.subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    data-ocid="home.category.button"
                    onClick={() => navigate({ to: "/find-work" })}
                    style={{
                      background: "#f9f9f9",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{CATEGORY_EMOJIS[sub] || "👷"}</span>
                    <span className={group.textColor}>{sub}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
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
    </div>
  );
}
