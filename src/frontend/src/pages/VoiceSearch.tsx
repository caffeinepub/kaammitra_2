import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Mic, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface MockJob {
  id: number;
  company: string;
  role: string;
  salary: string;
  salaryType: string;
  city: string;
  distance: string;
  phone: string;
}

interface MockWorker {
  id: number;
  name: string;
  category: string;
  experience: string;
  city: string;
  rating: number;
  phone: string;
  verified: boolean;
}

const MOCK_JOBS: MockJob[] = [
  {
    id: 1,
    company: "Metro Construction",
    role: "JCB Operator",
    salary: "\u20b918,000",
    salaryType: "month",
    city: "Delhi",
    distance: "3 km",
    phone: "9811000001",
  },
  {
    id: 2,
    company: "Road Project UP",
    role: "Helper",
    salary: "\u20b9600",
    salaryType: "day",
    city: "Lucknow",
    distance: "5 km",
    phone: "9811000002",
  },
  {
    id: 3,
    company: "Private Contractor",
    role: "Driver",
    salary: "\u20b915,000",
    salaryType: "month",
    city: "Ghaziabad",
    distance: "6 km",
    phone: "9811000003",
  },
  {
    id: 4,
    company: "City Corp",
    role: "Electrician",
    salary: "\u20b9700",
    salaryType: "day",
    city: "Noida",
    distance: "4 km",
    phone: "9811000004",
  },
  {
    id: 5,
    company: "BuildRight Ltd",
    role: "Mason",
    salary: "\u20b9650",
    salaryType: "day",
    city: "Kanpur",
    distance: "2 km",
    phone: "9811000005",
  },
  {
    id: 6,
    company: "SkyBuild Infra",
    role: "Crane Operator",
    salary: "\u20b925,000",
    salaryType: "month",
    city: "Mumbai",
    distance: "8 km",
    phone: "9811000006",
  },
  {
    id: 7,
    company: "HomeCare Services",
    role: "Maid",
    salary: "\u20b98,000",
    salaryType: "month",
    city: "Delhi",
    distance: "2 km",
    phone: "9811000007",
  },
  {
    id: 8,
    company: "AgroFarm Ltd",
    role: "Tractor Driver",
    salary: "\u20b914,000",
    salaryType: "month",
    city: "Patna",
    distance: "10 km",
    phone: "9811000008",
  },
  {
    id: 9,
    company: "Rapid Build",
    role: "Excavator Operator",
    salary: "\u20b922,000",
    salaryType: "month",
    city: "Jaipur",
    distance: "7 km",
    phone: "9811000009",
  },
  {
    id: 10,
    company: "Smart Homes",
    role: "Plumber",
    salary: "\u20b9600",
    salaryType: "day",
    city: "Agra",
    distance: "3 km",
    phone: "9811000010",
  },
];

const MOCK_WORKERS: MockWorker[] = [
  {
    id: 1,
    name: "Ramesh Kumar",
    category: "JCB Operator",
    experience: "6 years",
    city: "Delhi",
    rating: 4.8,
    phone: "9821000001",
    verified: true,
  },
  {
    id: 2,
    name: "Irfan Ahmed",
    category: "Driver",
    experience: "4 years",
    city: "Lucknow",
    rating: 4.5,
    phone: "9821000002",
    verified: false,
  },
  {
    id: 3,
    name: "Sandeep Singh",
    category: "Helper",
    experience: "2 years",
    city: "Ghaziabad",
    rating: 4.2,
    phone: "9821000003",
    verified: true,
  },
  {
    id: 4,
    name: "Priya Devi",
    category: "Maid",
    experience: "5 years",
    city: "Delhi",
    rating: 4.7,
    phone: "9821000004",
    verified: true,
  },
  {
    id: 5,
    name: "Suresh Yadav",
    category: "Electrician",
    experience: "8 years",
    city: "Noida",
    rating: 4.9,
    phone: "9821000005",
    verified: true,
  },
  {
    id: 6,
    name: "Mohd. Raza",
    category: "Crane Operator",
    experience: "10 years",
    city: "Mumbai",
    rating: 4.6,
    phone: "9821000006",
    verified: true,
  },
  {
    id: 7,
    name: "Anju Sharma",
    category: "Maid",
    experience: "7 years",
    city: "Delhi",
    rating: 4.5,
    phone: "9821000007",
    verified: true,
  },
  {
    id: 8,
    name: "Rajesh Bind",
    category: "Mason",
    experience: "12 years",
    city: "Kanpur",
    rating: 4.7,
    phone: "9821000008",
    verified: false,
  },
  {
    id: 9,
    name: "Vikram Patel",
    category: "Plumber",
    experience: "5 years",
    city: "Ahmedabad",
    rating: 4.4,
    phone: "9821000009",
    verified: true,
  },
  {
    id: 10,
    name: "Deepak Chaurasiya",
    category: "Painter",
    experience: "3 years",
    city: "Lucknow",
    rating: 4.3,
    phone: "9821000010",
    verified: false,
  },
];

