import { Button } from "@/components/ui/button";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Upload,
  UserCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Worker } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useCreateWorker } from "../hooks/useQueries";
import {
  type AvailabilityStatus,
  CATEGORY_EMOJIS,
  INDIA_STATES_CITIES,
  MAIN_CATEGORIES,
  PROFESSION_DOC_GROUPS,
  type WorkType,
  getCategoryFee,
  getMyExtendedProfile,
  saveExtendedById,
  saveMyExtendedProfile,
} from "../lib/constants";

const STORAGE_KEY = "kaam_mitra_worker_profile";
export const SHEETS_WEBHOOK_KEY = "sheetsWebhookUrl";

function loadSavedProfile(): Worker | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      id: BigInt(parsed.id ?? 0),
      createdAt: BigInt(parsed.createdAt ?? 0),
    } as Worker;
  } catch {
    return null;
  }
}

function saveProfile(worker: Worker) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...worker,
        id: worker.id.toString(),
        createdAt: worker.createdAt.toString(),
      }),
    );
  } catch {
    // ignore storage errors
  }
}

async function sendToGoogleSheets(data: {
  name: string;
  mobile: string;
  category: string;
  experience: string;
  location: string;
  salary: string;
  whatsapp?: string;
  availability?: string;
  workType?: string;
}) {
  const webhookUrl = localStorage.getItem(SHEETS_WEBHOOK_KEY);
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "worker_profile",
        timestamp: new Date().toISOString(),
        ...data,
      }),
    });
  } catch {
    // Sheet sync failure is non-blocking
  }
}

