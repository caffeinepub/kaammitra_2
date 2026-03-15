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
import { Bell, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
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

const TOP_TABS = [
  { path: "/" as const, label: "Home", ocid: "header.home_tab" },
  {
    path: "/find-worker" as const,
    label: "Workers",
    ocid: "header.workers_tab",
  },
  { path: "/find-work" as const, label: "Jobs", ocid: "header.jobs_tab" },
  { path: null as null, label: "Menu", ocid: "header.menu_tab" },
];

function LayoutWrapper() {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const isAdmin = currentPath === "/admin";
  const isPosterPage = currentPath === "/operator-poster";
  const isVoiceSearch = currentPath === "/voice-search";

  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      {/* Layout: [Bell]  [KaamMitra — center]  [Three-dot]
          Below:  [Home]  [Workers]  [Jobs]  [Menu] text tabs              */}
      <header
        className="sticky top-0 z-40 bg-white"
        style={{
          boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
          fontFamily: "'Poppins', sans-serif",
        }}
        data-ocid="header.navbar"
      >
        {/* Top Row */}
        <div
          className="max-w-[520px] mx-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 40px",
            alignItems: "center",
            padding: "10px 12px 0 12px",
            gap: "4px",
          }}
        >
          {/* Left: Bell icon only */}
          <button
            type="button"
            onClick={openNotifications}
            aria-label="Notifications"
            data-ocid="header.notifications_button"
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
              color: "#555",
              position: "relative",
            }}
          >
            <Bell size={20} />
            {/* Only show dot when there are unread notifications — no badge on empty */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#E65100",
                  border: "1.5px solid white",
                }}
              />
            )}
          </button>

          {/* Center: App name / logo */}
          <Link
            to="/"
            data-ocid="header.logo_link"
            style={{
              color: "#E65100",
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              textDecoration: "none",
              lineHeight: 1,
              fontFamily: "'Poppins', sans-serif",
              textAlign: "center",
              display: "block",
            }}
          >
            KaamMitra
          </Link>

          {/* Right: Three-dot menu */}
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
              color: "#555",
              marginLeft: "auto",
            }}
          >
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Tab Row: Home | Workers | Jobs | Menu */}
        <div
          className="max-w-[520px] mx-auto"
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            padding: "0 4px",
          }}
        >
          {TOP_TABS.map((tab) => {
            const isActive = tab.path !== null && currentPath === tab.path;
            if (tab.path === null) {
              return (
                <button
                  key="menu"
                  type="button"
                  data-ocid={tab.ocid}
                  onClick={() => setMenuOpen(true)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 4px",
                    background: "none",
                    border: "none",
                    borderBottom: "3px solid transparent",
                    cursor: "pointer",
                    color: "#65676b",
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {tab.label}
                </button>
              );
            }
            return (
              <Link
                key={tab.path}
                to={tab.path}
                data-ocid={tab.ocid}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 4px",
                  textDecoration: "none",
                  color: isActive ? "#E65100" : "#65676b",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  borderBottom: isActive
                    ? "3px solid #E65100"
                    : "3px solid transparent",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
        style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}
        data-ocid="nav.bottom_bar"
      >
        <div
          className="max-w-[520px] mx-auto"
          style={{ display: "flex", alignItems: "center", height: "56px" }}
        >
          <Link
            to="/"
            data-ocid="nav.home_link"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: currentPath === "/" ? "#E65100" : "#888",
              fontSize: "10px",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>🏠</span>
            <span>Home</span>
          </Link>

          <Link
            to="/find-worker"
            data-ocid="nav.workers_link"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: currentPath === "/find-worker" ? "#E65100" : "#888",
              fontSize: "10px",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>👷</span>
            <span>Workers</span>
          </Link>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => navigate({ to: "/post-job" })}
              data-ocid="nav.post_job_button"
              aria-label="Post a job"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6F00, #E65100)",
                border: "3px solid white",
                boxShadow: "0 4px 14px rgba(230, 81, 0, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginTop: "-18px",
                fontSize: "22px",
              }}
            >
              ➕
            </button>
          </div>

          <Link
            to="/find-work"
            data-ocid="nav.jobs_link"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: currentPath === "/find-work" ? "#E65100" : "#888",
              fontSize: "10px",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>💼</span>
            <span>Jobs</span>
          </Link>

          <Link
            to="/settings"
            data-ocid="nav.profile_link"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: currentPath === "/settings" ? "#E65100" : "#888",
              fontSize: "10px",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>👤</span>
            <span>Profile</span>
          </Link>
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
