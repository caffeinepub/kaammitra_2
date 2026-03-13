import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Briefcase, Phone, PlusCircle, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

const ACTIONS = [
  {
    path: "/find-work" as const,
    icon: Briefcase,
    label: "Kaam Dhundho",
    sublabel: "Find Work",
    color: "from-orange-500 to-orange-600",
    ocid: "home.find_work_button",
    bg: "bg-orange-50",
  },
  {
    path: "/find-worker" as const,
    icon: Users,
    label: "Worker Dhundho",
    sublabel: "Find Worker",
    color: "from-amber-500 to-amber-600",
    ocid: "home.find_worker_button",
    bg: "bg-amber-50",
  },
  {
    path: "/post-job" as const,
    icon: PlusCircle,
    label: "Job Do",
    sublabel: "Post a Job",
    color: "from-yellow-500 to-orange-500",
    ocid: "home.post_job_button",
    bg: "bg-yellow-50",
  },
  {
    path: "/contact" as const,
    icon: Phone,
    label: "Sampark Karo",
    sublabel: "Contact Us",
    color: "from-red-500 to-orange-500",
    ocid: "home.contact_button",
    bg: "bg-red-50",
  },
];

const DEFAULT_CATEGORIES = [
  "🚜 JCB Operator",
  "⚡ Electrician",
  "🔧 Plumber",
  "🧱 Mason",
  "🎨 Painter",
  "💪 Labour",
  "🚗 Driver",
  "🪚 Carpenter",
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

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });

  const rawCategories =
    categories.length > 0 ? categories.map((c) => c.name) : DEFAULT_CATEGORIES;

  // Ensure JCB Operator is always first
  const jcbEntry = rawCategories.find((c) => c.toLowerCase().includes("jcb"));
  const otherCategories = rawCategories.filter(
    (c) => !c.toLowerCase().includes("jcb"),
  );
  const categoryLabels = jcbEntry
    ? [jcbEntry, ...otherCategories]
    : rawCategories;

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

  return (
    <div className="page-container pt-0">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-700 text-primary-foreground -mx-4 px-6 pt-8 pb-12 mb-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-0 left-10 w-20 h-20 rounded-full bg-white" />
          <div className="absolute top-1/2 right-12 w-12 h-12 rounded-full bg-white" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <p className="text-orange-200 text-sm font-semibold mb-1 tracking-wide uppercase">
            🇮🇳 India's Own
          </p>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: hidden admin trigger, intentional tap-only interaction */}
          <h1
            className={`text-4xl font-display font-black leading-none mb-2 select-none cursor-default transition-opacity duration-200 ${
              tapFlash ? "opacity-60" : "opacity-100"
            }`}
            onClick={handleTitleTap}
          >
            KaamMitra
          </h1>
          <p className="text-lg font-body opacity-90 mb-1">{homeText}</p>
          <p className="text-sm opacity-75">{bannerText}</p>
        </motion.div>
      </div>

      {/* Announcement Banner */}
      {announcement && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mx-4 mb-4 px-4 py-2.5 bg-amber-100 border-y border-amber-300 flex items-start gap-2"
        >
          <span className="text-amber-600 text-base leading-none mt-0.5">
            📢
          </span>
          <p className="text-amber-800 text-sm font-medium">{announcement}</p>
        </motion.div>
      )}

      {/* Worker Profile CTA */}
      <motion.button
        data-ocid="home.create_profile_button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/create-profile" })}
        className="w-full mb-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
      >
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xl font-display font-black leading-tight">
            Apni Profile Banayein
          </div>
          <div className="text-sm opacity-85 font-body mt-0.5">
            Worker hain? Apna naam register karein
          </div>
        </div>
        <span className="text-2xl">👷</span>
      </motion.button>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.path}
            data-ocid={action.ocid}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate({ to: action.path })}
            className={`relative overflow-hidden ${action.bg} rounded-2xl p-5 flex flex-col items-start gap-3 shadow-card hover:shadow-card-hover transition-all duration-200 border border-border text-left`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm`}
            >
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base font-display font-bold text-foreground leading-tight">
                {action.label}
              </div>
              <div className="text-xs text-muted-foreground font-body mt-0.5">
                {action.sublabel}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Category Showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Worker Categories
        </h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {categoryLabels.map((cat) => (
            <span
              key={cat}
              className="bg-card border border-border rounded-full px-3 py-1.5 text-sm font-medium text-foreground shadow-xs"
            >
              {cat}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-4">
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
