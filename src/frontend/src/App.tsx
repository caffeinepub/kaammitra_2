import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Briefcase,
  Map as MapIcon,
  Menu,
  MoreVertical,
  Phone,
  PlusCircle,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MainMenu } from "./components/MainMenu";
import {
  type AppNotification,
  getMyExtendedProfile,
  getNotificationsForUser,
  markNotificationsRead,
  setOnlineStatus,
} from "./lib/constants";
import AIModerationDashboard from "./pages/AIModerationDashboard";
import AdminPanel from "./pages/AdminPanel";
import { AdvancedSettings } from "./pages/AdvancedSettings";
import { AutoRickshaw } from "./pages/AutoRickshaw";
import { BikeRider } from "./pages/BikeRider";
import { BookingCalendar } from "./pages/BookingCalendar";
import { BookingHistory } from "./pages/BookingHistory";
import { Contact } from "./pages/Contact";
import { ContractorDashboard } from "./pages/ContractorDashboard";
import { ContractorRegister } from "./pages/ContractorRegister";
import { CreateProfile } from "./pages/CreateProfile";
import { EscrowScreen } from "./pages/EscrowScreen";
import { FemaleHub } from "./pages/FemaleHub";
import { FindWork } from "./pages/FindWork";
import { FindWorker } from "./pages/FindWorker";
import { Home } from "./pages/Home";
import { LongTermHiring } from "./pages/LongTermHiring";
import { MinWage } from "./pages/MinWage";
import MitraAI from "./pages/MitraAI";
import { NearbyJobs } from "./pages/NearbyJobs";
import { OperatorPoster } from "./pages/OperatorPoster";
import { PaymentHistory } from "./pages/PaymentHistory";
import { PaymentScreen } from "./pages/PaymentScreen";
import { PostContractJob } from "./pages/PostContractJob";
import { PostJob } from "./pages/PostJob";
import { PremiumPlans } from "./pages/PremiumPlans";
import { ScanWorker } from "./pages/ScanWorker";
import { Settings as SettingsPage } from "./pages/Settings";
import { TransportServices } from "./pages/TransportServices";
import { VerifyAndPay } from "./pages/VerifyAndPay";
import VoiceSearch from "./pages/VoiceSearch";
import { WorkerIDCard } from "./pages/WorkerIDCard";
import { WorkerMap } from "./pages/WorkerMap";
import { WorkerVerification } from "./pages/WorkerVerification";
import { WorkerWallet } from "./pages/WorkerWallet";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// Bottom nav items
const BOTTOM_NAV = [
  {
    path: "/find-work" as const,
    icon: Briefcase,
    label: "Kaam",
    ocid: "nav.kaam_link",
  },
  {
    path: "/find-worker" as const,
    icon: User,
    label: "Worker",
    ocid: "nav.workers_link",
  },
  {
    path: "/post-job" as const,
    icon: PlusCircle,
    label: "Job Do",
    ocid: "nav.post_job_button",
    isCenter: true,
  },
  {
    path: "/contact" as const,
    icon: Phone,
    label: "Contact",
    ocid: "nav.contact_link",
  },
  {
    path: "/worker-map" as const,
    icon: MapIcon,
    label: "Map",
    ocid: "nav.map_link",
  },
  {
    path: "/booking-history" as const,
    icon: BookOpen,
    label: "Bookings",
    ocid: "nav.bookings_link",
  },
];

