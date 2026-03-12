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
  HomeIcon,
  Phone,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import AdminPanel from "./pages/AdminPanel";
import { Contact } from "./pages/Contact";
import { CreateProfile } from "./pages/CreateProfile";
import { FindWork } from "./pages/FindWork";
import { FindWorker } from "./pages/FindWorker";
import { Home } from "./pages/Home";
import { PostJob } from "./pages/PostJob";

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
];

function LayoutWrapper() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isHome = currentPath === "/";
  const isAdmin = currentPath === "/admin";

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
        <div className="max-w-[520px] mx-auto grid grid-cols-4">
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  findWorkRoute,
  findWorkerRoute,
  postJobRoute,
  createProfileRoute,
  contactRoute,
  adminRoute,
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
