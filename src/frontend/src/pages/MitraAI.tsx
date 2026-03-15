import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Mic,
  MicOff,
  Send,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
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

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  jobs?: MockJob[];
  workers?: MockWorker[];
  timestamp: Date;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_JOBS: MockJob[] = [
  {
    id: 1,
    company: "Metro Construction",
    role: "JCB Operator",
    salary: "₹18,000",
    salaryType: "month",
    city: "Delhi",
    distance: "3 km",
    phone: "9811000001",
  },
  {
    id: 2,
    company: "Road Project UP",
    role: "Helper",
    salary: "₹600",
    salaryType: "day",
    city: "Lucknow",
    distance: "5 km",
    phone: "9811000002",
  },
  {
    id: 3,
    company: "Private Contractor",
    role: "Driver",
    salary: "₹15,000",
    salaryType: "month",
    city: "Ghaziabad",
    distance: "6 km",
    phone: "9811000003",
  },
  {
    id: 4,
    company: "City Corp",
    role: "Electrician",
    salary: "₹700",
    salaryType: "day",
    city: "Noida",
    distance: "4 km",
    phone: "9811000004",
  },
  {
    id: 5,
    company: "BuildRight Ltd",
    role: "Mason",
    salary: "₹650",
    salaryType: "day",
    city: "Kanpur",
    distance: "2 km",
    phone: "9811000005",
  },
  {
    id: 6,
    company: "SkyBuild Infra",
    role: "Crane Operator",
    salary: "₹25,000",
    salaryType: "month",
    city: "Mumbai",
    distance: "8 km",
    phone: "9811000006",
  },
  {
    id: 7,
    company: "HomeCare Services",
    role: "Maid",
    salary: "₹8,000",
    salaryType: "month",
    city: "Delhi",
    distance: "2 km",
    phone: "9811000007",
  },
  {
    id: 8,
    company: "AgroFarm Ltd",
    role: "Tractor Driver",
    salary: "₹14,000",
    salaryType: "month",
    city: "Patna",
    distance: "10 km",
    phone: "9811000008",
  },
  {
    id: 9,
    company: "Rapid Build",
    role: "Excavator Operator",
    salary: "₹22,000",
    salaryType: "month",
    city: "Jaipur",
    distance: "7 km",
    phone: "9811000009",
  },
  {
    id: 10,
    company: "Smart Homes",
    role: "Plumber",
    salary: "₹600",
    salaryType: "day",
    city: "Agra",
    distance: "3 km",
    phone: "9811000010",
  },
  {
    id: 11,
    company: "GreenCity Projects",
    role: "Painter",
    salary: "₹550",
    salaryType: "day",
    city: "Ahmedabad",
    distance: "5 km",
    phone: "9811000011",
  },
  {
    id: 12,
    company: "Apex Constructions",
    role: "Carpenter",
    salary: "₹700",
    salaryType: "day",
    city: "Pune",
    distance: "4 km",
    phone: "9811000012",
  },
  {
    id: 13,
    company: "SecureGuard",
    role: "Security Guard",
    salary: "₹12,000",
    salaryType: "month",
    city: "Hyderabad",
    distance: "6 km",
    phone: "9811000013",
  },
  {
    id: 14,
    company: "QuickDeliver",
    role: "Delivery Boy",
    salary: "₹15,000",
    salaryType: "month",
    city: "Delhi",
    distance: "3 km",
    phone: "9811000014",
  },
  {
    id: 15,
    company: "Industrial Works",
    role: "Welder",
    salary: "₹800",
    salaryType: "day",
    city: "Surat",
    distance: "5 km",
    phone: "9811000015",
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
  {
    id: 11,
    name: "Geeta Bai",
    category: "Cook",
    experience: "8 years",
    city: "Jaipur",
    rating: 4.8,
    phone: "9821000011",
    verified: true,
  },
  {
    id: 12,
    name: "Sonu Tiwari",
    category: "Excavator Operator",
    experience: "7 years",
    city: "Noida",
    rating: 4.6,
    phone: "9821000012",
    verified: true,
  },
  {
    id: 13,
    name: "Arvind Maurya",
    category: "Carpenter",
    experience: "9 years",
    city: "Agra",
    rating: 4.5,
    phone: "9821000013",
    verified: false,
  },
  {
    id: 14,
    name: "Pooja Singh",
    category: "Security Guard",
    experience: "3 years",
    city: "Hyderabad",
    rating: 4.2,
    phone: "9821000014",
    verified: true,
  },
  {
    id: 15,
    name: "Raju Mistri",
    category: "Welder",
    experience: "15 years",
    city: "Surat",
    rating: 4.9,
    phone: "9821000015",
    verified: true,
  },
];

// ─── Intent Parser ────────────────────────────────────────────────────────────
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
  "Chandigarh",
  "Bhopal",
];

type Intent = "job_search" | "worker_finder" | "greeting" | "help" | "unknown";

interface ParsedQuery {
  intent: Intent;
  category: string | null;
  city: string | null;
}