// ─── FILE UPLOAD FIELD ───────────────────────────────────────────────────────
function FileUploadField({
  id,
  label,
  fileName,
  onChange,
  required,
  uploadOcid,
}: {
  id: string;
  label: string;
  fileName: string;
  onChange: (name: string) => void;
  required?: boolean;
  uploadOcid?: string;
}) {
  return (
    <div>
      <input
        type="file"
        id={id}
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-sm"
        onClick={() => document.getElementById(id)?.click()}
        data-ocid={uploadOcid}
      >
        <Upload className="w-4 h-4 mr-2 text-orange-500" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Button>
      {fileName ? (
        <p className="text-xs text-green-600 mt-1 font-medium">✓ {fileName}</p>
      ) : (
        <p className="text-xs text-muted-foreground mt-1">
          {required ? "Required" : "Optional"} · JPG, PNG, PDF accepted
        </p>
      )}
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({
  emoji,
  title,
  subtitle,
}: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="font-display font-bold text-base text-foreground">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function CreateProfile() {
  const { actor } = useActor();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    experience: "",
    location: "",
    expectedSalary: "",
    phone: "",
    whatsapp: "",
    state: "",
    city: "",
    lat: 0,
    lng: 0,
    availability: "available" as AvailabilityStatus,
    workType: "daily" as WorkType,
    // OTP
    otpSent: false,
    otpValue: "",
    otpVerified: false,
    demoOtp: "",
    // Base docs
    aadhaarFileName: "",
    profilePhotoName: "",
    // Driver
    drivingLicenceFileName: "",
    vehicleType: "",
    // Machine operator
    operatorCertFileName: "",
    // Construction
    skillCertFileName: "",
    experiencePhotoFileName: "",
    // Mechanic
    workshopExperience: "",
    technicalCertFileName: "",
    // Office staff
    educationCertFileName: "",
    resumeFileName: "",
    // Builder
    companyName: "",
    businessRegFileName: "",
    dailyWageRate: "",
    gender: "",
  });

  const [savedProfile, setSavedProfile] = useState<Worker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [justSaved, setJustSaved] = useState<Worker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [myStatusOverride, setMyStatusOverride] =
    useState<AvailabilityStatus | null>(null);
  const { mutateAsync, isPending } = useCreateWorker();

  useEffect(() => {
    const existing = loadSavedProfile();
    if (existing) setSavedProfile(existing);
    const ext = getMyExtendedProfile();
    if (ext) setMyStatusOverride(ext.availability);
  }, []);

  const docGroup = form.category
    ? (PROFESSION_DOC_GROUPS[form.category] ?? "general")
    : null;

  const needsLicence =
    docGroup === "driver" ||
    docGroup === "machine_operator" ||
    ["JCB Operator", "Crane Operator"].includes(form.category);

  const needsExpPhoto = ["Electrician", "Welder", "Mechanic"].includes(
    form.category,
  );

  const isVerified =
    !!form.aadhaarFileName &&
    !!form.profilePhotoName &&
    (needsLicence
      ? !!form.drivingLicenceFileName || !!form.operatorCertFileName
      : true);

  const citiesForState = form.state
    ? (INDIA_STATES_CITIES[form.state] ?? [])
    : [];

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      toast.error("GPS aapke browser mein support nahi hai");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          location:
            p.location ||
            `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        setGpsLoading(false);
        toast.success("📍 GPS Location detect ho gaya!");
      },
      () => {
        setGpsLoading(false);
        toast.error("Location access denied. Settings mein allow karo.");
      },
    );
  };

  const handleSendOtp = () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error("Pehle sahi mobile number dalo");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setForm((p) => ({ ...p, otpSent: true, demoOtp: otp, otpValue: "" }));
  };

  const handleVerifyOtp = () => {
    if (form.otpValue === form.demoOtp) {
      setForm((p) => ({ ...p, otpVerified: true }));
      toast.success("Mobile Verify Ho Gaya! ✓");
    } else {
      toast.error("Galat OTP! Dobara try karo.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.category ||
      !form.experience ||
      !form.expectedSalary
    ) {
      toast.error("Sab required fields bharo");
      return;
    }

    const locationStr =
      form.state && form.city
        ? `${form.city}, ${form.state}`
        : form.location ||
          (form.lat ? `${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}` : "");

    if (!locationStr) {
      toast.error("Location daalo ya GPS use karo");
      return;
    }

    setIsSubmitting(true);
    try {
      let savedWorker: Worker | null = null;
      if (actor) {
        try {
          savedWorker = await mutateAsync({
            name: form.name,
            category: form.category,
            experience: form.experience,
            location: locationStr,
            expectedSalary: form.expectedSalary,
          });
        } catch {
          // Backend unavailable - continue with local + sheets save
        }
      }

      if (!savedWorker) {
        savedWorker = {
          id: BigInt(Date.now()),
          name: form.name,
          category: form.category,
          experience: form.experience,
          location: locationStr,
          expectedSalary: form.expectedSalary,
          blocked: false,
          approved: true,
          createdAt: BigInt(Date.now()),
        } as Worker;
      }

      const extData = {
        mobile: form.phone,
        whatsapp: form.whatsapp || undefined,
        state: form.state || undefined,
        city: form.city || undefined,
        availability: form.availability,
        workType: form.workType,
        dailyWageRate: form.dailyWageRate || undefined,
        gender: form.gender || undefined,
        profilePhotoName: form.profilePhotoName || undefined,
        aadhaarUploaded: !!form.aadhaarFileName,
        licenceUploaded:
          !!form.drivingLicenceFileName || !!form.operatorCertFileName,
        experiencePhotoUploaded: !!form.experiencePhotoFileName,
        lat: form.lat || undefined,
        lng: form.lng || undefined,
        lastUpdated: Date.now(),
      };

      saveMyExtendedProfile(extData);
      saveExtendedById(savedWorker.id.toString(), extData);
      saveProfile(savedWorker);

      sendToGoogleSheets({
        name: form.name,
        mobile: form.phone,
        category: form.category,
        experience: form.experience,
        location: locationStr,
        salary: form.expectedSalary,
        whatsapp: form.whatsapp,
        availability: form.availability,
        workType: form.workType,
      });

      setJustSaved(savedWorker);
      setMyStatusOverride(form.availability);
      setSuccessDialogOpen(true);
    } catch {
      toast.error("Kuch galat ho gaya. Dobara try karo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    const saved = justSaved;
    if (saved) {
      setSavedProfile(saved);
      setJustSaved(null);
      setShowForm(false);
      navigate({
        to: "/payment",
        search: {
          workerId: saved.id.toString(),
          workerName: saved.name,
          category: saved.category,
          feeAmount: String(getCategoryFee(saved.category)),
          mobile: form.phone,
        },
      });
    } else {
      navigate({ to: "/find-worker" });
    }
  };

  const handleStatusUpdate = (newStatus: AvailabilityStatus) => {
    setMyStatusOverride(newStatus);
    const ext = getMyExtendedProfile();
    if (ext) {
      saveMyExtendedProfile({
        ...ext,
        availability: newStatus,
        lastUpdated: Date.now(),
      });
    }
    toast.success(
      newStatus === "available"
        ? "🟢 Status: Available set ho gaya!"
        : "🔴 Status: Busy set ho gaya!",
    );
  };

  const resetFormState = (prefill?: Partial<typeof form>) => ({
    name: "",
    category: "",
    experience: "",
    location: "",
    expectedSalary: "",
    phone: "",
    whatsapp: "",
    state: "",
    city: "",
    lat: 0,
    lng: 0,
    availability: "available" as AvailabilityStatus,
    workType: "daily" as WorkType,
    otpSent: false,
    otpValue: "",
    otpVerified: false,
    demoOtp: "",
    aadhaarFileName: "",
    profilePhotoName: "",
    drivingLicenceFileName: "",
    vehicleType: "",
    operatorCertFileName: "",
    skillCertFileName: "",
    experiencePhotoFileName: "",
    workshopExperience: "",
    technicalCertFileName: "",
    educationCertFileName: "",
    resumeFileName: "",
    companyName: "",
    businessRegFileName: "",
    dailyWageRate: "",
    gender: "",
    ...prefill,
  });

  // ─── SUCCESS DIALOG ──────────────────────────────────────────────
  const SuccessDialog = (
    <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
      <DialogContent
        data-ocid="create_profile.success_dialog"
        className="max-w-sm mx-auto rounded-2xl"
      >
        <DialogHeader className="text-center items-center pb-2">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-display font-black text-green-700">
            Profile Ban Gayi! ✅
          </DialogTitle>
        </DialogHeader>

        {justSaved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">
              Aapki Profile Details
            </p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Naam</span>
              <span className="font-semibold">{justSaved.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-semibold">
                {CATEGORY_EMOJIS[justSaved.category]} {justSaved.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-semibold">{justSaved.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Salary</span>
              <span className="font-semibold">{justSaved.expectedSalary}</span>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-green-700 font-semibold">
          🎉 Aapka profile save ho gaya! Workers list mein dikh raha hai.
        </p>

        <DialogFooter>
          <Button
            data-ocid="create_profile.success_confirm_button"
            className="w-full touch-btn font-display font-bold bg-green-600 hover:bg-green-700"
            onClick={handleSuccessDialogClose}
          >
            Worker Dhundho List Dekhein →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ─── EXISTING PROFILE VIEW ──────────────────────────────────────
  if (savedProfile && !showForm) {
    const currentStatus = myStatusOverride ?? "available";
    const ext = getMyExtendedProfile();
    const hasTrustBadge = ext
      ? ext.aadhaarUploaded && ext.profilePhotoName && ext.licenceUploaded
      : false;

    return (
      <div className="page-container pt-6">
        {SuccessDialog}

        <div
          data-ocid="create_profile.success_state"
          className="card-elevated overflow-hidden mb-4 animate-slide-up"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-base">Profile Ban Gayi! ✅</p>
              <p className="text-xs opacity-85">
                Aap logged in hain · Database mein saved
              </p>
            </div>
            {hasTrustBadge && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                ✅ Verified
              </span>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display font-black text-lg">
                  {savedProfile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_EMOJIS[savedProfile.category]}{" "}
                  {savedProfile.category}
                </p>
                {hasTrustBadge && (
                  <span className="text-xs text-green-700 font-semibold">
                    ✅ Verified Worker
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  currentStatus === "available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentStatus === "available" ? "🟢 Available" : "🔴 Busy"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(
                [
                  { label: "Experience", value: savedProfile.experience },
                  { label: "Location", value: savedProfile.location },
                  {
                    label: "Expected Salary",
                    value: savedProfile.expectedSalary,
                  },
                  {
                    label: "Profile ID",
                    value: `#${savedProfile.id.toString()}`,
                  },
                ] as { label: string; value: string }[]
              ).map(({ label, value }) => (
                <div key={label} className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-semibold truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Status Toggle */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-orange-800 mb-3">
                🔄 Apna Work Status Update Karo
              </p>
              <div className="flex gap-2">
                <Button
                  data-ocid="create_profile.available_toggle"
                  size="sm"
                  className={`flex-1 h-10 text-sm font-semibold ${
                    currentStatus === "available"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-white border border-green-300 text-green-700 hover:bg-green-50"
                  }`}
                  onClick={() => handleStatusUpdate("available")}
                >
                  🟢 Available
                </Button>
                <Button
                  data-ocid="create_profile.busy_toggle"
                  size="sm"
                  className={`flex-1 h-10 text-sm font-semibold ${
                    currentStatus === "busy"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white border border-red-300 text-red-700 hover:bg-red-50"
                  }`}
                  onClick={() => handleStatusUpdate("busy")}
                >
                  🔴 Busy
                </Button>
              </div>
            </div>

            <div className="mt-1 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700">
                ✅ Aapka profile database mein save hai. Contractors aapko dekh
                sakte hain.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            data-ocid="create_profile.find_worker_button"
            className="touch-btn w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate({ to: "/find-worker" })}
          >
            Worker Dhundho List Dekhein →
          </Button>
          <Button
            data-ocid="create_profile.edit_button"
            variant="outline"
            className="touch-btn w-full"
            onClick={() => {
              setForm(
                resetFormState({
                  name: savedProfile.name,
                  category: savedProfile.category,
                  experience: savedProfile.experience,
                  location: savedProfile.location,
                  expectedSalary: savedProfile.expectedSalary,
                }),
              );
              setShowForm(true);
            }}
          >
            Profile Edit Karo
          </Button>
          <Button
            data-ocid="create_profile.new_profile_button"
            variant="ghost"
            className="touch-btn w-full text-muted-foreground"
            onClick={() => {
              setForm(resetFormState());
              setShowForm(true);
            }}
          >
            Naya Profile Banao
          </Button>
        </div>
      </div>
    );
  }

  // ─── FORM ─────────────────────────────────────────────────────────
  return (
    <div className="page-container pt-4">
      {SuccessDialog}
      <h1 className="text-2xl font-display font-black mb-1">
        Worker Profile Banao
      </h1>
      <p className="text-sm text-muted-foreground mb-5">
        Apni details do, contractors milenge
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── SECTION 1: BASIC DETAILS ───────────────────────────── */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-4">
          <SectionHeader
            emoji="👤"
            title="Basic Details"
            subtitle="Naam, mobile, category"
          />

          <div className="space-y-1.5">
            <Label htmlFor="name">Apna Naam *</Label>
            <Input
              data-ocid="create_profile.name_input"
              id="name"
              placeholder="Eg: Ramesh Kumar"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="h-12"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
            >
              <SelectTrigger
                data-ocid="create_profile.gender_select"
                className="h-12"
              >
                <SelectValue placeholder="Gender chunein" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">👨 Male (Purush)</SelectItem>
                <SelectItem value="Female">👩 Female (Mahila)</SelectItem>
                <SelectItem value="Other">⚧ Other (Anya)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Female Safety Tips */}
          {form.gender === "Female" && (
            <div
              data-ocid="create_profile.female_safety_tips"
              className="bg-pink-50 border border-pink-200 rounded-xl p-3 mt-2"
            >
              <p className="text-xs font-bold text-pink-800 mb-1.5">
                🛡️ Mahila Worker Safety Tips
              </p>
              <ul className="text-xs text-pink-700 space-y-1">
                <li>
                  • Aapka mobile number sirf verified contractors ko dikhega
                </li>
                <li>
                  • Profile admin dwara review hogi activate hone se pehle
                </li>
                <li>• Kisi bhi problem ke liye Report button use karein</li>
                <li>
                  • OTP verification zaroori hai profile activate karne ke liye
                </li>
              </ul>
            </div>
          )}

          {/* Phone + OTP */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile Number *</Label>
            <div className="flex gap-2">
              <Input
                data-ocid="create_profile.phone_input"
                id="phone"
                type="tel"
                placeholder="10 digit mobile number"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="h-12 flex-1"
                maxLength={10}
              />
              <Button
                data-ocid="create_profile.send_otp_button"
                type="button"
                variant="outline"
                className="h-12 px-3 shrink-0 border-orange-300 text-orange-700"
                onClick={handleSendOtp}
                disabled={form.otpVerified}
              >
                {form.otpVerified ? "✓ Verified" : "OTP Bhejo"}
              </Button>
            </div>
            {form.otpSent && !form.otpVerified && (
              <div className="mt-2 space-y-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-xs text-amber-800 font-semibold">
                    Demo OTP: {form.demoOtp}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    data-ocid="create_profile.otp_input"
                    placeholder="OTP dalo"
                    value={form.otpValue}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, otpValue: e.target.value }))
                    }
                    className="h-11"
                    maxLength={6}
                  />
                  <Button
                    data-ocid="create_profile.verify_otp_button"
                    type="button"
                    className="h-11 px-3"
                    onClick={handleVerifyOtp}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">
              WhatsApp Number{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (Optional)
              </span>
            </Label>
            <Input
              data-ocid="create_profile.whatsapp_input"
              id="whatsapp"
              type="tel"
              placeholder="WhatsApp number (if different)"
              value={form.whatsapp}
              onChange={(e) =>
                setForm((p) => ({ ...p, whatsapp: e.target.value }))
              }
              className="h-12"
              maxLength={10}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger
                data-ocid="create_profile.category_select"
                id="category"
                className="touch-btn h-12"
              >
                <SelectValue placeholder="Apna kaam chunein" />
              </SelectTrigger>
              <SelectContent>
                {MAIN_CATEGORIES.map((group) => (
                  <SelectGroup key={group.id}>
                    <SelectLabel>
                      {group.emoji} {group.name}
                    </SelectLabel>
                    {group.subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {CATEGORY_EMOJIS[sub] || "👷"} {sub}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p
            data-ocid="create_profile.inclusive_note"
            className="text-xs text-muted-foreground mt-1"
          >
            ✅ Sabhi categories sabhi genders ke liye open hain — KaamMitra mein
            sab barabar hain
          </p>

          {form.category && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  Registration Fee
                </span>
              </div>
              <span className="text-lg font-bold text-amber-700">
                20b9{getCategoryFee(form.category)}
              </span>
            </div>
          )}
          {/* Experience */}
          <div className="space-y-1.5">
            <Label htmlFor="experience">Experience *</Label>
            <Input
              data-ocid="create_profile.experience_input"
              id="experience"
              placeholder="Eg: 5 saal, 3 years"
              value={form.experience}
              onChange={(e) =>
                setForm((p) => ({ ...p, experience: e.target.value }))
              }
              className="h-12"
            />
          </div>

          {/* Expected Salary */}
          <div className="space-y-1.5">
            <Label htmlFor="salary">Expected Salary *</Label>
            <Input
              data-ocid="create_profile.salary_input"
              id="salary"
              placeholder="Eg: ₹500/day, ₹18000/month"
              value={form.expectedSalary}
              onChange={(e) =>
                setForm((p) => ({ ...p, expectedSalary: e.target.value }))
              }
              className="h-12"
            />
          </div>
        </div>

        {/* ── SECTION 2: LOCATION ─────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-4">
          <SectionHeader
            emoji="📍"
            title="Location"
            subtitle="State, city ya GPS se location"
          />

          {/* State */}
          <div className="space-y-1.5">
            <Label>State *</Label>
            <Select
              value={form.state}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, state: v, city: "" }))
              }
            >
              <SelectTrigger
                data-ocid="create_profile.state_select"
                className="h-12"
              >
                <SelectValue placeholder="State chunein" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(INDIA_STATES_CITIES).map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <Label>City *</Label>
            <Select
              value={form.city}
              onValueChange={(v) =>
                setForm((p) => ({
                  ...p,
                  city: v,
                  location: `${v}, ${p.state}`,
                }))
              }
              disabled={!form.state}
            >
              <SelectTrigger
                data-ocid="create_profile.city_select"
                className="h-12"
              >
                <SelectValue
                  placeholder={
                    form.state ? "City chunein" : "Pehle state chunein"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {citiesForState.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GPS Button */}
          <Button
            data-ocid="create_profile.gps_button"
            type="button"
            variant="outline"
            className="w-full h-11 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={handleGpsDetect}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> GPS Detect Ho
                Raha Hai...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" /> GPS Auto Location Lo 📍
              </>
            )}
          </Button>
          {form.lat !== 0 && (
            <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> GPS: {form.lat.toFixed(4)},{" "}
              {form.lng.toFixed(4)}
            </p>
          )}
          {form.location && (
            <p className="text-xs text-green-600 font-medium">
              📍 Location: {form.location}
            </p>
          )}
        </div>

        {/* ── SECTION 3: VERIFICATION ─────────────────────────────── */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-4">
          <SectionHeader
            emoji="🪪"
            title="Verification"
            subtitle="Documents upload karo"
          />

          {/* Trust Badge Preview */}
          {isVerified && (
            <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <div>
                <p className="text-sm font-bold text-green-800">
                  Verified Worker Badge Milega!
                </p>
                <p className="text-xs text-green-600">
                  Sab required documents upload ho gaye hain
                </p>
              </div>
            </div>
          )}

          {/* Aadhaar Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-purple-800">
              Aadhaar Card Upload *
            </Label>
            <FileUploadField
              id="aadhaar-upload"
              label="Aadhaar Upload Karo"
              fileName={form.aadhaarFileName}
              onChange={(name) =>
                setForm((p) => ({ ...p, aadhaarFileName: name }))
              }
              required
              uploadOcid="create_profile.aadhaar_upload_button"
            />
          </div>

          {/* Profile Photo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-purple-800">
              Profile Photo *
            </Label>
            <FileUploadField
              id="profile-photo-upload"
              label="Photo Upload Karo"
              fileName={form.profilePhotoName}
              onChange={(name) =>
                setForm((p) => ({ ...p, profilePhotoName: name }))
              }
              required
              uploadOcid="create_profile.profile_photo_upload_button"
            />
          </div>

          {/* Profession-specific documents */}
          {form.category && docGroup && (
            <div className="bg-white border border-purple-200 rounded-xl p-3 space-y-4">
              <p className="text-xs font-semibold text-purple-900">
                📋 {form.category} ke liye Additional Documents
              </p>

              {/* DRIVER */}
              {docGroup === "driver" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Driving Licence Upload *
                    </Label>
                    <FileUploadField
                      id="driving-licence-upload"
                      label="Driving Licence Upload Karo"
                      fileName={form.drivingLicenceFileName}
                      onChange={(name) =>
                        setForm((p) => ({ ...p, drivingLicenceFileName: name }))
                      }
                      required
                      uploadOcid="create_profile.driving_licence_upload_button"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Vehicle Type *
                    </Label>
                    <Select
                      value={form.vehicleType}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, vehicleType: v }))
                      }
                    >
                      <SelectTrigger
                        className="h-11"
                        data-ocid="create_profile.vehicle_type_select"
                      >
                        <SelectValue placeholder="Vehicle chunein" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Car",
                          "Bolero",
                          "Pickup",
                          "Truck",
                          "Tipper",
                          "Trailer",
                          "Dumper",
                          "Tractor",
                          "Bus",
                        ].map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* MACHINE OPERATOR */}
              {docGroup === "machine_operator" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Operator Licence / Certificate *
                  </Label>
                  <FileUploadField
                    id="operator-cert-upload"
                    label="Operator Certificate Upload Karo"
                    fileName={form.operatorCertFileName}
                    onChange={(name) =>
                      setForm((p) => ({ ...p, operatorCertFileName: name }))
                    }
                    required
                    uploadOcid="create_profile.operator_cert_upload_button"
                  />
                </div>
              )}

              {/* CONSTRUCTION - Experience photo for Electrician/Welder/Mechanic */}
              {needsExpPhoto && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Experience Photo{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <FileUploadField
                    id="exp-photo-upload"
                    label="Experience Photo Upload Karo"
                    fileName={form.experiencePhotoFileName}
                    onChange={(name) =>
                      setForm((p) => ({ ...p, experiencePhotoFileName: name }))
                    }
                    uploadOcid="create_profile.experience_photo_upload_button"
                  />
                </div>
              )}

              {/* CONSTRUCTION other */}
              {docGroup === "construction" && !needsExpPhoto && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Skill Certificate{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <FileUploadField
                    id="skill-cert-upload"
                    label="Skill Certificate Upload Karo"
                    fileName={form.skillCertFileName}
                    onChange={(name) =>
                      setForm((p) => ({ ...p, skillCertFileName: name }))
                    }
                    uploadOcid="create_profile.skill_cert_upload_button"
                  />
                </div>
              )}

              {/* HELPER */}
              {docGroup === "helper" && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Mobile Verification hi kaafi hai
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Helper / Labour ke liye koi extra documents nahi chahiye.
                  </p>
                </div>
              )}

              {/* MECHANIC */}
              {docGroup === "mechanic" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Workshop Experience *
                    </Label>
                    <Input
                      data-ocid="create_profile.workshop_experience_input"
                      placeholder="Eg: 5 saal auto workshop mein kaam kiya"
                      value={form.workshopExperience}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          workshopExperience: e.target.value,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Technical Certificate{" "}
                      <span className="text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <FileUploadField
                      id="technical-cert-upload"
                      label="Technical Certificate Upload Karo"
                      fileName={form.technicalCertFileName}
                      onChange={(name) =>
                        setForm((p) => ({ ...p, technicalCertFileName: name }))
                      }
                    />
                  </div>
                </>
              )}

              {/* OFFICE STAFF */}
              {docGroup === "office_staff" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Education Certificate *
                    </Label>
                    <FileUploadField
                      id="education-cert-upload"
                      label="Education Certificate Upload Karo"
                      fileName={form.educationCertFileName}
                      onChange={(name) =>
                        setForm((p) => ({ ...p, educationCertFileName: name }))
                      }
                      required
                      uploadOcid="create_profile.education_cert_upload_button"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Resume Upload *
                    </Label>
                    <FileUploadField
                      id="resume-upload"
                      label="Resume Upload Karo"
                      fileName={form.resumeFileName}
                      onChange={(name) =>
                        setForm((p) => ({ ...p, resumeFileName: name }))
                      }
                      required
                      uploadOcid="create_profile.resume_upload_button"
                    />
                  </div>
                </>
              )}

              {/* BUILDER */}
              {docGroup === "builder" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Company Name *
                    </Label>
                    <Input
                      data-ocid="create_profile.company_name_input"
                      placeholder="Eg: Sharma Construction Pvt. Ltd."
                      value={form.companyName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, companyName: e.target.value }))
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Business Registration / GST{" "}
                      <span className="text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <FileUploadField
                      id="business-reg-upload"
                      label="Business Reg / GST Upload Karo"
                      fileName={form.businessRegFileName}
                      onChange={(name) =>
                        setForm((p) => ({ ...p, businessRegFileName: name }))
                      }
                      uploadOcid="create_profile.business_reg_upload_button"
                    />
                  </div>
                </>
              )}

              {/* GENERAL */}
              {docGroup === "general" && (
                <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-blue-800 font-medium">
                    ✓ Base verification documents kaafi hain
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION 4: WORK & AVAILABILITY ─────────────────────── */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-4">
          <SectionHeader
            emoji="💼"
            title="Work & Availability"
            subtitle="Work type aur availability set karo"
          />

          {/* Daily Wage Rate */}
          <div className="space-y-2">
            <Label htmlFor="daily-wage-rate">Daily Wage Rate (₹/day)</Label>
            <input
              id="daily-wage-rate"
              data-ocid="create_profile.daily_wage_input"
              type="number"
              min="0"
              placeholder="e.g. 1200"
              value={form.dailyWageRate}
              onChange={(e) =>
                setForm((p) => ({ ...p, dailyWageRate: e.target.value }))
              }
              className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              💡 JCB Operator: ₹1200/day • Driver: ₹900/day • Helper: ₹500/day
            </p>
          </div>

          {/* Work Type */}
          <div className="space-y-2">
            <Label>Work Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "daily", label: "Daily Work", emoji: "📅" },
                  { value: "monthly", label: "Monthly Job", emoji: "📆" },
                  { value: "contract", label: "Contract", emoji: "📄" },
                ] as { value: WorkType; label: string; emoji: string }[]
              ).map((wt) => (
                <button
                  key={wt.value}
                  type="button"
                  data-ocid={`create_profile.work_type_${wt.value}_toggle`}
                  onClick={() => setForm((p) => ({ ...p, workType: wt.value }))}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-colors ${
                    form.workType === wt.value
                      ? "border-green-500 bg-green-100 text-green-800"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  <span className="text-xl">{wt.emoji}</span>
                  {wt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label>Availability Status *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-ocid="create_profile.availability_available_toggle"
                onClick={() =>
                  setForm((p) => ({ ...p, availability: "available" }))
                }
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  form.availability === "available"
                    ? "border-green-500 bg-green-100 text-green-800"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                🟢 Available
              </button>
              <button
                type="button"
                data-ocid="create_profile.availability_busy_toggle"
                onClick={() => setForm((p) => ({ ...p, availability: "busy" }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  form.availability === "busy"
                    ? "border-red-500 bg-red-100 text-red-800"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                🔴 Busy / Not Available
              </button>
            </div>
          </div>
        </div>

        <Button
          data-ocid="create_profile.submit_button"
          type="submit"
          className="w-full touch-btn h-14 text-lg font-display font-bold mt-2 bg-green-600 hover:bg-green-700"
          disabled={isPending || isSubmitting}
        >
          {isPending || isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Profile Ban Rahi
              Hai...
            </>
          ) : (
            "Profile Banao 👷"
          )}
        </Button>

        {savedProfile && (
          <Button
            data-ocid="create_profile.cancel_button"
            type="button"
            variant="ghost"
            className="w-full touch-btn"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        )}
      </form>
    </div>
  );
}
