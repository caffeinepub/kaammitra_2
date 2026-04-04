import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Copy, Gift, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addReferral, getMyReferral } from "../lib/paymentData";

export function InviteEarn() {
  const navigate = useNavigate();
  const mobile = localStorage.getItem("myMobile") || "9876543210";
  const [referral, setReferral] = useState(() => getMyReferral(mobile));

  const shareText = `KaamMitra app join karo aur kaam pao! Mera referral code use karo: ${referral.code} https://kaammitra.in`;

  function copyCode() {
    navigator.clipboard.writeText(referral.code);
    toast.success("Referral code copy ho gaya! 📋");
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareText);
    toast.success("Link copy ho gaya! 🔗");
  }

  function addDemoReferral() {
    addReferral(mobile, "9999999999");
    setReferral(getMyReferral(mobile));
    toast.success("Demo referral add ho gaya! ₹10 earned 🎉");
  }

  return (
    <div className="page-container pt-0 pb-28">
      {/* Header */}
      <div
        className="-mx-4 px-4 pt-10 pb-8 mb-5"
        style={{
          background: "linear-gradient(135deg, #FF6F00, #E65100)",
          color: "white",
        }}
      >
        <button
          type="button"
          data-ocid="invite.back_button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1 text-white/80 text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <Gift className="w-8 h-8" />
          <div>
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "22px",
                fontWeight: 800,
                margin: 0,
              }}
            >
              Invite &amp; Earn
            </h1>
            <p style={{ fontSize: "12px", opacity: 0.85, margin: 0 }}>
              Dosto ko bulao, ₹10 paao
            </p>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <Card className="mb-4 border-2 border-orange-200">
        <CardContent className="p-5 text-center">
          <p
            className="text-xs text-muted-foreground mb-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Aapka Referral Code
          </p>
          <div
            data-ocid="invite.referral_code_card"
            className="rounded-xl px-5 py-4 mb-4 tracking-widest text-2xl font-black"
            style={{
              background: "#FFF3E0",
              border: "2px dashed #FF6F00",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#E65100",
              letterSpacing: "0.2em",
            }}
          >
            {referral.code}
          </div>
          <Button
            data-ocid="invite.copy_code_button"
            onClick={copyCode}
            className="w-full font-bold"
            style={{ background: "#FF6F00", color: "white" }}
          >
            <Copy className="w-4 h-4 mr-2" /> Copy Code
          </Button>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}
        >
          <Users className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <p
            className="text-2xl font-black text-green-700"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {referral.referredMobiles.length}
          </p>
          <p className="text-xs text-green-600 font-medium">Friends Joined</p>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "#FFF3E0", border: "1px solid #FFCC80" }}
        >
          <Gift className="w-5 h-5 mx-auto mb-1 text-orange-600" />
          <p
            className="text-2xl font-black text-orange-700"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            ₹{referral.totalEarnings}
          </p>
          <p className="text-xs text-orange-600 font-medium">Total Earned</p>
        </div>
      </div>

      {/* How it Works */}
      <Card className="mb-5">
        <CardContent className="p-4">
          <h3
            className="font-bold text-sm mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#E65100" }}
          >
            🎯 Kaise Kaam Karta Hai
          </h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Apna referral code share karo", emoji: "📤" },
              { step: "2", text: "Dost KaamMitra join kare", emoji: "👋" },
              {
                step: "3",
                text: "₹10 turant milenge wallet mein",
                emoji: "💰",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: "#FF6F00" }}
                >
                  {item.step}
                </div>
                <p className="text-sm text-foreground">
                  {item.emoji} {item.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share Buttons */}
      <div className="space-y-3 mb-5">
        <Button
          data-ocid="invite.whatsapp_button"
          onClick={shareWhatsApp}
          className="w-full font-bold py-6 rounded-2xl text-white"
          style={{ background: "#25D366", border: "none" }}
        >
          💬 WhatsApp Par Share Karo
        </Button>
        <Button
          data-ocid="invite.copy_link_button"
          onClick={copyLink}
          variant="outline"
          className="w-full font-bold py-6 rounded-2xl"
          style={{ borderColor: "#1976D2", color: "#1976D2" }}
        >
          🔗 Copy Link
        </Button>
      </div>

      {/* Demo Button */}
      <Button
        data-ocid="invite.demo_referral_button"
        onClick={addDemoReferral}
        variant="outline"
        className="w-full text-xs text-muted-foreground"
      >
        + Add Demo Referral (Testing)
      </Button>
    </div>
  );
}
