import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_JOBS = [
  {
    id: 101,
    title: "Road Construction – Helper",
    company: "Road Construction Project",
    location: "Delhi",
    distanceKm: 7,
    salary: "₹600/day",
    category: "Helper",
  },
  {
    id: 102,
    title: "Metro Project – JCB Operator",
    company: "Metro Rail Project",
    location: "Delhi",
    distanceKm: 9,
    salary: "₹1200/day",
    category: "JCB Operator",
  },
  {
    id: 103,
    title: "Building Work – Mason",
    company: "Building Construction",
    location: "Delhi",
    distanceKm: 5,
    salary: "₹800/day",
    category: "Mason",
  },
  {
    id: 1,
    title: "JCB Operator Needed",
    company: "XYZ Construction",
    location: "Delhi",
    distanceKm: 6,
    salary: "₹1200/day",
    category: "JCB Operator",
  },
  {
    id: 2,
    title: "Helper Required",
    company: "Sharma Builders",
    location: "Noida",
    distanceKm: 3,
    salary: "₹600/day",
    category: "Helper",
  },
  {
    id: 3,
    title: "Electrician Urgently Needed",
    company: "PowerTech Ltd",
    location: "Gurgaon",
    distanceKm: 12,
    salary: "₹900/day",
    category: "Electrician",
  },
  {
    id: 4,
    title: "Truck Driver Needed",
    company: "Fast Logistics",
    location: "Faridabad",
    distanceKm: 18,
    salary: "₹1100/day",
    category: "Driver",
  },
  {
    id: 5,
    title: "Mason / Rajmistri Chahiye",
    company: "Build India Corp",
    location: "Delhi",
    distanceKm: 8,
    salary: "₹800/day",
    category: "Mason",
  },
  {
    id: 6,
    title: "Plumber Required",
    company: "HomeRepair Co",
    location: "Noida",
    distanceKm: 25,
    salary: "₹750/day",
    category: "Plumber",
  },
  {
    id: 7,
    title: "Security Guard Needed",
    company: "SecureGuard Pvt",
    location: "Delhi",
    distanceKm: 5,
    salary: "₹700/day",
    category: "Security Guard",
  },
  {
    id: 8,
    title: "Crane Operator Required",
    company: "HeavyLift Ltd",
    location: "Ghaziabad",
    distanceKm: 40,
    salary: "₹1500/day",
    category: "Crane Operator",
  },
];

const MOCK_WORKERS = [
  {
    id: 1,
    name: "Rahul Kumar",
    skill: "JCB Operator",
    exp: "5 Years",
    location: "Delhi",
    distanceKm: 4,
    verified: true,
    mobile: "9876500001",
  },
  {
    id: 2,
    name: "Suresh Yadav",
    skill: "Helper/Labour",
    exp: "3 Years",
    location: "Noida",
    distanceKm: 7,
    verified: false,
    mobile: "9876500002",
  },
  {
    id: 3,
    name: "Mohan Singh",
    skill: "Electrician",
    exp: "8 Years",
    location: "Delhi",
    distanceKm: 2,
    verified: true,
    mobile: "9876500003",
  },
  {
    id: 4,
    name: "Ramesh Sharma",
    skill: "Truck Driver",
    exp: "10 Years",
    location: "Gurgaon",
    distanceKm: 15,
    verified: true,
    mobile: "9876500004",
  },
  {
    id: 5,
    name: "Vijay Kumar",
    skill: "Plumber",
    exp: "4 Years",
    location: "Delhi",
    distanceKm: 9,
    verified: false,
    mobile: "9876500005",
  },
];

const DISTANCE_FILTERS = [
  { label: "5 KM", value: 5 },
  { label: "10 KM", value: 10 },
  { label: "25 KM", value: 25 },
  { label: "50 KM", value: 50 },
  { label: "All India", value: 99999 },
];

