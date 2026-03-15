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
import { BIKE_RIDER_SERVICES } from "../lib/constants";

type BikeRiderService = (typeof BIKE_RIDER_SERVICES)[number];

const FARE_MAP: Record<string, string> = {
  "Parcel Delivery": "₹50–₹120",
  "Food Delivery": "₹40–₹100",
  "Document Delivery": "₹60–₹130",
  "Personal Ride": "₹80–₹200",
  "Emergency Item Pickup": "₹100–₹250",
};

interface Rider {
  id: string;
  name: string;
  rating: number;
  experience: string;
  services: BikeRiderService[];
  verified: boolean;
  available: boolean;
  mobile: string;
  city: string;
}

const MOCK_RIDERS: Rider[] = [
  {
    id: "1",
    name: "Raju Singh",
    rating: 4.7,
    experience: "3 years",
    services: ["Parcel Delivery", "Food Delivery"],
    verified: true,
    available: true,
    mobile: "9800000001",
    city: "Lucknow",
  },
  {
    id: "2",
    name: "Mohan Yadav",
    rating: 4.2,
    experience: "1 year",
    services: ["Document Delivery", "Personal Ride"],
    verified: true,
    available: true,
    mobile: "9800000002",
    city: "Lucknow",
  },
  {
    id: "3",
    name: "Suresh Kumar",
    rating: 3.9,
    experience: "2 years",
    services: ["Emergency Item Pickup", "Parcel Delivery"],
    verified: false,
    available: false,
    mobile: "9800000003",
    city: "Lucknow",
  },
  {
    id: "4",
    name: "Amit Verma",
    rating: 4.5,
    experience: "4 years",
    services: ["Personal Ride", "Parcel Delivery", "Emergency Item Pickup"],
    verified: true,
    available: true,
    mobile: "9800000004",
    city: "Lucknow",
  },
];

