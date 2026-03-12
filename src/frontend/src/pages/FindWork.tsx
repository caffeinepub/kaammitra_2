import { Button } from "@/components/ui/button";
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
import { Calendar, Filter, IndianRupee, MapPin, User } from "lucide-react";
import { useState } from "react";
import type { Job } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { useGetAllJobs } from "../hooks/useQueries";
import { CATEGORIES } from "../lib/constants";

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
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  const { data: jobs, isLoading } = useGetAllJobs(
    category !== "all" ? category : undefined,
    debouncedLocation || undefined,
  );

  const handleLocationChange = (val: string) => {
    setLocation(val);
    const t = setTimeout(() => setDebouncedLocation(val), 400);
    return () => clearTimeout(t);
  };

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
          jobs.map((job: Job, idx: number) => (
            <div
              key={job.id.toString()}
              data-ocid={`find_work.item.${idx + 1}`}
              className="card-elevated p-4 animate-slide-up"
            >
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
              <div className="flex flex-wrap gap-x-4 gap-y-1">
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
            </div>
          ))
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
    </div>
  );
}
