import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Phone, Shield, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  OWNER_CONFIG,
  getDemoOTP,
  setOwnerSession,
  verifyOwnerWithBackend,
} from "../utils/ownerAuth";

interface OwnerLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function OwnerLoginModal({ open, onClose }: OwnerLoginModalProps) {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mobileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMobile("");
      setEmail("");
      setOtp("");
      setError("");
      setOtpSent(false);
      setTimeout(() => mobileRef.current?.focus(), 100);
    }
  }, [open]);

  function handleSendOTP() {
    if (!mobile.trim() || !email.trim()) {
      setError("Mobile aur email dono required hain.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setError("");
    }, 800);
  }

  async function handleLogin() {
    setError("");
    setIsLoading(true);
    try {
      // Backend-enforced verification — canister checks all three fields
      const valid = await verifyOwnerWithBackend(mobile, email, otp);
      if (!valid) {
        setError(
          "\u274C Aap owner nahi hain. Access denied. Sahi credentials enter karein.",
        );
        setIsLoading(false);
        return;
      }
      setOwnerSession();
      toast.success(
        "\u2705 Owner verified! Super Admin Panel mein aapka swagat hai.",
      );
      onClose();
      navigate({ to: "/super-admin" });
    } catch {
      setError("Login failed. Dobara try karein.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      data-ocid="owner_login.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(160deg, #0D0D0D 0%, #1A0800 60%, #2D1000 100%)",
          border: "1px solid rgba(255,111,0,0.3)",
          borderRadius: "20px",
          padding: "28px 24px",
          width: "100%",
          maxWidth: "400px",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(255,111,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FF6F00, #E65100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={22} color="white" />
            </div>
            <div>
              <h2
                style={{
                  color: "white",
                  fontSize: "18px",
                  fontWeight: 800,
                  fontFamily: "'Poppins', sans-serif",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Owner Login
              </h2>
              <p
                style={{
                  color: "rgba(255,111,0,0.8)",
                  fontSize: "11px",
                  fontFamily: "'Poppins', sans-serif",
                  margin: 0,
                  marginTop: "2px",
                }}
              >
                \uD83D\uDD10 Super Admin Access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="owner_login.close_button"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Demo OTP hint */}
        <div
          style={{
            background: "rgba(255,111,0,0.12)",
            border: "1px solid rgba(255,111,0,0.25)",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              color: "rgba(255,200,100,0.9)",
              fontSize: "11px",
              fontFamily: "'Poppins', sans-serif",
              margin: 0,
            }}
          >
            \uD83D\uDCCB Demo Mode — OTP:{" "}
            <strong style={{ color: "#FF9800" }}>{getDemoOTP()}</strong>
          </p>
          <p
            style={{
              color: "rgba(255,200,100,0.6)",
              fontSize: "10px",
              fontFamily: "'Poppins', sans-serif",
              margin: 0,
              marginTop: "2px",
            }}
          >
            Owner Mobile: {OWNER_CONFIG.mobile} | Email: {OWNER_CONFIG.email}
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <Label
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
              }}
            >
              <Phone
                size={12}
                style={{ display: "inline", marginRight: "4px" }}
              />
              Mobile Number
            </Label>
            <Input
              ref={mobileRef}
              type="tel"
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              data-ocid="owner_login.mobile_input"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,111,0,0.3)",
                color: "white",
                borderRadius: "10px",
                marginTop: "6px",
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          <div>
            <Label
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
              }}
            >
              \u2709\uFE0F Email ID
            </Label>
            <Input
              type="email"
              placeholder="admin@kaammitra.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-ocid="owner_login.email_input"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,111,0,0.3)",
                color: "white",
                borderRadius: "10px",
                marginTop: "6px",
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          {!otpSent ? (
            <Button
              onClick={handleSendOTP}
              disabled={isLoading}
              data-ocid="owner_login.send_otp_button"
              style={{
                background: "linear-gradient(135deg, #FF6F00, #E65100)",
                border: "none",
                borderRadius: "12px",
                height: "44px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                color: "white",
                cursor: "pointer",
              }}
            >
              {isLoading ? "Sending OTP..." : "\uD83D\uDCF2 OTP Bhejo"}
            </Button>
          ) : (
            <>
              <div>
                <Label
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  \uD83D\uDD11 OTP Enter Karein
                </Label>
                <Input
                  type="text"
                  placeholder="Demo OTP: 1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  data-ocid="owner_login.otp_input"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,111,0,0.3)",
                    color: "white",
                    borderRadius: "10px",
                    marginTop: "6px",
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: "4px",
                    fontSize: "18px",
                  }}
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                data-ocid="owner_login.submit_button"
                style={{
                  background: "linear-gradient(135deg, #FF6F00, #E65100)",
                  border: "none",
                  borderRadius: "12px",
                  height: "48px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "white",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(255,111,0,0.4)",
                }}
              >
                <Lock size={16} style={{ marginRight: "8px" }} />
                {isLoading ? "Verifying..." : "Owner Panel Kholein"}
              </Button>
            </>
          )}

          {error && (
            <div
              data-ocid="owner_login.error_state"
              style={{
                background: "rgba(220,38,38,0.15)",
                border: "1px solid rgba(220,38,38,0.4)",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <p
                style={{
                  color: "#FCA5A5",
                  fontSize: "12px",
                  fontFamily: "'Poppins', sans-serif",
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