export function BikeRider() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] =
    useState<BikeRiderService | null>(null);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [bookingRider, setBookingRider] = useState<Rider | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [upiId, setUpiId] = useState("");
  const [reportRider, setReportRider] = useState<Rider | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [ratingRider, setRatingRider] = useState<Rider | null>(null);
  const [starRating, setStarRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const filteredRiders = selectedService
    ? MOCK_RIDERS.filter((r) => r.services.includes(selectedService))
    : MOCK_RIDERS;

  const fare = selectedService ? FARE_MAP[selectedService] : "₹50–₹250";

  function handleBookNow(rider: Rider) {
    if (!pickup || !drop) {
      toast.error("Pickup aur drop location daalo pehle");
      return;
    }
    setBookingRider(rider);
    setPaymentMethod("upi");
    setUpiId("");
  }

  function handleConfirmBooking() {
    setBookingRider(null);
    toast.success("Booking confirmed! Rider ko request bheja gaya 🏍️");
    if (bookingRider) {
      setTimeout(() => setRatingRider(bookingRider), 1500);
    }
  }

  function handleReport() {
    if (!reportReason) {
      toast.error("Reason chunein");
      return;
    }
    setReportRider(null);
    setReportReason("");
    toast.success("Report submit ho gaya. Hum jaanch karenge.");
  }

  function handleSubmitRating() {
    if (starRating === 0) {
      toast.error("Rating chunein");
      return;
    }
    setRatingRider(null);
    setStarRating(0);
    toast.success(`${starRating} star rating di gaya! Shukriya! ⭐`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            data-ocid="bike_rider.back_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-display font-black">
              Bike Rider Bulao 🏍️
            </h1>
            <p className="text-sm opacity-85">
              Fast delivery & rides at your doorstep
            </p>
          </div>
        </div>

        {/* Service Type chips */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedService === null
                  ? "bg-white text-orange-600"
                  : "bg-white/20 text-white"
              }`}
              data-ocid="bike_rider.all_services_tab"
            >
              All Services
            </button>
            {BIKE_RIDER_SERVICES.map((svc) => (
              <button
                type="button"
                key={svc}
                onClick={() =>
                  setSelectedService(selectedService === svc ? null : svc)
                }
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedService === svc
                    ? "bg-white text-orange-600"
                    : "bg-white/20 text-white"
                }`}
                data-ocid="bike_rider.service_tab"
              >
                {svc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {/* Booking form */}
        <Card className="border border-yellow-200">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-sm text-foreground">
              📍 Booking Details
            </h2>
            <div className="space-y-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <Input
                  className="pl-9 h-11"
                  placeholder="Pickup location enter karein"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  data-ocid="bike_rider.pickup_input"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <Input
                  className="pl-9 h-11"
                  placeholder="Drop location enter karein"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  data-ocid="bike_rider.drop_input"
                />
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-yellow-800 font-medium">
                Estimated Fare
              </span>
              <span className="text-sm font-bold text-yellow-700">{fare}</span>
            </div>
          </CardContent>
        </Card>

        {/* Riders list */}
        <div>
          <h2 className="font-bold text-sm text-foreground mb-3">
            🏍️ Nearby Bike Riders ({filteredRiders.length})
          </h2>
          {filteredRiders.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="bike_rider.empty_state"
            >
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-sm">
                Is service ke liye koi rider available nahi
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRiders.map((rider, idx) => (
                <Card
                  key={rider.id}
                  className={`border ${
                    rider.available
                      ? "border-green-200"
                      : "border-gray-200 opacity-75"
                  }`}
                  data-ocid={`bike_rider.item.${idx + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-14 h-14 border-2 border-yellow-200">
                          <AvatarFallback className="bg-yellow-50 text-yellow-700 text-xl">
                            🏍️
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            rider.available ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {rider.name}
                          </span>
                          {rider.verified && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          )}
                          <Badge
                            className={`text-xs px-1.5 py-0 ${
                              rider.available
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {rider.available ? "Available" : "Busy"}
                          </Badge>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-700">
                            {rider.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {rider.experience} experience
                          </span>
                        </div>

                        {/* City */}
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {rider.city}
                          </span>
                        </div>

                        {/* Service chips */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {rider.services.map((svc) => (
                            <span
                              key={svc}
                              className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs h-8"
                            disabled={!rider.available}
                            onClick={() => handleBookNow(rider)}
                            data-ocid={`bike_rider.primary_button.${idx + 1}`}
                          >
                            Book Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            onClick={() =>
                              window.open(`tel:${rider.mobile}`, "_self")
                            }
                            data-ocid={`bike_rider.secondary_button.${idx + 1}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 border-red-200 text-red-500 hover:bg-red-50"
                            onClick={() => setReportRider(rider)}
                            data-ocid={`bike_rider.delete_button.${idx + 1}`}
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
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog
        open={!!bookingRider}
        onOpenChange={(o) => !o && setBookingRider(null)}
      >
        <DialogContent className="max-w-sm" data-ocid="bike_rider.dialog">
          <DialogHeader>
            <DialogTitle>Booking Confirm Karo 🏍️</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {bookingRider && (
              <div className="bg-yellow-50 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">🏍️</span>
                <div>
                  <p className="font-bold text-sm">{bookingRider.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bookingRider.services.join(", ")}
                  </p>
                </div>
                {bookingRider.verified && (
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
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-border text-muted-foreground"
                    }`}
                    data-ocid="bike_rider.payment_toggle"
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
                  data-ocid="bike_rider.upi_input"
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
                  onClick={() => {
                    toast.success("Razorpay: Payment Successful ✓");
                  }}
                  data-ocid="bike_rider.razorpay_button"
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
              onClick={() => setBookingRider(null)}
              data-ocid="bike_rider.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
              onClick={handleConfirmBooking}
              data-ocid="bike_rider.confirm_button"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog
        open={!!reportRider}
        onOpenChange={(o) => !o && setReportRider(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="bike_rider.report_dialog"
        >
          <DialogHeader>
            <DialogTitle>Report Rider</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {reportRider && (
              <p className="text-sm text-muted-foreground">
                {reportRider.name} ko report kar rahe hain
              </p>
            )}
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger data-ocid="bike_rider.report_select">
                <SelectValue placeholder="Reason chunein" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fake">Fake Profile</SelectItem>
                <SelectItem value="rude">Rude Behavior</SelectItem>
                <SelectItem value="safety">Safety Concern</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setReportRider(null)}
              data-ocid="bike_rider.report_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              data-ocid="bike_rider.report_submit_button"
            >
              Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog
        open={!!ratingRider}
        onOpenChange={(o) => !o && setRatingRider(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="bike_rider.rating_dialog"
        >
          <DialogHeader>
            <DialogTitle>Rider ko Rate Karo ⭐</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-2">
            {ratingRider && (
              <p className="text-sm text-muted-foreground">
                {ratingRider.name} ke saath aapka experience kaisa raha?
              </p>
            )}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setStarRating(star)}
                  data-ocid="bike_rider.star_toggle"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= (hoveredStar || starRating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {starRating > 0 && (
              <p className="text-sm font-medium text-yellow-600">
                {starRating === 5
                  ? "Excellent! 🎉"
                  : starRating >= 4
                    ? "Bahut Accha! 👍"
                    : starRating >= 3
                      ? "Theek Tha"
                      : "Improvement Chahiye"}
              </p>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setRatingRider(null)}
              data-ocid="bike_rider.rating_cancel_button"
            >
              Skip
            </Button>
            <Button
              className="bg-yellow-500 text-white"
              onClick={handleSubmitRating}
              data-ocid="bike_rider.rating_submit_button"
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
