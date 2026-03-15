import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type PremiumPlanType,
  type PremiumRecord,
  getMyPremiumPlan,
  isPremiumContractor,
  savePremiumRecord,
} from "../lib/constants";

interface Plan {
  id: PremiumPlanType;
  badge: string;
  title: string;
  price: number;
  priceLabel: string;
  popular?: string;
  features: string[];
  cta: string;
  color: string;
  borderColor: string;
}

const PLANS: Plan[] = [
  {
    id: "worker_basic",
    badge: "Worker",
    title: "Worker Basic",
    price: 49,
    priceLabel: "₹49 one-time",
    features: [
      "Profile verification badge",
      "Appear in search results",
      "Basic support",
    ],
    cta: "Get Verified – ₹49",
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-200",
  },
  {
    id: "worker_priority",
    badge: "Worker Priority",
    title: "Worker Priority",
    price: 99,
    priceLabel: "₹99 one-time",
    popular: "Popular",
    features: [
      "Priority listing in search",
      "Verified badge on profile",
      "Profile featured to contractors",
      "Fast review (24 hrs)",
    ],
    cta: "Get Priority Verified – ₹99",
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-200",
  },
  {
    id: "contractor_premium",
    badge: "Contractor",
    title: "Contractor Premium",
    price: 299,
    priceLabel: "₹299/month",
    popular: "Best Value",
    features: [
      "Unlimited job posts",
      "Priority listing",
      "Featured jobs to workers",
      "Dedicated support",
      "Booking commission waived",
    ],
    cta: "Get Premium – ₹299/mo",
    color: "from-violet-600 to-purple-700",
    borderColor: "border-violet-200",
  },
];

export function PremiumPlans() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [upiId, setUpiId] = useState("");
  const [paying, setPaying] = useState(false);

  const myMobile = (() => {
    try {
      const p = localStorage.getItem("kaam_mitra_my_extended");
      return p ? JSON.parse(p).mobile : "";
    } catch {
      return "";
    }
  })();

  const contractorProfile = localStorage.getItem("contractorProfile");
  const contractorMobile = (() => {
    try {
      return contractorProfile
        ? JSON.parse(contractorProfile).mobile
        : myMobile;
    } catch {
      return myMobile;
    }
  })();

  const isPremium = isPremiumContractor(contractorMobile);
  const premiumRecord = getMyPremiumPlan(contractorMobile);

  function handlePay() {
    if (!selectedPlan) return;
    setPaying(true);
    setTimeout(() => {
      const record: PremiumRecord = {
        id: `prem-${Date.now()}`,
        mobile: contractorMobile || myMobile || "demo",
        planType: selectedPlan.id,
        amount: selectedPlan.price,
        txnId: `KM-TXN-${Date.now()}`,
        activatedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      savePremiumRecord(record);
      setPaying(false);
      setSelectedPlan(null);
      toast.success(`Plan activated! ✅ ${selectedPlan.title} is now active.`);
    }, 1200);
  }

  return (
    <div className="page-container pt-0">
      {/* Header */}
      <div className="-mx-4 px-6 pt-8 pb-10 bg-gradient-to-br from-violet-600 to-purple-700 text-white mb-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-black mb-1">
            KaamMitra Premium 👑
          </h1>
          <p className="text-violet-200 text-sm">Apne kaam ko aage badhao</p>
        </motion.div>
      </div>

      {/* Premium Active Banner */}
      <AnimatePresence>
        {isPremium && premiumRecord && (
          <motion.div
            data-ocid="premium.active_state"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="-mx-4 px-4 py-3 mb-4 bg-green-50 border-y border-green-200"
          >
            <p className="text-green-700 font-semibold text-sm">
              ✅ Contractor Premium Active
            </p>
            <p className="text-green-600 text-xs">
              Expires:{" "}
              {new Date(premiumRecord.expiresAt).toLocaleDateString("en-IN")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Cards */}
      <div className="space-y-4 mb-6">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            data-ocid={`premium.plan.item.${i + 1}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className={`border-2 ${plan.borderColor} relative overflow-hidden`}
            >
              {plan.popular && (
                <div
                  className={`absolute top-0 right-0 bg-gradient-to-r ${plan.color} text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl`}
                >
                  {plan.popular}
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span
                      className={`inline-block bg-gradient-to-r ${plan.color} text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2`}
                    >
                      {plan.badge}
                    </span>
                    <h3 className="font-display font-black text-lg text-foreground">
                      {plan.title}
                    </h3>
                    <p className="text-2xl font-black text-foreground">
                      {plan.priceLabel}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <span className="text-green-500 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  data-ocid={`premium.plan.primary_button.${i + 1}`}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full bg-gradient-to-r ${plan.color} text-white font-bold border-0 hover:opacity-90`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Booking Commission Info */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-8">
        <p className="text-amber-800 text-sm font-semibold mb-1">
          📌 Booking Commission
        </p>
        <p className="text-amber-700 text-xs">
          ₹50–₹200 is charged per successful booking. This ensures quality
          service for both workers and contractors.
        </p>
      </div>

      {/* Payment Sheet */}
      <Sheet open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <SheetContent
          data-ocid="premium.payment_sheet"
          side="bottom"
          className="rounded-t-3xl max-h-[85vh]"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="font-display font-black">
              {selectedPlan?.title} – {selectedPlan?.priceLabel}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto">
            {/* UPI Input */}
            <div>
              <label
                htmlFor="upi-id"
                className="text-sm font-semibold text-foreground mb-1.5 block"
              >
                Your UPI ID
              </label>
              <input
                type="text"
                id="upi-id"
                data-ocid="premium.upi.input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter your UPI ID (e.g. name@upi)"
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* QR Placeholder */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-muted border-2 border-dashed border-border py-8 gap-2">
              <span className="text-4xl">📱</span>
              <p className="font-semibold text-foreground text-sm">
                Scan QR to Pay
              </p>
              <p className="text-xs text-muted-foreground">
                UPI: kaammitra@upi
              </p>
              <p className="text-lg font-black text-foreground mt-1">
                ₹{selectedPlan?.price}
              </p>
            </div>

            <Button
              data-ocid="premium.pay_button"
              onClick={handlePay}
              disabled={paying}
              className="w-full py-6 text-base font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white border-0"
            >
              {paying ? "Processing..." : "Pay via Razorpay"}
            </Button>

            <Button
              variant="outline"
              data-ocid="premium.payment.cancel_button"
              onClick={() => setSelectedPlan(null)}
              className="w-full rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
