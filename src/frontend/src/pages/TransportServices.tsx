import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { TRANSPORT_VEHICLE_TYPES } from "@/lib/constants";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_DRIVERS = [
  {
    id: "t1",
    name: "Ramesh Chauhan",
    category: "Auto Rickshaw Driver",
    emoji: "🛺",
    rating: 4.7,
    distance: "0.8 km",
    eta: "3 min",
    experience: "5 yrs",
    verified: true,
    available: true,
    mobile: "9700000001",
    fare: 50,
  },
  {
    id: "t2",
    name: "Raju Singh",
    category: "Bike Rider / Delivery Boy",
    emoji: "🏍️",
    rating: 4.8,
    distance: "1.1 km",
    eta: "4 min",
    experience: "3 yrs",
    verified: true,
    available: true,
    mobile: "9800000001",
    fare: 40,
  },
  {
    id: "t3",
    name: "Sunil Yadav",
    category: "E-Rickshaw Driver",
    emoji: "🛻",
    rating: 4.3,
    distance: "1.5 km",
    eta: "6 min",
    experience: "2 yrs",
    verified: true,
    available: true,
    mobile: "9700000003",
    fare: 45,
  },
  {
    id: "t4",
    name: "Manoj Sharma",
    category: "Taxi Driver",
    emoji: "🚕",
    rating: 4.9,
    distance: "2.0 km",
    eta: "7 min",
    experience: "8 yrs",
    verified: true,
    available: true,
    mobile: "9700000004",
    fare: 150,
  },
  {
    id: "t5",
    name: "Deepak Gupta",
    category: "Mini Tempo Driver",
    emoji: "🚐",
    rating: 4.1,
    distance: "2.3 km",
    eta: "9 min",
    experience: "4 yrs",
    verified: false,
    available: true,
    mobile: "9700000005",
    fare: 200,
  },
  {
    id: "t6",
    name: "Santosh Tiwari",
    category: "Loading Auto Driver",
    emoji: "🛺",
    rating: 3.9,
    distance: "3.0 km",
    eta: "11 min",
    experience: "2 yrs",
    verified: false,
    available: false,
    mobile: "9700000006",
    fare: 120,
  },
  {
    id: "t7",
    name: "Dinesh Patel",
    category: "Auto Rickshaw Driver",
    emoji: "🛺",
    rating: 4.4,
    distance: "3.5 km",
    eta: "12 min",
    experience: "3 yrs",
    verified: true,
    available: true,
    mobile: "9700000007",
    fare: 55,
  },
  {
    id: "t8",
    name: "Anil Verma",
    category: "Bike Rider / Delivery Boy",
    emoji: "🏍️",
    rating: 4.2,
    distance: "4.1 km",
    eta: "15 min",
    experience: "1 yr",
    verified: false,
    available: false,
    mobile: "9800000002",
    fare: 35,
  },
];

type Driver = (typeof MOCK_DRIVERS)[number];

