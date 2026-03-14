import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  HomeIcon,
  Map as MapIcon,
  Phone,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { setOnlineStatus } from "./lib/constants";
import AdminPanel from "./pages/AdminPanel";
import { BookingCalendar } from "./pages/BookingCalendar";
import { BookingHistory } from "./pages/BookingHistory";
import { Contact } from "./pages/Contact";
import { ContractorDashboard } from "./pages/ContractorDashboard";
import { ContractorRegister } from "./pages/ContractorRegister";
import { CreateProfile } from "./pages/CreateProfile";
import { EscrowScreen } from "./pages/EscrowScreen";
import { FindWork } from "./pages/FindWork";
import { FindWorker } from "./pages/FindWorker";
import { Home } from "./pages/Home";
import { PaymentHistory } from "./pages/PaymentHistory";
import { PaymentScreen } from "./pages/PaymentScreen";
import { PostJob } from "./pages/PostJob";
import { Settings as SettingsPage } from "./pages/Settings";
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

const NAV_ITEMS = [
  { path: "/find-work", icon: Briefcase, label: "Kaam" },
  { path: "/find-worker", icon: Users, label: "Worker" },
  { path: "/post-job", icon: PlusCircle, label: "Job Do" },
  { path: "/contact", icon: Phone, label: "Contact" },
  { path: "/worker-map", icon: MapIcon, label: "Map" },
  { path: "/booking-history", icon: CalendarDays, label: "Bookings" },
];

function LayoutWrapper() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isHome = currentPath === "/";
  const isAdmin = currentPath === "/admin";

  // Online status on app open
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

  if (isAdmin) {
    return (
      <>
        <Outlet />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          {!isHome && (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="p-2 rounded-xl hover:bg-white/20 transition-colors -ml-2 touch-btn"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 flex-1 min-w-0 text-primary-foreground"
          >
            <span className="text-2xl font-display font-black tracking-tight leading-none">
              KaamMitra
            </span>
            {isHome && (
              <span className="text-xs font-body opacity-80 truncate hidden sm:block">
                Apna Kaam, Apni Pehchaan
              </span>
            )}
          </Link>
          {!isHome && (
            <Link
              to="/"
              className="p-2 rounded-xl hover:bg-white/20 transition-colors text-primary-foreground"
              aria-label="Home"
            >
              <HomeIcon className="w-5 h-5" />
            </Link>
          )}
          <Link
            to="/admin"
            data-ocid="header.admin_panel_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors text-primary-foreground text-sm font-semibold"
            aria-label="Admin Panel"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs font-bold">Admin</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg">
        <div className="max-w-[520px] mx-auto grid grid-cols-6">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = currentPath === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span
                  className={`text-[10px] font-semibold ${active ? "text-primary" : ""}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
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
const escrowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/escrow",
  component: EscrowScreen,
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
  escrowRoute,
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
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