function parseIntent(query: string): ParsedQuery {
  const q = query.toLowerCase();

  // Greeting
  if (/\b(hi|hello|namaste|helo|namaskar|jai hind|kya hal)\b/.test(q)) {
    return { intent: "greeting", category: null, city: null };
  }

  // Help
  if (/\b(help|madad|kya karte|kaise use|guide)\b/.test(q)) {
    return { intent: "help", category: null, city: null };
  }

  // Extract category
  let category: string | null = null;
  for (const cat of CATEGORIES) {
    if (q.includes(cat.toLowerCase())) {
      category = cat;
      break;
    }
  }
  // Also handle role words
  if (!category) {
    if (/driver/.test(q)) category = "Driver";
    else if (/helper|labour|mazdoor|mazdur/.test(q)) category = "Helper";
    else if (/maid|bai|kaam wali|cook|khana/.test(q)) category = "Maid";
    else if (/electric/.test(q)) category = "Electrician";
    else if (/plumb/.test(q)) category = "Plumber";
    else if (/mason|raj mistri|mistri/.test(q)) category = "Mason";
    else if (/guard|security/.test(q)) category = "Security Guard";
    else if (/weld/.test(q)) category = "Welder";
    else if (/paint/.test(q)) category = "Painter";
    else if (/carpent|wood/.test(q)) category = "Carpenter";
    else if (/crane/.test(q)) category = "Crane Operator";
    else if (/excavat/.test(q)) category = "Excavator";
  }

  // Extract city
  let city: string | null = null;
  for (const c of CITIES) {
    if (q.includes(c.toLowerCase())) {
      city = c;
      break;
    }
  }
  // Fallback to stored city
  if (!city) {
    try {
      const stored = localStorage.getItem("kaam_mitra_my_extended");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.city) city = parsed.city;
      }
    } catch (_) {}
  }

  // Determine intent
  const workerFinderKeywords =
    /chahiye|need|hire|dhundho worker|worker chahiye|operator chahiye|driver chahiye|helper chahiye|maid chahiye|cook chahiye|mil sakta|mil sakti|koi hai|koi milega/.test(
      q,
    );
  const jobSearchKeywords =
    /job|kaam chahiye|kaam dhundho|vacancy|kaam mil|work chahiye|opportunity|naukri|kaam dhundhna/.test(
      q,
    );

  if (workerFinderKeywords && !jobSearchKeywords) {
    return { intent: "worker_finder", category, city };
  }
  if (jobSearchKeywords || (category && !workerFinderKeywords)) {
    return { intent: "job_search", category, city };
  }
  if (category) {
    return { intent: "job_search", category, city };
  }

  return { intent: "unknown", category, city };
}

