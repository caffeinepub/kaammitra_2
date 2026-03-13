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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Worker } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useCreateWorker } from "../hooks/useQueries";
import { CATEGORIES, CATEGORY_EMOJIS } from "../lib/constants";

const STORAGE_KEY = "kaam_mitra_worker_profile";

function loadSavedProfile(): Worker | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Restore bigint fields
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

export function CreateProfile() {
  const { actor, isFetching } = useActor();
  const [form, setForm] = useState({
    name: "",
    category: "",
    experience: "",
    location: "",
    expectedSalary: "",
    phone: "",
  });
  const [savedProfile, setSavedProfile] = useState<Worker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [justSaved, setJustSaved] = useState<Worker | null>(null);
  const { mutateAsync, isPending } = useCreateWorker();

  // Load existing profile from localStorage on mount
  useEffect(() => {
    const existing = loadSavedProfile();
    if (existing) {
      setSavedProfile(existing);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("App connect ho rahi hai... Thoda wait karo");
      return;
    }
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
    try {
      const worker = await mutateAsync(form);
      saveProfile(worker);
      setJustSaved(worker);
      toast.success("Profile successfully save ho gayi!");
      setSuccessDialogOpen(true);
    } catch {
      toast.error("Kuch galat ho gaya. Dobara try karo.");
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    if (justSaved) {
      setSavedProfile(justSaved);
      setJustSaved(null);
      setShowForm(false);
    }
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
          <DialogTitle className="text-xl font-display font-black text-green-700">
            Profile Save Ho Gayi! ✅
          </DialogTitle>
        </DialogHeader>

        {justSaved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">
              Saved Profile Details
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profile ID</span>
              <span className="font-mono font-semibold">
                #{justSaved.id.toString()}
              </span>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          ✅ Aapka profile database mein save hai. Contractors aapko dekh sakte
          hain.
        </p>

        <DialogFooter>
          <Button
            data-ocid="create_profile.success_confirm_button"
            className="w-full touch-btn font-display font-bold"
            onClick={handleSuccessDialogClose}
          >
            Theek Hai 👍
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
        {/* Success Banner */}
        <div
          data-ocid="create_profile.success_state"
          className="card-elevated overflow-hidden mb-4 animate-slide-up"
        >
          <div className="bg-green-600 text-white px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-base">Profile Save Ho Gayi!</p>
              <p className="text-xs opacity-85">
                Aap logged in hain · Database mein saved
              </p>
            </div>
          </div>

          {/* Profile card */}
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
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_EMOJIS[c]} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          <Label htmlFor="location">Location *</Label>
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

        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile Number (Optional)</Label>
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

        <Button
          data-ocid="create_profile.submit_button"
          type="submit"
          className="w-full touch-btn h-14 text-lg font-display font-bold mt-2"
          disabled={isPending || isFetching || !actor}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...
            </>
          ) : isFetching ? (
            "Connecting..."
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