export function TransportServices() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState<5 | 10 | 20>(5);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [hireDriver, setHireDriver] = useState<Driver | null>(null);
  const [reportDriver, setReportDriver] = useState<Driver | null>(null);
  const [ratingDriver, setRatingDriver] = useState<Driver | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [reportReason, setReportReason] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);

  const filteredDrivers =
    selectedVehicle === "all"
      ? MOCK_DRIVERS
      : MOCK_DRIVERS.filter((d) => {
          const vt = TRANSPORT_VEHICLE_TYPES.find(
            (v) => v.id === selectedVehicle,
          );
          return vt ? d.category === vt.category : true;
        });

  function handleGPS() {
    setGpsLoading(true);
    toast("Location detect ho rahi hai...");
    setTimeout(() => {
      setGpsLoading(false);
      setPickup("Aapke paas (GPS)");
      toast.success("Location set: Aapke paas");
    }, 1500);
  }

  function handleHireConfirm() {
    if (!hireDriver) return;
    const name = hireDriver.name;
    setHireDriver(null);
    toast.success(`${name} ko request bheja gaya! 🚀`);
    setTimeout(() => setRatingDriver(hireDriver), 1000);
  }

  function handleReport() {
    setReportDriver(null);
    setReportReason("");
    toast.success("Report submit ho gaya. Hum jaach karenge.");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white px-4 pt-safe-top pb-5">
        <div className="flex items-center gap-3 mb-4 pt-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-black">
              Transport Services 🚖
            </h1>
            <p className="text-sm opacity-85">Apne paas ke drivers dhundein</p>
          </div>
        </div>
        {/* Radius pills */}
        <div className="flex gap-2">
          {([5, 10, 20] as const).map((r) => (
            <button
              type="button"
              key={r}
              data-ocid={`transport.radius_${r}km_button`}
              onClick={() => setRadius(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                radius === r
                  ? "bg-white text-amber-600 shadow-sm"
                  : "bg-white/20 text-white"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Location inputs */}
        <div className="bg-card border border-border rounded-2xl p-4 mt-4 shadow-sm space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
              📍
            </span>
            <Input
              data-ocid="transport.pickup_input"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Pickup location daalein"
              className="pl-9"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
              🏁
            </span>
            <Input
              data-ocid="transport.drop_input"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              placeholder="Drop location daalein (optional)"
              className="pl-9"
            />
          </div>
          <Button
            data-ocid="transport.gps_button"
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleGPS}
            disabled={gpsLoading}
          >
            <Navigation className="w-4 h-4" />
            GPS se Location Lein 📡
          </Button>
        </div>

        {/* Vehicle type grid */}
        <div className="mt-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Gaadi Chunein
          </h2>
          <div className="grid grid-cols-3 gap-2.5 mb-2">
            <button
              type="button"
              onClick={() => setSelectedVehicle("all")}
              className={`rounded-xl p-3 flex flex-col items-center gap-1 border-2 transition-all ${
                selectedVehicle === "all"
                  ? "border-amber-500 bg-amber-50"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-2xl">🚖</span>
              <span className="text-xs font-semibold text-foreground">Sab</span>
              <span className="text-[10px] text-muted-foreground">
                All vehicles
              </span>
            </button>
            {TRANSPORT_VEHICLE_TYPES.map((vt, i) => (
              <button
                type="button"
                key={vt.id}
                data-ocid={`transport.vehicle_card.${i + 1}`}
                onClick={() => setSelectedVehicle(vt.id)}
                className={`rounded-xl p-3 flex flex-col items-center gap-1 border-2 transition-all ${
                  selectedVehicle === vt.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-2xl">{vt.emoji}</span>
                <span className="text-xs font-semibold text-foreground leading-tight text-center">
                  {vt.label}
                </span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {vt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Driver list */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-display font-black text-foreground">
              Nearby Drivers
            </h2>
            <Badge variant="secondary">{filteredDrivers.length} found</Badge>
          </div>

          {filteredDrivers.length === 0 ? (
            <div
              data-ocid="transport.driver_card.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-sm">Is area mein koi driver nahi mila</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrivers.map((driver, idx) => (
                <motion.div
                  key={driver.id}
                  data-ocid={`transport.driver_card.${idx + 1}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                        driver.category === "Taxi Driver"
                          ? "bg-blue-100"
                          : driver.category === "E-Rickshaw Driver"
                            ? "bg-green-100"
                            : driver.category === "Mini Tempo Driver"
                              ? "bg-orange-100"
                              : "bg-amber-100"
                      }`}
                    >
                      {driver.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-foreground">
                          {driver.name}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${driver.available ? "bg-green-500" : "bg-red-500"}`}
                        />
                        {driver.verified && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-green-500 text-green-700 py-0 px-1.5"
                          >
                            ✅ Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">
                          {driver.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {driver.experience} exp
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span>⭐ {driver.rating}</span>
                        <span>📍 {driver.distance}</span>
                        <span>🕐 ~{driver.eta}</span>
                        <span
                          className={
                            driver.available
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {driver.available ? "🟢 Available" : "🔴 Busy"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <a
                      href={`tel:${driver.mobile}`}
                      data-ocid={`transport.call_button.${idx + 1}`}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-amber-400 text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a
                      href={`https://wa.me/91${driver.mobile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid={`transport.whatsapp_button.${idx + 1}`}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-green-500 text-green-700 text-xs font-semibold hover:bg-green-50 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <button
                      type="button"
                      data-ocid={`transport.hire_button.${idx + 1}`}
                      disabled={!driver.available}
                      onClick={() => driver.available && setHireDriver(driver)}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
                    >
                      Hire Now 🚀
                    </button>
                  </div>

                  <button
                    type="button"
                    data-ocid={`transport.report_link.${idx + 1}`}
                    onClick={() => setReportDriver(driver)}
                    className="mt-2 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ⚠️ Report
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Map section */}
        <div className="mt-6">
          <h2 className="text-base font-display font-black text-foreground mb-3">
            Map Par Dekhein 🗺️
          </h2>
          <div className="bg-slate-100 rounded-2xl h-48 flex flex-col items-center justify-center gap-2 border border-border">
            <span className="text-4xl">📍</span>
            <p className="text-sm text-muted-foreground">
              GPS Map – Live driver locations
            </p>
            <Button
              data-ocid="transport.full_map_button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/worker-map" })}
              className="mt-1"
            >
              <MapPin className="w-4 h-4 mr-1" /> Full Map Kholo
            </Button>
          </div>
        </div>
      </div>

      {/* Hire Now Dialog */}
      <AnimatePresence>
        {hireDriver && (
          <Dialog open={!!hireDriver} onOpenChange={() => setHireDriver(null)}>
            <DialogContent data-ocid="transport.hire_dialog">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{hireDriver.emoji}</span>
                  {hireDriver.name} ko Hire Karein
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                  <div className="font-semibold text-amber-900">
                    {hireDriver.category}
                  </div>
                  <div className="text-amber-700 mt-1">
                    Estimated Fare: ₹{hireDriver.fare}–₹{hireDriver.fare * 2}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">
                    Payment Method
                  </div>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger data-ocid="transport.payment_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">
                        UPI (GPay / PhonePe / Paytm)
                      </SelectItem>
                      <SelectItem value="qr">QR Code Payment</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  data-ocid="transport.confirm_booking_button"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleHireConfirm}
                >
                  Confirm Booking 🚀
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Report Dialog */}
      <AnimatePresence>
        {reportDriver && (
          <Dialog
            open={!!reportDriver}
            onOpenChange={() => setReportDriver(null)}
          >
            <DialogContent data-ocid="transport.report_dialog">
              <DialogHeader>
                <DialogTitle>Report Driver ⚠️</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  {reportDriver.name} ke bare mein report karein:
                </p>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Reason chunein" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fake">Fake Profile</SelectItem>
                    <SelectItem value="rude">Rude Behavior</SelectItem>
                    <SelectItem value="safety">Safety Concern</SelectItem>
                    <SelectItem value="overcharge">Overcharging</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  data-ocid="transport.report_submit_button"
                  variant="destructive"
                  className="w-full"
                  disabled={!reportReason}
                  onClick={handleReport}
                >
                  Report Submit Karein
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Rating Dialog */}
      <AnimatePresence>
        {ratingDriver && (
          <Dialog
            open={!!ratingDriver}
            onOpenChange={() => {
              setRatingDriver(null);
              setStarRating(0);
            }}
          >
            <DialogContent data-ocid="transport.rating_dialog">
              <DialogHeader>
                <DialogTitle>Rate Driver ⭐</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 text-center">
                <p className="text-sm text-muted-foreground">
                  {ratingDriver.name} ko rate karein
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStarRating(s)}
                      className={`text-3xl transition-transform hover:scale-110 ${s <= starRating ? "text-amber-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={starRating === 0}
                  onClick={() => {
                    setRatingDriver(null);
                    setStarRating(0);
                    toast.success("Rating de diya! Shukriya 🙏");
                  }}
                >
                  Rating Submit Karein
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
