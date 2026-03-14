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
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileCheck, ShieldCheck, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CATEGORIES,
  type VerificationRecord,
  getMyExtendedProfile,
  getVerificationRecord,
  isDocNumberUsed,
  registerDocNumber,
  saveVerificationRecord,
} from "../lib/constants";

function StatusBadge({
  status,
}: { status: VerificationRecord["status"] | null }) {
  if (!status) return null;
  if (status === "pending")
    return (
      <div
        data-ocid="worker_verification.status_badge"
        className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4"
      >
        <span className="text-2xl">⏳</span>
        <div>
          <p className="font-bold text-yellow-800 text-sm">
            Verification Pending
          </p>
          <p className="text-xs text-yellow-700">
            Admin review karega — 24-48 hours mein update milega
          </p>
        </div>
      </div>
    );
  if (status === "verified")
    return (
      <div
        data-ocid="worker_verification.status_badge"
        className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4"
      >
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-bold text-green-800 text-sm">Verified Worker</p>
          <p className="text-xs text-green-700">
            Aapka account verified hai. Worker cards mein badge dikh raha hai.
          </p>
        </div>
      </div>
    );
  return (
    <div
      data-ocid="worker_verification.status_badge"
      className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"
    >
      <span className="text-2xl">❌</span>
      <div>
        <p className="font-bold text-red-800 text-sm">Rejected</p>
        <p className="text-xs text-red-700">
          Dobara try karein — sahi documents upload karein
        </p>
      </div>
    </div>
  );
}

export function WorkerVerification() {
  const navigate = useNavigate();
  const myProfile = getMyExtendedProfile();
  const workerProfileRaw = localStorage.getItem("workerProfile");
  const workerProfile = workerProfileRaw
    ? (JSON.parse(workerProfileRaw) as Record<string, string>)
    : null;

  const existingRecord = myProfile
    ? getVerificationRecord(myProfile.mobile)
    : null;

  const [fullName, setFullName] = useState(workerProfile?.name || "");
  const [mobile] = useState(myProfile?.mobile || "");
  const [category, setCategory] = useState(workerProfile?.category || "");
  const [city, setCity] = useState(
    myProfile?.city || workerProfile?.city || "",
  );
  const [docType, setDocType] = useState<VerificationRecord["docType"] | "">(
    "",
  );
  const [docNumber, setDocNumber] = useState("");
  const [docImageBase64, setDocImageBase64] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File 2MB se chhota hona chahiye");
      return;
    }
    setDocFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocImageBase64((ev.target?.result as string) || "");
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mobile) {
      toast.error("Pehle apna worker profile banao!");
      navigate({ to: "/create-profile" });
      return;
    }
    if (!fullName || !category || !city || !docType || !docNumber) {
      toast.error("Sab fields bharein");
      return;
    }
    if (isDocNumberUsed(docNumber, mobile)) {
      toast.error(
        "Yeh document number pehle se registered hai. Ek document sirf ek baar use ho sakta hai.",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      registerDocNumber(docNumber, mobile);
      saveVerificationRecord({
        mobile,
        fullName,
        category,
        city,
        docType: docType as VerificationRecord["docType"],
        docNumber,
        docImageBase64,
        status: "pending",
        submittedAt: Date.now(),
      });
      setSubmitted(true);
      toast.success("Verification request submit ho gayi! ✅");
    } catch {
      toast.error("Kuch galat ho gaya. Dobara try karein.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentStatus = submitted
    ? "pending"
    : (existingRecord?.status ?? null);

  return (
    <div
      data-ocid="worker_verification.page"
      className="page-container pt-4 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/settings" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display font-black">
            Worker Verification
          </h1>
        </div>
      </div>

      {/* Status badge if already submitted */}
      <StatusBadge status={currentStatus} />

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-bold text-blue-800 mb-1">
          📋 Verification Kyun Zaruri Hai?
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Worker cards mein ✅ Verified badge milega</li>
          <li>• Contractors aapko pehle dekhenge (sort by verified)</li>
          <li>• Trust aur credibility badhegi</li>
          <li>• Ek document ek baar sirf ek hi worker use kar sakta hai</li>
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm font-semibold">Pura Naam *</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Apna pura naam likhein"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold">Mobile Number</Label>
          <Input
            value={mobile || "Profile se load hoga"}
            disabled
            className="h-11 bg-muted"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold">Work Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Category chunein" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold">City *</Label>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Apna shehar likhein"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold">Document Type *</Label>
          <Select
            value={docType}
            onValueChange={(v) =>
              setDocType(v as VerificationRecord["docType"])
            }
          >
            <SelectTrigger
              data-ocid="worker_verification.doc_type_select"
              className="h-11"
            >
              <SelectValue placeholder="Document type chunein" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aadhaar">🪪 Aadhaar Card</SelectItem>
              <SelectItem value="driving_licence">
                🚗 Driving Licence
              </SelectItem>
              <SelectItem value="voter_id">🗳️ Voter ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold">Document Number *</Label>
          <Input
            data-ocid="worker_verification.doc_number_input"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
            placeholder={
              docType === "aadhaar" ? "xxxx xxxx xxxx" : "Document number"
            }
            className="h-11 font-mono tracking-wider"
            required
          />
          {docNumber && isDocNumberUsed(docNumber, mobile) && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Yeh number pehle se use ho chuka hai
            </p>
          )}
        </div>

        {/* Document Upload */}
        <div className="space-y-1">
          <Label className="text-sm font-semibold">
            Document Photo Upload (Optional)
          </Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            data-ocid="worker_verification.doc_upload_button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
          >
            {docImageBase64 ? (
              <>
                <FileCheck className="w-6 h-6 text-green-600" />
                <span className="text-xs font-semibold text-green-700">
                  {docFileName}
                </span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, PDF — max 2MB
                </span>
              </>
            )}
          </button>
        </div>

        <Button
          type="submit"
          data-ocid="worker_verification.submit_button"
          disabled={isSubmitting || submitted}
          className="w-full h-12 bg-primary hover:bg-primary/90 font-bold text-base rounded-xl"
        >
          {submitted
            ? "✅ Submitted — Review Pending"
            : isSubmitting
              ? "Submit ho raha hai..."
              : "Submit Verification Request"}
        </Button>
      </form>
    </div>
  );
}
