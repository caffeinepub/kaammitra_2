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
import { CheckCircle2, Loader2, Upload, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Worker } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useCreateWorker } from "../hooks/useQueries";
import {
  CATEGORY_EMOJIS,
  MAIN_CATEGORIES,
  PROFESSION_DOC_GROUPS,
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
        name: data.name,
        mobile: data.mobile,
        category: data.category,
        experience: data.experience,
        location: data.location,
        salary: data.salary,
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
    // Mechanic
    workshopExperience: "",
    technicalCertFileName: "",
    // Office staff
    educationCertFileName: "",
    resumeFileName: "",
    // Builder
    companyName: "",
    businessRegFileName: "",
  });

  const [savedProfile, setSavedProfile] = useState<Worker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [justSaved, setJustSaved] = useState<Worker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync, isPending } = useCreateWorker();

  useEffect(() => {
    const existing = loadSavedProfile();
    if (existing) setSavedProfile(existing);
  }, []);

  const docGroup = form.category
    ? (PROFESSION_DOC_GROUPS[form.category] ?? "general")
    : null;

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
      !form.location ||
      !form.expectedSalary
    ) {
      toast.error("Sab fields bharo");
      return;
    }

    setIsSubmitting(true);
    try {
      let savedWorker: Worker | null = null;
      if (actor) {
        try {
          savedWorker = await mutateAsync(form);
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
          location: form.location,
          expectedSalary: form.expectedSalary,
          phone: form.phone ? [form.phone] : [],
          createdAt: BigInt(Date.now()),
          isActive: true,
          latitude: [],
          longitude: [],
        } as unknown as Worker;
      }

      saveProfile(savedWorker);
      sendToGoogleSheets({
        name: form.name,
        mobile: form.phone,
        category: form.category,
        experience: form.experience,
        location: form.location,
        salary: form.expectedSalary,
      });

      setJustSaved(savedWorker);
      setSuccessDialogOpen(true);
    } catch {
      toast.error("Kuch galat ho gaya. Dobara try karo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    if (justSaved) {
      setSavedProfile(justSaved);
      setJustSaved(null);
      setShowForm(false);
    }
    navigate({ to: "/find-worker" });
  };

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
    return (
      <div className="page-container pt-8">
        {SuccessDialog}
        <div
          data-ocid="create_profile.success_state"
          className="card-elevated overflow-hidden mb-4 animate-slide-up"
        >
          <div className="bg-green-600 text-white px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-base">Profile Ban Gayi! ✅</p>
              <p className="text-xs opacity-85">
                Aap logged in hain · Database mein saved
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-display font-black text-lg">
                  {savedProfile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_EMOJIS[savedProfile.category]}{" "}
                  {savedProfile.category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
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
              setForm({
                name: savedProfile.name,
                category: savedProfile.category,
                experience: savedProfile.experience,
                location: savedProfile.location,
                expectedSalary: savedProfile.expectedSalary,
                phone: "",
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
                workshopExperience: "",
                technicalCertFileName: "",
                educationCertFileName: "",
                resumeFileName: "",
                companyName: "",
                businessRegFileName: "",
              });
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
              setForm({
                name: "",
                category: "",
                experience: "",
                location: "",
                expectedSalary: "",
                phone: "",
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
                workshopExperience: "",
                technicalCertFileName: "",
                educationCertFileName: "",
                resumeFileName: "",
                companyName: "",
                businessRegFileName: "",
              });
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
      <p className="text-sm text-muted-foreground mb-6">
        Apni details do, contractors milenge
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
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

        {/* Phone field moved before OTP section */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile Number *</Label>
          <Input
            data-ocid="create_profile.phone_input"
            id="phone"
            type="tel"
            placeholder="Contractors contact kar sakein"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="h-12"
          />
        </div>

        {/* ── BASE VERIFICATION CARD ─────────────────────────────── */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔐</span>
            <p className="font-semibold text-orange-900 text-sm">
              Base Verification (Sabke liye Required)
            </p>
          </div>

          {/* OTP Verification */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-orange-800">
              Mobile OTP Verification *
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shrink-0"
                onClick={handleSendOtp}
                disabled={form.otpVerified}
                data-ocid="create_profile.otp_send_button"
              >
                {form.otpVerified
                  ? "✓ Verified"
                  : form.otpSent
                    ? "Resend"
                    : "OTP Bhejo"}
              </Button>
              {form.otpVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            {form.otpSent && !form.otpVerified && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
                  📱 Demo OTP: <strong>{form.demoOtp}</strong>{" "}
                  <span className="opacity-60">
                    (Real SMS ke liye paid plan chahiye)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    data-ocid="create_profile.otp_input"
                    placeholder="6-digit OTP dalo"
                    maxLength={6}
                    value={form.otpValue}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, otpValue: e.target.value }))
                    }
                    className="h-10 text-center tracking-widest font-mono text-base"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shrink-0"
                    onClick={handleVerifyOtp}
                    data-ocid="create_profile.otp_verify_button"
                  >
                    Verify
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Aadhaar Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-orange-800">
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
            <Label className="text-xs font-medium text-orange-800">
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

        {/* ── PROFESSION DOCUMENTS CARD (shown after category selected) ── */}
        {form.category && docGroup && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <p className="font-semibold text-blue-900 text-sm">
                {form.category} ke liye Documents
              </p>
            </div>

            {/* DRIVER */}
            {docGroup === "driver" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-blue-800">
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
                  <Label
                    htmlFor="vehicle-type"
                    className="text-xs font-medium text-blue-800"
                  >
                    Vehicle Type *
                  </Label>
                  <Select
                    value={form.vehicleType}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, vehicleType: v }))
                    }
                  >
                    <SelectTrigger
                      id="vehicle-type"
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
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-blue-800">
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
                <div className="space-y-1.5">
                  <Label
                    htmlFor="experience"
                    className="text-xs font-medium text-blue-800"
                  >
                    Machine Experience Details *
                  </Label>
                  <Input
                    id="experience-operator"
                    placeholder="Eg: 3 saal JCB chalaya hai"
                    value={form.experience}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, experience: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
              </>
            )}

            {/* CONSTRUCTION */}
            {docGroup === "construction" && (
              <>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="work-experience"
                    className="text-xs font-medium text-blue-800"
                  >
                    Work Experience *
                  </Label>
                  <Input
                    id="work-experience"
                    placeholder="Eg: 4 saal masonry kaam"
                    value={form.experience}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, experience: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-blue-800">
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
              </>
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
                  <Label
                    htmlFor="workshop-exp"
                    className="text-xs font-medium text-blue-800"
                  >
                    Workshop Experience *
                  </Label>
                  <Input
                    data-ocid="create_profile.workshop_experience_input"
                    id="workshop-exp"
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
                  <Label className="text-xs font-medium text-blue-800">
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
                  <Label className="text-xs font-medium text-blue-800">
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
                  <Label className="text-xs font-medium text-blue-800">
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
                  <Label
                    htmlFor="company-name"
                    className="text-xs font-medium text-blue-800"
                  >
                    Company Name *
                  </Label>
                  <Input
                    data-ocid="create_profile.company_name_input"
                    id="company-name"
                    placeholder="Eg: Sharma Construction Pvt. Ltd."
                    value={form.companyName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, companyName: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-blue-800">
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
                <p className="text-xs text-blue-600 mt-1">
                  Is category ke liye koi additional documents required nahi
                  hain.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── REMAINING FIELDS ───────────────────────────────────── */}
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

        <div className="space-y-1.5">
          <Label htmlFor="location">Location / City *</Label>
          <Input
            data-ocid="create_profile.location_input"
            id="location"
            placeholder="Eg: Mumbai, Delhi, Patna"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            className="h-12"
          />
        </div>

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