function LayoutWrapper() {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const isHome = currentPath === "/";
  const isAdmin = currentPath === "/admin";
  const isPosterPage = currentPath === "/operator-poster";
  const isVoiceSearch = currentPath === "/voice-search";

  const [menuOpen, setMenuOpen] = useState(false);

  // Admin easter-egg tap logic (moved from Home.tsx)
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tapFlash, setTapFlash] = useState(false);

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

  // Notification state
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

  useEffect(() => {
    try {
      const profile = localStorage.getItem("kaam_mitra_my_extended");
      if (profile) {
        const parsed = JSON.parse(profile);
        if (parsed.mobile) {
          setOnlineStatus(parsed.mobile, true);
        }
      }
    } catch {}

    const handleUnload = () => {
      try {
        const p = localStorage.getItem("kaam_mitra_my_extended");
        if (p) {
          const parsed = JSON.parse(p);
          if (parsed.mobile) setOnlineStatus(parsed.mobile, false);
        }
      } catch {}
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  void navigate;

  if (isAdmin || isPosterPage || isVoiceSearch) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── TWO-LAYER HEADER ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{ fontFamily: "'Poppins', sans-serif" }}
        data-ocid="header.navbar"
      >
        {/* ── ROW 1: Thin orange bar (always shown) ──────────────────────── */}
        <div
          style={{
            background: "#FF6F00",
            boxShadow: isHome ? "none" : "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          <div
            className="max-w-[520px] mx-auto"
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr 44px",
              alignItems: "center",
              padding: "6px 12px",
              height: "42px",
            }}
          >
            {/* Left: Hamburger menu */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Main menu"
              data-ocid="header.menu_button"
              style={{
                background: "none",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                color: "white",
              }}
            >
              <Menu size={20} />
            </button>

            {/* Center: KaamMitra text */}
            <Link
              to="/"
              data-ocid="header.logo_link"
              style={{
                color: "white",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "-0.3px",
                textDecoration: "none",
                lineHeight: 1,
                fontFamily: "'Poppins', sans-serif",
                textAlign: "center",
                display: "block",
              }}
            >
              KaamMitra
            </Link>

            {/* Right: spacer (mirrors left button width) */}
            <div style={{ width: "36px" }} />
          </div>
        </div>

        {/* ── ROW 2: Dark branding section (home only) ───────────────────── */}
        {isHome && (
          <div
            style={{
              background:
                "linear-gradient(160deg, #1A0800 0%, #0A0400 60%, #000000 100%)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="max-w-[520px] mx-auto"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "16px 16px 20px 16px",
              }}
            >
              {/* LEFT: Badge + Logo + Slogans */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "4px",
                  flex: 1,
                }}
              >
                {/* INDIA'S OWN badge */}
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "2px",
                    opacity: 0.7,
                    fontWeight: 600,
                    color: "white",
                    fontFamily: "'Poppins', sans-serif",
                    textTransform: "uppercase",
                  }}
                >
                  🇮🇳 INDIA&apos;S OWN
                </span>

                {/* KaamMitra heading — admin easter egg */}
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: hidden admin trigger */}
                <h1
                  onClick={handleTitleTap}
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "white",
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: 1,
                    margin: 0,
                    cursor: "default",
                    userSelect: "none",
                    opacity: tapFlash ? 0.6 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  KaamMitra
                </h1>

                {/* Primary slogan */}
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "white",
                    opacity: 0.9,
                    fontFamily: "'Poppins', sans-serif",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  KaamMitra - Apka Vishwas, Hamari Zimmedari
                </p>

                {/* Secondary slogan */}
                <p
                  style={{
                    fontSize: "11px",
                    color: "white",
                    opacity: 0.6,
                    fontFamily: "'Poppins', sans-serif",
                    margin: 0,
                  }}
                >
                  Sankalp Bharat, Shrestha Bharat
                </p>
              </div>

              {/* RIGHT: Bell + Three-dot */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                  paddingTop: "4px",
                }}
              >
                {/* Bell button */}
                <button
                  type="button"
                  onClick={openNotifications}
                  aria-label="Notifications"
                  data-ocid="header.notifications_button"
                  style={{
                    background: "none",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    position: "relative",
                  }}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#FF6F00",
                        border: "1.5px solid #fff",
                      }}
                    />
                  )}
                </button>

                {/* Three-dot menu */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-label="More options"
                  data-ocid="header.more_button"
                  style={{
                    background: "none",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  <MoreVertical size={22} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom Nav — 6 items */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
        style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}
        data-ocid="nav.bottom_bar"
      >
        <div
          className="max-w-[520px] mx-auto"
          style={{ display: "flex", alignItems: "center", height: "58px" }}
        >
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            if (item.isCenter) {
              return (
                <div
                  key={item.path}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate({ to: item.path })}
                    data-ocid={item.ocid}
                    aria-label="Post a job"
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #FF6F00, #E65100)",
                      border: "3px solid white",
                      boxShadow: "0 4px 14px rgba(230, 81, 0, 0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      marginTop: "-16px",
                      color: "white",
                    }}
                  >
                    <Icon size={22} />
                  </button>
                </div>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                data-ocid={item.ocid}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  color: isActive ? "#FF6F00" : "#888",
                  fontSize: "9px",
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  gap: "2px",
                }}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <MainMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Notification Sheet */}
      <Sheet open={notifSheetOpen} onOpenChange={setNotifSheetOpen}>
        <SheetContent
          data-ocid="header.notifications_sheet"
          side="right"
          className="w-[90vw] max-w-sm"
        >
          <SheetHeader className="pb-4">
            <SheetTitle
              className="font-black flex items-center gap-2"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Bell className="w-5 h-5" /> Notifications
            </SheetTitle>
          </SheetHeader>
          {notifications.length === 0 ? (
            <div
              data-ocid="header.notifications.empty_state"
              className="text-center py-12"
            >
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
                    className={`rounded-2xl p-3 border ${
                      n.read
                        ? "bg-gray-50 border-gray-200"
                        : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground leading-snug">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
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

      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({ component: LayoutWrapper });
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
const findWorkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/find-work",
  component: FindWork,
});
const findWorkerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/find-worker",
  component: FindWorker,
});
const postJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-job",
  component: PostJob,
});
const createProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-profile",
  component: CreateProfile,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: Contact,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPanel,
});
const contractorRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor-register",
  component: ContractorRegister,
});
const contractorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor-dashboard",
  component: ContractorDashboard,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
const workerVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker-verification",
  component: WorkerVerification,
});
const workerIDCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker-id-card",
  component: WorkerIDCard,
});
const workerMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker-map",
  component: WorkerMap,
});
const bookingCalendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking-calendar/$workerId",
  component: BookingCalendar,
});
const bookingHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking-history",
  component: BookingHistory,
});
const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: PaymentScreen,
});
const paymentHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-history",
  component: PaymentHistory,
});
const workerWalletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker-wallet",
  component: WorkerWallet,
});
const autoRickshawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auto-rickshaw",
  component: AutoRickshaw,
});
const bikeRiderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bike-rider",
  component: BikeRider,
});
const transportServicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transport-services",
  component: TransportServices,
});
const escrowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/escrow",
  component: EscrowScreen,
});
const longTermHiringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/long-term-hiring",
  component: LongTermHiring,
});
const postContractJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-contract-job",
  component: PostContractJob,
});
const premiumPlansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/premium-plans",
  component: PremiumPlans,
});
const verifyAndPayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-and-pay",
  component: VerifyAndPay,
});
const scanWorkerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scan-worker",
  component: ScanWorker,
});
const operatorPosterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/operator-poster",
  component: OperatorPoster,
});
const advancedSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/advanced-settings",
  component: AdvancedSettings,
});
const minWageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/min-wage",
  component: MinWage,
});
const nearbyJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nearby-jobs",
  component: NearbyJobs,
});
const femaleHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/female-hub",
  component: FemaleHub,
});
const aiModerationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-moderation",
  component: AIModerationDashboard,
});
const mitraAIRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mitra-ai",
  component: MitraAI,
});
const voiceSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/voice-search",
  component: VoiceSearch,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  findWorkRoute,
  findWorkerRoute,
  postJobRoute,
  createProfileRoute,
  contactRoute,
  adminRoute,
  contractorRegisterRoute,
  contractorDashboardRoute,
  settingsRoute,
  workerVerificationRoute,
  workerIDCardRoute,
  workerMapRoute,
  bookingCalendarRoute,
  bookingHistoryRoute,
  paymentRoute,
  paymentHistoryRoute,
  workerWalletRoute,
  autoRickshawRoute,
  bikeRiderRoute,
  transportServicesRoute,
  escrowRoute,
  longTermHiringRoute,
  postContractJobRoute,
  premiumPlansRoute,
  verifyAndPayRoute,
  scanWorkerRoute,
  operatorPosterRoute,
  advancedSettingsRoute,
  minWageRoute,
  nearbyJobsRoute,
  femaleHubRoute,
  aiModerationRoute,
  mitraAIRoute,
  voiceSearchRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