const CATEGORIES = [
  "JCB",
  "Crane",
  "Excavator",
  "Driver",
  "Helper",
  "Electrician",
  "Plumber",
  "Mason",
  "Maid",
  "Cook",
  "Painter",
  "Carpenter",
  "Guard",
  "Welder",
  "Tractor",
];
const CITIES = [
  "Delhi",
  "Mumbai",
  "Lucknow",
  "Ghaziabad",
  "Noida",
  "Kanpur",
  "Agra",
  "Jaipur",
  "Patna",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Surat",
  "Ahmedabad",
];

type Intent = "job_search" | "worker_finder" | "greeting" | "unknown";
interface ParsedQuery {
  intent: Intent;
  category: string | null;
  city: string | null;
}

function parseIntent(query: string): ParsedQuery {
  const q = query.toLowerCase();
  if (/\b(hi|hello|namaste|helo|namaskar)\b/.test(q))
    return { intent: "greeting", category: null, city: null };

  let category: string | null = null;
  for (const cat of CATEGORIES) {
    if (q.includes(cat.toLowerCase())) {
      category = cat;
      break;
    }
  }
  if (!category) {
    if (/driver/.test(q)) category = "Driver";
    else if (/helper|labour|mazdoor/.test(q)) category = "Helper";
    else if (/maid|bai|cook/.test(q)) category = "Maid";
    else if (/electric/.test(q)) category = "Electrician";
    else if (/plumb/.test(q)) category = "Plumber";
    else if (/mason|mistri/.test(q)) category = "Mason";
    else if (/crane/.test(q)) category = "Crane Operator";
    else if (/excavat/.test(q)) category = "Excavator";
  }

  let city: string | null = null;
  for (const c of CITIES) {
    if (q.includes(c.toLowerCase())) {
      city = c;
      break;
    }
  }
  if (!city) {
    try {
      const stored = localStorage.getItem("kaam_mitra_my_extended");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.city) city = parsed.city;
      }
    } catch (_) {}
  }

  const isWorkerSearch =
    /chahiye|need|hire|worker chahiye|operator chahiye|driver chahiye|helper chahiye|maid chahiye/.test(
      q,
    );
  const isJobSearch = /job|kaam chahiye|vacancy|naukri/.test(q);

  if (isWorkerSearch && !isJobSearch)
    return { intent: "worker_finder", category, city };
  if (isJobSearch || (category && !isWorkerSearch))
    return { intent: "job_search", category, city };
  if (category) return { intent: "job_search", category, city };
  return { intent: "unknown", category, city };
}

function generateResponse(query: string): {
  text: string;
  jobs?: MockJob[];
  workers?: MockWorker[];
} {
  const { intent, category, city } = parseIntent(query);
  if (intent === "greeting")
    return { text: "Namaste! \ud83d\ude4f Bolkar kaam dhundo!" };
  if (intent === "job_search") {
    let jobs = MOCK_JOBS;
    if (category)
      jobs = jobs.filter((j) =>
        j.role.toLowerCase().includes(category!.toLowerCase()),
      );
    if (city)
      jobs = jobs.filter((j) => j.city.toLowerCase() === city!.toLowerCase());
    if (jobs.length === 0)
      jobs = MOCK_JOBS.filter(
        (j) =>
          !category || j.role.toLowerCase().includes(category!.toLowerCase()),
      ).slice(0, 3);
    const displayJobs = jobs.slice(0, 4);
    if (displayJobs.length === 0)
      return { text: "Koi job nahi mila. Doosra city ya category try karein." };
    return {
      text: `${city || "Aapke area"} mein ${category || "available"} jobs:`,
      jobs: displayJobs,
    };
  }
  if (intent === "worker_finder") {
    let workers = MOCK_WORKERS;
    if (category)
      workers = workers.filter((w) =>
        w.category.toLowerCase().includes(category!.toLowerCase()),
      );
    if (city)
      workers = workers.filter(
        (w) => w.city.toLowerCase() === city!.toLowerCase(),
      );
    if (workers.length === 0)
      workers = MOCK_WORKERS.filter(
        (w) =>
          !category ||
          w.category.toLowerCase().includes(category!.toLowerCase()),
      ).slice(0, 3);
    const displayWorkers = workers.slice(0, 4);
    if (displayWorkers.length === 0)
      return { text: "Koi worker nahi mila. Doosra area try karein." };
    return {
      text: `${city || "Aapke area"} mein ${category || "available"} workers:`,
      workers: displayWorkers,
    };
  }
  return {
    text: "Samajh nahi aaya. Phir se bolein, jaise: JCB operator job Delhi ya Driver chahiye Lucknow.",
  };
}

