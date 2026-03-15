import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CONTRACT_CATEGORIES,
  type ContractDuration,
  type ContractJob,
  loadAllContractJobs,
} from "../lib/constants";

const DURATIONS: ContractDuration[] = [
  "1 Month",
  "4 Months",
  "6 Months",
  "1 Year",
];

const MOCK_WORKERS = [
  {
    id: "c1",
    name: "Ramu Lal Patel",
    category: "JCB Operator",
    experience: "7 years",
    city: "Lucknow",
    salaryExpected: "₹25,000/month",
    availability: "available" as const,
    verified: true,
    rating: 4.7,
    docs: ["Aadhaar", "DL"],
    mobile: "9600000001",
  },
  {
    id: "c2",
    name: "Shyam Sundar",
    category: "Crane Operator",
    experience: "5 years",
    city: "Mumbai",
    salaryExpected: "₹30,000/month",
    availability: "available" as const,
    verified: true,
    rating: 4.8,
    docs: ["Aadhaar", "DL", "Experience Cert"],
    mobile: "9600000002",
  },
  {
    id: "c3",
    name: "Mohan Das",
    category: "Electrician",
    experience: "4 years",
    city: "Delhi",
    salaryExpected: "₹18,000/month",
    availability: "busy" as const,
    verified: true,
    rating: 4.3,
    docs: ["Aadhaar", "ITI Certificate"],
    mobile: "9600000003",
  },
  {
    id: "c4",
    name: "Deepak Kumar",
    category: "Car Driver",
    experience: "6 years",
    city: "Pune",
    salaryExpected: "₹20,000/month",
    availability: "available" as const,
    verified: false,
    rating: 4.2,
    docs: ["Aadhaar", "DL"],
    mobile: "9600000004",
  },
  {
    id: "c5",
    name: "Suresh Bind",
    category: "Helper / Labour",
    experience: "3 years",
    city: "Kanpur",
    salaryExpected: "₹12,000/month",
    availability: "available" as const,
    verified: true,
    rating: 4.5,
    docs: ["Aadhaar"],
    mobile: "9600000005",
  },
  {
    id: "c6",
    name: "Vijay Sharma",
    category: "Plumber",
    experience: "8 years",
    city: "Jaipur",
    salaryExpected: "₹22,000/month",
    availability: "available" as const,
    verified: true,
    rating: 4.6,
    docs: ["Aadhaar", "Experience Cert"],
    mobile: "9600000006",
  },
];

