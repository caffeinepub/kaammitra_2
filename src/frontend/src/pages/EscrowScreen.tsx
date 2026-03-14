import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  RefreshCw,
  Shield,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type EscrowRecord,
  generateTxnId,
  saveEscrowRecord,
} from "../lib/constants";

type PaymentMethod = "upi" | "card" | "netbanking";
type Step = "payment" | "processing" | "success" | "failed";

interface EscrowSearchParams {
  bookingId?: string;
  workerName?: string;
  workerMobile?: string;
  contractorMobile?: string;
  totalAmount?: string;
  jobTitle?: string;
  jobDates?: string;
}

const BANKS = ["SBI", "HDFC", "ICICI", "Axis", "PNB", "Kotak"];

export function EscrowScreen() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/escrow" }) as EscrowSearchParams;

  const bookingId = search.bookingId ?? "";
  const workerName = search.workerName ?? "Worker";
  const workerMobile = search.workerMobile ?? "";
  const contractorMobile = search.contractorMobile ?? "";
  const totalAmount = Number(search.totalAmount ?? 0);
  const jobTitle = search.jobTitle ?? "Job";
  const jobDates = search.jobDates ?? "";
  const advanceAmount = Math.round(totalAmount * 0.5);

  const [step, setStep] = useState<Step>("payment");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [escrowId, setEscrowId] = useState("");

  function validate(): boolean {
    if (payMethod === "upi") {
      if (!upiId.includes("@")) {
        toast.error("Valid UPI ID daalo");
        return false;
      }
    } else if (payMethod === "card") {
      const cleaned = cardNum.replace(/\s/g, "");
      if (cleaned.length < 16) {
        toast.error("16-digit card number daalo");
        return false;
      }
      if (expiry.length < 5) {
        toast.error("Expiry date daalo");
        return false;
      }
      if (cvv.length < 3) {
        toast.error("CVV daalo");
        return false;
      }
      if (!cardName.trim()) {
        toast.error("Card holder name daalo");
        return false;
      }
    } else {
      if (!selectedBank) {
        toast.error("Bank chunein");
        return false;
      }
    }
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;
    setStep("processing");
    setTimeout(() => {
      const success = Math.random() < 0.95;
      if (success) {
        const id = generateTxnId();
        setEscrowId(id);
        const record: EscrowRecord = {
          escrowId: id,
          bookingId,
          contractorMobile,
          workerMobile,
          workerName,
          totalAmount,
          advanceAmount,
          status: "held",
          createdAt: Date.now(),
        };
        saveEscrowRecord(record);
        setStep("success");
      } else {
        setStep("failed");
      }
    }, 2200);
  }

  function formatCardNum(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  if (step === "processing") {
    return (
      <div
        data-ocid="escrow.loading_state"
        className="min-h-screen bg-[#072654] flex flex-col items-center justify-center gap-6"
      >
        <Loader2 className="w-16 h-16 text-white animate-spin" />
        <div className="text-center">
          <p className="text-white text-xl font-black">
            Escrow Mein Hold Ho Raha Hai...
          </p>
          <p className="text-white/70 text-sm mt-1">
            Paisa safe hai, please wait
          </p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div data-ocid="escrow.success_state" className="min-h-screen bg-gray-50">
        <header className="bg-[#072654] px-4 py-3 flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-white font-bold">Escrow Confirmed</span>
        </header>
        <div className="p-4 space-y-4">
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">
              🔒
            </div>
            <h1 className="text-xl font-black text-green-700">
              Payment Held in Escrow ✅
            </h1>
            <p className="text-sm text-gray-500 text-center">
              Aapka paisa safe lock ho gaya. Kaam hone ke baad worker ko milega.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-green-200 p-4 space-y-2 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Escrow Details
            </p>
            <ERow label="Escrow ID" value={escrowId} mono />
            <ERow label="Job" value={jobTitle} />
            <ERow label="Worker" value={workerName} />
            <ERow
              label="Amount Held"
              value={`₹${advanceAmount} (50% advance)`}
              green
            />
            <ERow
              label="Remaining"
              value={`₹${totalAmount - advanceAmount} (on completion)`}
            />
            <ERow label="Date" value={new Date().toLocaleDateString("en-IN")} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <p className="text-xs text-blue-700 font-semibold">
              ℹ️ Paisa kab milega worker ko?
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Jab aap Booking History mein "Mark Work Completed" karoge, tab
              worker ko payment release hogi.
            </p>
          </div>

          <Button
            className="w-full h-12 bg-[#072654] text-white font-bold rounded-2xl"
            onClick={() => navigate({ to: "/booking-history" })}
          >
            Booking History Dekho
          </Button>
        </div>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="min-h-screen bg-[#072654] flex flex-col items-center justify-center gap-6 p-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl">
          ❌
        </div>
        <div className="text-center">
          <p className="text-white text-xl font-black">Payment Failed</p>
          <p className="text-white/70 text-sm mt-1">Dobara try karein.</p>
        </div>
        <Button
          className="h-12 px-8 bg-white text-[#072654] font-bold rounded-2xl"
          onClick={() => setStep("payment")}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#072654] flex flex-col">
      <header className="px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => navigate({ to: "/booking-history" })}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Shield className="w-5 h-5 text-white/80" />
        <div className="flex-1">
          <p className="text-white font-bold">Escrow Payment</p>
          <p className="text-white/70 text-xs">Advance hold karein</p>
        </div>
      </header>

      <div className="flex-1 bg-gray-50 rounded-t-3xl p-4 mt-2 space-y-4">
        {/* Job summary */}
        <div className="bg-white rounded-2xl border p-4 space-y-3 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">
            Job Summary
          </p>
          <div className="space-y-1">
            <p className="font-bold text-gray-900">{jobTitle}</p>
            <p className="text-sm text-gray-600">Worker: {workerName}</p>
            {jobDates && <p className="text-xs text-gray-400">📅 {jobDates}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-amber-700">
                ₹{advanceAmount}
              </p>
              <p className="text-[10px] text-amber-600 font-semibold">
                Advance (50%)
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-gray-700">
                ₹{totalAmount - advanceAmount}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold">
                On Completion
              </p>
            </div>
          </div>
        </div>

        {/* Escrow explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Aapka paisa safe hai. Kaam hone ke baad worker ko milega. Cancel
            karne par refund hoga.
          </p>
        </div>

        {/* Payment Methods */}
        <Tabs
          value={payMethod}
          onValueChange={(v) => setPayMethod(v as PaymentMethod)}
        >
          <TabsList className="w-full grid grid-cols-3 h-11">
            <TabsTrigger
              data-ocid="escrow.method_tab"
              value="upi"
              className="text-xs font-bold gap-1"
            >
              <Smartphone className="w-3 h-3" /> UPI
            </TabsTrigger>
            <TabsTrigger
              data-ocid="escrow.method_tab"
              value="card"
              className="text-xs font-bold gap-1"
            >
              <CreditCard className="w-3 h-3" /> Card
            </TabsTrigger>
            <TabsTrigger
              data-ocid="escrow.method_tab"
              value="netbanking"
              className="text-xs font-bold gap-1"
            >
              🏦 Net Banking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upi" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">UPI ID</Label>
              <Input
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="h-12"
              />
            </div>
          </TabsContent>

          <TabsContent value="card" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Card Number</Label>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNum}
                onChange={(e) => setCardNum(formatCardNum(e.target.value))}
                className="h-12 font-mono"
                inputMode="numeric"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Expiry</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className="h-12"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">CVV</Label>
                <Input
                  placeholder="000"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  className="h-12"
                  type="password"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Card Holder Name</Label>
              <Input
                placeholder="Name as on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="h-12"
              />
            </div>
          </TabsContent>

          <TabsContent value="netbanking" className="mt-3">
            <div className="grid grid-cols-3 gap-2">
              {BANKS.map((bank) => (
                <button
                  key={bank}
                  type="button"
                  className={`h-16 bg-white border-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedBank === bank
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedBank(bank)}
                >
                  🏦 {bank}
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Button
          data-ocid="escrow.submit_button"
          className="w-full h-14 bg-[#072654] text-white font-black text-base rounded-2xl"
          onClick={handleSubmit}
        >
          <Lock className="w-4 h-4 mr-2" />₹{advanceAmount} Escrow Mein Hold
          Karein
        </Button>
      </div>
    </div>
  );
}

function ERow({
  label,
  value,
  mono,
  green,
}: { label: string; value: string; mono?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={`text-xs font-bold ${mono ? "font-mono" : ""} ${green ? "text-green-600" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default EscrowScreen;