const CATEGORY_COLORS: Record<string, string> = {
  "JCB Operator": "border-l-orange-500",
  Helper: "border-l-yellow-500",
  Electrician: "border-l-blue-500",
  Driver: "border-l-green-500",
  Mason: "border-l-red-500",
  Plumber: "border-l-cyan-500",
  "Security Guard": "border-l-indigo-500",
  "Crane Operator": "border-l-amber-500",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-teal-500",
    "bg-red-500",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

type TabType = "jobs" | "workers";

export function NearbyJobs() {
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const filteredJobs = MOCK_JOBS.filter(
    (job) => selectedDistance >= 99999 || job.distanceKm <= selectedDistance,
  );
  const filteredWorkers = MOCK_WORKERS.filter(
    (w) => selectedDistance >= 99999 || w.distanceKm <= selectedDistance,
  );

  function detectLocation() {
    setDetecting(true);
    if (!navigator.geolocation) {
      toast.error("Location not supported on this device");
      setDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setDetectedCity("Delhi NCR");
        setDetecting(false);
        toast.success("Location detected: Delhi NCR");
      },
      () => {
        setDetectedCity("Delhi NCR");
        setDetecting(false);
        toast.info("Using approximate location: Delhi NCR");
      },
      { timeout: 5000 },
    );
  }

  function handleShare(title: string) {
    const text = `🔔 Job Alert on KaamMitra!\n\n${title}\n\nJoin now: https://kaammitra.app`;
    if (navigator.share) {
      navigator.share({ title: "KaamMitra Job", text });
    } else {
      navigator.clipboard?.writeText(text);
      toast.success("Job link copied!");
    }
  }

  function handleCall(mobile: string) {
    window.open(`tel:${mobile}`);
  }

  function handleWhatsApp(mobile: string, name: string) {
    const msg = encodeURIComponent(
      `Namaste ${name} ji, main KaamMitra se contact kar raha hoon.`,
    );
    window.open(`https://wa.me/91${mobile}?text=${msg}`, "_blank");
  }

  function handleApply(jobTitle: string) {
    toast.success(`Application sent for: ${jobTitle}`);
  }

  return (
    <div className="page-container pt-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-2xl font-display font-black text-foreground flex items-center gap-2">
          <span className="text-2xl">📍</span> Nearby Jobs
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Aas-paas ke available kaam aur workers
        </p>
      </motion.div>

      {/* Location Detect */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-4 text-white shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">
              {detectedCity
                ? `📍 ${detectedCity}`
                : "Apni location detect karein"}
            </p>
            <p className="text-xs opacity-80">
              {detectedCity
                ? "Location detected successfully"
                : "Aas-paas ke jobs dekhne ke liye"}
            </p>
          </div>
          <Button
            data-ocid="nearby_jobs.location_detect_button"
            size="sm"
            onClick={detectLocation}
            disabled={detecting}
            className="bg-white text-teal-700 hover:bg-white/90 font-bold text-xs shrink-0"
          >
            {detecting ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                ...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {detectedCity ? "Update" : "Detect"}
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Tab Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex rounded-xl border border-border bg-muted/40 p-1 mb-4 gap-1"
      >
        <button
          type="button"
          data-ocid="nearby_jobs.jobs_tab"
          onClick={() => setActiveTab("jobs")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === "jobs"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Jobs ({filteredJobs.length})
        </button>
        <button
          type="button"
          data-ocid="nearby_jobs.workers_tab"
          onClick={() => setActiveTab("workers")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === "workers"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Workers ({filteredWorkers.length})
        </button>
      </motion.div>

      {/* Distance Filter Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18 }}
        className="mb-4"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Distance Filter
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DISTANCE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              data-ocid="nearby_jobs.distance_filter.tab"
              onClick={() => setSelectedDistance(filter.value)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                selectedDistance === filter.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "jobs" ? (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" />
                Nearby Jobs
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredJobs.length} jobs found
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <motion.div
                data-ocid="nearby_jobs.empty_state"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 rounded-2xl bg-card border border-border"
              >
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-bold text-foreground">Koi job nahi mili</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Is distance mein koi job available nahi hai
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Distance filter badhayein
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    data-ocid={`nearby_jobs.job_card.item.${i + 1}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className={`bg-card border border-border rounded-2xl overflow-hidden border-l-4 ${
                      CATEGORY_COLORS[job.category] || "border-l-primary"
                    } shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="p-4">
                      {/* Top Row */}
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-sm leading-tight">
                            {job.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {job.company}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className="text-[10px] bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-100 font-semibold px-2 py-0.5">
                            📍 {job.distanceKm} KM
                          </Badge>
                          <button
                            type="button"
                            data-ocid={`nearby_jobs.job.share_button.${i + 1}`}
                            onClick={() => handleShare(job.title)}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="text-xs font-bold text-green-600">
                          💰 {job.salary}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0"
                        >
                          {job.category}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          data-ocid={`nearby_jobs.job.call_button.${i + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() => handleCall("9876543210")}
                          className="flex-1 text-xs font-semibold border-border h-8 gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Employer
                        </Button>
                        <Button
                          data-ocid={`nearby_jobs.apply_button.${i + 1}`}
                          size="sm"
                          onClick={() => handleApply(job.title)}
                          className="flex-1 text-xs font-semibold h-8 gap-1 bg-primary hover:bg-primary/90"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="workers"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                आस-पास के Workers
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredWorkers.length} workers found
              </span>
            </div>

            {filteredWorkers.length === 0 ? (
              <motion.div
                data-ocid="nearby_jobs.empty_state"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 rounded-2xl bg-card border border-border"
              >
                <p className="text-4xl mb-3">👷</p>
                <p className="font-bold text-foreground">
                  Koi worker nahi mila
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Is distance mein koi worker available nahi hai
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Distance filter badhayein
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredWorkers.map((worker, i) => (
                  <motion.div
                    key={worker.id}
                    data-ocid={`nearby_jobs.worker_card.item.${i + 1}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-12 h-12 rounded-xl ${getAvatarColor(worker.name)} flex items-center justify-center shrink-0 text-white font-bold text-base shadow-sm`}
                        >
                          {getInitials(worker.name)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-foreground text-sm">
                              {worker.name}
                            </span>
                            {worker.verified && (
                              <span
                                title="Verified Worker"
                                className="flex items-center gap-0.5"
                              >
                                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 stroke-white" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-primary font-semibold">
                            {worker.skill}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              💼 {worker.exp}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {worker.location}
                            </span>
                          </div>
                        </div>

                        {/* Distance */}
                        <Badge className="shrink-0 text-[10px] bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-100 font-semibold px-2 py-0.5">
                          📍 {worker.distanceKm} KM
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          data-ocid={`nearby_jobs.worker.call_button.${i + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() => handleCall(worker.mobile)}
                          className="flex-1 text-xs font-semibold h-8 gap-1 border-border"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </Button>
                        <Button
                          data-ocid={`nearby_jobs.worker.whatsapp_button.${i + 1}`}
                          size="sm"
                          onClick={() =>
                            handleWhatsApp(worker.mobile, worker.name)
                          }
                          className="flex-1 text-xs font-semibold h-8 gap-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 shrink-0"
                          onClick={() => handleShare(worker.name)}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4"
      >
        <p className="text-xs font-semibold text-amber-800 flex items-start gap-2">
          <span className="text-base shrink-0">💡</span>
          <span>
            <strong>Tip:</strong> Job accept karne se pehle employer ya worker
            se payment terms confirm kar lein. KaamMitra Payment Complaint
            system aapki suraksha ke liye available hai.
          </span>
        </p>
      </motion.div>

      <div className="h-6" />
    </div>
  );
}
