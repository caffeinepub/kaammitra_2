import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Filter,
  IndianRupee,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Job } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { useGetAllJobs } from "../hooks/useQueries";
import {
  CATEGORIES,
  type JobApplication,
  getMyExtendedProfile,
  loadAllExtendedJobs,
  loadJobApplications,
  saveJobApplication,
} from "../lib/constants";

const SKELETON_IDS = ["sk1", "sk2", "sk3"];

function timeAgo(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const diff = Date.now() - ms;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function FindWork() {
  const navigate = useNavigate();
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  // Apply Dialog state
  const [applyJob, setApplyJob] = useState<{
    job: Job;
    jobTitle: string;
    contactNumber: string;
  } | null>(null);

  const { data: jobs, isLoading } = useGetAllJobs(
    category !== "all" ? category : undefined,
    debouncedLocation || undefined,
  );

  const extendedJobs = loadAllExtendedJobs();
  const myProfile = getMyExtendedProfile();

  // Build set of already-applied jobIds for this worker
  const appliedJobIds = new Set(
    myProfile
      ? loadJobApplications()
          .filter((a) => a.workerMobile === myProfile.mobile)
          .map((a) => a.jobId)
      : [],
  );

  // Reset pagination when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, debouncedLocation]);

  // Memoized filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs ?? [];
  }, [jobs]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    const t = setTimeout(() => setDebouncedLocation(val), 400);
    return () => clearTimeout(t);
  };

  function handleApplyClick(job: Job) {
    if (!myProfile) {
      toast.error("Pehle apna profile banao!");
      navigate({ to: "/create-profile" });
      return;
    }
    const ext = extendedJobs[job.id.toString()];
    setApplyJob({
      job,
      jobTitle: ext?.jobTitle ?? job.category,
      contactNumber: ext?.contactNumber ?? "",
    });
  }

  function handleConfirmApply() {
    if (!applyJob || !myProfile) return;

    // Load worker's basic profile for name/experience/salary
    let workerName = myProfile.mobile;
    let workerExperience = "";
    let workerSalary = "";
    let workerCategory = "";
    let workerCity = myProfile.city ?? "";
    try {
      const raw = localStorage.getItem("workerProfile");
      if (raw) {
        const p = JSON.parse(raw) as Record<string, string>;
        workerName = p.name || myProfile.mobile;
        workerExperience = p.experience || "";
        workerSalary = p.salary || "";
        workerCategory = p.category || "";
        workerCity = p.city || myProfile.city || "";
      }
    } catch {
      /* ignore */
    }

    const application: JobApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      jobId: applyJob.job.id.toString(),
      jobTitle: applyJob.jobTitle,
      contractorMobile: applyJob.contactNumber,
      workerName,
      workerMobile: myProfile.mobile,
      workerCategory,
      workerExperience,
      workerCity,
      workerSalary,
      appliedAt: Date.now(),
      status: "pending",
    };

    saveJobApplication(application);
    toast.success("Application bhej di gayi! 🎉");
    setApplyJob(null);
  }

  // Get worker display info for dialog
  let workerDisplayName = myProfile?.mobile ?? "";
  let workerDisplayCategory = "";
  let workerDisplayExp = "";
  let workerDisplayCity = myProfile?.city ?? "";
  let workerDisplaySalary = "";
  try {
    const raw = localStorage.getItem("workerProfile");
    if (raw) {
      const p = JSON.parse(raw) as Record<string, string>;
      workerDisplayName = p.name || workerDisplayName;
      workerDisplayCategory = p.category || "";
      workerDisplayExp = p.experience || "";
      workerDisplayCity = p.city || workerDisplayCity;
      workerDisplaySalary = p.salary || "";
    }
  } catch {
    /* ignore */
  }

  return (
    <div className="page-container pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-black">Find Work</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 touch-btn"
          onClick={() => navigate({ to: "/create-profile" })}
        >
          + Profile Banao
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 items-center">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            data-ocid="find_work.category_select"
            className="flex-1 touch-btn h-11"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          data-ocid="find_work.location_input"
          placeholder="City / Location"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="flex-1 h-11"
        />
      </div>

      {/* Job Listings */}
      <div data-ocid="find_work.list" className="space-y-3">
        {isLoading ? (
          SKELETON_IDS.map((id) => (
            <div
              key={id}
              data-ocid="find_work.loading_state"
              className="card-elevated p-4 space-y-2"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))
        ) : !jobs || jobs.length === 0 ? (
          <div
            data-ocid="find_work.empty_state"
            className="card-elevated p-10 text-center"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-display font-bold text-lg text-foreground">
              Koi Job Nahi Mila
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try different filters or check back later
            </p>
            <Button
              className="mt-4 touch-btn"
              onClick={() => {
                setCategory("all");
                setLocation("");
                setDebouncedLocation("");
              }}
            >
              Sab Dekhein
            </Button>
          </div>
        ) : (
          <>
            <p
              data-ocid="find_work.results_count"
              className="text-xs text-muted-foreground mb-2"
            >
              Showing {Math.min(visibleCount, filteredJobs.length)} of{" "}
              {filteredJobs.length} jobs
            </p>
            {visibleJobs.map((job: Job, idx: number) => {
              const ext = extendedJobs[job.id.toString()];
              const alreadyApplied = appliedJobIds.has(job.id.toString());
              return (
                <div
                  key={job.id.toString()}
                  data-ocid={`find_work.item.${idx + 1}`}
                  className="card-elevated p-4 animate-slide-up"
                >
                  {ext ? (
                    // Enhanced card with extended data
                    <>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-display font-bold text-base text-foreground leading-tight">
                          {ext.jobTitle}
                        </h3>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3" />
                          {timeAgo(job.createdAt)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <CategoryBadge category={job.category} />
                        <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                          👷 {ext.workersNeeded} Workers
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          ⏱ {ext.workDuration}
                        </span>
                        {ext.salaryType === "daily" ? (
                          <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Daily
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Monthly
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-foreground mb-3 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="text-xs font-semibold text-primary flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {job.payOffered}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {job.postedBy}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {ext.contactNumber && (
                          <a
                            href={`tel:${ext.contactNumber}`}
                            data-ocid={`find_work.item.call_button.${idx + 1}`}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                          >
                            <Phone className="w-3 h-3" />📞 Call
                          </a>
                        )}
                        {alreadyApplied ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            data-ocid={`find_work.apply_button.${idx + 1}`}
                            onClick={() => handleApplyClick(job)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                          >
                            <Briefcase className="w-3.5 h-3.5" /> Apply for Job
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    // Legacy card layout
                    <>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CategoryBadge category={job.category} />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {timeAgo(job.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-3 leading-relaxed">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="text-xs font-semibold text-primary flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {job.payOffered}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {job.postedBy}
                        </span>
                      </div>
                      {alreadyApplied ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          data-ocid={`find_work.apply_button.${idx + 1}`}
                          onClick={() => handleApplyClick(job)}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors mt-1"
                        >
                          <Briefcase className="w-3.5 h-3.5" /> Apply for Job
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {visibleCount < filteredJobs.length && (
              <button
                type="button"
                data-ocid="find_work.load_more_button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="w-full py-3 text-sm font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors"
              >
                Load More ({filteredJobs.length - visibleCount} more jobs)
              </button>
            )}
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <Button
          variant="outline"
          className="touch-btn w-full"
          onClick={() => navigate({ to: "/create-profile" })}
        >
          Worker Profile Banao →
        </Button>
      </div>

      {/* Apply Confirmation Dialog */}
      <Dialog
        open={!!applyJob}
        onOpenChange={(open) => !open && setApplyJob(null)}
      >
        <DialogContent
          data-ocid="find_work.apply_dialog"
          className="mx-4 rounded-2xl max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-black text-lg">
              Job Apply Karo
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Yeh profile contractor ko bheji jayegi:
            </p>

            {applyJob && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-2">
                <div className="font-display font-bold text-sm text-green-800">
                  📋 {applyJob.jobTitle}
                </div>
                <div className="h-px bg-green-200" />
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <span className="text-muted-foreground">Worker</span>
                  <span className="font-semibold text-foreground">
                    {workerDisplayName}
                  </span>
                  {workerDisplayCategory && (
                    <>
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold text-foreground">
                        {workerDisplayCategory}
                      </span>
                    </>
                  )}
                  {workerDisplayExp && (
                    <>
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-semibold text-foreground">
                        {workerDisplayExp}
                      </span>
                    </>
                  )}
                  {workerDisplayCity && (
                    <>
                      <span className="text-muted-foreground">City</span>
                      <span className="font-semibold text-foreground">
                        {workerDisplayCity}
                      </span>
                    </>
                  )}
                  {workerDisplaySalary && (
                    <>
                      <span className="text-muted-foreground">
                        Expected Salary
                      </span>
                      <span className="font-semibold text-foreground">
                        ₹{workerDisplaySalary}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 flex-row">
            <Button
              data-ocid="find_work.apply_cancel_button"
              variant="outline"
              onClick={() => setApplyJob(null)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              data-ocid="find_work.apply_confirm_button"
              onClick={handleConfirmApply}
              className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
            >
              Apply Karo ✅
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
