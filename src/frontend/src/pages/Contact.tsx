import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitContact } from "../hooks/useQueries";

export function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [success, setSuccess] = useState(false);
  const { mutateAsync, isPending } = useSubmitContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error("Sab fields bharo");
      return;
    }
    try {
      await mutateAsync(form);
      setSuccess(true);
      toast.success("Message bhej diya!");
    } catch {
      toast.error("Kuch galat ho gaya.");
    }
  };

  if (success) {
    return (
      <div className="page-container pt-8">
        <div
          data-ocid="contact.success_state"
          className="card-elevated p-10 text-center animate-slide-up"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-black mb-2">
            Message Mil Gaya!
          </h2>
          <p className="text-muted-foreground mb-6">
            Hum jald hi aapse sampark karenge
          </p>
          <Button
            className="touch-btn w-full"
            onClick={() => {
              setSuccess(false);
              setForm({ name: "", phone: "", message: "" });
            }}
          >
            Naya Message Bhejo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-4">
      <h1 className="text-2xl font-display font-black mb-1">Sampark Karo</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Koi sawaal? Hum yahaan hain
      </p>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: Phone, label: "Phone", value: "+91 98765 43210" },
          { icon: Mail, label: "Email", value: "help@kaammitra.in" },
          { icon: MessageSquare, label: "WhatsApp", value: "Available" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card-elevated p-3 text-center">
            <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {value}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Apna Naam *</Label>
          <Input
            data-ocid="contact.name_input"
            id="name"
            placeholder="Eg: Suresh Yadav"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="h-12"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            data-ocid="contact.phone_input"
            id="phone"
            type="tel"
            placeholder="Eg: 98765 43210"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="h-12"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">Aapka Message *</Label>
          <Textarea
            data-ocid="contact.message_textarea"
            id="message"
            placeholder="Apni problem ya sawaal likhein..."
            value={form.message}
            onChange={(e) =>
              setForm((p) => ({ ...p, message: e.target.value }))
            }
            rows={4}
            className="resize-none text-base"
          />
        </div>

        <Button
          data-ocid="contact.submit_button"
          type="submit"
          className="w-full touch-btn h-14 text-lg font-display font-bold mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Bhej rahe
              hain...
            </>
          ) : (
            "Message Bhejo 📩"
          )}
        </Button>
      </form>
    </div>
  );
}
