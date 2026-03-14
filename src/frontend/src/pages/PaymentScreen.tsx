import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Loader2,
  Lock,
  RefreshCw,
  Smartphone,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type PaymentRecord,
  generateTxnId,
  getPaymentRecord,
  savePaymentRecord,
} from "../lib/constants";

type PaymentMethod = "upi" | "card" | "netbanking";
type Step = "payment" | "processing" | "success" | "failed";

interface PaymentSearchParams {
  workerId?: string;
  workerName?: string;
  category?: string;
  feeAmount?: string;
  mobile?: string;
}

const BANKS = [
  { name: "SBI", icon: "🏦" },
  { name: "HDFC", icon: "🏦" },
  { name: "ICICI", icon: "🏦" },
  { name: "Axis", icon: "🏦" },
  { name: "PNB", icon: "🏦" },
  { name: "Kotak", icon: "🏦" },
];

export function PaymentScreen() {
  const search = useSearch({ from: "/payment" }) as PaymentSearchParams;
  const navigate = useNavigate();

  const workerId = search.workerId ?? "";
  const workerName = search.workerName ?? "Unknown";
  const category = search.category ?? "";
  const feeAmount = Number(search.feeAmount ?? 50);
  const mobile = search.mobile ?? "";

  const existingRecord = workerId ? getPaymentRecord(workerId) : null;
  const alreadyApproved = existingRecord?.status === "approved";

  const [step, setStep] = useState<Step>("payment");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [txnId, setTxnId] = useState("");
  const [savedRecord, setSavedRecord] = useState<PaymentRecord | null>(
    existingRecord,
  );

  function validate(): boolean {
    if (payMethod === "upi") {
      if (!upiId.includes("@")) {
        toast.error("Valid UPI ID daalo (e.g. name@upi)");
        return false;
      }
    } else if (payMethod === "card") {
      const cleaned = cardNum.replace(/\s/g, "");
      if (cleaned.length < 16) {
        toast.error("16-digit card number daalo");
        return false;
      }
      if (expiry.length < 5) {
        toast.error("Expiry date daalo (MM/YY)");
        return false;
      }
      if (cvv.length < 3) {
        toast.error("3-digit CVV daalo");
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
        setTxnId(id);
        const record: PaymentRecord = {
          workerId,
          mobile,
          workerName,
          category,
          feeAmount,
          status: "approved",
          submittedAt: Date.now(),
          reviewedAt: Date.now(),
        };
        savePaymentRecord(record);
        setSavedRecord(record);
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

  const shortWorkerId = `KM-${workerId.slice(-8).toUpperCase()}`;
  const displayDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Already paid view
  if (alreadyApproved && savedRecord) {
    return (
      <div className="min-h-screen bg-[#072654] flex flex-col">
        <header className="px-4 py-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-white/80" />
          <div>
            <p className="text-white font-bold text-base">KaamMitra</p>
            <p className="text-white/70 text-xs">Registration Fee</p>
          </div>
          <div className="ml-auto bg-white/20 rounded-full px-3 py-1">
            <span className="text-white font-bold text-sm">
              ₹{savedRecord.feeAmount}
            </span>
          </div>
        </header>
        <div className="flex-1 bg-gray-50 rounded-t-3xl p-4 mt-2 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">✅</div>
          <h1 className="text-2xl font-black text-green-700">Already Paid!</h1>
          <p className="text-sm text-gray-500">
            Aapki payment pehle se approved hai
          </p>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-green-200 p-4 space-y-2 shadow-sm">
            <ReceiptRow label="Worker Name" value={savedRecord.workerName} />
            <ReceiptRow label="Category" value={savedRecord.category} />
            <ReceiptRow label="Amount" value={`₹${savedRecord.feeAmount}`} />
            <ReceiptRow label="Worker ID" value={shortWorkerId} />
            <ReceiptRow label="Status" value="✅ Approved" />
          </div>
          <Button
            className="w-full max-w-sm h-12 bg-[#072654] text-white font-bold rounded-2xl"
            onClick={() => navigate({ to: "/find-worker" })}
          >
            Worker List Mein Dekho
          </Button>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div
        data-ocid="payment.loading_state"
        className="min-h-screen bg-[#072654] flex flex-col items-center justify-center gap-6"
      >
        <Loader2 className="w-16 h-16 text-white animate-spin" />
        <div className="text-center">
          <p className="text-white text-xl font-black">
            Payment Ho Rahi Hai...
          </p>
          <p className="text-white/70 text-sm mt-1">
            Please wait, mat close karo
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div
        data-ocid="payment.success_state"
        className="min-h-screen bg-[#072654] flex flex-col"
      >
        <header className="px-4 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-white font-bold">Payment Successful</span>
        </header>
        <div className="flex-1 bg-gray-50 rounded-t-3xl p-4 mt-2">
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl animate-bounce">
              ✅
            </div>
            <h1 className="text-2xl font-black text-green-700">
              Payment Successful!
            </h1>
            <p className="text-sm text-gray-500 text-center">
              Aapki profile ab active ho gayi hai
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-green-200 p-4 space-y-3 shadow-sm mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Receipt
            </p>
            <ReceiptRow label="Worker Name" value={workerName} />
            <ReceiptRow label="Category" value={category} />
            <ReceiptRow label="Amount" value={`₹${feeAmount}`} />
            <ReceiptRow label="Worker ID" value={shortWorkerId} />
            <ReceiptRow label="Transaction ID" value={txnId} mono />
            <ReceiptRow label="Date" value={displayDate} />
            <ReceiptRow label="Status" value="✅ Approved" green />
          </div>

          <div className="space-y-2">
            <Button
              data-ocid="payment.view_workers_button"
              className="w-full h-12 bg-[#072654] text-white font-bold rounded-2xl"
              onClick={() => navigate({ to: "/find-worker" })}
            >
              Worker List Mein Dekho
            </Button>
            <Button
              data-ocid="payment.view_history_button"
              variant="outline"
              className="w-full h-12 rounded-2xl font-bold border-[#072654] text-[#072654]"
              onClick={() => navigate({ to: "/payment-history" })}
            >
              Payment History Dekho
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div
        data-ocid="payment.error_state"
        className="min-h-screen bg-[#072654] flex flex-col items-center justify-center gap-6 p-4"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl">
          ❌
        </div>
        <div className="text-center">
          <p className="text-white text-xl font-black">Payment Failed</p>
          <p className="text-white/70 text-sm mt-1">
            Kuch problem aa gayi. Dobara try karein.
          </p>
        </div>
        <Button
          data-ocid="payment.retry_button"
          className="h-12 px-8 bg-white text-[#072654] font-bold rounded-2xl"
          onClick={() => setStep("payment")}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Karein
        </Button>
        <Button
          variant="ghost"
          className="text-white/70"
          onClick={() => navigate({ to: "/" })}
        >
          Home Jao
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#072654] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3">
        <Lock className="w-5 h-5 text-white/80" />
        <div className="flex-1">
          <p className="text-white font-bold text-base">
            KaamMitra Registration Fee
          </p>
          <p className="text-white/70 text-xs">Secure Payment Gateway</p>
        </div>
        <div className="bg-white/20 rounded-full px-3 py-1">
          <span className="text-white font-bold text-sm">₹{feeAmount}</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl p-4 mt-2 space-y-4">
        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{workerName}</p>
              <p className="text-xs text-gray-500">{category}</p>
            </div>
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-amber-800">
              Registration Fee
            </span>
            <span className="text-lg font-black text-amber-700">
              ₹{feeAmount}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <Tabs
          value={payMethod}
          onValueChange={(v) => setPayMethod(v as PaymentMethod)}
        >
          <TabsList className="w-full grid grid-cols-3 h-11">
            <TabsTrigger
              data-ocid="payment.upi_tab"
              value="upi"
              className="text-xs font-bold gap-1"
            >
              <Smartphone className="w-3 h-3" /> UPI
            </TabsTrigger>
            <TabsTrigger
              data-ocid="payment.card_tab"
              value="card"
              className="text-xs font-bold gap-1"
            >
              <CreditCard className="w-3 h-3" /> Card
            </TabsTrigger>
            <TabsTrigger
              data-ocid="payment.netbanking_tab"
              value="netbanking"
              className="text-xs font-bold gap-1"
            >
              🏦 Net Banking
            </TabsTrigger>
          </TabsList>

          {/* UPI Tab */}
          <TabsContent value="upi" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">UPI ID</Label>
              <Input
                data-ocid="payment.upi_input"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="h-12"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Ya in apps se pay karein:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Google Pay", emoji: "🔵" },
                { name: "PhonePe", emoji: "🟣" },
                { name: "Paytm", emoji: "🔵" },
              ].map((app) => (
                <button
                  key={app.name}
                  type="button"
                  className="h-16 bg-white border-2 border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                  onClick={() => {
                    setUpiId("user@upi");
                    toast.info(`${app.name} se payment karein`);
                  }}
                >
                  <span className="text-xl">{app.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Card Tab */}
          <TabsContent value="card" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Card Number</Label>
              <Input
                data-ocid="payment.card_number_input"
                placeholder="0000 0000 0000 0000"
                value={cardNum}
                onChange={(e) => setCardNum(formatCardNum(e.target.value))}
                className="h-12 font-mono tracking-widest"
                inputMode="numeric"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Expiry (MM/YY)</Label>
                <Input
                  data-ocid="payment.card_expiry_input"
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
                  data-ocid="payment.card_cvv_input"
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
                data-ocid="payment.card_name_input"
                placeholder="Name as on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="h-12"
              />
            </div>
          </TabsContent>

          {/* Net Banking Tab */}
          <TabsContent value="netbanking" className="mt-3">
            <p className="text-xs font-bold text-gray-600 mb-2">
              Bank Chunein:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BANKS.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  className={`h-16 bg-white border-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                    selectedBank === bank.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedBank(bank.name)}
                >
                  <span className="text-xl">{bank.icon}</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {bank.name}
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <Button
          data-ocid="payment.submit_button"
          className="w-full h-14 bg-[#072654] text-white font-black text-base rounded-2xl shadow-lg"
          onClick={handleSubmit}
        >
          <Lock className="w-4 h-4 mr-2" />₹{feeAmount} Pay Karein
        </Button>

        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> 256-bit SSL Encrypted · Safe & Secure
        </p>
      </div>
    </div>
  );
}

function ReceiptRow({
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

export default PaymentScreen;
