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
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateJob } from "../hooks/useQueries";
import { CATEGORIES, CATEGORY_EMOJIS } from "../lib/constants";

export function PostJob() {
  const [form, setForm] = useState({
    category: "",
    location: "",
    description: "",
    payOffered: "",
    postedBy: "",
  });
  const [success, setSuccess] = useState(false);
  const { mutateAsync, isPending } = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      await mutateAsync(form);
      setSuccess(true);
      toast.success("Job post ho gayi!");
    } catch {
      toast.error("Kuch galat ho gaya. Dobara try karo.");
    }
  };

  if (success) {
    return (
      <div className="page-container pt-8">
        <div
          data-ocid="post_job.success_state"
          className="card-elevated p-10 text-center animate-slide-up"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-black mb-2">
            Job Post Ho Gayi!
          </h2>
          <p className="text-muted-foreground mb-6">
            Workers dekh rahe hain aapki job listing
          </p>
          <Button
            className="touch-btn w-full"
            onClick={() => setSuccess(false)}
          >
            Naya Job Post Karo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-4">
      <h1 className="text-2xl font-display font-black mb-1">Job Post Karo</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Apni requirement batao, worker milega
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Button
          data-ocid="post_job.submit_button"
          type="submit"
          className="w-full touch-btn h-14 text-lg font-display font-bold mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Posting...
            </>
          ) : (
            "Job Post Karo 🚀"
          )}
        </Button>
      </form>
    </div>
  );
}
