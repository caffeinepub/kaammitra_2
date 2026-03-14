import { Button } from "@/components/ui/button";
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
  Briefcase,
  Building2,
  CheckCircle2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CATEGORY_EMOJIS, MAIN_CATEGORIES } from "../lib/constants";

export function ContractorRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSendOtp() {
    if (mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Sahi mobile number daalo (10 digits)");
      return;
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setDemoOtp(otp);
    setOtpSent(true);
    setOtpVerified(false);
    setEnteredOtp("");
    toast.success("OTP bheja gaya! (Demo mode)");
  }

  function handleVerifyOtp() {
    if (enteredOtp === demoOtp) {
      setOtpVerified(true);
      toast.success("OTP verify ho gaya! ✅");
    } else {
      toast.error("Galat OTP. Dobara try karein.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Contractor ka naam daalo");
      return;
    }
    if (!otpVerified) {
      toast.error("Pehle OTP verify karo");
      return;
    }
    if (!city.trim()) {
      toast.error("City / Location daalo");
      return;
    }
    if (!category) {
      toast.error("Work category chunein");
      return;
    }

    setIsSubmitting(true);
    const profile = {
      name: name.trim(),
      companyName: companyName.trim(),
      mobile,
      city: city.trim(),
      category,
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem("contractorProfile", JSON.stringify(profile));
    toast.success("Registration safal! 🎉");
    setTimeout(() => {
      navigate({ to: "/contractor-dashboard" });
    }, 500);
  }

  const canSubmit = name.trim() && otpVerified && city.trim() && category;

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 text-white -mx-4 px-6 pt-8 pb-10 mb-6 rounded-b-3xl"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-6 w-28 h-28 rounded-full bg-white" />
          <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-black leading-tight mb-1">
            Contractor Registration
          </h1>
          <p className="text-indigo-200 text-sm font-body">
            Apna account banayein — workers dhundein, jobs post karein
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contractor Name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label
            htmlFor="contractor-name"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <User className="w-4 h-4 text-indigo-600" />
            Contractor Ka Naam <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contractor-name"
            data-ocid="contractor_register.name_input"
            type="text"
            placeholder="Eg: Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-base rounded-xl border-border focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <Label
            htmlFor="company-name"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            Company Ka Naam
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Optional
            </span>
          </Label>
          <Input
            id="company-name"
            data-ocid="contractor_register.company_input"
            type="text"
            placeholder="Eg: Kumar Construction Pvt Ltd"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-12 text-base rounded-xl"
          />
        </motion.div>

        {/* Mobile + OTP */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Label
            htmlFor="mobile"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <Phone className="w-4 h-4 text-indigo-600" />
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-muted px-3 rounded-xl border border-border text-sm font-medium text-muted-foreground shrink-0">
              🇮🇳 +91
            </div>
            <Input
              id="mobile"
              data-ocid="contractor_register.mobile_input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digit number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                setOtpSent(false);
                setOtpVerified(false);
              }}
              className="h-12 text-base rounded-xl flex-1"
              required
            />
            <Button
              type="button"
              data-ocid="contractor_register.send_otp_button"
              onClick={handleSendOtp}
              disabled={mobile.length !== 10}
              className="h-12 px-4 rounded-xl shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm"
            >
              {otpSent ? "Resend" : "OTP Send"}
            </Button>
          </div>

          {/* Demo OTP Box */}
          {otpSent && !otpVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-start gap-3"
              data-ocid="contractor_register.success_state"
            >
              <span className="text-2xl leading-none mt-0.5">📱</span>
              <div>
                <p className="text-emerald-800 text-sm font-bold">Demo OTP:</p>
                <p className="text-emerald-700 text-2xl font-black font-mono tracking-widest">
                  {demoOtp}
                </p>
                <p className="text-emerald-600 text-xs mt-0.5">
                  Is OTP ko neeche daalo aur verify karo
                </p>
              </div>
            </motion.div>
          )}

          {otpVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-emerald-800 text-sm font-semibold">
                Mobile verify ho gaya! ✅
              </span>
            </motion.div>
          )}

          {otpSent && !otpVerified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2"
            >
              <Input
                data-ocid="contractor_register.otp_input"
                type="tel"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP daalo"
                value={enteredOtp}
                onChange={(e) =>
                  setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="h-12 text-base rounded-xl flex-1 text-center tracking-widest font-mono"
              />
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={enteredOtp.length !== 6}
                className="h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Verify
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* City */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <Label
            htmlFor="city"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <MapPin className="w-4 h-4 text-indigo-600" />
            City / Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            data-ocid="contractor_register.city_input"
            type="text"
            placeholder="Eg: Mumbai, Delhi, Lucknow"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 text-base rounded-xl"
            required
          />
        </motion.div>

        {/* Work Category */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Work Category Needed <span className="text-destructive">*</span>
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              data-ocid="contractor_register.category_select"
              className="h-12 text-base rounded-xl w-full"
            >
              <SelectValue placeholder="Category chunein..." />
            </SelectTrigger>
            <SelectContent>
              {MAIN_CATEGORIES.map((group) => (
                <SelectGroup key={group.id}>
                  <SelectLabel className="font-bold text-xs uppercase tracking-wide">
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
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pt-2"
        >
          <Button
            type="submit"
            data-ocid="contractor_register.submit_button"
            disabled={!canSubmit || isSubmitting}
            className="w-full h-14 text-lg font-display font-black rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? "Register ho raha hai..." : "🏗️ Register Karo"}
          </Button>
          {!otpVerified && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              Submit karne se pehle OTP verify karna zaroori hai
            </p>
          )}
        </motion.div>
      </form>

      {/* Already registered link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-6"
      >
        <button
          type="button"
          onClick={() => {
            const profile = localStorage.getItem("contractorProfile");
            if (profile) navigate({ to: "/contractor-dashboard" });
            else toast.info("Pehle register karo");
          }}
          className="text-indigo-600 text-sm font-semibold underline underline-offset-2"
        >
          Pehle se registered hain? Dashboard dekho →
        </button>
      </motion.div>
    </div>
  );
}
