import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Phone,
  PlusCircle,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import {
  type AppNotification,
  CATEGORY_EMOJIS,
  MAIN_CATEGORIES,
  getMyExtendedProfile,
  getNotificationsForUser,
  getUnreadCount,
  markNotificationsRead,
} from "../lib/constants";

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

  const [notifSheetOpen, setNotifSheetOpen] = useState(false);
  const myProfile = getMyExtendedProfile();
  const myMobile = myProfile?.mobile ?? "";
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    myMobile ? getNotificationsForUser(myMobile) : [],
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  function openNotifications() {
    const latest = myMobile ? getNotificationsForUser(myMobile) : [];
    setNotifications(latest);
    setNotifSheetOpen(true);
    if (myMobile) {
      markNotificationsRead(myMobile);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  const hasContractorProfile = !!localStorage.getItem("contractorProfile");
  const hasWorkerProfile = !!localStorage.getItem("workerProfile");

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
          <div className="flex items-start justify-between">
            <p className="text-orange-200 text-sm font-semibold mb-1 tracking-wide uppercase">
              🇮🇳 India&apos;s Own
            </p>
            {myMobile && (
              <button
                type="button"
                data-ocid="home.notifications_button"
                onClick={openNotifications}
                className="relative p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}
          </div>
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
      <div className="relative mb-3">
        <motion.button
          data-ocid="home.create_profile_button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/create-profile" })}
          className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
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

        {/* Settings button for workers who have a profile */}
        {hasWorkerProfile && (
          <motion.button
            data-ocid="home.settings_button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate({ to: "/settings" })}
            className="absolute top-2 right-2 w-9 h-9 rounded-xl bg-white/25 hover:bg-white/40 transition-colors flex items-center justify-center"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-white" />
          </motion.button>
        )}
      </div>

      {/* Contractor CTA */}
      <motion.button
        data-ocid="home.contractor_register_button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() =>
          navigate({
            to: hasContractorProfile
              ? "/contractor-dashboard"
              : "/contractor-register",
          })
        }
        className="w-full mb-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-5 py-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
      >
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Briefcase className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xl font-display font-black leading-tight">
            {hasContractorProfile
              ? "Contractor Dashboard"
              : "Contractor Hain? Register Karein"}
          </div>
          <div className="text-sm opacity-85 font-body mt-0.5">
            Job post karein, workers dhundein
          </div>
        </div>
        <span className="text-2xl">🏗️</span>
      </motion.button>

      {/* Map Quick Access */}
      <motion.button
        data-ocid="home.map_button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/worker-map" })}
        className="w-full mb-5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-5 py-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-all duration-200 text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-2xl">🗺️</span>
        </div>
        <div className="flex-1">
          <div className="text-lg font-display font-black leading-tight">
            Map Mein Dhundho
          </div>
          <div className="text-sm opacity-85 font-body mt-0.5">
            Nearby workers map par dekhein
          </div>
        </div>
        <span className="text-2xl">📍</span>
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

      {/* Category Groups */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Job Categories
        </h2>
        <div className="space-y-3">
          {MAIN_CATEGORIES.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.07, duration: 0.35 }}
              data-ocid={"home.category.card"}
              className={`rounded-2xl border ${group.borderColor} ${group.bgColor} p-4`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{group.emoji}</span>
                <span
                  className={`font-display font-bold text-base ${group.textColor}`}
                >
                  {group.name}
                </span>
                <span
                  className={`ml-auto text-xs font-medium ${group.textColor} opacity-60`}
                >
                  {group.subcategories.length} roles
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    data-ocid="home.category.button"
                    onClick={() => navigate({ to: "/find-work" })}
                    className={`bg-white border ${group.borderColor} rounded-full px-2.5 py-1 text-xs font-medium ${group.textColor} shadow-xs hover:shadow-sm transition-all`}
                  >
                    {CATEGORY_EMOJIS[sub] || "👷"} {sub}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Notification Sheet */}
      <Sheet open={notifSheetOpen} onOpenChange={setNotifSheetOpen}>
        <SheetContent
          data-ocid="home.notifications_sheet"
          side="right"
          className="w-[90vw] max-w-sm"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="font-display font-black flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </SheetTitle>
          </SheetHeader>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🔔</p>
              <p className="font-semibold text-foreground">
                Koi notification nahi
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sab aapdo pe!
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1">
              {notifications.map((n) => {
                const mins = Math.floor((Date.now() - n.createdAt) / 60000);
                const timeAgo =
                  mins < 1
                    ? "Abhi"
                    : mins < 60
                      ? `${mins}m ago`
                      : `${Math.floor(mins / 60)}h ago`;
                return (
                  <div
                    key={n.id}
                    className={`rounded-xl p-3 border ${n.read ? "bg-muted/30 border-border" : "bg-primary/5 border-primary/20"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground leading-snug">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {timeAgo}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>

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
