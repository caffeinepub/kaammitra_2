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
import { Clock, Filter, IndianRupee, MapPin } from "lucide-react";
import { useState } from "react";
import type { Worker } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { useGetAllWorkers } from "../hooks/useQueries";
import { CATEGORIES, CATEGORY_EMOJIS } from "../lib/constants";

const SKELETON_IDS = ["sk1", "sk2", "sk3"];

export function FindWorker() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  const { data: workers, isLoading } = useGetAllWorkers(
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
        <h1 className="text-2xl font-display font-black">Find Worker</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 touch-btn"
          onClick={() => navigate({ to: "/post-job" })}
        >
          + Job Do
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 items-center">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            data-ocid="find_worker.category_select"
            className="flex-1 touch-btn h-11"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_EMOJIS[c]} {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          data-ocid="find_worker.location_input"
          placeholder="City / Location"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="flex-1 h-11"
        />
      </div>

      {/* Worker Listings */}
      <div data-ocid="find_worker.list" className="space-y-3">
        {isLoading ? (
          SKELETON_IDS.map((id) => (
            <div
              key={id}
              data-ocid="find_worker.loading_state"
              className="card-elevated p-4 space-y-2"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : !workers || workers.length === 0 ? (
          <div
            data-ocid="find_worker.empty_state"
            className="card-elevated p-10 text-center"
          >
            <div className="text-4xl mb-3">👷</div>
            <p className="font-display font-bold text-lg text-foreground">
              Koi Worker Nahi Mila
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try different filters
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
          workers.map((worker: Worker, idx: number) => (
            <div
              key={worker.id.toString()}
              data-ocid={`find_worker.item.${idx + 1}`}
              className="card-elevated p-4 animate-slide-up"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {worker.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground truncate">
                    {worker.name}
                  </p>
                  <CategoryBadge category={worker.category} size="sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pl-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {worker.location}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {worker.experience}
                </span>
                <span className="text-xs font-semibold text-primary flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {worker.expectedSalary}
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
          onClick={() => navigate({ to: "/post-job" })}
        >
          Naya Job Post Karo →
        </Button>
      </div>
    </div>
  );
}
