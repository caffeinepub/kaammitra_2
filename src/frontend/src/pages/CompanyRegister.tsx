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
import { useNavigate } from "@tanstack/react-router";
import { Building2, CheckCircle, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { registerCompany } from "../lib/companies";
import type { CompanyType } from "../lib/companies";

const COMPANY_TYPES: CompanyType[] = [
  "Pvt Ltd",
  "Contractor",
  "Builder",
  "Developer",
  "Partnership",
  "Proprietorship",
  "Other",
];

const POPPINS = "'Poppins', sans-serif";

export function CompanyRegister() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    type: "" as CompanyType | "",
    gstNumber: "",
    location: "",
    contactPhone: "",
    description: "",
    logoBase64: "",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setLogoPreview(b64);
      setForm((p) => ({ ...p, logoBase64: b64 }));
    };
    reader.readAsDataURL(file);
  }

  function sendOtp() {
    if (otpPhone.length !== 10) {
      setErrors((p) => ({ ...p, otpPhone: "10 digit number daalo" }));
      return;
    }
    const otp = "1234";
    setDemoOtp(otp);
    setOtpSent(true);
    setErrors((p) => ({ ...p, otpPhone: "" }));
  }

  function verifyOtp() {
    if (otpInput === demoOtp) {
      setOtpVerified(true);
      setErrors((p) => ({ ...p, otpInput: "" }));
    } else {
      setErrors((p) => ({ ...p, otpInput: "OTP galat hai" }));
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Company name zaroori hai";
    if (!form.type) e.type = "Company type select karein";
    if (!form.location.trim()) e.location = "Location zaroori hai";
    if (form.contactPhone.length !== 10)
      e.contactPhone = "10 digit phone daalo";
    if (!otpVerified) e.otp = "OTP verify karein pehle";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      registerCompany({
        name: form.name,
        type: form.type as CompanyType,
        gstNumber: form.gstNumber || undefined,
        location: form.location,
        contactPhone: form.contactPhone,
        logoBase64: form.logoBase64 || undefined,
        description: form.description || undefined,
        isPremium: false,
      });
      setSubmitting(false);
      setSuccess(true);
    }, 800);
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#fff8f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          fontFamily: POPPINS,
        }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#FF6F00,#e53935)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 4px 20px rgba(255,111,0,0.35)",
            }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#1a1a1a",
              marginBottom: "10px",
            }}
          >
            Registration Submitted!
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#555",
              marginBottom: "20px",
              lineHeight: 1.6,
            }}
          >
            Aapki company review ke liye bhej di gayi hai. Admin approval ke
            baad aap job post kar sakenge.
          </p>
          <span
            style={{
              display: "inline-block",
              background: "#FFF3E0",
              color: "#E65100",
              fontSize: "12px",
              fontWeight: 700,
              padding: "6px 18px",
              borderRadius: "20px",
              marginBottom: "28px",
              border: "1px solid #FFE0B2",
            }}
          >
            ⏳ Pending Approval
          </span>
          <br />
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            style={{
              background: "#FF6F00",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 32px",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: POPPINS,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255,111,0,0.3)",
            }}
          >
            Home Jaayein
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#fff8f0",
        fontFamily: POPPINS,
      }}
      className="pb-28"
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg,#FF6F00,#e53935)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="company_register.back_button"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span style={{ color: "#fff", fontSize: "17px", fontWeight: 800 }}>
          Company Register Karein
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "16px" }}>
        {/* Company Name */}
        <div className="mb-4">
          <Label
            htmlFor="co_name"
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              marginBottom: "6px",
              display: "block",
            }}
          >
            Company Name <span style={{ color: "red" }}>*</span>
          </Label>
          <Input
            id="co_name"
            data-ocid="company_register.name_input"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Aapki company ka naam"
            style={{
              fontFamily: POPPINS,
              borderColor: errors.name ? "red" : undefined,
            }}
          />
          {errors.name && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Company Type */}
        <div className="mb-4">
          <Label
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              marginBottom: "6px",
              display: "block",
            }}
          >
            Company Type <span style={{ color: "red" }}>*</span>
          </Label>
          <Select
            value={form.type}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, type: v as CompanyType }))
            }
          >
            <SelectTrigger
              data-ocid="company_register.type_select"
              style={{ fontFamily: POPPINS }}
            >
              <SelectValue placeholder="Company type select karein" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.type}
            </p>
          )}
        </div>

        {/* GST */}
        <div className="mb-4">
          <Label
            htmlFor="co_gst"
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              marginBottom: "6px",
              display: "block",
            }}
          >
            GST Number{" "}
            <span style={{ color: "#888", fontSize: "11px" }}>(optional)</span>
          </Label>
          <Input
            id="co_gst"
            data-ocid="company_register.gst_input"
            value={form.gstNumber}
            onChange={(e) =>
              setForm((p) => ({ ...p, gstNumber: e.target.value }))
            }
            placeholder="GST12345..."
            style={{ fontFamily: POPPINS }}
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <Label
            htmlFor="co_location"
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              marginBottom: "6px",
              display: "block",
            }}
          >
            Location / City <span style={{ color: "red" }}>*</span>
          </Label>
          <Input
            id="co_location"
            data-ocid="company_register.location_input"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="Delhi, Mumbai, Pune..."
            style={{
              fontFamily: POPPINS,
              borderColor: errors.location ? "red" : undefined,
            }}
          />
          {errors.location && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.location}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <Label
            htmlFor="co_phone"
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              marginBottom: "6px",
              display: "block",
            }}
          >
            Contact Phone <span style={{ color: "red" }}>*</span>
          </Label>
          <Input
            id="co_phone"
            data-ocid="company_register.phone_input"
            value={form.contactPhone}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                contactPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
              }))
            }
            placeholder="10-digit mobile number"
            style={{
              fontFamily: POPPINS,
              borderColor: errors.contactPhone ? "red" : undefined,
            }}
          />
          {errors.contactPhone && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.contactPhone}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <Label
            htmlFor="co_desc"
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              marginBottom: "6px",
              display: "block",
            }}
          >
            Description{" "}
            <span style={{ color: "#888", fontSize: "11px" }}>(optional)</span>
          </Label>
          <Textarea
            id="co_desc"
            data-ocid="company_register.description_textarea"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Company ke baare mein..."
            rows={3}
            style={{ fontFamily: POPPINS }}
          />
        </div>

        {/* Logo Upload */}
        <div className="mb-5">
          <Label
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              marginBottom: "6px",
              display: "block",
            }}
          >
            Company Logo{" "}
            <span style={{ color: "#888", fontSize: "11px" }}>(optional)</span>
          </Label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "#fff",
              border: "1px dashed #FFB74D",
              borderRadius: "12px",
              padding: "12px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "10px",
                background: logoPreview
                  ? "transparent"
                  : "linear-gradient(135deg,#FF6F00,#e53935)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Building2 className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <button
                type="button"
                data-ocid="company_register.upload_button"
                onClick={() => fileRef.current?.click()}
                style={{
                  background: "#FF6F00",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontFamily: POPPINS,
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                📷 Logo Upload Karein
              </button>
              <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                JPG, PNG, max 2MB
              </p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleLogoChange}
          />
        </div>

        {/* OTP Verification */}
        <div
          style={{
            background: "#fff",
            border: "2px solid #FF6F00",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: "14px",
              color: "#E65100",
              marginBottom: "12px",
            }}
          >
            📱 Mobile OTP Verification
          </div>
          {otpVerified ? (
            <div
              style={{
                color: "#388E3C",
                fontFamily: POPPINS,
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              ✅ Phone Verified!
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <Input
                  data-ocid="company_register.otp_phone_input"
                  value={otpPhone}
                  onChange={(e) =>
                    setOtpPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="Mobile number (OTP ke liye)"
                  style={{ fontFamily: POPPINS, flex: 1 }}
                />
                <button
                  type="button"
                  data-ocid="company_register.send_otp_button"
                  onClick={sendOtp}
                  style={{
                    background: "#FF6F00",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0 14px",
                    fontFamily: POPPINS,
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Send OTP
                </button>
              </div>
              {errors.otpPhone && (
                <p style={{ color: "red", fontSize: "12px" }}>
                  {errors.otpPhone}
                </p>
              )}
              {otpSent && (
                <>
                  <div
                    style={{
                      background: "#FFF3E0",
                      border: "1px solid #FFB74D",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontFamily: POPPINS,
                      fontSize: "13px",
                      color: "#E65100",
                    }}
                  >
                    🔐 Demo OTP: <strong>{demoOtp}</strong> (sirf demo ke liye)
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Input
                      data-ocid="company_register.otp_input"
                      value={otpInput}
                      onChange={(e) =>
                        setOtpInput(
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      placeholder="OTP enter karein"
                      style={{ fontFamily: POPPINS, flex: 1 }}
                    />
                    <button
                      type="button"
                      data-ocid="company_register.verify_otp_button"
                      onClick={verifyOtp}
                      style={{
                        background: "#388E3C",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0 14px",
                        fontFamily: POPPINS,
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Verify
                    </button>
                  </div>
                  {errors.otpInput && (
                    <p style={{ color: "red", fontSize: "12px" }}>
                      {errors.otpInput}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        {errors.otp && (
          <p
            style={{
              color: "red",
              fontSize: "12px",
              marginTop: "-14px",
              marginBottom: "12px",
            }}
          >
            {errors.otp}
          </p>
        )}

        <Button
          type="submit"
          data-ocid="company_register.submit_button"
          disabled={submitting}
          style={{
            width: "100%",
            background: "linear-gradient(90deg,#FF6F00,#e53935)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            fontSize: "15px",
            fontWeight: 800,
            fontFamily: POPPINS,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(255,111,0,0.3)",
          }}
        >
          {submitting ? "Submitting..." : "🏢 Company Register Karein"}
        </Button>
      </form>
    </div>
  );
}
