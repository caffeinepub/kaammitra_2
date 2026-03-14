import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, IndianRupee } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Booking,
  type BookingStatus,
  addWalletTransaction,
  generateTxnId,
  getBookingsForContractor,
  getBookingsForWorker,
  getEscrowByBookingId,
  getMyExtendedProfile,
  saveBooking,
  saveNotification,
  updateEscrowStatus,
} from "../lib/constants";

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { label: string; cls: string }> = {
    Pending: { label: "⏳ Pending", cls: "bg-amber-100 text-amber-800" },
    Accepted: { label: "✅ Accepted", cls: "bg-green-100 text-green-800" },
    Rejected: { label: "❌ Rejected", cls: "bg-red-100 text-red-800" },
    Completed: { label: "🏆 Completed", cls: "bg-blue-100 text-blue-800" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function formatDate(dateStr: string, numDays: number): string {
  const start = new Date(dateStr);
  const end = new Date(dateStr);
  end.setDate(end.getDate() + numDays - 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function BookingCard({
  booking,
  isWorker,
  idx,
  onStatusChange,
}: {
  booking: Booking;
  isWorker: boolean;
  idx: number;
  onStatusChange: (b: Booking) => void;
}) {
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  function handleMarkComplete() {
    const updated: Booking = { ...booking, status: "Completed" };
    onStatusChange(updated);
    // Release escrow if exists
    const escrow = getEscrowByBookingId(booking.id);
    if (escrow) {
      updateEscrowStatus(escrow.escrowId, "released", {
        resolvedAt: Date.now(),
      });
      addWalletTransaction({
        id: generateTxnId(),
        mobile: booking.workerMobile,
        type: "credit",
        amount: escrow.totalAmount,
        description: `Job Complete: ${booking.workerCategory}`,
        bookingId: booking.id,
        escrowId: escrow.escrowId,
        createdAt: Date.now(),
      });
    }
    toast.success("Job completed! Worker ko payment release ho gayi ✅");
  }

  function handleDisputeSubmit() {
    if (!disputeReason.trim()) {
      toast.error("Reason likhein");
      return;
    }
    const escrow = getEscrowByBookingId(booking.id);
    if (escrow) {
      updateEscrowStatus(escrow.escrowId, "disputed", {
        disputeReason,
        resolvedAt: Date.now(),
      });
    }
    setShowDisputeForm(false);
    setDisputeReason("");
    toast.info("Dispute report ho gayi. Admin review karega.");
  }

  return (
    <div
      data-ocid={`booking_history.item.${idx}`}
      className="bg-card border border-border rounded-2xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-display font-black text-base">
            {isWorker ? booking.contractorName : booking.workerName}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.workerCategory}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/50 rounded-xl p-2.5">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Dates
          </p>
          <p className="text-xs font-semibold mt-0.5">
            {formatDate(booking.startDate, booking.numDays)}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.numDays} day{booking.numDays > 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <IndianRupee className="w-3 h-3" /> Amount
          </p>
          <p className="text-sm font-black text-primary mt-0.5">
            ₹{booking.totalAmount > 0 ? booking.totalAmount : "TBD"}
          </p>
          {booking.dailyRate > 0 && (
            <p className="text-xs text-muted-foreground">
              ₹{booking.dailyRate}/day
            </p>
          )}
        </div>
      </div>

      {/* Location */}
      {booking.location && (
        <p className="text-xs text-muted-foreground">📍 {booking.location}</p>
      )}

      {/* Advance paid badge */}
      {booking.advancePaid && booking.advanceAmount > 0 && (
        <Badge className="bg-amber-100 text-amber-800 text-xs">
          💰 Advance Paid: ₹{booking.advanceAmount}
        </Badge>
      )}

      {/* Worker accept/reject for Pending bookings */}
      {isWorker && booking.status === "Pending" && (
        <div className="flex gap-2 pt-1">
          <Button
            data-ocid={`booking_history.accept_button.${idx}`}
            size="sm"
            className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white font-bold"
            onClick={() => {
              const updated: Booking = {
                ...booking,
                status: "Accepted",
                respondedAt: Date.now(),
              };
              onStatusChange(updated);
              saveNotification({
                id: `notif_acc_${Date.now()}`,
                mobile: booking.contractorMobile,
                title: "✅ Booking Accept Ho Gayi!",
                body: `${booking.workerName} ne aapki booking accept kar li. Dates: ${formatDate(booking.startDate, booking.numDays)}`,
                createdAt: Date.now(),
                read: false,
              });
              toast.success("Booking accept kar li! ✅");
            }}
          >
            ✅ Accept
          </Button>
          <Button
            data-ocid={`booking_history.reject_button.${idx}`}
            size="sm"
            variant="outline"
            className="flex-1 h-9 border-red-300 text-red-700 hover:bg-red-50 font-bold"
            onClick={() => {
              const updated: Booking = {
                ...booking,
                status: "Rejected",
                respondedAt: Date.now(),
              };
              onStatusChange(updated);
              saveNotification({
                id: `notif_rej_${Date.now()}`,
                mobile: booking.contractorMobile,
                title: "❌ Booking Reject Ho Gayi",
                body: `${booking.workerName} ne aapki booking reject kar di.`,
                createdAt: Date.now(),
                read: false,
              });
              toast.info("Booking reject kar di");
            }}
          >
            ❌ Reject
          </Button>
        </div>
      )}

      {/* Contractor: Mark Complete or Dispute for Accepted bookings */}
      {!isWorker && booking.status === "Accepted" && (
        <div className="space-y-2 pt-1">
          <Button
            data-ocid={`booking_history.confirm_button.${idx}`}
            size="sm"
            className="w-full h-9 bg-green-600 hover:bg-green-700 text-white font-bold"
            onClick={handleMarkComplete}
          >
            ✅ Mark Work Completed
          </Button>
          {!showDisputeForm ? (
            <Button
              data-ocid={`booking_history.secondary_button.${idx}`}
              size="sm"
              variant="outline"
              className="w-full h-9 border-orange-300 text-orange-700 hover:bg-orange-50 font-bold"
              onClick={() => setShowDisputeForm(true)}
            >
              ⚠️ Report Issue
            </Button>
          ) : (
            <div className="space-y-2 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <textarea
                className="w-full text-xs p-2 rounded-lg border border-orange-300 bg-white resize-none h-16"
                placeholder="Issue ka reason likhein..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 bg-orange-600 text-white text-xs"
                  onClick={handleDisputeSubmit}
                >
                  Submit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => setShowDisputeForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {booking.status === "Completed" && (
        <p className="text-xs font-bold text-blue-700 text-center">
          ✅ Job Done
        </p>
      )}

      {/* Note */}
      {booking.note && (
        <p className="text-xs text-muted-foreground italic">
          📝 {booking.note}
        </p>
      )}
    </div>
  );
}

export function BookingHistory() {
  const myProfile = getMyExtendedProfile();
  const contractorRaw = localStorage.getItem("contractorProfile");
  const contractor = contractorRaw
    ? (JSON.parse(contractorRaw) as { mobile: string; name: string })
    : null;

  const isWorker = !!myProfile?.mobile;
  const mobile = myProfile?.mobile ?? contractor?.mobile ?? "";

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (!mobile) return [];
    if (isWorker) return getBookingsForWorker(mobile);
    return getBookingsForContractor(mobile);
  });

  function refreshBookings() {
    if (!mobile) return;
    if (isWorker) setBookings(getBookingsForWorker(mobile));
    else setBookings(getBookingsForContractor(mobile));
  }

  function handleStatusChange(updated: Booking) {
    saveBooking(updated);
    refreshBookings();
  }

  const tabs: {
    value: string;
    label: string;
    filter: (b: Booking) => boolean;
  }[] = [
    { value: "all", label: "All", filter: () => true },
    {
      value: "pending",
      label: "Pending",
      filter: (b) => b.status === "Pending",
    },
    {
      value: "accepted",
      label: "Accepted",
      filter: (b) => b.status === "Accepted",
    },
    {
      value: "completed",
      label: "Completed",
      filter: (b) => b.status === "Completed",
    },
    {
      value: "rejected",
      label: "Rejected",
      filter: (b) => b.status === "Rejected",
    },
  ];

  // Summary stats
  const totalEarnings = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;

  if (!mobile) {
    return (
      <div className="page-container">
        <div
          data-ocid="booking_history.empty_state"
          className="text-center py-16"
        >
          <p className="text-4xl mb-3">📅</p>
          <p className="font-display font-bold text-xl">Login Required</p>
          <p className="text-sm text-muted-foreground mt-1">
            Bookings dekhne ke liye login karein
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="booking_history.page" className="page-container">
      <div className="mb-4">
        <h1 className="text-xl font-display font-black">📅 Booking History</h1>
        <p className="text-sm text-muted-foreground">
          {isWorker ? "Worker bookings" : "Contractor bookings"}
        </p>
      </div>

      {/* Summary card */}
      {isWorker ? (
        <div
          data-ocid="booking_history.earnings_card"
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-green-700">
              ₹{totalEarnings}
            </p>
            <p className="text-xs text-green-700 font-semibold mt-0.5">
              Total Earnings
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-amber-700">
              {bookings.length}
            </p>
            <p className="text-xs text-amber-700 font-semibold mt-0.5">
              Total Bookings
            </p>
          </div>
        </div>
      ) : (
        <div
          data-ocid="booking_history.earnings_card"
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-blue-700">
              {bookings.length}
            </p>
            <p className="text-xs text-blue-700 font-semibold mt-0.5">
              Total Bookings
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
            <p className="text-xs text-amber-700 font-semibold mt-0.5">
              Pending
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList className="w-full mb-4 grid grid-cols-5 h-auto gap-0.5">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              data-ocid="booking_history.tab"
              className="text-xs py-1.5 px-1"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => {
          const filtered = bookings.filter(t.filter);
          return (
            <TabsContent key={t.value} value={t.value} className="space-y-3">
              {filtered.length === 0 ? (
                <div
                  data-ocid="booking_history.empty_state"
                  className="text-center py-10"
                >
                  <p className="text-3xl mb-2">📭</p>
                  <p className="font-semibold text-foreground">
                    Koi booking nahi
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.value === "all"
                      ? "Abhi tak koi booking nahi mili"
                      : `${t.label} bookings nahi hain`}
                  </p>
                </div>
              ) : (
                filtered.map((b, i) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    isWorker={isWorker}
                    idx={i + 1}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
