import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  IndianRupee,
  Receipt,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import {
  type PaymentRecord,
  type PaymentStatus,
  getMyExtendedProfile,
  loadAllPaymentRecords,
} from "../lib/constants";

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] px-2 py-0.5 gap-1">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px] px-2 py-0.5 gap-1">
        <XCircle className="w-3 h-3" /> Rejected
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-2 py-0.5 gap-1">
      <Clock className="w-3 h-3" /> Pending
    </Badge>
  );
}

export function PaymentHistory() {
  const navigate = useNavigate();
  const myProfile = getMyExtendedProfile();
  const allRecords = loadAllPaymentRecords();

  const myRecords = useMemo(() => {
    if (!myProfile?.mobile) return allRecords;
    return allRecords.filter((r) => r.mobile === myProfile.mobile);
  }, [allRecords, myProfile]);

  const approved = myRecords.filter((r) => r.status === "approved");
  const pending = myRecords.filter((r) => r.status === "pending");
  const rejected = myRecords.filter((r) => r.status === "rejected");
  const totalPaid = approved.reduce((s, r) => s + r.feeAmount, 0);

  return (
    <div data-ocid="payment_history.page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#072654] text-white px-4 py-3 flex items-center gap-3">
        <Button
          data-ocid="payment_history.back_button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 -ml-2"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Receipt className="w-5 h-5" />
        <span className="font-bold text-base">Payment History</span>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border p-3 shadow-sm">
            <p className="text-2xl font-black text-[#072654]">
              {myRecords.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total Payments</p>
          </div>
          <div className="bg-white rounded-2xl border p-3 shadow-sm">
            <p className="text-2xl font-black text-green-700">₹{totalPaid}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Amount Paid</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-green-700">
              {approved.length}
            </p>
            <p className="text-[10px] text-green-600 font-semibold">Approved</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-amber-700">
              {pending.length}
            </p>
            <p className="text-[10px] text-amber-600 font-semibold">Pending</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-red-700">{rejected.length}</p>
            <p className="text-[10px] text-red-600 font-semibold">Rejected</p>
          </div>
        </div>

        {myRecords.length === 0 ? (
          <div
            data-ocid="payment_history.empty_state"
            className="text-center py-16"
          >
            <p className="text-5xl mb-3">💸</p>
            <p className="font-bold text-xl text-gray-700">Koi payment nahi</p>
            <p className="text-sm text-gray-500 mt-1">
              Abhi tak koi payment nahi ki
            </p>
            <Button
              className="mt-4 bg-[#072654] text-white font-bold rounded-2xl"
              onClick={() => navigate({ to: "/create-profile" })}
            >
              Profile Banao
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="w-full grid grid-cols-3 h-10">
              <TabsTrigger
                value="all"
                data-ocid="payment_history.tab"
                className="text-xs"
              >
                All ({myRecords.length})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                data-ocid="payment_history.tab"
                className="text-xs"
              >
                Approved ({approved.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                data-ocid="payment_history.tab"
                className="text-xs"
              >
                Pending ({pending.length})
              </TabsTrigger>
            </TabsList>

            {(
              [
                { value: "all", items: myRecords },
                { value: "approved", items: approved },
                { value: "pending", items: pending },
              ] as { value: string; items: PaymentRecord[] }[]
            ).map(({ value, items }) => (
              <TabsContent key={value} value={value} className="space-y-3 mt-3">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm">Koi record nahi</p>
                  </div>
                ) : (
                  items.map((r, i) => (
                    <div
                      key={r.workerId + r.submittedAt}
                      data-ocid={`payment_history.item.${i + 1}`}
                      className="bg-white rounded-2xl border p-4 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            {r.workerName}
                          </p>
                          <p className="text-xs text-gray-500">{r.category}</p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex items-center gap-1 text-green-700">
                        <IndianRupee className="w-4 h-4" />
                        <span className="text-xl font-black">
                          {r.feeAmount}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400">
                          Date:{" "}
                          {new Date(r.submittedAt).toLocaleDateString("en-IN")}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          Worker ID: KM-{r.workerId.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;
