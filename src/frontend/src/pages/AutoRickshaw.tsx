import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AUTO_SERVICES } from "../lib/constants";

type AutoService = (typeof AUTO_SERVICES)[number];

const FARE_MAP: Record<string, string> = {
  "Local Ride": "₹30–₹80",
  "Office Drop": "₹50–₹120",
  "Station / Airport Drop": "₹80–₹200",
  "Shopping Trip": "₹40–₹100",
  "Hourly Hire": "₹100–₹300",
};

interface AutoDriver {
  id: string;
  name: string;
  rating: number;
  experience: string;
  services: AutoService[];
  verified: boolean;
  available: boolean;
  mobile: string;
  city: string;
}

const MOCK_DRIVERS: AutoDriver[] = [
  {
    id: "1",
    name: "Ramesh Chauhan",
    rating: 4.6,
    experience: "5 years",
    services: ["Local Ride", "Office Drop"],
    verified: true,
    available: true,
    mobile: "9700000001",
    city: "Lucknow",
  },
  {
    id: "2",
    name: "Dinesh Patel",
    rating: 4.3,
    experience: "3 years",
    services: ["Station / Airport Drop", "Shopping Trip"],
    verified: true,
    available: true,
    mobile: "9700000002",
    city: "Kanpur",
  },
  {
    id: "3",
    name: "Santosh Mishra",
    rating: 4.0,
    experience: "2 years",
    services: ["Hourly Hire", "Local Ride"],
    verified: false,
    available: true,
    mobile: "9700000003",
    city: "Agra",
  },
  {
    id: "4",
    name: "Anil Verma",
    rating: 3.8,
    experience: "1 year",
    services: ["Local Ride"],
    verified: false,
    available: false,
    mobile: "9700000004",
    city: "Varanasi",
  },
];