// ─── Response Generator ───────────────────────────────────────────────────────
function generateResponse(query: string): {
  text: string;
  jobs?: MockJob[];
  workers?: MockWorker[];
} {
  const { intent, category, city } = parseIntent(query);

  if (intent === "greeting") {
    return {
      text: `Namaste! 🙏 Main Mitra Assistant hoon — aapka AI Kaam Partner!\n\nAap mujhse pooch sakte hain:\n• Job dhundhne ke liye: "JCB operator job Delhi"\n• Worker dhundhne ke liye: "Driver chahiye Lucknow"\n• Kisi bhi kaam ki jankari ke liye bas type karein!\n\nKya chahiye aapko? 😊`,
    };
  }

  if (intent === "help") {
    return {
      text: `📋 Mitra Assistant se aap yeh pooch sakte hain:\n\n🔍 **Job Dhundhne ke liye:**\n• "JCB operator job Lucknow"\n• "Driver ka kaam chahiye"\n• "Helper vacancy Delhi"\n\n👷 **Worker Dhundhne ke liye:**\n• "Driver chahiye Ghaziabad"\n• "Maid chahiye Delhi"\n• "Electrician chahiye Noida"\n\n🌐 **Hindi, Hinglish ya English** mein type kar sakte hain!`,
    };
  }

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
    const loc = city || "aapke area";
    const cat = category || "available";
    if (displayJobs.length === 0) {
      return {
        text: `😕 Abhi ${loc} mein ${cat} ke liye koi job nahi mila.\n\nKripya doosre city ya category try karein, ya All India filter lagayein.`,
      };
    }
    return {
      text: `🔍 **${loc}** mein **${cat}** jobs mile:\n\nNeeche ke results dekhen aur Apply karein! 👇`,
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
    const loc = city || "aapke area";
    const cat = category || "available";
    if (displayWorkers.length === 0) {
      return {
        text: `😕 Abhi ${loc} mein ${cat} worker nahi mila.\n\nKripya doosre area ya category try karein.`,
      };
    }
    return {
      text: `✅ **${loc}** mein **${cat}** workers available hain:\n\nInhe directly contact karein ya Hire Now dabayein! 👇`,
      workers: displayWorkers,
    };
  }

  // unknown
  return {
    text: `🤔 Mujhe samajh nahi aaya. Kripya clearly likhein, jaise:\n• "JCB operator job Delhi"\n• "Driver chahiye Lucknow"\n\nHelp ke liye "help" likhein.`,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function JobCard({ job, index }: { job: MockJob; index: number }) {
  return (
    <div className="bg-white rounded-xl border border-orange-100 overflow-hidden shadow-sm mb-2">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm text-gray-900">{job.role}</p>
            <p className="text-xs text-gray-600">{job.company}</p>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-none text-xs shrink-0">
            {job.salary}/{job.salaryType}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          📍 {job.city} · {job.distance} away
        </p>
      </div>
      <div className="flex border-t border-orange-50">
        <button
          type="button"
          data-ocid={`mitra_ai.job_view_button.${index}`}
          className="flex-1 py-2 text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors border-r border-orange-50"
        >
          View Details
        </button>
        <a
          href={`tel:${job.phone}`}
          data-ocid={`mitra_ai.job_call_button.${index}`}
          className="flex-1 py-2 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors border-r border-orange-50 text-center block"
        >
          📞 Call
        </a>
        <button
          type="button"
          data-ocid={`mitra_ai.job_apply_button.${index}`}
          className="flex-1 py-2 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          ✅ Apply
        </button>
      </div>
    </div>
  );
}

function WorkerCard({ worker, index }: { worker: MockWorker; index: number }) {
  return (
    <div className="bg-white rounded-xl border border-orange-100 overflow-hidden shadow-sm mb-2">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0 font-bold text-orange-600 text-sm">
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
            <p className="text-xs text-gray-600">
              {worker.category} · {worker.experience}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">📍 {worker.city}</span>
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
          data-ocid={`mitra_ai.worker_call_button.${index}`}
          className="flex-1 py-2 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors border-r border-orange-50 text-center block"
        >
          📞 Call
        </a>
        <button
          type="button"
          data-ocid={`mitra_ai.worker_profile_button.${index}`}
          className="flex-1 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors border-r border-orange-50"
        >
          👤 Profile
        </button>
        <button
          type="button"
          data-ocid={`mitra_ai.worker_hire_button.${index}`}
          className="flex-1 py-2 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          ✅ Hire
        </button>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-orange-400"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

const SUGGESTIONS = [
  "JCB Operator Job",
  "Driver Chahiye",
  "Helper Kaam",
  "Electrician near me",
  "Crane Operator",
  "Maid chahiye",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MitraAI() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check voice support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  // Initial greeting
  useEffect(() => {
    const greeting: Message = {
      id: "init",
      role: "bot",
      text: `Namaste! 🙏 Main Mitra Assistant hoon — aapka AI Kaam Partner!\n\nAap mujhse pooch sakte hain:\n• Job dhundhne ke liye: "JCB operator job Delhi"\n• Worker dhundhne ke liye: "Driver chahiye Lucknow"\n\nKya chahiye aapko? 😊`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(
      () => {
        const resp = generateResponse(trimmed);
        const botMsg: Message = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: resp.text,
          jobs: resp.jobs,
          workers: resp.workers,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      },
      900 + Math.random() * 400,
    );
  }, []);

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoice = () => {
    if (!voiceSupported) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "hi-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => sendMessage(transcript), 300);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const showSuggestions =
    messages.length <= 1 ||
    (messages.length > 0 && messages[messages.length - 1].role === "bot");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="text-white/80 hover:text-white transition-colors p-1 -ml-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base leading-tight">
            Mitra Assistant
          </h1>
          <p className="text-white/70 text-xs">Aapka AI Kaam Partner 🤖</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-orange-600" />
                </div>
              )}
              <div
                className={`max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm bg-white text-gray-800 shadow-sm border border-gray-100"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, #ff6a00, #ee0979)",
                        }
                      : {}
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                </div>
                {/* Job cards */}
                {msg.jobs && msg.jobs.length > 0 && (
                  <div className="w-full mt-1">
                    {msg.jobs.map((job, i) => (
                      <JobCard key={job.id} job={job} index={i + 1} />
                    ))}
                  </div>
                )}
                {/* Worker cards */}
                {msg.workers && msg.workers.length > 0 && (
                  <div className="w-full mt-1">
                    {msg.workers.map((worker, i) => (
                      <WorkerCard
                        key={worker.id}
                        worker={worker}
                        index={i + 1}
                      />
                    ))}
                  </div>
                )}
                <span className="text-xs text-gray-400">
                  {msg.timestamp.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start gap-2"
          >
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-orange-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
              <TypingDots />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && !isTyping && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-2 overflow-x-auto"
          >
            <div className="flex gap-2 pb-1">
              {SUGGESTIONS.map((s, i) => (
                <button
                  type="button"
                  key={s}
                  data-ocid={`mitra_ai.suggestion.${i + 1}`}
                  onClick={() => sendMessage(s)}
                  className="whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="px-3 pb-safe pb-4 pt-2 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
            <input
              ref={inputRef}
              data-ocid="mitra_ai.chat_input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Apna kaam puchiye... (Example: Delhi me JCB operator job hai?)"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
          </div>
          <button
            type="button"
            data-ocid="mitra_ai.voice_button"
            onClick={handleVoice}
            disabled={!voiceSupported}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : voiceSupported
                  ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {voiceSupported ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            data-ocid="mitra_ai.send_button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ee0979)" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