function VoiceJobCard({ job, index }: { job: MockJob; index: number }) {
  return (
    <div className="bg-white/95 rounded-2xl border border-orange-100 overflow-hidden shadow-sm mb-3">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm text-gray-900">{job.role}</p>
            <p className="text-xs text-gray-500">{job.company}</p>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-none text-xs shrink-0">
            {job.salary}/{job.salaryType}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {job.city} · {job.distance} away
        </p>
      </div>
      <div className="flex border-t border-orange-50">
        <button
          type="button"
          data-ocid={`voice_search.job_view_button.${index}`}
          className="flex-1 py-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors border-r border-orange-100"
        >
          View Details
        </button>
        <a
          href={`tel:${job.phone}`}
          data-ocid={`voice_search.job_call_button.${index}`}
          className="flex-1 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors border-r border-orange-100 text-center block"
        >
          Call
        </a>
        <button
          type="button"
          data-ocid={`voice_search.job_apply_button.${index}`}
          className="flex-1 py-2.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function VoiceWorkerCard({
  worker,
  index,
}: { worker: MockWorker; index: number }) {
  return (
    <div className="bg-white/95 rounded-2xl border border-orange-100 overflow-hidden shadow-sm mb-3">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 font-bold text-orange-600">
            {worker.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-bold text-sm text-gray-900 truncate">
                {worker.name}
              </p>
              {worker.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {worker.category} · {worker.experience}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{worker.city}</span>
              <span className="flex items-center gap-0.5 text-xs text-amber-600">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {worker.rating}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-t border-orange-50">
        <a
          href={`tel:${worker.phone}`}
          data-ocid={`voice_search.worker_call_button.${index}`}
          className="flex-1 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors border-r border-orange-100 text-center block"
        >
          Call
        </a>
        <button
          type="button"
          data-ocid={`voice_search.worker_profile_button.${index}`}
          className="flex-1 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-r border-orange-100"
        >
          Profile
        </button>
        <button
          type="button"
          data-ocid={`voice_search.worker_hire_button.${index}`}
          className="flex-1 py-2.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          Hire
        </button>
      </div>
    </div>
  );
}

type VoiceState = "idle" | "listening" | "processing";

const EXAMPLES = [
  "JCB operator job chahiye",
  "Driver chahiye Delhi mein",
  "Helper ka kaam Lucknow",
];

export default function VoiceSearch() {
  const navigate = useNavigate();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [resultText, setResultText] = useState("");
  const [resultJobs, setResultJobs] = useState<MockJob[] | undefined>(
    undefined,
  );
  const [resultWorkers, setResultWorkers] = useState<MockWorker[] | undefined>(
    undefined,
  );
  const [hasResults, setHasResults] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const voiceStateRef = useRef<VoiceState>("idle");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRec);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when results appear
  useEffect(() => {
    voiceStateRef.current = voiceState;
    if (hasResults && resultsRef.current) {
      setTimeout(
        () =>
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        400,
      );
    }
  }, [hasResults, voiceState]);

  function processQuery(query: string) {
    setVoiceState("processing");
    setTranscript(query);
    setTimeout(() => {
      const resp = generateResponse(query);
      setResultText(resp.text);
      setResultJobs(resp.jobs);
      setResultWorkers(resp.workers);
      setHasResults(true);
      setVoiceState("idle");
    }, 800);
  }

  function startListening() {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    setHasResults(false);
    setTranscript("");
    setVoiceState("listening");

    const rec = new SpeechRec();
    rec.lang = "hi-IN";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      setTranscript(finalText || interimText);
      if (finalText) {
        rec.stop();
        processQuery(finalText);
      }
    };
    rec.onerror = () => setVoiceState("idle");
    rec.onend = () => {
      if (voiceStateRef.current === "listening") setVoiceState("idle");
    };
    recognitionRef.current = rec;
    rec.start();
  }

  function handleMicTap() {
    if (voiceState === "listening") {
      recognitionRef.current?.stop();
      setVoiceState("idle");
    } else if (voiceState === "idle") {
      startListening();
    }
  }

  function handleExampleChip(text: string) {
    setHasResults(false);
    setTranscript(text);
    processQuery(text);
  }

  function handleRetry() {
    setHasResults(false);
    setTranscript("");
    setResultJobs(undefined);
    setResultWorkers(undefined);
    setResultText("");
    setVoiceState("idle");
  }

  const statusText =
    voiceState === "idle"
      ? "Tap karke bolein"
      : voiceState === "listening"
        ? "Sun raha hoon... Boliye"
        : "Samajh raha hoon...";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #c2410c 0%, #ea580c 40%, #dc2626 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-4 shrink-0">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-white font-black text-lg tracking-tight">
          Bolkar Kaam Dhundo
        </h1>
        <div className="w-9" />
      </div>

      {/* Main UI */}
      <div className="flex-1 flex flex-col items-center px-6 pt-6">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-white text-xl font-bold text-center mb-10 leading-snug"
        >
          Boliye, hum sun rahe hain...
        </motion.p>

        {/* Mic */}
        <div className="relative flex items-center justify-center mb-6">
          {voiceState === "listening" && (
            <>
              <motion.div
                className="absolute rounded-full bg-white/20"
                style={{ width: 160, height: 160 }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute rounded-full bg-white/15"
                style={{ width: 200, height: 200 }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                transition={{
                  duration: 1.6,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.3,
                }}
              />
            </>
          )}
          <motion.button
            type="button"
            data-ocid="voice_search.mic_button"
            onClick={handleMicTap}
            disabled={voiceState === "processing"}
            whileTap={{ scale: 0.93 }}
            className={`w-24 h-24 rounded-full shadow-2xl flex items-center justify-center transition-colors z-10 relative ${voiceState === "listening" ? "bg-red-500" : "bg-white"} disabled:opacity-60`}
            aria-label={
              voiceState === "listening"
                ? "Stop listening"
                : "Start voice search"
            }
          >
            <Mic
              className={`w-10 h-10 ${voiceState === "listening" ? "text-white" : "text-orange-500"}`}
            />
          </motion.button>
        </div>

        {/* Status */}
        <motion.p
          key={voiceState}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-semibold text-center mb-4 ${voiceState === "listening" ? "text-red-200" : "text-white/80"}`}
        >
          {statusText}
        </motion.p>

        {/* Live transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-5 px-5 py-3 rounded-2xl bg-white/20 backdrop-blur-sm max-w-xs text-center"
            >
              <p className="text-white text-sm font-medium">
                &#34;{transcript}&#34;
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Examples */}
        <AnimatePresence>
          {!hasResults && voiceState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex flex-col items-center gap-2 mb-5 w-full max-w-xs"
            >
              <p className="text-white/60 text-xs font-medium mb-1">
                Example queries:
              </p>
              {EXAMPLES.map((ex, i) => (
                <button
                  type="button"
                  key={ex}
                  data-ocid={`voice_search.example.${i + 1}`}
                  onClick={() => handleExampleChip(ex)}
                  className="w-full px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors border border-white/30 text-left"
                >
                  {ex}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text fallback */}
        <button
          type="button"
          data-ocid="voice_search.go_text_button"
          onClick={() => navigate({ to: "/mitra-ai" })}
          className="text-white/60 text-xs hover:text-white/90 transition-colors underline underline-offset-2 mb-6"
        >
          Type karke search karein
        </button>

        {!voiceSupported && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-white/15 max-w-xs text-center">
            <p className="text-white text-sm font-medium">
              Aapka browser voice search support nahi karta. Please type karein.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/mitra-ai" })}
              className="mt-3 px-4 py-2 bg-white text-orange-600 rounded-full text-xs font-bold"
            >
              Mitra AI pe jaayein
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            ref={resultsRef}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="mx-3 mb-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-2">
              <p className="text-white font-bold text-sm">{resultText}</p>
            </div>
            {resultJobs && resultJobs.length > 0 && (
              <div className="px-3 pb-2">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
                  Jobs Found:
                </p>
                {resultJobs.map((job, i) => (
                  <VoiceJobCard key={job.id} job={job} index={i + 1} />
                ))}
              </div>
            )}
            {resultWorkers && resultWorkers.length > 0 && (
              <div className="px-3 pb-2">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
                  Workers Available:
                </p>
                {resultWorkers.map((worker, i) => (
                  <VoiceWorkerCard
                    key={worker.id}
                    worker={worker}
                    index={i + 1}
                  />
                ))}
              </div>
            )}
            <div className="px-3 pb-4">
              <button
                type="button"
                data-ocid="voice_search.retry_button"
                onClick={handleRetry}
                className="w-full py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-colors border border-white/30"
              >
                Dobara Bolein
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
