import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Worker } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { useGetAllWorkers } from "../hooks/useQueries";
import {
  type AppNotification,
  type AvailabilityStatus,
  type Booking,
  type BookingStatus,
  CATEGORIES,
  CATEGORY_EMOJIS,
  INDIA_STATES_CITIES,
  type WorkType,
  type WorkerExtended,
  formatLastSeen,
  getBookedDatesForWorker,
  getMyExtendedProfile,
  getNotificationsForUser,
  getOnlineStatus,
  getUnreadCount,
  getVerificationRecord,
  getWorkerRatingStats,
  isWorkerPaymentApproved,
  isWorkerVerified,
  loadAllExtendedById,
  loadAllNotifications,
  markNotificationsRead,
  saveBooking,
  saveMyExtendedProfile,
  saveNotification,
  saveRating,
} from "../lib/constants";

const SKELETON_IDS = ["sk1", "sk2", "sk3"];

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function workTypeLabel(wt?: WorkType): string {
  if (wt === "daily") return "📅 Daily";
  if (wt === "monthly") return "📆 Monthly";
  if (wt === "contract") return "📄 Contract";
  return "";
}

function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
        status === "available"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status === "available" ? "🟢 Available" : "🔴 Busy"}
    </span>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          data-ocid={`find_worker.rating_stars.${n}`}
          onClick={() => onChange(n)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 ${
              n <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function WorkerCard({
  worker,
  ext,
  idx,
  onViewProfile,
}: {
  worker: Worker;
  ext?: WorkerExtended;
  idx: number;
  onViewProfile: () => void;
}) {
  const availability: AvailabilityStatus = ext?.availability ?? "available";
  const mobile = ext?.mobile ?? "";
  const whatsapp = ext?.whatsapp || mobile;
  const waNumber = whatsapp.replace(/^0/, "");

  // Verification status
  const verRecord = getVerificationRecord(mobile);
  const isDocVerified = verRecord?.status === "verified";
  const isProfileVerified = isWorkerVerified(
    ext ?? { mobile: "", availability: "available" },
  );

  // Rating
  const ratingStats = getWorkerRatingStats(worker.id.toString());

  // Online status
  const onlineStat = mobile ? getOnlineStatus(mobile) : null;
  const isOnline = onlineStat?.isOnline ?? false;

  const wtLabel = workTypeLabel(ext?.workType);
  const initials = worker.name.charAt(0).toUpperCase();

  return (
    <div
      data-ocid={`find_worker.item.${idx}`}
      className="card-elevated p-4 animate-slide-up"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-black text-lg shrink-0">
            {initials}
          </div>
          {/* Online dot */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-display font-black text-foreground truncate">
              {worker.name}
            </p>
            {isDocVerified && (
              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                ✅ Verified
              </span>
            )}
            {!isDocVerified && isProfileVerified && (
              <span className="text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full shrink-0">
                ✔ Verified Worker
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={worker.category} size="sm" />
            {!isOnline && onlineStat && (
              <span className="text-[10px] text-muted-foreground">
                {formatLastSeen(onlineStat.lastSeen)}
              </span>
            )}
          </div>
          {ratingStats.count > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-700">
                {ratingStats.avg}
              </span>
              <span className="text-xs text-muted-foreground">
                ({ratingStats.count} reviews)
              </span>
            </div>
          )}
        </div>
        <AvailabilityBadge status={availability} />
      </div>

      {/* Info row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 pl-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {worker.location}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          🏆 {worker.experience}
        </span>
        <span className="text-xs font-semibold text-primary flex items-center gap-1">
          <IndianRupee className="w-3 h-3" />
          {worker.expectedSalary}
        </span>
        {wtLabel && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {wtLabel}
          </span>
        )}
        {ext?.dailyWageRate && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
            ₹{ext.dailyWageRate}/day
          </span>
        )}
        {ext?.gender && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              ext.gender === "Male"
                ? "bg-blue-100 text-blue-700"
                : ext.gender === "Female"
                  ? "bg-pink-100 text-pink-700"
                  : "bg-purple-100 text-purple-700"
            }`}
          >
            {ext.gender === "Male"
              ? "👨 Male"
              : ext.gender === "Female"
                ? "👩 Female"
                : "⚧ Other"}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {mobile ? (
          <a
            href={`tel:${mobile}`}
            data-ocid={`find_worker.call_button.${idx}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10 border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 mr-1" /> 📞 Call
            </Button>
          </a>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex-1 h-10 text-xs"
          >
            📞 Call
          </Button>
        )}

        {whatsapp ? (
          <a
            href={`https://wa.me/91${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid={`find_worker.whatsapp_button.${idx}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10 border-green-500 text-green-800 hover:bg-green-50 text-xs font-semibold"
            >
              💬 WhatsApp
            </Button>
          </a>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex-1 h-10 text-xs"
          >
            💬 WhatsApp
          </Button>
        )}

        <Button
          data-ocid={`find_worker.view_profile_button.${idx}`}
          variant="outline"
          size="sm"
          className="flex-1 h-10 border-orange-300 text-orange-700 hover:bg-orange-50 text-xs font-semibold"
          onClick={onViewProfile}
        >
          👁 Profile
        </Button>
      </div>
    </div>
  );
}

export function FindWorker() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [availability, setAvailability] = useState<"all" | AvailabilityStatus>(
    "all",
  );
  const [genderFilter, setGenderFilter] = useState("all");
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10);
  const [selectedWorker, setSelectedWorker] = useState<{
    worker: Worker;
    ext?: WorkerExtended;
  } | null>(null);

  // Booking state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    startDate: "",
    numDays: 1,
    location: "",
    note: "",
    advanceEnabled: false,
    advanceAmount: 0,
  });

  // Rating state
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Report/Block state
  const [blockedWorkers, setBlockedWorkers] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("kaam_mitra_blocked_workers") || "[]"),
  );
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const myProfile = getMyExtendedProfile();
  const [myStatus, setMyStatus] = useState<AvailabilityStatus>(
    myProfile?.availability ?? "available",
  );

  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: workers, isLoading } = useGetAllWorkers(
    category !== "all" ? category : undefined,
    filterCity || filterState || undefined,
  );

  const extById = loadAllExtendedById();

  const citiesForState = filterState
    ? (INDIA_STATES_CITIES[filterState] ?? [])
    : [];

  // Reset pagination when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    category,
    filterState,
    filterCity,
    availability,
    nearbyMode,
    nearbyRadius,
    genderFilter,
  ]);

  // Memoized filtered + sorted worker list
  const filteredWorkers = useMemo(() => {
    let result: Worker[] = workers ?? [];

    // Availability filter
    if (availability !== "all") {
      result = result.filter((w) => {
        const ext = extById[w.id.toString()];
        const status: AvailabilityStatus = ext?.availability ?? "available";
        return status === availability;
      });
    }

    // Gender filter
    if (genderFilter !== "all") {
      result = result.filter((w) => {
        const ext = extById[w.id.toString()];
        return ext?.gender === genderFilter;
      });
    }

    // Filter out blocked workers
    if (blockedWorkers.length > 0) {
      result = result.filter((w) => {
        const ext = extById[w.id.toString()];
        return !ext?.mobile || !blockedWorkers.includes(ext.mobile);
      });
    }

    // City filter
    if (filterCity) {
      result = result.filter((w) => {
        const ext = extById[w.id.toString()];
        return (
          w.location.toLowerCase().includes(filterCity.toLowerCase()) ||
          ext?.city?.toLowerCase() === filterCity.toLowerCase()
        );
      });
    } else if (filterState) {
      result = result.filter((w) => {
        const ext = extById[w.id.toString()];
        return (
          w.location.toLowerCase().includes(filterState.toLowerCase()) ||
          ext?.state?.toLowerCase() === filterState.toLowerCase()
        );
      });
    }

    // Nearby filter
    if (nearbyMode && userCoords) {
      result = result
        .filter((w) => {
          const ext = extById[w.id.toString()];
          if (!ext?.lat || !ext?.lng) return false;
          return (
            haversineKm(userCoords.lat, userCoords.lng, ext.lat, ext.lng) <=
            nearbyRadius
          );
        })
        .sort((a, b) => {
          const extA = extById[a.id.toString()];
          const extB = extById[b.id.toString()];
          const dA =
            extA?.lat && extA?.lng
              ? haversineKm(userCoords.lat, userCoords.lng, extA.lat, extA.lng)
              : 999;
          const dB =
            extB?.lat && extB?.lng
              ? haversineKm(userCoords.lat, userCoords.lng, extB.lat, extB.lng)
              : 999;
          return dA - dB;
        });
    }

    // Filter out workers who haven't paid registration fee
    const myProfileFilter = getMyExtendedProfile();
    result = result.filter((w) => {
      const wid = w.id.toString();
      if (
        myProfileFilter?.mobile &&
        extById[wid]?.mobile === myProfileFilter.mobile
      )
        return true;
      return isWorkerPaymentApproved(wid);
    });

    // Sort verified workers first
    return [...result].sort((a, b) => {
      const extA = extById[a.id.toString()];
      const extB = extById[b.id.toString()];
      const aVerified =
        getVerificationRecord(extA?.mobile ?? "")?.status === "verified"
          ? 1
          : 0;
      const bVerified =
        getVerificationRecord(extB?.mobile ?? "")?.status === "verified"
          ? 1
          : 0;
      return bVerified - aVerified;
    });
    // biome-ignore lint/correctness/useExhaustiveDependencies: blockedWorkers intentionally included
  }, [
    workers,
    extById,
    availability,
    filterCity,
    filterState,
    nearbyMode,
    nearbyRadius,
    userCoords,
    genderFilter,
    blockedWorkers,
  ]);

  const visibleWorkers = filteredWorkers.slice(0, visibleCount);

  const handleNearby = () => {
    if (!navigator.geolocation) {
      toast.error("GPS aapke browser mein support nahi hai");
      return;
    }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyMode(true);
        setNearbyLoading(false);
        toast.success("📍 Nearby workers dikh rahe hain!");
      },
      () => {
        setNearbyLoading(false);
        toast.error("Location access denied.");
      },
    );
  };

  const handleMyStatusUpdate = (newStatus: AvailabilityStatus) => {
    setMyStatus(newStatus);
    if (myProfile) {
      saveMyExtendedProfile({
        ...myProfile,
        availability: newStatus,
        lastUpdated: Date.now(),
      });
    }
    toast.success(
      newStatus === "available" ? "🟢 Status: Available" : "🔴 Status: Busy",
    );
  };

  function handleSubmitBooking() {
    if (!selectedWorker) return;
    if (!bookingForm.startDate) {
      toast.error("Date chunein");
      return;
    }
    const contractorRaw = localStorage.getItem("contractorProfile");
    const contractor = contractorRaw
      ? (JSON.parse(contractorRaw) as { mobile: string; name: string })
      : null;
    const contractorMobile =
      contractor?.mobile ?? myProfile?.mobile ?? "unknown";
    const contractorName =
      contractor?.name ?? myProfile?.mobile ?? "Contractor";
    const dailyRate = Number(selectedWorker.ext?.dailyWageRate ?? 0);
    const totalAmount = dailyRate * bookingForm.numDays;
    const booking: Booking = {
      id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workerId: selectedWorker.worker.id.toString(),
      workerName: selectedWorker.worker.name,
      workerMobile: selectedWorker.ext?.mobile ?? "",
      workerCategory: selectedWorker.worker.category,
      contractorMobile,
      contractorName,
      startDate: bookingForm.startDate,
      numDays: bookingForm.numDays,
      dailyRate,
      totalAmount,
      advancePaid: bookingForm.advanceEnabled,
      advanceAmount: bookingForm.advanceEnabled ? bookingForm.advanceAmount : 0,
      status: "Pending",
      location: bookingForm.location,
      note: bookingForm.note || undefined,
      createdAt: Date.now(),
    };
    saveBooking(booking);

    // Notify worker
    if (selectedWorker.ext?.mobile) {
      saveNotification({
        id: `notif_${Date.now()}_w`,
        mobile: selectedWorker.ext.mobile,
        title: "📅 Nayi Booking Request!",
        body: `${contractorName} ne aapko ${bookingForm.startDate} se ${bookingForm.numDays} din ke liye book kiya hai. Location: ${bookingForm.location}`,
        createdAt: Date.now(),
        read: false,
      });
    }
    // Notify contractor
    saveNotification({
      id: `notif_${Date.now()}_c`,
      mobile: contractorMobile,
      title: "✅ Booking Request Bheja Gaya!",
      body: `${selectedWorker.worker.name} ko booking request bheja gaya. Status: Pending`,
      createdAt: Date.now(),
      read: false,
    });

    setBookingDialogOpen(false);
    setBookingForm({
      startDate: "",
      numDays: 1,
      location: "",
      note: "",
      advanceEnabled: false,
      advanceAmount: 0,
    });
    toast.success("Booking request bheja gaya! ✅");
  }

  function handleSubmitRating() {
    if (!selectedWorker || ratingStars === 0) {
      toast.error("Stars chunein");
      return;
    }
    const contractorRaw = localStorage.getItem("contractorProfile");
    const contractorMobile = contractorRaw
      ? (JSON.parse(contractorRaw) as { mobile: string }).mobile
      : "anonymous";
    saveRating({
      workerId: selectedWorker.worker.id.toString(),
      contractorMobile,
      stars: ratingStars,
      ratedAt: Date.now(),
    });
    setRatingSubmitted(true);
    toast.success("⭐ Rating save ho gayi!");
  }

  return (
    <div className="page-container pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-black">Worker Dhundho</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 touch-btn"
            onClick={() => navigate({ to: "/worker-map" })}
          >
            🗺️ Map
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 touch-btn"
            onClick={() => navigate({ to: "/post-job" })}
          >
            + Job Do
          </Button>
        </div>
      </div>

      {/* My Status Banner */}
      {myProfile && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-orange-800">
              Aapka Status
            </p>
            <div className="flex items-center gap-2 mt-1">
              <AvailabilityBadge status={myStatus} />
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button
              data-ocid="find_worker.my_available_toggle"
              size="sm"
              className={`h-8 px-2 text-xs font-semibold ${
                myStatus === "available"
                  ? "bg-green-600 text-white"
                  : "bg-white border border-green-300 text-green-700"
              }`}
              onClick={() => handleMyStatusUpdate("available")}
            >
              🟢
            </Button>
            <Button
              data-ocid="find_worker.my_busy_toggle"
              size="sm"
              className={`h-8 px-2 text-xs font-semibold ${
                myStatus === "busy"
                  ? "bg-red-600 text-white"
                  : "bg-white border border-red-300 text-red-700"
              }`}
              onClick={() => handleMyStatusUpdate("busy")}
            >
              🔴
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2 mb-4">
        {/* Row 1: Category + Availability */}
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              data-ocid="find_worker.category_select"
              className="flex-1 h-11 touch-btn"
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

          <Select
            value={availability}
            onValueChange={(v) =>
              setAvailability(v as "all" | AvailabilityStatus)
            }
          >
            <SelectTrigger
              data-ocid="find_worker.availability_select"
              className="w-36 h-11"
            >
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🔍 Sab</SelectItem>
              <SelectItem value="available">🟢 Available</SelectItem>
              <SelectItem value="busy">🔴 Busy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 1b: Gender filter */}
        <div className="flex gap-2">
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger
              data-ocid="find_worker.gender_filter"
              className="flex-1 h-11"
            >
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">👥 All Gender</SelectItem>
              <SelectItem value="Male">👨 Male</SelectItem>
              <SelectItem value="Female">👩 Female</SelectItem>
              <SelectItem value="Other">⚧ Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: State + City */}
        <div className="flex gap-2">
          <Select
            value={filterState}
            onValueChange={(v) => {
              setFilterState(v);
              setFilterCity("");
            }}
          >
            <SelectTrigger
              data-ocid="find_worker.state_select"
              className="flex-1 h-11"
            >
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_states">All States</SelectItem>
              {Object.keys(INDIA_STATES_CITIES).map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterCity}
            onValueChange={setFilterCity}
            disabled={!filterState || filterState === "all_states"}
          >
            <SelectTrigger
              data-ocid="find_worker.city_select"
              className="flex-1 h-11"
            >
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_cities">All Cities</SelectItem>
              {citiesForState.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nearby row */}
        <div className="flex gap-2">
          <Button
            data-ocid="find_worker.nearby_button"
            variant={nearbyMode ? "default" : "outline"}
            className={`flex-1 h-10 text-sm font-semibold ${
              nearbyMode
                ? "bg-primary text-white"
                : "border-primary text-primary"
            }`}
            onClick={() => {
              if (nearbyMode) {
                setNearbyMode(false);
                setUserCoords(null);
              } else {
                handleNearby();
              }
            }}
            disabled={nearbyLoading}
          >
            {nearbyLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Location
                detect ho rahi hai...
              </>
            ) : nearbyMode ? (
              `✕ Nearby Off (${nearbyRadius}km)`
            ) : (
              "📍 Nearby Workers"
            )}
          </Button>

          {/* Radius selector */}
          {nearbyMode && (
            <Select
              value={nearbyRadius.toString()}
              onValueChange={(v) => setNearbyRadius(Number(v))}
            >
              <SelectTrigger
                data-ocid="find_worker.radius_select"
                className="w-24 h-10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Worker Listings */}
      <div data-ocid="find_worker.list" className="space-y-3">
        {isLoading ? (
          SKELETON_IDS.map((id) => (
            <div
              key={id}
              data-ocid="find_worker.loading_state"
              className="card-elevated p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          ))
        ) : !filteredWorkers || filteredWorkers.length === 0 ? (
          <div
            data-ocid="find_worker.empty_state"
            className="card-elevated p-10 text-center"
          >
            <div className="text-4xl mb-3">👷</div>
            <p className="font-display font-bold text-lg text-foreground">
              Koi Worker Nahi Mila
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Filters change karo ya sab dekhein
            </p>
            <Button
              data-ocid="find_worker.reset_filters_button"
              className="mt-4 touch-btn"
              onClick={() => {
                setCategory("all");
                setFilterState("");
                setFilterCity("");
                setAvailability("all");
                setNearbyMode(false);
                setUserCoords(null);
              }}
            >
              Sab Dekhein
            </Button>
          </div>
        ) : (
          <>
            <p
              data-ocid="find_worker.results_count"
              className="text-xs text-muted-foreground mb-2"
            >
              Showing {Math.min(visibleCount, filteredWorkers.length)} of{" "}
              {filteredWorkers.length} workers
            </p>
            {visibleWorkers.map((worker: Worker, idx: number) => (
              <WorkerCard
                key={worker.id.toString()}
                worker={worker}
                ext={extById[worker.id.toString()]}
                idx={idx + 1}
                onViewProfile={() =>
                  setSelectedWorker({
                    worker,
                    ext: extById[worker.id.toString()],
                  })
                }
              />
            ))}
            {visibleCount < filteredWorkers.length && (
              <button
                type="button"
                data-ocid="find_worker.load_more_button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="w-full py-3 text-sm font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors"
              >
                Load More ({filteredWorkers.length - visibleCount} more workers)
              </button>
            )}
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <Button
          data-ocid="find_worker.post_job_button"
          variant="outline"
          className="touch-btn w-full"
          onClick={() => navigate({ to: "/post-job" })}
        >
          Naya Job Post Karo →
        </Button>
      </div>

      {/* Worker Detail Sheet */}
      <Sheet
        open={!!selectedWorker}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWorker(null);
            setShowRating(false);
            setRatingStars(0);
            setRatingSubmitted(false);
          }
        }}
      >
        <SheetContent
          data-ocid="find_worker.worker_detail_sheet"
          side="bottom"
          className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        >
          {selectedWorker && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-black text-2xl">
                      {selectedWorker.worker.name.charAt(0).toUpperCase()}
                    </div>
                    {(() => {
                      const onlineStat = getOnlineStatus(
                        selectedWorker.ext?.mobile ?? "",
                      );
                      return (
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            onlineStat?.isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl font-display font-black">
                      {selectedWorker.worker.name}
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {CATEGORY_EMOJIS[selectedWorker.worker.category]}{" "}
                      {selectedWorker.worker.category}
                    </p>
                    {(() => {
                      const verRec = getVerificationRecord(
                        selectedWorker.ext?.mobile ?? "",
                      );
                      if (verRec?.status === "verified")
                        return (
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                            ✅ Verified Worker
                          </span>
                        );
                      return null;
                    })()}
                    {(() => {
                      const stats = getWorkerRatingStats(
                        selectedWorker.worker.id.toString(),
                      );
                      if (stats.count === 0) return null;
                      return (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-yellow-700">
                            {stats.avg}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({stats.count} reviews)
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <AvailabilityBadge
                    status={selectedWorker.ext?.availability ?? "available"}
                  />
                  {selectedWorker.ext?.gender && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        selectedWorker.ext.gender === "Male"
                          ? "bg-blue-100 text-blue-700"
                          : selectedWorker.ext.gender === "Female"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {selectedWorker.ext.gender === "Male"
                        ? "👨 Male"
                        : selectedWorker.ext.gender === "Female"
                          ? "👩 Female"
                          : "⚧ Other"}
                    </span>
                  )}
                  {/* Verification Checklist */}
                  {(() => {
                    const verRec2 = getVerificationRecord(
                      selectedWorker.ext?.mobile ?? "",
                    );
                    return (
                      <div
                        data-ocid="find_worker.verification_checklist"
                        className="flex flex-wrap gap-1 mt-2"
                      >
                        {[
                          {
                            label: "📱 Mobile",
                            verified: !!selectedWorker.ext?.mobileVerified,
                          },
                          {
                            label: "📧 Email",
                            verified: !!selectedWorker.ext?.emailVerified,
                          },
                          {
                            label: "🪪 ID",
                            verified: verRec2?.status === "verified",
                          },
                          {
                            label: "💳 Payment",
                            verified: isWorkerPaymentApproved(
                              selectedWorker.worker.id.toString(),
                            ),
                          },
                        ].map(({ label, verified }) => (
                          <span
                            key={label}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${verified ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}
                          >
                            {verified ? "✓" : "○"} {label}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </SheetHeader>

              <div className="space-y-4">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "📍 Location",
                      value: selectedWorker.worker.location,
                    },
                    {
                      label: "🏆 Experience",
                      value: selectedWorker.worker.experience,
                    },
                    {
                      label: "💰 Expected Salary",
                      value: selectedWorker.worker.expectedSalary,
                    },
                    {
                      label: "💼 Work Type",
                      value:
                        workTypeLabel(selectedWorker.ext?.workType) ||
                        "Not set",
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                {selectedWorker.ext && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-800 mb-2">
                      📋 Documents
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs flex items-center gap-2">
                        <span>
                          {selectedWorker.ext.aadhaarUploaded ? "✅" : "❌"}
                        </span>
                        <span>Aadhaar Card</span>
                      </p>
                      <p className="text-xs flex items-center gap-2">
                        <span>
                          {selectedWorker.ext.profilePhotoName ? "✅" : "❌"}
                        </span>
                        <span>Profile Photo</span>
                      </p>
                      <p className="text-xs flex items-center gap-2">
                        <span>
                          {selectedWorker.ext.licenceUploaded ? "✅" : "❌"}
                        </span>
                        <span>Licence / Certificate</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Rate Worker section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-yellow-800">
                      ⭐ Rate this Worker
                    </p>
                    {!showRating && (
                      <button
                        type="button"
                        data-ocid={`find_worker.rate_worker_button.${1}`}
                        onClick={() => {
                          setShowRating(true);
                          setRatingSubmitted(false);
                          setRatingStars(0);
                        }}
                        className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                      >
                        Rate Worker ⭐
                      </button>
                    )}
                  </div>
                  {showRating && !ratingSubmitted && (
                    <div className="space-y-2">
                      <StarRating
                        value={ratingStars}
                        onChange={setRatingStars}
                      />
                      <Button
                        size="sm"
                        onClick={handleSubmitRating}
                        disabled={ratingStars === 0}
                        className="h-8 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs"
                      >
                        Rating Submit Karo
                      </Button>
                    </div>
                  )}
                  {ratingSubmitted && (
                    <p className="text-xs text-green-700 font-semibold">
                      ✅ Rating save ho gayi! {ratingStars} ⭐
                    </p>
                  )}
                </div>

                {/* Book Worker + Calendar */}
                <div className="flex gap-2 pt-2">
                  <Button
                    data-ocid="find_worker.book_button"
                    className="flex-1 h-12 bg-primary hover:bg-primary/90 font-bold text-base"
                    onClick={() => {
                      setBookingForm({
                        startDate: "",
                        numDays: 1,
                        location: "",
                        note: "",
                        advanceEnabled: false,
                        advanceAmount: 0,
                      });
                      setBookingDialogOpen(true);
                    }}
                  >
                    📅 Book Worker
                  </Button>
                  <Button
                    data-ocid="find_worker.view_calendar_button"
                    variant="outline"
                    className="flex-1 h-12 border-primary text-primary font-semibold"
                    onClick={() =>
                      navigate({
                        to: `/booking-calendar/${selectedWorker.worker.id.toString()}`,
                      })
                    }
                  >
                    <CalendarDays className="w-4 h-4 mr-1" /> Calendar
                  </Button>
                </div>

                {/* Female Worker Safety Banner */}
                {selectedWorker.ext?.gender === "Female" && (
                  <div
                    data-ocid="find_worker.female_safety_banner"
                    className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-xs text-pink-800"
                  >
                    🛡️ <span className="font-bold">Female Worker Safety</span>
                    <br />
                    Phone number is shared only after mutual confirmation.
                    OTP-verified profile.
                  </div>
                )}

                {/* Report / Block button */}
                <div className="flex justify-end pt-1">
                  <Button
                    data-ocid="find_worker.report_button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-3"
                    onClick={() => {
                      setReportReason("");
                      setReportDialogOpen(true);
                    }}
                  >
                    ⚠️ Report / Block
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  {selectedWorker.ext?.mobile ? (
                    <a
                      href={`tel:${selectedWorker.ext.mobile}`}
                      className="flex-1"
                    >
                      <Button className="w-full h-12 bg-green-600 hover:bg-green-700 font-semibold">
                        <Phone className="w-4 h-4 mr-2" /> 📞 Call
                      </Button>
                    </a>
                  ) : (
                    <Button disabled className="flex-1 h-12">
                      📞 Call
                    </Button>
                  )}
                  {selectedWorker.ext?.mobile ? (
                    <a
                      href={`https://wa.me/91${(selectedWorker.ext.whatsapp || selectedWorker.ext.mobile).replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-semibold">
                        💬 WhatsApp
                      </Button>
                    </a>
                  ) : (
                    <Button disabled className="flex-1 h-12">
                      💬 WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── REPORT / BLOCK DIALOG ──────────────────────────────── */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent
          data-ocid="find_worker.report_dialog"
          className="max-w-sm mx-auto rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Report या Block करें</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              {selectedWorker?.worker.name} के बारे में कारण चुनें:
            </p>
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger
                data-ocid="find_worker.report_reason_select"
                className="h-10"
              >
                <SelectValue placeholder="कारण चुनें" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment / उत्पीड़न</SelectItem>
                <SelectItem value="fake">
                  Fake Profile / नकली प्रोफाइल
                </SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="other">Other / अन्य</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              data-ocid="find_worker.report_cancel_button"
              className="w-full sm:w-auto"
            >
              Wapas Jao
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="find_worker.report_confirm_button"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600"
              onClick={() => {
                if (!selectedWorker || !reportReason) {
                  toast.error("Karan zaroor chunein");
                  return;
                }
                const reports = JSON.parse(
                  localStorage.getItem("kaam_mitra_reports") || "[]",
                );
                reports.push({
                  mobile:
                    selectedWorker.ext?.mobile ?? selectedWorker.worker.name,
                  reason: reportReason,
                  date: new Date().toISOString(),
                });
                localStorage.setItem(
                  "kaam_mitra_reports",
                  JSON.stringify(reports),
                );
                setReportDialogOpen(false);
                toast.success(
                  "Report submit ho gayi. Hamaari team review karegi.",
                );
              }}
            >
              Report Only
            </AlertDialogAction>
            <AlertDialogAction
              data-ocid="find_worker.block_confirm_button"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!selectedWorker) return;
                const mobile =
                  selectedWorker.ext?.mobile ?? selectedWorker.worker.name;
                const updated = [...blockedWorkers, mobile];
                setBlockedWorkers(updated);
                localStorage.setItem(
                  "kaam_mitra_blocked_workers",
                  JSON.stringify(updated),
                );
                setReportDialogOpen(false);
                setSelectedWorker(null);
                toast.success("Worker block ho gaya successfully.");
              }}
            >
              Block Worker
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── BOOKING DIALOG ─────────────────────────────────────── */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent
          data-ocid="find_worker.booking_dialog"
          className="max-w-sm mx-auto rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-black">
              📅 Book {selectedWorker?.worker.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedWorker?.worker.category}
              {selectedWorker?.ext?.dailyWageRate && (
                <span className="ml-2 text-green-700 font-bold">
                  ₹{selectedWorker.ext.dailyWageRate}/day
                </span>
              )}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="bk-date">Start Date *</Label>
              <input
                id="bk-date"
                data-ocid="find_worker.booking_date_input"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={bookingForm.startDate}
                onChange={(e) =>
                  setBookingForm((p) => ({ ...p, startDate: e.target.value }))
                }
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bk-days">Number of Days (1–30)</Label>
              <input
                id="bk-days"
                data-ocid="find_worker.booking_days_input"
                type="number"
                min={1}
                max={30}
                value={bookingForm.numDays}
                onChange={(e) =>
                  setBookingForm((p) => ({
                    ...p,
                    numDays: Math.min(30, Math.max(1, Number(e.target.value))),
                  }))
                }
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {selectedWorker?.ext?.dailyWageRate && (
                <p className="text-xs font-bold text-primary">
                  Total: ₹
                  {Number(selectedWorker.ext.dailyWageRate) *
                    bookingForm.numDays}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="bk-location">Location / Site *</Label>
              <input
                id="bk-location"
                data-ocid="find_worker.booking_location_input"
                type="text"
                placeholder="e.g. Delhi, Site No. 5"
                value={bookingForm.location}
                onChange={(e) =>
                  setBookingForm((p) => ({ ...p, location: e.target.value }))
                }
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bk-note">Note (optional)</Label>
              <Textarea
                id="bk-note"
                placeholder="Koi baat batana ho..."
                value={bookingForm.note}
                onChange={(e) =>
                  setBookingForm((p) => ({ ...p, note: e.target.value }))
                }
                className="h-16 text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  💰 Advance Payment (UPI)
                </p>
                <p className="text-xs text-amber-600">
                  Optional advance via UPI
                </p>
              </div>
              <Switch
                checked={bookingForm.advanceEnabled}
                onCheckedChange={(v) =>
                  setBookingForm((p) => ({ ...p, advanceEnabled: v }))
                }
              />
            </div>

            {bookingForm.advanceEnabled && (
              <div className="space-y-2 bg-amber-50 rounded-xl p-3">
                <Label htmlFor="bk-advance">Advance Amount (₹)</Label>
                <input
                  id="bk-advance"
                  type="number"
                  min={0}
                  placeholder="e.g. 500"
                  value={bookingForm.advanceAmount || ""}
                  onChange={(e) =>
                    setBookingForm((p) => ({
                      ...p,
                      advanceAmount: Number(e.target.value),
                    }))
                  }
                  className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-amber-400 text-amber-700 hover:bg-amber-100"
                  onClick={() =>
                    toast.info("UPI demo mode - advance recorded ✅")
                  }
                >
                  💳 Pay Advance (Demo)
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setBookingDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="find_worker.booking_confirm_button"
              className="flex-1 bg-primary hover:bg-primary/90 font-bold"
              onClick={handleSubmitBooking}
            >
              Send Request 📅
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
