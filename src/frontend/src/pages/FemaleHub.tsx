import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  Shield,
  Star,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_WORKERS = [
  {
    id: 1,
    name: "Priya Sharma",
    age: 26,
    category: "Office Staff",
    city: "Delhi",
    state: "Delhi",
    expYears: 3,
    expMonths: 0,
    experience: "3 Years 0 Months",
    salary: "₹18,000/month",
    rating: 4.7,
    verified: true,
    availability: "Full-time",
    skills: ["HR", "Accounts", "MS Office"],
    phone: "98XXXXXX01",
    whatsapp: "9800000001",
  },
  {
    id: 2,
    name: "Sunita Devi",
    age: 34,
    category: "Maid / Helper",
    city: "Mumbai",
    state: "Maharashtra",
    expYears: 8,
    expMonths: 6,
    experience: "8 Years 6 Months",
    salary: "₹500/day",
    rating: 4.5,
    verified: true,
    availability: "Part-time",
    skills: ["Cleaning", "Cooking", "Laundry"],
    phone: "98XXXXXX02",
    whatsapp: "9800000002",
  },
  {
    id: 3,
    name: "Neha Gupta",
    age: 23,
    category: "Office Staff",
    city: "Noida",
    state: "Uttar Pradesh",
    expYears: 1,
    expMonths: 3,
    experience: "1 Year 3 Months",
    salary: "₹14,000/month",
    rating: 4.2,
    verified: false,
    availability: "Full-time",
    skills: ["Data Entry", "Excel", "Typing"],
    phone: "98XXXXXX03",
  },
  {
    id: 4,
    name: "Rekha Kumari",
    age: 38,
    category: "Maid / Helper",
    city: "Patna",
    state: "Bihar",
    expYears: 12,
    expMonths: 0,
    experience: "12 Years",
    salary: "₹400/day",
    rating: 4.8,
    verified: true,
    availability: "Shifts",
    skills: ["Housekeeping", "Elder Care", "Babysitting"],
    phone: "98XXXXXX04",
    whatsapp: "9800000004",
  },
  {
    id: 5,
    name: "Anjali Singh",
    age: 28,
    category: "Private Jobs",
    city: "Lucknow",
    state: "Uttar Pradesh",
    expYears: 3,
    expMonths: 4,
    experience: "3 Years 4 Months",
    salary: "₹16,000/month",
    rating: 4.3,
    verified: true,
    availability: "Full-time",
    skills: ["Sales", "Customer Support", "Telecalling"],
    phone: "98XXXXXX05",
    whatsapp: "9800000005",
  },
  {
    id: 6,
    name: "Kavita Yadav",
    age: 30,
    category: "Other Skills",
    city: "Jaipur",
    state: "Rajasthan",
    expYears: 2,
    expMonths: 8,
    experience: "2 Years 8 Months",
    salary: "₹12,000/month",
    rating: 4.0,
    verified: false,
    availability: "Part-time",
    skills: ["Computer", "Typing", "DTP"],
    phone: "98XXXXXX06",
  },
  {
    id: 7,
    name: "Meena Patel",
    age: 25,
    category: "Office Staff",
    city: "Ahmedabad",
    state: "Gujarat",
    expYears: 1,
    expMonths: 0,
    experience: "1 Year",
    salary: "₹13,000/month",
    rating: 4.1,
    verified: true,
    availability: "Full-time",
    skills: ["Receptionist", "Filing", "Communication"],
    phone: "98XXXXXX07",
    whatsapp: "9800000007",
  },
  {
    id: 8,
    name: "Savita Rani",
    age: 42,
    category: "Maid / Helper",
    city: "Kanpur",
    state: "Uttar Pradesh",
    expYears: 15,
    expMonths: 2,
    experience: "15 Years 2 Months",
    salary: "₹450/day",
    rating: 4.6,
    verified: true,
    availability: "Shifts",
    skills: ["Cooking", "Cleaning", "Child Care"],
    phone: "98XXXXXX08",
  },
];

type Worker = (typeof MOCK_WORKERS)[0];

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "🏠 Maid/Helper", value: "Maid / Helper" },
  { label: "💼 Office Staff", value: "Office Staff" },
  { label: "🏢 Private Jobs", value: "Private Jobs" },
  { label: "💡 Other Skills", value: "Other Skills" },
];

const DISTANCES = ["5KM", "10KM", "25KM", "All India"];
const AVAILABILITY_OPTS = ["All", "Full-time", "Part-time", "Shifts"];

function categoryColor(cat: string) {
  if (cat === "Maid / Helper") return "bg-emerald-100 text-emerald-800";
  if (cat === "Office Staff") return "bg-blue-100 text-blue-800";
  if (cat === "Private Jobs") return "bg-purple-100 text-purple-800";
  return "bg-orange-100 text-orange-800";
}

