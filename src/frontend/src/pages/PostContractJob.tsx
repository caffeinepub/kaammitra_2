import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CONTRACT_CATEGORIES,
  type ContractDuration,
  type ContractJob,
  saveContractJob,
} from "../lib/constants";

const DURATIONS: ContractDuration[] = [
  "1 Month",
  "4 Months",
  "6 Months",
  "1 Year",
];

export function PostContractJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    contractorName: "",
    contactNumber: "",
    companyName: "",
    category: "",
    salaryPerMonth: "",
    workLocation: "",
    duration: "1 Month" as ContractDuration,
    accommodationProvided: false,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.contractorName ||
      !form.contactNumber ||
      !form.category ||
      !form.salaryPerMonth ||
      !form.workLocation
    ) {
      toast.error("Sabhi required fields bharo");
      return;
    }
    setSubmitting(true);
    const job: ContractJob = {
      id: `cj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      contractorMobile: form.contactNumber,
      contractorName: form.contractorName,
      category: form.category,
      salaryPerMonth: Number(form.salaryPerMonth),
      workLocation: form.workLocation,
      duration: form.duration,
      accommodationProvided: form.accommodationProvided,
      contactNumber: form.contactNumber,
      description: form.description || undefined,
      postedAt: Date.now(),
      status: "open",
    };
    saveContractJob(job);
    toast.success("Contract job post ho gaya! ✅");
    setTimeout(() => {
      setSubmitting(false);
      navigate({ to: "/long-term-hiring" });
    }, 600);
  }

  return (
    <div className="page-container pt-0">
      {/* Header */}
      <div className="-mx-4 px-6 pt-8 pb-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white mb-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-black">
            Post Contract Job 📋
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            Apni requirement post karein
          </p>
        </motion.div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
      >
        <Card className="mb-6">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-semibold mb-1.5 block"
              >
                Your Name *
              </Label>
              <input
                id="name"
                type="text"
                data-ocid="post_contract.name.input"
                value={form.contractorName}
                onChange={(e) => set("contractorName", e.target.value)}
                placeholder="Full name"
                required
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <Label
                htmlFor="contact"
                className="text-sm font-semibold mb-1.5 block"
              >
                Contact Number *
              </Label>
              <input
                id="contact"
                type="tel"
                data-ocid="post_contract.contact.input"
                value={form.contactNumber}
                onChange={(e) => set("contactNumber", e.target.value)}
                placeholder="10-digit mobile"
                required
                maxLength={10}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <Label
                htmlFor="company"
                className="text-sm font-semibold mb-1.5 block"
              >
                Company Name (Optional)
              </Label>
              <input
                id="company"
                type="text"
                data-ocid="post_contract.company.input"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="Company / Firm name"
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <Label
                htmlFor="category"
                className="text-sm font-semibold mb-1.5 block"
              >
                Work Category *
              </Label>
              <select
                id="category"
                data-ocid="post_contract.category.select"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">-- Select Category --</option>
                {CONTRACT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label
                htmlFor="salary"
                className="text-sm font-semibold mb-1.5 block"
              >
                Salary per Month (₹) *
              </Label>
              <input
                id="salary"
                type="number"
                data-ocid="post_contract.salary.input"
                value={form.salaryPerMonth}
                onChange={(e) => set("salaryPerMonth", e.target.value)}
                placeholder="e.g. 25000"
                required
                min={1}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <Label
                htmlFor="location"
                className="text-sm font-semibold mb-1.5 block"
              >
                Work Location / City *
              </Label>
              <input
                id="location"
                type="text"
                data-ocid="post_contract.location.input"
                value={form.workLocation}
                onChange={(e) => set("workLocation", e.target.value)}
                placeholder="City name"
                required
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Contract Duration *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    data-ocid="post_contract.duration.toggle"
                    onClick={() => set("duration", d)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      form.duration === d
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-foreground border-border"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <Label className="text-sm font-semibold">
                  Accommodation Provided
                </Label>
                <p className="text-xs text-muted-foreground">
                  Worker ko rehne ki jagah milegi
                </p>
              </div>
              <Switch
                data-ocid="post_contract.accommodation.switch"
                checked={form.accommodationProvided}
                onCheckedChange={(v) => set("accommodationProvided", v)}
              />
            </div>

            <div>
              <Label
                htmlFor="desc"
                className="text-sm font-semibold mb-1.5 block"
              >
                Additional Requirements
              </Label>
              <Textarea
                id="desc"
                data-ocid="post_contract.description.textarea"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Koi aur requirements likho..."
                rows={3}
                className="rounded-xl text-sm resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          data-ocid="post_contract.submit_button"
          disabled={submitting}
          className="w-full py-6 text-base font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700"
        >
          {submitting ? "Post ho raha hai..." : "Post Contract Job 📋"}
        </Button>
      </motion.form>
    </div>
  );
}