export function LongTermHiring() {
  const navigate = useNavigate();
  const [durationFilter, setDurationFilter] = useState<
    ContractDuration | "All"
  >("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [hireDialog, setHireDialog] = useState<(typeof MOCK_WORKERS)[0] | null>(
    null,
  );
  const [hireDuration, setHireDuration] = useState<ContractDuration>("1 Month");
  const [hireDate, setHireDate] = useState("");
  const [contractJobs] = useState<ContractJob[]>(() => loadAllContractJobs());

  const filteredWorkers = MOCK_WORKERS.filter((w) => {
    if (categoryFilter !== "All" && w.category !== categoryFilter) return false;
    return true;
  });

  function handleHire() {
    if (!hireDialog) return;
    toast.success(`Contract request bheja gaya ${hireDialog.name} ko!`);
    setHireDialog(null);
  }

  return (
    <div className="page-container pt-0">
      {/* Header */}
      <div className="-mx-4 px-6 pt-8 pb-10 bg-gradient-to-br from-indigo-600 to-blue-700 text-white mb-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-display font-black mb-1">
            Long Term Hiring 📋
          </h1>
          <p className="text-indigo-100 text-sm">
            Monthly aur contract workers dhundein
          </p>
        </motion.div>
      </div>

      {/* Info Banner */}
      <div className="-mx-4 px-4 py-3 mb-4 bg-amber-50 border-y border-amber-200">
        <p className="text-amber-800 text-xs font-medium">
          📌 For monthly or long term hiring, please contact the worker or
          company directly.
        </p>
      </div>

      {/* Duration Filter Pills */}
      <div className="mb-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Duration
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(["All", ...DURATIONS] as const).map((d) => (
            <button
              key={d}
              type="button"
              data-ocid="hiring.duration.tab"
              onClick={() => setDurationFilter(d as ContractDuration | "All")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                durationFilter === d
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-foreground border-border"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Category
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(["All", ...CONTRACT_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              data-ocid="hiring.category.tab"
              onClick={() => setCategoryFilter(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                categoryFilter === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-foreground border-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Post Requirement CTA */}
      <motion.button
        data-ocid="hiring.post_requirement_button"
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/post-contract-job" })}
        className="w-full mb-5 rounded-2xl bg-indigo-600 text-white px-5 py-4 flex items-center justify-between shadow-md"
      >
        <div>
          <div className="font-display font-bold text-base">
            Company hain? Post karein apni requirement
          </div>
          <div className="text-indigo-200 text-xs mt-0.5">
            Long term workers hire karein
          </div>
        </div>
        <span className="text-2xl">→</span>
      </motion.button>

      {/* Workers List */}
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Available Contract Workers
      </h2>
      <div className="space-y-3 mb-8">
        {filteredWorkers.map((worker, i) => (
          <motion.div
            key={worker.id}
            data-ocid={`hiring.worker.item.${i + 1}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <Card className="border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-foreground">
                        {worker.name}
                      </span>
                      {worker.verified && (
                        <span className="text-xs text-green-600 font-semibold">
                          ✅ Verified
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          worker.availability === "available"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            worker.availability === "available"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        {worker.availability === "available"
                          ? "Available"
                          : "Busy"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {worker.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        📍 {worker.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    ⭐ {worker.rating}
                  </span>
                  <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                    {worker.experience} exp
                  </span>
                  <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    {worker.salaryExpected}
                  </span>
                </div>

                {/* Docs */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {worker.docs.map((doc) => (
                    <span
                      key={doc}
                      className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                    >
                      📄 {doc}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    data-ocid={`hiring.worker.call_button.${i + 1}`}
                    href={`tel:${worker.mobile}`}
                    className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    📞 Call
                  </a>
                  <a
                    data-ocid={`hiring.worker.secondary_button.${i + 1}`}
                    href={`https://wa.me/91${worker.mobile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl border border-green-300 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                  <button
                    type="button"
                    data-ocid={`hiring.worker.primary_button.${i + 1}`}
                    onClick={() => setHireDialog(worker)}
                    disabled={worker.availability === "busy"}
                    className="flex items-center justify-center rounded-xl bg-indigo-600 text-white py-2 text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hire 📋
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Posted Contract Jobs */}
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Posted Contract Jobs
      </h2>
      {contractJobs.length === 0 ? (
        <div
          data-ocid="hiring.jobs.empty_state"
          className="text-center py-10 bg-muted/30 rounded-2xl border border-border mb-8"
        >
          <p className="text-3xl mb-2">📋</p>
          <p className="font-semibold text-foreground text-sm">
            Koi contract job post nahi hai abhi
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Post button se pehli requirement daalo
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {contractJobs.map((job, i) => (
            <Card
              key={job.id}
              data-ocid={`hiring.job.item.${i + 1}`}
              className="border-border"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary">{job.category}</Badge>
                    <p className="font-bold text-foreground mt-1">
                      {job.contractorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📍 {job.workLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-bold text-sm">
                      ₹{job.salaryPerMonth.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.duration}
                    </p>
                    {job.accommodationProvided && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        🏠 Accommodation
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`tel:${job.contactNumber}`}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold"
                >
                  📞 Contact: {job.contactNumber}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hire Dialog */}
      <Dialog open={!!hireDialog} onOpenChange={() => setHireDialog(null)}>
        <DialogContent data-ocid="hiring.hire_dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              Hire {hireDialog?.name} 📋
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Contract Duration
              </Label>
              <RadioGroup
                value={hireDuration}
                onValueChange={(v) => setHireDuration(v as ContractDuration)}
                className="grid grid-cols-2 gap-2"
              >
                {DURATIONS.map((d) => (
                  <div key={d} className="flex items-center space-x-2">
                    <RadioGroupItem
                      data-ocid={"hiring.hire.duration.radio"}
                      value={d}
                      id={`dur-${d}`}
                    />
                    <Label
                      htmlFor={`dur-${d}`}
                      className="text-sm cursor-pointer"
                    >
                      {d}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label
                htmlFor="hire-date"
                className="text-sm font-semibold mb-1.5 block"
              >
                Start Date
              </Label>
              <input
                id="hire-date"
                type="date"
                data-ocid="hiring.hire.date.input"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="hiring.hire.cancel_button"
              onClick={() => setHireDialog(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="hiring.hire.confirm_button"
              onClick={handleHire}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Confirm Hire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