function availabilityColor(av: string) {
  if (av === "Full-time") return "bg-green-100 text-green-800";
  if (av === "Part-time") return "bg-blue-100 text-blue-700";
  return "bg-orange-100 text-orange-700";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatExperience(years: number, months: number): string {
  if (years === 0 && months === 0) return "Fresher";
  const yPart = years > 0 ? `${years} Year${years !== 1 ? "s" : ""}` : "";
  const mPart = months > 0 ? `${months} Month${months !== 1 ? "s" : ""}` : "";
  return [yPart, mPart].filter(Boolean).join(" ");
}

const EXP_FILTER_OPTIONS = [
  { label: "Any Experience", value: "0" },
  { label: "1+ Years", value: "1" },
  { label: "2+ Years", value: "2" },
  { label: "3+ Years", value: "3" },
  { label: "5+ Years", value: "5" },
  { label: "7+ Years", value: "7" },
  { label: "10+ Years", value: "10" },
  { label: "15+ Years", value: "15" },
  { label: "20+ Years", value: "20" },
];

const EXP_YEARS_OPTIONS = [
  ...Array.from({ length: 31 }, (_, i) => ({
    label: `${i} Year${i !== 1 ? "s" : ""}`,
    value: String(i),
  })),
  { label: "30+ Years", value: "30+" },
];

const EXP_MONTHS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i} Month${i !== 1 ? "s" : ""}`,
  value: String(i),
}));

const DEMO_MESSAGES = [
  {
    from: "employer",
    text: "Hello, I need a maid for daily work.",
    time: "10:00 AM",
  },
  {
    from: "worker",
    text: "Namaste ji, main available hoon. Kya kaam hai?",
    time: "10:02 AM",
  },
  {
    from: "employer",
    text: "Cooking aur cleaning chahiye. Morning 8 to 12.",
    time: "10:05 AM",
  },
  {
    from: "worker",
    text: "Ji bilkul, kal se aa sakti hoon. Rate kya hoga?",
    time: "10:07 AM",
  },
];

function WorkerCard({
  worker,
  onHire,
  onMessage,
  index,
}: {
  worker: Worker;
  onHire: (w: Worker) => void;
  onMessage: (w: Worker) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`female_hub.worker.item.${index + 1}`}
    >
      <Card className="overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Top row */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-12 h-12 shrink-0 ring-2 ring-rose-200">
              <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white font-bold text-sm">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground text-sm">
                  {worker.name}
                </span>
                {worker.verified && (
                  <span className="inline-flex items-center gap-0.5 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold text-amber-600">
                  {worker.rating}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {worker.age} yrs ·{" "}
                  {formatExperience(worker.expYears, worker.expMonths)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {worker.city}, {worker.state}
                </span>
              </div>
            </div>
          </div>

          {/* Chips row */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${categoryColor(worker.category)}`}
            >
              {worker.category}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${availabilityColor(worker.availability)}`}
            >
              <Clock className="inline w-2.5 h-2.5 mr-0.5" />
              {worker.availability}
            </span>
          </div>

          {/* Salary */}
          <div className="bg-rose-50 rounded-lg px-3 py-2 mb-3">
            <span className="text-xs text-muted-foreground">Expected: </span>
            <span className="text-sm font-bold text-rose-700">
              {worker.salary}
            </span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {worker.skills.map((s) => (
              <span
                key={s}
                className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 border-green-200 text-green-700 hover:bg-green-50"
                data-ocid={`female_hub.worker.button.${index + 1}`}
                onClick={() => window.open(`tel:${worker.phone}`)}
              >
                <Phone className="w-3 h-3 mr-1" /> Call
              </Button>
              {"whatsapp" in worker && worker.whatsapp ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                  data-ocid={`female_hub.whatsapp.button.${index + 1}`}
                  onClick={() =>
                    window.open(`https://wa.me/91${worker.whatsapp}`, "_blank")
                  }
                >
                  💬 WhatsApp
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                  data-ocid={`female_hub.message.button.${index + 1}`}
                  onClick={() => onMessage(worker)}
                >
                  <MessageSquare className="w-3 h-3 mr-1" /> Message
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {"whatsapp" in worker && worker.whatsapp && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                  data-ocid={`female_hub.message.button.${index + 1}`}
                  onClick={() => onMessage(worker)}
                >
                  <MessageSquare className="w-3 h-3 mr-1" /> Message
                </Button>
              )}
              <Button
                size="sm"
                className={`text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white ${"whatsapp" in worker && worker.whatsapp ? "" : "col-span-2"}`}
                data-ocid={`female_hub.hire.button.${index + 1}`}
                onClick={() => onHire(worker)}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Hire Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BrowseTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [distance, setDistance] = useState("All India");
  const [availability, setAvailability] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [hireOpen, setHireOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgWorker, setMsgWorker] = useState<Worker | null>(null);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [msgInput, setMsgInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minExp, setMinExp] = useState("0");

  // Hire form state
  const [jobTitle, setJobTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [salaryOffer, setSalaryOffer] = useState("");
  const [hireMsg, setHireMsg] = useState("");

  const filtered = MOCK_WORKERS.filter((w) => {
    if (verifiedOnly && !w.verified) return false;
    if (category !== "all" && w.category !== category) return false;
    if (availability !== "All" && w.availability !== availability) return false;
    const minExpVal = minExp === "0" ? 0 : Number(minExp);
    if (minExpVal > 0 && w.expYears < minExpVal) return false;
    if (
      search &&
      !w.name.toLowerCase().includes(search.toLowerCase()) &&
      !w.city.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  function sendMsg() {
    if (!msgInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        from: "employer",
        text: msgInput,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMsgInput("");
  }

  function submitHire() {
    toast.success(`Job request sent to ${selectedWorker?.name}!`);
    setHireOpen(false);
    setJobTitle("");
    setStartDate("");
    setDuration("");
    setSalaryOffer("");
    setHireMsg("");
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or city..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="female_hub.search_input"
        />
      </div>

      {/* Filter toggle */}
      <Button
        variant="outline"
        size="sm"
        className="w-full flex items-center gap-2 text-sm"
        onClick={() => setShowFilters((v) => !v)}
        data-ocid="female_hub.filter.toggle"
      >
        <Filter className="w-4 h-4" /> Filters
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
      </Button>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-3 space-y-3">
              {/* Category */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Work Category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      data-ocid={"female_hub.category.tab"}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                        category === c.value
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-background border-border text-foreground hover:border-rose-300"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Distance
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DISTANCES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistance(d)}
                      data-ocid="female_hub.distance.tab"
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                        distance === d
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-background border-border text-foreground hover:border-blue-300"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Availability
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABILITY_OPTS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvailability(a)}
                      data-ocid="female_hub.availability.tab"
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                        availability === a
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-background border-border text-foreground hover:border-green-300"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Experience Filter */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Min. Experience
                </p>
                <Select value={minExp} onValueChange={setMinExp}>
                  <SelectTrigger
                    className="h-8 text-xs"
                    data-ocid="female_hub.browse.exp_filter_select"
                  >
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXP_FILTER_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Only */}
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Verified Profiles Only
                </Label>
                <Switch
                  checked={verifiedOnly}
                  onCheckedChange={setVerifiedOnly}
                  data-ocid="female_hub.verified_only.switch"
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} workers found
      </p>

      {/* Worker grid */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="female_hub.empty_state"
        >
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-sm">No workers found. Try changing filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w, i) => (
            <WorkerCard
              key={w.id}
              worker={w}
              index={i}
              onHire={(worker) => {
                setSelectedWorker(worker);
                setHireOpen(true);
              }}
              onMessage={(worker) => {
                setMsgWorker(worker);
                setMessages(DEMO_MESSAGES);
                setMsgOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Hire Sheet */}
      <Sheet open={hireOpen} onOpenChange={setHireOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] overflow-y-auto rounded-t-2xl"
          data-ocid="female_hub.hire.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-rose-700">
              <CheckCircle2 className="w-5 h-5" />
              Send Job Request
            </SheetTitle>
          </SheetHeader>

          {selectedWorker && (
            <div className="space-y-4">
              {/* Worker mini profile */}
              <div className="flex items-center gap-3 bg-rose-50 rounded-xl p-3">
                <Avatar className="w-12 h-12 ring-2 ring-rose-300">
                  <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white font-bold">
                    {getInitials(selectedWorker.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm">{selectedWorker.name}</p>
                    {selectedWorker.verified && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedWorker.category} · {selectedWorker.city}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium">
                      {selectedWorker.rating} ·{" "}
                      {formatExperience(
                        selectedWorker.expYears,
                        selectedWorker.expMonths,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work History Mock */}
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-semibold mb-2">Work History</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    ✅ Completed 12 jobs · ⭐ Avg rating 4.6
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📅 Last worked: March 2026 · Delhi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    🔒 Documents verified by Admin
                  </p>
                </div>
              </div>

              <Separator />
              <p className="text-sm font-bold">Job Request Details</p>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Job Title</Label>
                  <Input
                    placeholder="e.g. Daily Housekeeping"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1"
                    data-ocid="female_hub.hire.job_title.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                      data-ocid="female_hub.hire.start_date.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Duration</Label>
                    <Input
                      placeholder="1 month"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="mt-1"
                      data-ocid="female_hub.hire.duration.input"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Salary Offered</Label>
                  <Input
                    placeholder="₹15,000/month"
                    value={salaryOffer}
                    onChange={(e) => setSalaryOffer(e.target.value)}
                    className="mt-1"
                    data-ocid="female_hub.hire.salary.input"
                  />
                </div>
                <div>
                  <Label className="text-xs">Message</Label>
                  <Textarea
                    placeholder="Describe the job briefly..."
                    value={hireMsg}
                    onChange={(e) => setHireMsg(e.target.value)}
                    className="mt-1 min-h-[80px]"
                    data-ocid="female_hub.hire.message.textarea"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <p className="text-xs text-amber-800">
                  💳 Payment terms to be discussed directly with the worker
                  after accepting.
                </p>
              </div>

              <Button
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                onClick={submitHire}
                data-ocid="female_hub.hire.submit_button"
              >
                Send Job Request
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Message Sheet */}
      <Sheet open={msgOpen} onOpenChange={setMsgOpen}>
        <SheetContent
          side="bottom"
          className="h-[80vh] flex flex-col rounded-t-2xl"
          data-ocid="female_hub.message.sheet"
        >
          <SheetHeader className="mb-2">
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Chat with {msgWorker?.name}
            </SheetTitle>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            {messages.map((m) => (
              <div
                key={m.text + m.time}
                className={`flex ${m.from === "employer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    m.from === "employer"
                      ? "bg-rose-600 text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <p>{m.text}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${m.from === "employer" ? "text-rose-200" : "text-muted-foreground"}`}
                  >
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Type a message..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              className="flex-1"
              data-ocid="female_hub.message.input"
            />
            <Button
              size="icon"
              className="bg-rose-600 hover:bg-rose-700 shrink-0"
              onClick={sendMsg}
              data-ocid="female_hub.message.send_button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PostJobTab() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    city: "",
    state: "",
    salaryRate: "",
    salaryType: "month",
    availability: "",
    description: "",
    experience: "",
    contactName: "",
    contactMobile: "",
    verifiedOnly: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Job posted successfully! Workers will be notified.");
    setForm({
      title: "",
      category: "",
      city: "",
      state: "",
      salaryRate: "",
      salaryType: "month",
      availability: "",
      description: "",
      experience: "",
      contactName: "",
      contactMobile: "",
      verifiedOnly: false,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-xs font-semibold">Job Title *</Label>
        <Input
          placeholder="e.g. Office Assistant Needed"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="mt-1"
          required
          data-ocid="female_hub.post_job.title.input"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold">Work Category *</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger
            className="mt-1"
            data-ocid="female_hub.post_job.category.select"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Maid / Helper">
              🏠 Maid / Helper / Domestic Work
            </SelectItem>
            <SelectItem value="Office Staff">
              💼 Office Staff (HR, Accountant)
            </SelectItem>
            <SelectItem value="Private Jobs">
              🏢 Private Company Jobs
            </SelectItem>
            <SelectItem value="Other Skills">
              💡 Other Skills (Typing, Computer)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs font-semibold">City *</Label>
          <Input
            placeholder="Delhi"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="mt-1"
            required
            data-ocid="female_hub.post_job.city.input"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">State</Label>
          <Input
            placeholder="Delhi"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className="mt-1"
            data-ocid="female_hub.post_job.state.input"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold">Salary / Rate *</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="₹ Amount"
            value={form.salaryRate}
            onChange={(e) =>
              setForm((f) => ({ ...f, salaryRate: e.target.value }))
            }
            className="flex-1"
            required
            data-ocid="female_hub.post_job.salary.input"
          />
          <Select
            value={form.salaryType}
            onValueChange={(v) => setForm((f) => ({ ...f, salaryType: v }))}
          >
            <SelectTrigger
              className="w-28"
              data-ocid="female_hub.post_job.salary_type.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Per Day</SelectItem>
              <SelectItem value="month">Per Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold">Availability Required</Label>
        <Select
          value={form.availability}
          onValueChange={(v) => setForm((f) => ({ ...f, availability: v }))}
        >
          <SelectTrigger
            className="mt-1"
            data-ocid="female_hub.post_job.availability.select"
          >
            <SelectValue placeholder="Select availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Shifts">Shifts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold">Job Description</Label>
        <Textarea
          placeholder="Describe the work requirements..."
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="mt-1 min-h-[80px]"
          data-ocid="female_hub.post_job.description.textarea"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold">Preferred Experience</Label>
        <Select
          value={form.experience}
          onValueChange={(v) => setForm((f) => ({ ...f, experience: v }))}
        >
          <SelectTrigger
            className="mt-1"
            data-ocid="female_hub.post_job.experience.select"
          >
            <SelectValue placeholder="Any experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fresher">Fresher OK</SelectItem>
            <SelectItem value="1year">1+ Year</SelectItem>
            <SelectItem value="2-3years">2-3 Years</SelectItem>
            <SelectItem value="5plus">5+ Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs font-semibold">Contact Name</Label>
          <Input
            placeholder="Your name"
            value={form.contactName}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactName: e.target.value }))
            }
            className="mt-1"
            data-ocid="female_hub.post_job.contact_name.input"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Mobile</Label>
          <Input
            placeholder="98XXXXXXXX"
            value={form.contactMobile}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactMobile: e.target.value }))
            }
            className="mt-1"
            data-ocid="female_hub.post_job.mobile.input"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <Label className="text-xs font-semibold text-blue-800">
          Require Verified Profiles Only
        </Label>
        <Switch
          checked={form.verifiedOnly}
          onCheckedChange={(v) => setForm((f) => ({ ...f, verifiedOnly: v }))}
          data-ocid="female_hub.post_job.verified_only.switch"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-rose-600 hover:bg-rose-700 text-white"
        data-ocid="female_hub.post_job.submit_button"
      >
        Post Job
      </Button>
    </form>
  );
}

function RegisterTab() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [bioLen, setBioLen] = useState(0);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Female",
    mobile: "",
    otp: "",
    whatsapp: "",
    email: "",
    expYears: "",
    expMonths: "",
    category: "",
    state: "",
    city: "",
    zip: "",
    availability: "",
    salary: "",
    bio: "",
    languages: [] as string[],
    timing: "",
  });
  const [idFile, setIdFile] = useState<string | null>(null);
  const [expFile, setExpFile] = useState<string | null>(null);
  const [eduFile, setEduFile] = useState<string | null>(null);

  const [workerId] = useState(
    () => `KM-F-${Math.floor(10000 + Math.random() * 90000)}`,
  );

  function sendOtp() {
    setOtpSent(true);
    setDemoOtp("4521");
  }

  function toggleLang(lang: string) {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter((l) => l !== lang)
        : [...f.languages, lang],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("success");
  }

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
        data-ocid="female_hub.register.success_state"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          Profile Submitted! ✓
        </h3>
        <p className="text-muted-foreground text-sm">
          Admin will verify your profile within 24 hours.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">
              You will receive a Blue Verified Badge after approval
            </p>
          </div>
          <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 font-mono text-sm font-bold text-blue-700">
            Worker ID: {workerId}
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
          <p className="text-xs text-rose-700">
            📱 You will be notified when job offers arrive
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setStep("form")}
          data-ocid="female_hub.register.back_button"
        >
          Register Another Profile
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── SECTION 1: Personal Details ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-rose-500 rounded-full" />
          <h3 className="font-bold text-base text-foreground">
            1. Personal Details
          </h3>
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
            {form.name ? getInitials(form.name) : "👩"}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-rose-300 text-rose-700"
            data-ocid="female_hub.register.photo.upload_button"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Photo
          </Button>
        </div>

        {/* Full Name */}
        <div className="mb-3">
          <Label className="text-xs font-semibold">Full Name *</Label>
          <Input
            placeholder="Priya Sharma"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1"
            required
            data-ocid="female_hub.register.name_input"
          />
        </div>

        {/* Age */}
        <div className="mb-3">
          <Label className="text-xs font-semibold">Age *</Label>
          <Input
            type="number"
            min={18}
            max={60}
            placeholder="25"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            className="mt-1 max-w-[120px]"
            required
            data-ocid="female_hub.register.age.input"
          />
        </div>

        {/* Gender radio cards */}
        <div className="mb-3">
          <Label className="text-xs font-semibold">Gender</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm((f) => ({ ...f, gender: g }))}
                className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-colors text-center ${
                  form.gender === g
                    ? g === "Female"
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-border bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:border-rose-200"
                }`}
              >
                {g === "Male"
                  ? "👨 Male"
                  : g === "Female"
                    ? "👩 Female"
                    : "🌈 Other"}
              </button>
            ))}
          </div>
          {form.gender === "Female" && (
            <div className="mt-1.5 flex items-center gap-1.5 bg-pink-50 border border-pink-200 rounded-lg px-3 py-1.5">
              <span className="text-pink-500 text-xs">🔒</span>
              <span className="text-[11px] text-pink-700 font-medium">
                Female Worker Hub — extra safety & privacy
              </span>
            </div>
          )}
        </div>

        {/* Mobile + OTP */}
        <div className="mb-3">
          <Label className="text-xs font-semibold">Mobile Number *</Label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="98XXXXXXXX"
              value={form.mobile}
              onChange={(e) =>
                setForm((f) => ({ ...f, mobile: e.target.value }))
              }
              className="flex-1"
              required
              data-ocid="female_hub.register.mobile.input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-rose-300 text-rose-700 text-xs"
              onClick={sendOtp}
              data-ocid="female_hub.register.send_otp.button"
            >
              Send OTP
            </Button>
          </div>
          {otpSent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 space-y-2"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="text-xs text-amber-800 font-semibold">
                  📱 Demo OTP:{" "}
                  <span className="font-mono text-lg text-amber-900">
                    {demoOtp}
                  </span>
                </p>
              </div>
              <Input
                placeholder="Enter OTP"
                value={form.otp}
                onChange={(e) =>
                  setForm((f) => ({ ...f, otp: e.target.value }))
                }
                data-ocid="female_hub.register.otp.input"
              />
            </motion.div>
          )}
        </div>

        {/* WhatsApp Number */}
        <div className="mb-3">
          <Label className="text-xs font-semibold">
            WhatsApp Number{" "}
            <span className="text-muted-foreground font-normal">
              (Optional – recommended for direct contact)
            </span>
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">💬</span>
            <Input
              placeholder="WhatsApp number"
              value={form.whatsapp}
              onChange={(e) =>
                setForm((f) => ({ ...f, whatsapp: e.target.value }))
              }
              className="flex-1 border-green-200 focus-visible:ring-green-400"
              data-ocid="female_hub.register.whatsapp_input"
            />
          </div>
          <p className="text-[11px] text-green-700 mt-1">
            ✓ Employers can reach you directly on WhatsApp
          </p>
        </div>

        {/* Email */}
        <div className="mb-3">
          <Label className="text-xs font-semibold">Email Address</Label>
          <Input
            type="email"
            placeholder="priya@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1"
            data-ocid="female_hub.register.email.input"
          />
        </div>

        {/* Location: State / City / ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <Label className="text-xs font-semibold">State</Label>
            <Input
              placeholder="Uttar Pradesh"
              value={form.state}
              onChange={(e) =>
                setForm((f) => ({ ...f, state: e.target.value }))
              }
              className="mt-1"
              data-ocid="female_hub.register.state.input"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">City *</Label>
            <Input
              placeholder="Delhi"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="mt-1"
              required
              data-ocid="female_hub.register.city.input"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">Zip / PIN Code</Label>
            <Input
              placeholder="110001"
              value={form.zip}
              onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
              className="mt-1"
              data-ocid="female_hub.register.zip_input"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ── SECTION 2: Work Details ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-rose-500 rounded-full" />
          <h3 className="font-bold text-base text-foreground">
            2. Work Details
          </h3>
        </div>

        {/* Work Category */}
        <div className="mb-4">
          <Label className="text-xs font-semibold">Work Category *</Label>
          <div
            className="grid grid-cols-2 gap-2 mt-2"
            data-ocid="female_hub.register.category_select"
          >
            {[
              {
                icon: "🧹",
                label: "Maid / Helper / Domestic Work",
                value: "Maid / Helper",
              },
              {
                icon: "💼",
                label: "Office Staff (HR / Accountant / Assistant)",
                value: "Office Staff",
              },
              {
                icon: "🏢",
                label: "Private Company Jobs",
                value: "Private Jobs",
              },
              {
                icon: "💻",
                label: "Other Skills (Typing, Computer, Customer Support)",
                value: "Other Skills",
              },
            ].map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                className={`p-3 rounded-xl border-2 text-left transition-colors ${
                  form.category === cat.value
                    ? "border-rose-500 bg-rose-50"
                    : "border-border bg-background hover:border-rose-200"
                }`}
              >
                <span className="text-xl block mb-1">{cat.icon}</span>
                <span className="text-xs font-semibold leading-tight block">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Work Experience — years + months */}
        <div className="mb-4">
          <Label className="text-xs font-semibold">Work Experience *</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 pl-0.5">
                Years
              </p>
              <Select
                value={form.expYears}
                onValueChange={(v) => setForm((f) => ({ ...f, expYears: v }))}
              >
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="female_hub.register.exp_years_select"
                >
                  <SelectValue placeholder="0 Years" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {EXP_YEARS_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-sm"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 pl-0.5">
                Months
              </p>
              <Select
                value={form.expMonths}
                onValueChange={(v) => setForm((f) => ({ ...f, expMonths: v }))}
              >
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="female_hub.register.exp_months_select"
                >
                  <SelectValue placeholder="0 Months" />
                </SelectTrigger>
                <SelectContent>
                  {EXP_MONTHS_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-sm"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Live preview badge */}
          {(form.expYears !== "" && form.expYears !== "0") ||
          (form.expMonths !== "" && form.expMonths !== "0") ? (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-full">
                <Briefcase className="w-3 h-3" />
                Experience:{" "}
                {formatExperience(
                  form.expYears === "30+" ? 30 : Number(form.expYears || 0),
                  Number(form.expMonths || 0),
                )}
                {form.expYears === "30+" ? "+" : ""}
              </span>
            </div>
          ) : null}
        </div>

        {/* Availability */}
        <div className="mb-4">
          <Label className="text-xs font-semibold">Availability *</Label>
          <div className="flex gap-2 mt-2">
            {["Full-time", "Part-time", "Shifts"].map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setForm((f) => ({ ...f, availability: av }))}
                className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-colors ${
                  form.availability === av
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-border text-muted-foreground hover:border-rose-200"
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Expected Salary */}
        <div className="mb-2">
          <Label className="text-xs font-semibold">
            Expected Salary / Rate
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground font-bold text-lg shrink-0">
              ₹
            </span>
            <Input
              placeholder="12,000/month or 500/day"
              value={form.salary}
              onChange={(e) =>
                setForm((f) => ({ ...f, salary: e.target.value }))
              }
              data-ocid="female_hub.register.salary.input"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ── SECTION 3: Document Verification ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-rose-500 rounded-full" />
          <h3 className="font-bold text-base text-foreground">
            3. Document Verification
          </h3>
        </div>

        {/* Upload slots */}
        <div className="space-y-2 mb-4">
          {/* ID Proof */}
          <label className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl p-3 hover:border-rose-300 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setIdFile(e.target.files?.[0]?.name ?? null)}
            />
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${idFile ? "bg-green-100" : "bg-rose-50"}`}
            >
              {idFile ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Upload className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">
                ID Proof (Aadhaar / Voter ID / Passport){" "}
                <span className="text-rose-500">*</span>
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {idFile ?? "Tap to upload file (JPG, PNG, PDF)"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5"
              data-ocid="female_hub.register.id_upload_button"
              onClick={(e) => {
                e.preventDefault();
                (
                  e.currentTarget.previousElementSibling?.previousElementSibling
                    ?.previousElementSibling as HTMLInputElement
                )?.click();
              }}
            >
              {idFile ? "Change" : "Upload"}
            </button>
          </label>

          {/* Experience Cert */}
          <label className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl p-3 hover:border-rose-300 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setExpFile(e.target.files?.[0]?.name ?? null)}
            />
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${expFile ? "bg-green-100" : "bg-amber-50"}`}
            >
              {expFile ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Briefcase className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">
                Experience Certificates / Work Proof{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {expFile ?? "Tap to upload file (JPG, PNG, PDF)"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5"
              data-ocid="female_hub.register.exp_cert_upload_button"
              onClick={(e) => {
                e.preventDefault();
                (
                  e.currentTarget.previousElementSibling?.previousElementSibling
                    ?.previousElementSibling as HTMLInputElement
                )?.click();
              }}
            >
              {expFile ? "Change" : "Upload"}
            </button>
          </label>

          {/* Education Cert */}
          <label className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl p-3 hover:border-rose-300 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setEduFile(e.target.files?.[0]?.name ?? null)}
            />
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${eduFile ? "bg-green-100" : "bg-blue-50"}`}
            >
              {eduFile ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Upload className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">
                Education Certificates{" "}
                <span className="text-muted-foreground font-normal">
                  (If applicable)
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {eduFile ?? "Tap to upload file (JPG, PNG, PDF)"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5"
              data-ocid="female_hub.register.edu_cert_upload_button"
              onClick={(e) => {
                e.preventDefault();
                (
                  e.currentTarget.previousElementSibling?.previousElementSibling
                    ?.previousElementSibling as HTMLInputElement
                )?.click();
              }}
            >
              {eduFile ? "Change" : "Upload"}
            </button>
          </label>
        </div>

        {/* Verification Status card */}
        <div className="bg-gray-50 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700">
                Verification Status: Not Submitted
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Documents not yet uploaded
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
            🔍 Admin will review your documents and add a{" "}
            <strong>Verified Badge</strong> to your profile once approved.
          </p>
        </div>
      </div>

      <Separator />

      {/* ── SECTION 4: Additional Details ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-rose-500 rounded-full" />
          <h3 className="font-bold text-base text-foreground">
            4. Additional Details
          </h3>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <Label className="text-xs font-semibold">
            Short Bio / Cover Note
          </Label>
          <div className="relative mt-1">
            <Textarea
              placeholder="Tell employers about yourself — your skills, work style, and availability..."
              maxLength={300}
              rows={4}
              value={form.bio}
              onChange={(e) => {
                setForm((f) => ({ ...f, bio: e.target.value }));
                setBioLen(e.target.value.length);
              }}
              className="resize-none"
              data-ocid="female_hub.register.bio_textarea"
            />
            <span
              className={`absolute bottom-2 right-3 text-[10px] ${bioLen > 270 ? "text-rose-500" : "text-muted-foreground"}`}
            >
              {bioLen}/300
            </span>
          </div>
        </div>

        {/* Languages Known */}
        <div className="mb-4">
          <Label className="text-xs font-semibold">Languages Known</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              "Hindi",
              "English",
              "Tamil",
              "Telugu",
              "Marathi",
              "Bengali",
              "Other",
            ].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLang(lang)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  form.languages.includes(lang)
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-border text-muted-foreground hover:border-rose-200"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Work Timing */}
        <div className="mb-4">
          <Label className="text-xs font-semibold">Preferred Work Timing</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: "🌅 Morning", sub: "6am – 2pm", value: "Morning" },
              { label: "☀️ Afternoon", sub: "2pm – 10pm", value: "Afternoon" },
              { label: "🌙 Night", sub: "10pm – 6am", value: "Night" },
              { label: "🕐 Flexible", sub: "Any time", value: "Flexible" },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, timing: t.value }))}
                className={`p-3 rounded-xl border-2 text-left transition-colors ${
                  form.timing === t.value
                    ? "border-rose-500 bg-rose-50"
                    : "border-border hover:border-rose-200"
                }`}
              >
                <p className="text-xs font-semibold">{t.label}</p>
                <p className="text-[10px] text-muted-foreground">{t.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Safety note */}
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
          <p className="text-xs text-pink-800 leading-relaxed">
            Your phone number and documents are visible only to verified
            employers. You can report or block any employer at any time.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white font-semibold py-5 text-base shadow-md"
        data-ocid="female_hub.register.submit_button"
      >
        Submit Registration
      </Button>
    </form>
  );
}