export function AutoRickshaw() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<AutoService | null>(
    null,
  );
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [bookingDriver, setBookingDriver] = useState<AutoDriver | null>(null);
  const [reportDriver, setReportDriver] = useState<AutoDriver | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [ratingDriver, setRatingDriver] = useState<AutoDriver | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const filtered = selectedService
    ? MOCK_DRIVERS.filter((d) => d.services.includes(selectedService))
    : MOCK_DRIVERS;

  function handleBookNow(driver: AutoDriver) {
    if (!pickup.trim()) {
      toast.error("Pickup location daalein");
      return;
    }
    setBookingDriver(driver);
  }

  function handleConfirmBooking() {
    toast.success(
      `✅ ${bookingDriver?.name} ke saath booking confirm ho gayi!`,
    );
    setBookingDriver(null);
    setRatingDriver(bookingDriver);
    setSelectedRating(0);
  }

  function handleSubmitReport() {
    if (!reportReason) {
      toast.error("Reason chunein");
      return;
    }
    toast.success("Report submit ho gayi. Admin review karega.");
    setReportDriver(null);
    setReportReason("");
  }

  function handleSubmitRating() {
    if (selectedRating === 0) {
      toast.error("Rating dein");
      return;
    }
    toast.success(`${selectedRating} ⭐ rating di gayi. Shukriya!`);
    setRatingDriver(null);
  }

  const estimatedFare = selectedService
    ? FARE_MAP[selectedService]
    : "₹30–₹120";

  return (
    <div
      data-ocid="auto_rickshaw.page"
      className="min-h-screen bg-background pb-24"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-5">
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              data-ocid="auto_rickshaw.back_button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Auto Bulao 🛺
              </h1>
              <p className="text-sm opacity-85">Nearby auto rickshaw drivers</p>
            </div>
          </div>

          {/* Service chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                !selectedService
                  ? "bg-white text-amber-700"
                  : "bg-white/20 text-white"
              }`}
              data-ocid="auto_rickshaw.service_all_tab"
            >
              Sab
            </button>
            {AUTO_SERVICES.map((svc) => (
              <button
                type="button"
                key={svc}
                onClick={() =>
                  setSelectedService(svc === selectedService ? null : svc)
                }
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedService === svc
                    ? "bg-white text-amber-700"
                    : "bg-white/20 text-white"
                }`}
                data-ocid="auto_rickshaw.service_tab"
              >
                {svc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 pt-4 space-y-4">
        {/* Location Inputs */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <MapPin className="w-4 h-4 text-amber-500" />
            Location & Fare
          </div>
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold text-xs">
                A
              </span>
              <input
                className="flex h-10 w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Pickup location daalein"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                data-ocid="auto_rickshaw.pickup_input"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 font-bold text-xs">
                B
              </span>
              <input
                className="flex h-10 w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Drop location daalein"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                data-ocid="auto_rickshaw.drop_input"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Estimated Fare
            </span>
            <span className="text-sm font-bold text-amber-600">
              {estimatedFare}
            </span>
          </div>
        </div>

        {/* Driver cards */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">
            {filtered.length} driver{filtered.length !== 1 ? "s" : ""} nearby
          </p>
          {filtered.map((driver, idx) => (
            <Card
              key={driver.id}
              data-ocid={`auto_rickshaw.item.${idx + 1}`}
              className={`border ${
                driver.available
                  ? "border-border"
                  : "border-dashed border-muted-foreground/30 opacity-70"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="w-14 h-14 border-2 border-amber-200">
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-600 text-white text-xl">
                        🛺
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        driver.available ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm">{driver.name}</span>
                        {driver.verified && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${
                          driver.available
                            ? "border-green-300 text-green-700 bg-green-50"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {driver.available ? "Available" : "Busy"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {driver.rating}
                      </span>
                      <span>{driver.experience}</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {driver.city}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {driver.services.map((svc) => (
                        <span
                          key={svc}
                          className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs h-8"
                        disabled={!driver.available}
                        onClick={() => handleBookNow(driver)}
                        data-ocid={`auto_rickshaw.primary_button.${idx + 1}`}
                      >
                        Book Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        onClick={() =>
                          window.open(`tel:${driver.mobile}`, "_self")
                        }
                        data-ocid={`auto_rickshaw.secondary_button.${idx + 1}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 border-red-200 text-red-500 hover:bg-red-50"
                        onClick={() => setReportDriver(driver)}
                        data-ocid={`auto_rickshaw.delete_button.${idx + 1}`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog
        open={!!bookingDriver}
        onOpenChange={(o) => !o && setBookingDriver(null)}
      >
        <DialogContent className="max-w-sm" data-ocid="auto_rickshaw.dialog">
          <DialogHeader>
            <DialogTitle>Booking Confirm Karo 🛺</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {bookingDriver && (
              <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">🛺</span>
                <div>
                  <p className="font-bold text-sm">{bookingDriver.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bookingDriver.services.join(", ")}
                  </p>
                  {pickup && (
                    <p className="text-xs text-amber-700 mt-0.5">
                      📍 {pickup}
                      {drop ? ` → ${drop}` : ""}
                    </p>
                  )}
                </div>
                {bookingDriver.verified && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                )}
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Payment Method
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {["upi", "qr", "razorpay"].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`border rounded-lg py-2 px-2 text-xs font-medium transition-all ${
                      paymentMethod === method
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-border text-muted-foreground"
                    }`}
                    data-ocid="auto_rickshaw.payment_toggle"
                  >
                    {method === "upi"
                      ? "UPI"
                      : method === "qr"
                        ? "QR Code"
                        : "Razorpay"}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "upi" && (
              <div className="space-y-1.5">
                <Label className="text-xs">UPI ID</Label>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  data-ocid="auto_rickshaw.upi_input"
                />
                <p className="text-xs text-muted-foreground">
                  Admin UPI: kaammitra@upi
                </p>
              </div>
            )}

            {paymentMethod === "qr" && (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border">
                  <div className="grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }, (_, i) => i).map((i) => (
                      <div
                        key={`qr-cell-${i}`}
                        className={`w-5 h-5 ${
                          [0, 2, 4, 10, 12, 14, 20, 22, 24].includes(i)
                            ? "bg-gray-800"
                            : "bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Google Pay / Paytm / PhonePe se scan karo
                </p>
              </div>
            )}

            {paymentMethod === "razorpay" && (
              <div className="text-center">
                <Button
                  className="w-full bg-blue-600 text-white"
                  onClick={() =>
                    toast.success("Razorpay: Payment Successful ✓")
                  }
                  data-ocid="auto_rickshaw.razorpay_button"
                >
                  Pay with Razorpay
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  UPI • Cards • Net Banking
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBookingDriver(null)}
              data-ocid="auto_rickshaw.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
              onClick={handleConfirmBooking}
              data-ocid="auto_rickshaw.confirm_button"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog
        open={!!reportDriver}
        onOpenChange={(o) => !o && setReportDriver(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="auto_rickshaw.report_dialog"
        >
          <DialogHeader>
            <DialogTitle>Report Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {reportDriver && (
              <p className="text-sm text-muted-foreground">
                {reportDriver.name} ko report kar rahe hain
              </p>
            )}
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger data-ocid="auto_rickshaw.report_select">
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
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setReportDriver(null)}
              data-ocid="auto_rickshaw.report_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitReport}
              data-ocid="auto_rickshaw.report_submit_button"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog
        open={!!ratingDriver}
        onOpenChange={(o) => !o && setRatingDriver(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="auto_rickshaw.rating_dialog"
        >
          <DialogHeader>
            <DialogTitle>Driver ko Rate Karein ⭐</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {ratingDriver && (
              <p className="text-sm text-center text-muted-foreground">
                {ratingDriver.name} ko apna experience rate karein
              </p>
            )}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="transition-transform hover:scale-110"
                  data-ocid={`auto_rickshaw.rating_star.${star}`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= selectedRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setRatingDriver(null)}
              data-ocid="auto_rickshaw.rating_skip_button"
            >
              Skip
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
              onClick={handleSubmitRating}
              data-ocid="auto_rickshaw.rating_submit_button"
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
