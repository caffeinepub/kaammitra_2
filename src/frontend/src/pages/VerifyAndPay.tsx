import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getMyExtendedProfile,
  getPaidVerification,
  getVerificationRecord,
  isDocNumberUsed,
  registerDocNumber,
  savePaidVerification,
  saveVerificationRecord,
} from "../lib/constants";

type DocType = "aadhaar" | "driving_licence" | "voter_id";

interface ProfileField {
  label: string;
  value: string | undefined;
}

export function VerifyAndPay() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [docType, setDocType] = useState<DocType | "">("");
  const [docNumber, setDocNumber] = useState("");
  const [docDupError, setDocDupError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const myProfile = getMyExtendedProfile();
  const workerProfileRaw = localStorage.getItem("workerProfile");
  const wp = workerProfileRaw
    ? (JSON.parse(workerProfileRaw) as Record<string, string>)
    : null;

  const mobile = myProfile?.mobile || wp?.mobile || "";
  const name = wp?.name || mobile;
  const category = wp?.category || "";
  const city = myProfile?.city || wp?.city || "";

  const profileFields: ProfileField[] = [
    { label: "Name", value: wp?.name },
    { label: "Mobile Number", value: wp?.mobile || myProfile?.mobile },
    { label: "Work Category", value: wp?.category },
    { label: "City/Location", value: myProfile?.city || wp?.city },
    { label: "Experience", value: wp?.experience },
    { label: "Daily Wage Rate", value: wp?.salary },
    { label: "Gender", value: wp?.gender },
  ];

  const completedCount = profileFields.filter((f) => !!f.value?.trim()).length;
  const completionPct = Math.round(
    (completedCount / profileFields.length) * 100,
  );

  const catInitial =
    category.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "KM";
  const mobileDigits = mobile.slice(-5).padStart(5, "0");
  const workerId = `KM-${catInitial}-${mobileDigits}`;

  function handleSendOtp() {
    setOtpSent(true);
    toast.info("Demo OTP bheja gaya!");
  }

  function handleVerifyOtp() {
    if (otpInput === "7291") {
      setOtpVerified(true);
      toast.success("Mobile verified! ✅");
      setTimeout(() => setStep(3), 600);
    } else {
      toast.error("Galat OTP. Demo OTP hai: 7291");
    }
  }

  function handleDocNext() {
    if (!docType || !docNumber.trim()) {
      toast.error("Document type aur number zaroori hai");
      return;
    }
    if (isDocNumberUsed(docNumber.trim())) {
      setDocDupError("Yeh document number pehle se registered hai.");
      return;
    }
    setDocDupError("");
    setStep(4);
  }

  async function handlePay() {
    if (!mobile) {
      toast.error("Profile nahi mili");
      return;
    }
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPaying(false);

    const txnId = `KM-TXN-${Date.now()}`;
    registerDocNumber(docNumber.trim(), mobile);
    const existingRec = getVerificationRecord(mobile);
    saveVerificationRecord({
      mobile,
      fullName: name,
      category,
      city,
      docType: docType as DocType,
      docNumber: docNumber.trim(),
      status: "pending",
      submittedAt: existingRec?.submittedAt ?? Date.now(),
      ...(existingRec ?? {}),
      paidVerified: true,
      otpVerified: true,
      verifiedAt: Date.now(),
      paymentTxnId: txnId,
    } as Parameters<typeof saveVerificationRecord>[0]);
    savePaidVerification({ mobile, txnId, amount: 99, paidAt: Date.now() });
    setPaid(true);
  }

  const alreadyPaid = !!getPaidVerification(mobile);

  if (alreadyPaid && !paid) {
    return (
      <div className="page-container pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/settings" })}
            className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-black">Verification</h1>
        </div>
        <div className="card-elevated p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="w-8 h-8"
              aria-hidden="true"
              role="presentation"
            >
              <path
                d="M2 6l2.5 2.5L10 3.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-xl font-black mb-2">Aap Verified Hain! 🎉</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Aapne pehle se ₹99 pay kar diya hai. Verification pending ya
            approved hai.
          </p>
          <p className="text-xs text-blue-600 font-semibold mb-6">
            Worker ID: {workerId}
          </p>
          <Button
            onClick={() => navigate({ to: "/worker-id-card" })}
            className="w-full"
            data-ocid="verify_pay.id_card_button"
          >
            View My ID Card 🪪
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/settings" })}
            className="w-full mt-2"
            data-ocid="verify_pay.back_button"
          >
            Back to Settings
          </Button>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="page-container pt-4">
        <div className="card-elevated p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="w-10 h-10"
              aria-hidden="true"
              role="presentation"
            >
              <path
                d="M2 6l2.5 2.5L10 3.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-green-600 mb-2">
            Payment Successful! ✅
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Aapka verification request submit ho gaya. 24-48 ghante mein aapka
            Blue Verified Badge active ho jayega.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-blue-600 font-bold">Aapka Worker ID:</p>
            <p className="text-lg font-black text-blue-700 mt-1">{workerId}</p>
          </div>
          <Button
            onClick={() => navigate({ to: "/worker-id-card" })}
            className="w-full bg-blue-600 hover:bg-blue-700"
            data-ocid="verify_pay.success_id_card_button"
          >
            View My ID Card 🪪
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="w-full mt-2"
            data-ocid="verify_pay.success_home_button"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() =>
            step === 1 ? navigate({ to: "/settings" }) : setStep((s) => s - 1)
          }
          className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-black">
          Verification + ID Card
        </h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                step > s
                  ? "bg-blue-500 text-white"
                  : step === s
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? "✓" : s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 flex-1 rounded transition-colors ${step > s ? "bg-blue-400" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Profile Completeness */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <h2 className="font-black text-lg mb-1">Step 1: Profile Check</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Verification ke liye profile complete honi chahiye.
            </p>
            <div className="space-y-2">
              {profileFields.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span
                    className={`text-base ${f.value ? "text-green-500" : "text-red-400"}`}
                  >
                    {f.value ? "✅" : "❌"}
                  </span>
                  <span className="text-sm flex-1">{f.label}</span>
                  {f.value && (
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {f.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  Profile {completionPct}% complete
                </span>
                <span className="font-semibold">
                  {completedCount}/{profileFields.length}
                </span>
              </div>
              <Progress
                value={completionPct}
                className="h-2"
                data-ocid="verify_pay.profile_progress"
              />
            </div>
          </div>
          {completedCount < 4 ? (
            <div className="card-elevated p-4 border-yellow-300 bg-yellow-50">
              <p className="text-yellow-800 font-semibold text-sm">
                ⚠️ Pehle apna profile poora karein ({completedCount}/4 fields
                complete)
              </p>
              <Button
                onClick={() => navigate({ to: "/create-profile" })}
                className="w-full mt-3"
                variant="outline"
                data-ocid="verify_pay.profile_update_button"
              >
                Profile Update Karein
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-ocid="verify_pay.step1_next_button"
            >
              Next Step →
            </Button>
          )}
        </div>
      )}

      {/* Step 2 — OTP */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <h2 className="font-black text-lg mb-1">Step 2: Mobile Verify</h2>
            <p className="text-sm text-muted-foreground mb-4">
              OTP aapke registered mobile number par bheja jayega.
            </p>
            <div className="bg-muted rounded-xl p-3 text-center mb-4">
              <p className="text-sm text-muted-foreground">Mobile Number</p>
              <p className="text-xl font-black">{mobile || "Not found"}</p>
            </div>
            {!otpSent ? (
              <Button
                onClick={handleSendOtp}
                className="w-full"
                data-ocid="verify_pay.send_otp_button"
              >
                Send OTP
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-amber-800 text-sm font-semibold">
                    Demo OTP: <span className="font-black text-lg">7291</span>
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    (Real SMS is demo-only on this platform)
                  </p>
                </div>
                <div>
                  <Label htmlFor="otp-input">OTP Enter Karein</Label>
                  <Input
                    id="otp-input"
                    data-ocid="verify_pay.otp_input"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    className="text-center text-xl tracking-widest mt-1"
                  />
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otpVerified}
                  className="w-full"
                  data-ocid="verify_pay.verify_otp_button"
                >
                  {otpVerified ? "✅ Verified!" : "Verify OTP"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3 — Document */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <h2 className="font-black text-lg mb-1">Step 3: Document Upload</h2>
            <p className="text-sm text-muted-foreground mb-4">
              ID proof upload karein verification ke liye.
            </p>
            <div className="space-y-4">
              <div>
                <Label>Document Type</Label>
                <Select
                  value={docType}
                  onValueChange={(v) => setDocType(v as DocType)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="verify_pay.doc_type_select"
                  >
                    <SelectValue placeholder="Select document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="driving_licence">
                      Driving Licence
                    </SelectItem>
                    <SelectItem value="voter_id">Voter ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doc-number">Document Number</Label>
                <Input
                  id="doc-number"
                  data-ocid="verify_pay.doc_number_input"
                  value={docNumber}
                  onChange={(e) => {
                    setDocNumber(e.target.value);
                    setDocDupError("");
                  }}
                  placeholder="Document number darj karein"
                  className="mt-1"
                />
                {docDupError && (
                  <p
                    className="text-red-500 text-xs mt-1"
                    data-ocid="verify_pay.doc_error_state"
                  >
                    {docDupError}
                  </p>
                )}
              </div>
              <div>
                <Label>Document Photo (Optional)</Label>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center mt-1 text-sm text-muted-foreground"
                  data-ocid="verify_pay.dropzone"
                >
                  📎 Photo attach karein (optional)
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDocNext}
            disabled={!docType || !docNumber.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
            data-ocid="verify_pay.doc_next_button"
          >
            Next Step →
          </Button>
        </div>
      )}

      {/* Step 4 — Pay */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <h2 className="font-black text-lg mb-1">Step 4: Pay ₹99</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-800 font-bold text-sm mb-2">
                Aapko milega:
              </p>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>🔵 Blue Verified Badge aapke profile par</li>
                <li>🪪 Digital Worker ID Card</li>
                <li>📋 Search results mein priority listing</li>
                <li>🔒 Secure verified worker identity</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-2">UPI se pay karein:</p>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3Dkaammitra%40upi%26am%3D99%26tn%3DKaamMitra+Verification"
                alt="UPI QR Code"
                className="w-40 h-40 mx-auto rounded-xl border mb-3"
              />
              <p className="text-xs text-muted-foreground mb-1">
                UPI ID:{" "}
                <span className="font-bold text-foreground">kaammitra@upi</span>
              </p>
              <div className="flex justify-center gap-3 text-xs text-muted-foreground mb-4">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-base py-3"
            data-ocid="verify_pay.pay_button"
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Payment Processing...
              </>
            ) : (
              "Pay ₹99 Now →"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo mode — payment automatically verified
          </p>
        </div>
      )}
    </div>
  );
}