export function FemaleHub() {
  const navigate = useNavigate();
  const [workerBannerDismissed, setWorkerBannerDismissed] = useState(false);
  const [employerBannerDismissed, setEmployerBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            data-ocid="female_hub.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl">👩‍💼</span>
          <div>
            <h1 className="font-bold text-base leading-tight">
              Female Job Hub
            </h1>
            <p className="text-rose-200 text-[11px]">
              Hire Maids, Staff & Office Workers
            </p>
          </div>
          <div className="ml-auto">
            <Bell className="w-5 h-5 text-white/80" />
          </div>
        </div>
      </header>

      <main className="max-w-[520px] mx-auto px-4 pt-3 space-y-3">
        {/* Notification banners */}
        <AnimatePresence>
          {!workerBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2"
              data-ocid="female_hub.worker_notification.toast"
            >
              <span className="text-sm">🔔</span>
              <p className="flex-1 text-xs text-amber-800 font-medium">
                You have 2 new job offers! Tap to view.
              </p>
              <button
                type="button"
                onClick={() => setWorkerBannerDismissed(true)}
                className="text-amber-600 hover:text-amber-800"
                data-ocid="female_hub.worker_notification.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!employerBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 flex items-center gap-2"
              data-ocid="female_hub.employer_notification.toast"
            >
              <span className="text-sm">✅</span>
              <p className="flex-1 text-xs text-green-800 font-medium">
                Worker Priya Sharma accepted your job request.
              </p>
              <button
                type="button"
                onClick={() => setEmployerBannerDismissed(true)}
                className="text-green-600 hover:text-green-800"
                data-ocid="female_hub.employer_notification.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="w-full rounded-xl bg-rose-50 border border-rose-200 p-1">
            <TabsTrigger
              value="browse"
              className="flex-1 text-xs rounded-lg data-[state=active]:bg-rose-600 data-[state=active]:text-white"
              data-ocid="female_hub.browse.tab"
            >
              <Search className="w-3 h-3 mr-1" /> Browse
            </TabsTrigger>
            <TabsTrigger
              value="post"
              className="flex-1 text-xs rounded-lg data-[state=active]:bg-rose-600 data-[state=active]:text-white"
              data-ocid="female_hub.post_job.tab"
            >
              <Briefcase className="w-3 h-3 mr-1" /> Post Job
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1 text-xs rounded-lg data-[state=active]:bg-rose-600 data-[state=active]:text-white"
              data-ocid="female_hub.register.tab"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" /> Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-3">
            <BrowseTab />
          </TabsContent>

          <TabsContent value="post" className="mt-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-rose-600" />
                  Post a Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PostJobTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="mt-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>👩‍💼</span>
                  Register as Female Worker
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Kaam Mitra platform par apni skill ke hisab se job dhundh
                  sakti hain.
                </p>
              </CardHeader>
              <CardContent>
                <RegisterTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
