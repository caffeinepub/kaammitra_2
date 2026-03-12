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
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateWorker } from "../hooks/useQueries";
import { CATEGORIES, CATEGORY_EMOJIS } from "../lib/constants";

export function CreateProfile() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    experience: "",
    location: "",
    expectedSalary: "",
  });
  const [success, setSuccess] = useState(false);
  const { mutateAsync, isPending } = useCreateWorker();

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
    try {
      await mutateAsync(form);
      setSuccess(true);
      toast.success("Profile ban gayi!");
    } catch {
      toast.error("Kuch galat ho gaya. Dobara try karo.");
    }
  };

  if (success) {
    return (
      <div className="page-container pt-8">
        <div
          data-ocid="create_profile.success_state"
          className="card-elevated p-10 text-center animate-slide-up"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-black mb-2">
            Profile Ban Gayi!
          </h2>
          <p className="text-muted-foreground mb-6">
            Contractors ab aapko dekh sakte hain
          </p>
          <Button
            className="touch-btn w-full"
            onClick={() => setSuccess(false)}
          >
            Naya Profile Banao
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-4">
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

        <Button
          data-ocid="create_profile.submit_button"
          type="submit"
          className="w-full touch-btn h-14 text-lg font-display font-bold mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Profile Banao 👷"
          )}
        </Button>
      </form>
    </div>
  );
}
