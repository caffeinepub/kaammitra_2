import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateJobApproved } from "../hooks/useQueries";
import { CATEGORIES, CATEGORY_EMOJIS } from "../lib/constants";

type PaymentMethod = "upi" | "card" | "netbanking";
type Step = "form" | "payment" | "processing" | "success" | "failed";

const PAYMENT_AMOUNT = 99;

export function PostJob() {
  const [form, setForm] = useState({
    category: "",
    location: "",
    description: "",
    payOffered: "",
    postedBy: "",
    phone: "",
  });
  const [step, setStep] = useState<Step>("form");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [payError, setPayError] = useState("");
  const [savedJob, setSavedJob] = useState<{
    id: string;
    category: string;
  } | null>(null);

  const { mutateAsync, isPending } = useCreateJobApproved();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.category ||
      !form.location ||
      !form.description ||
      !form.payOffered ||
      !form.postedBy
    ) {
      toast.error("Sab fields bharo");
      return;
    }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayment = async () => {
    setPayError("");

    // Validate payment fields
    if (payMethod === "upi") {
      if (!upiId.trim() || !upiId.includes("@")) {
        setPayError("Valid UPI ID daalo (eg: name@upi)");
        return;
      }
    } else if (payMethod === "card") {
      if (cardNum.replace(/\s/g, "").length < 16) {
        setPayError("16-digit card number daalo");
        return;
      }
      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        setPayError("Expiry MM/YY format mein daalo");
        return;
      }
      if (cardCvv.length < 3) {
        setPayError("CVV daalo");
        return;
      }
      if (!cardName.trim()) {
        setPayError("Card par naam daalo");
        return;
      }
    }

    setStep("processing");

    // Simulate payment processing (2s delay)
    await new Promise((res) => setTimeout(res, 2000));

    // Demo: 90% success rate simulation
    const success = Math.random() > 0.05;

    if (success) {
      try {
        const job = await mutateAsync(form);
        setSavedJob({ id: job.id.toString(), category: job.category });
        setStep("success");
        toast.success("Payment safal! Job post ho gayi!");
      } catch {
        setStep("failed");
        setPayError("Job save karne mein error. Support se sampark karo.");
      }
    } else {
      setStep("failed");
      setPayError("Payment fail ho gayi. Dobara try karo.");
    }
  };

  const resetAll = () => {
    setForm({
      category: "",
      location: "",
      description: "",
      payOffered: "",
      postedBy: "",
      phone: "",
    });
    setUpiId("");
    setCardNum("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setPayError("");
    setStep("form");
    setSavedJob(null);
  };

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="page-container pt-8">
        <div
          data-ocid="post_job.success_state"
          className="card-elevated p-8 text-center animate-slide-up"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-black mb-1 text-green-700">
            Payment Safal!
          </h2>
          <p className="text-sm text-muted-foreground mb-1">
            ₹{PAYMENT_AMOUNT} payment ho gayi
          </p>
          <div className="my-4 bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">
              Job Details Saved
            </p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold">{form.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold">{form.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pay Offered</span>
                <span className="font-semibold">{form.payOffered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posted By</span>
                <span className="font-semibold">{form.postedBy}</span>
              </div>
              {savedJob && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job ID</span>
                  <span className="font-mono text-xs font-semibold">
                    #{savedJob.id}
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Aapki job ab "Find Work" list mein dikhayi de rahi hai
          </p>
          <Button
            data-ocid="post_job.new_post_button"
            className="touch-btn w-full"
            onClick={resetAll}
          >
            Naya Job Post Karo
          </Button>
        </div>
      </div>
    );
  }

  // ─── FAILED SCREEN ────────────────────────────────────────────────
  if (step === "failed") {
    return (
      <div className="page-container pt-8">
        <div
          data-ocid="post_job.error_state"
          className="card-elevated p-8 text-center animate-slide-up"
        >
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-display font-black mb-1 text-red-700">
            Payment Fail!
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {payError || "Kuch galat ho gaya. Job post nahi hui."}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Aapka data safe hai. Dobara try karo.
          </p>
          <div className="space-y-3">
            <Button
              data-ocid="post_job.retry_button"
              className="touch-btn w-full"
              onClick={() => {
                setPayError("");
                setStep("payment");
              }}
            >
              Dobara Try Karo
            </Button>
            <Button
              data-ocid="post_job.back_to_form_button"
              variant="outline"
              className="touch-btn w-full"
              onClick={() => {
                setPayError("");
                setStep("form");
              }}
            >
              Form Wapas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PROCESSING SCREEN ────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="page-container pt-8">
        <div
          data-ocid="post_job.loading_state"
          className="card-elevated p-10 text-center"
        >
          <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold mb-2">
            Payment Ho Rahi Hai...
          </h2>
          <p className="text-sm text-muted-foreground">
            Bank se verify ho raha hai, please wait
          </p>
        </div>
      </div>
    );
  }

  // ─── PAYMENT SCREEN ───────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="page-container pt-4">
        {/* Razorpay-style header */}
        <div className="card-elevated overflow-hidden mb-4">
          <div className="bg-[#072654] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs opacity-70">KaamMitra Premium</p>
              <p className="text-lg font-bold">₹{PAYMENT_AMOUNT}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <Lock className="w-3 h-3" />
              <span>Secure Payment</span>
            </div>
          </div>

          {/* Job summary */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-800 mb-1">
              Job Summary
            </p>
            <div className="text-xs text-blue-700 space-y-0.5">
              <p>
                {CATEGORY_EMOJIS[form.category]} {form.category} ·{" "}
                {form.location}
              </p>
              <p className="truncate">{form.description}</p>
            </div>
          </div>
        </div>

        {/* Payment method tabs */}
        <div
          data-ocid="post_job.payment_method_tab"
          className="card-elevated p-4"
        >
          <p className="text-sm font-semibold mb-3">Payment Method Chunein</p>

          <div className="flex gap-2 mb-4">
            {[
              { id: "upi" as PaymentMethod, label: "UPI", icon: Smartphone },
              { id: "card" as PaymentMethod, label: "Card", icon: CreditCard },
              {
                id: "netbanking" as PaymentMethod,
                label: "Net Banking",
                icon: Lock,
              },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                data-ocid={`post_job.${id}_tab`}
                onClick={() => {
                  setPayMethod(id);
                  setPayError("");
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-colors ${
                  payMethod === id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* UPI */}
          {payMethod === "upi" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="upi">UPI ID</Label>
                <Input
                  data-ocid="post_job.upi_input"
                  id="upi"
                  placeholder="Eg: yourname@upi, 9876543210@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex gap-2">
                {["@paytm", "@gpay", "@phonepe", "@ybl"].map((suffix) => (
                  <button
                    key={suffix}
                    type="button"
                    onClick={() => {
                      const base = upiId.split("@")[0] || "yourname";
                      setUpiId(base + suffix);
                    }}
                    className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {suffix}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card */}
          {payMethod === "card" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cname">Card Par Naam</Label>
                <Input
                  data-ocid="post_job.card_name_input"
                  id="cname"
                  placeholder="Jaise card par likha hai"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnum">Card Number</Label>
                <Input
                  data-ocid="post_job.card_number_input"
                  id="cnum"
                  placeholder="1234 5678 9012 3456"
                  value={cardNum}
                  maxLength={19}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setCardNum(v.replace(/(\d{4})/g, "$1 ").trim());
                  }}
                  className="h-12 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="exp">Expiry (MM/YY)</Label>
                  <Input
                    data-ocid="post_job.card_expiry_input"
                    id="exp"
                    placeholder="08/27"
                    value={cardExpiry}
                    maxLength={5}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCardExpiry(
                        v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v,
                      );
                    }}
                    className="h-12 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    data-ocid="post_job.card_cvv_input"
                    id="cvv"
                    type="password"
                    placeholder="•••"
                    value={cardCvv}
                    maxLength={4}
                    onChange={(e) =>
                      setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="h-12 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Net Banking */}
          {payMethod === "netbanking" && (
            <div className="grid grid-cols-3 gap-2">
              {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Other"].map(
                (bank) => (
                  <button
                    key={bank}
                    type="button"
                    data-ocid={`post_job.bank_${bank.toLowerCase()}_button`}
                    className="border-2 border-border rounded-xl p-3 text-xs font-semibold hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {bank}
                  </button>
                ),
              )}
            </div>
          )}

          {payError && (
            <div
              data-ocid="post_job.payment_error_state"
              className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {payError}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 space-y-3">
          <Button
            data-ocid="post_job.pay_button"
            className="w-full touch-btn h-14 text-lg font-display font-bold bg-[#072654] hover:bg-[#0a3470] text-white"
            onClick={handlePayment}
          >
            <Lock className="w-4 h-4 mr-2" />₹{PAYMENT_AMOUNT} Pay Karo & Post
            Karo
          </Button>
          <Button
            data-ocid="post_job.back_button"
            variant="ghost"
            className="w-full touch-btn"
            onClick={() => setStep("form")}
          >
            <X className="w-4 h-4 mr-1" /> Wapas Jao
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          🔒 256-bit SSL encrypted · Secure checkout
        </p>
      </div>
    );
  }

  // ─── FORM ─────────────────────────────────────────────────────────
  return (
    <div className="page-container pt-4">
      <h1 className="text-2xl font-display font-black mb-1">Job Post Karo</h1>
      <p className="text-sm text-muted-foreground mb-1">
        Apni requirement batao, worker milega
      </p>
      <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-5">
        <span className="text-amber-700 font-bold text-sm">
          ₹{PAYMENT_AMOUNT}
        </span>
        <span className="text-amber-600 text-xs">
          premium job post — turant visible
        </span>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
          >
            <SelectTrigger
              data-ocid="post_job.category_select"
              id="category"
              className="touch-btn h-12"
            >
              <SelectValue placeholder="Worker category chunein" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_EMOJIS[c]} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location *</Label>
          <Input
            data-ocid="post_job.location_input"
            id="location"
            placeholder="Eg: Mumbai, Delhi, Pune"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            className="h-12"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            data-ocid="post_job.description_textarea"
            id="description"
            placeholder="Kya kaam chahiye? Details batao..."
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={4}
            className="resize-none text-base"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pay">Pay Offered *</Label>
          <Input
            data-ocid="post_job.pay_input"
            id="pay"
            placeholder="Eg: ₹500/day, ₹15000/month"
            value={form.payOffered}
            onChange={(e) =>
              setForm((p) => ({ ...p, payOffered: e.target.value }))
            }
            className="h-12"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Your Name *</Label>
          <Input
            data-ocid="post_job.name_input"
            id="name"
            placeholder="Contractor/employer ka naam"
            value={form.postedBy}
            onChange={(e) =>
              setForm((p) => ({ ...p, postedBy: e.target.value }))
            }
            className="h-12"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile Number (Optional)</Label>
          <Input
            data-ocid="post_job.phone_input"
            id="phone"
            type="tel"
            placeholder="Workers contact kar sakein"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="h-12"
          />
        </div>

        <Button
          data-ocid="post_job.submit_button"
          type="submit"
          className="w-full touch-btn h-14 text-lg font-display font-bold mt-2"
          disabled={isPending}
        >
          Aage Badho: ₹{PAYMENT_AMOUNT} Pay Karo 💳
        </Button>
      </form>
    </div>
  );
}
