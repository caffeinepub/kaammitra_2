import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, IdCard } from "lucide-react";
import { BlueBadge } from "../components/BlueBadge";
import {
  CATEGORY_EMOJIS,
  getMyExtendedProfile,
  getVerificationRecord,
  isWorkerPaidVerified,
} from "../lib/constants";

export function WorkerIDCard() {
  const navigate = useNavigate();
  const myProfile = getMyExtendedProfile();
  const workerProfileRaw = localStorage.getItem("workerProfile");
  const workerProfile = workerProfileRaw
    ? (JSON.parse(workerProfileRaw) as Record<string, string>)
    : null;

  const mobile = myProfile?.mobile || workerProfile?.mobile || "";
  const name = workerProfile?.name || mobile || "Worker";
  const category = workerProfile?.category || "";
  const experience = workerProfile?.experience || "";
  const salary = workerProfile?.salary || "";
  const city = myProfile?.city || workerProfile?.city || "";
  const state = myProfile?.state || "";
  const profilePhotoBase64 = myProfile?.profilePhotoBase64 || "";

  const catInitial =
    category.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "KM";
  const mobileDigits = mobile.slice(-5).padStart(5, "0");
  const workerId = mobile ? `KM-${catInitial}-${mobileDigits}` : "KM-KM-00000";

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const verRecord = mobile ? getVerificationRecord(mobile) : null;
  const paidVerified = mobile ? isWorkerPaidVerified(mobile) : false;
  const profileUrl = `${window.location.origin}/scan-worker?mobile=${mobile}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff&color=1a5e20`;

  function handleDownload() {
    window.print();
  }

  if (!mobile) {
    return (
      <div className="page-container pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/settings" })}
            className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-black">My ID Card</h1>
        </div>
        <div className="card-elevated p-10 text-center">
          <IdCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-foreground">Profile Nahi Mili</p>
          <p className="text-sm text-muted-foreground mt-1">
            Pehle apna worker profile banao
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate({ to: "/create-profile" })}
          >
            Profile Banao
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="worker_id_card.page" className="page-container pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 print:hidden">
        <button
          type="button"
          onClick={() => navigate({ to: "/settings" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-black">My ID Card</h1>
      </div>

      {/* Paid verified promo or status */}
      {!paidVerified ? (
        <div className="mb-4 print:hidden bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-blue-800 text-sm">
              🔵 Blue Badge + ID Card
            </p>
            <p className="text-blue-600 text-xs">
              Verified badge paane ke liye ₹99 pay karein
            </p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            onClick={() => navigate({ to: "/verify-and-pay" })}
            data-ocid="worker_id_card.get_verified_button"
          >
            Get Verified →
          </Button>
        </div>
      ) : (
        <div className="mb-4 print:hidden bg-blue-500 rounded-xl p-3 flex items-center gap-3">
          <BlueBadge size="lg" />
          <p className="font-bold text-white">
            Verified Worker — Blue Badge Active!
          </p>
        </div>
      )}

      {/* ID Card */}
      <div
        id="worker-id-card"
        className="max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl border bg-white"
        style={{ borderColor: paidVerified ? "#3b82f6" : "#d1fae5" }}
      >
        {/* Header strip */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: paidVerified
              ? "linear-gradient(to right, #1d4ed8, #2563eb)"
              : "linear-gradient(to right, #16a34a, #059669)",
          }}
        >
          <div>
            <p className="text-white/80 text-xs font-semibold tracking-wider uppercase">
              KaamMitra
            </p>
            <p className="text-white text-base font-display font-black">
              Worker ID Card
            </p>
          </div>
          <div className="flex items-center gap-2">
            {paidVerified && <BlueBadge size="lg" />}
            <div className="text-2xl">🪪</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            {profilePhotoBase64 ? (
              <img
                src={profilePhotoBase64}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover shrink-0 border-2"
                style={{ borderColor: paidVerified ? "#93c5fd" : "#bbf7d0" }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0 border-2"
                style={{
                  background: paidVerified
                    ? "linear-gradient(to br, #3b82f6, #2563eb)"
                    : "linear-gradient(to br, #16a34a, #059669)",
                  borderColor: paidVerified ? "#93c5fd" : "#bbf7d0",
                }}
              >
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-lg text-foreground leading-tight">
                  {name}
                </h2>
                {paidVerified && <BlueBadge size="sm" />}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {workerId}
              </p>
              {category && (
                <p
                  className="text-sm font-semibold mt-1"
                  style={{ color: paidVerified ? "#2563eb" : "#15803d" }}
                >
                  {CATEGORY_EMOJIS[category] || "👷"} {category}
                </p>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {city && (
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground">📍 Location</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {city}
                  {state ? `, ${state}` : ""}
                </p>
              </div>
            )}
            {experience && (
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground">🏆 Experience</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {experience}
                </p>
              </div>
            )}
            {salary && (
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground">💰 Daily Rate</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  ₹{salary}/day
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground">📋 Status</p>
              <p className="text-xs font-semibold mt-0.5">
                {paidVerified ? (
                  <span className="text-blue-700">🔵 Blue Verified</span>
                ) : verRecord?.status === "verified" ? (
                  <span className="text-green-700">✅ Verified</span>
                ) : verRecord?.status === "pending" ? (
                  <span className="text-yellow-700">⏳ Pending</span>
                ) : (
                  <span className="text-gray-500">Not Verified</span>
                )}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div
            className="flex items-center gap-4 rounded-xl p-3 border"
            style={{
              background: paidVerified ? "#eff6ff" : "#f0fdf4",
              borderColor: paidVerified ? "#bfdbfe" : "#d1fae5",
            }}
          >
            <div data-ocid="worker_id_card.qr_code">
              <img
                src={qrApiUrl}
                alt="Worker Profile QR Code"
                width={100}
                height={100}
                className="rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <p
                className="text-xs font-bold"
                style={{ color: paidVerified ? "#1e40af" : "#166534" }}
              >
                Scan to View Profile
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: paidVerified ? "#2563eb" : "#15803d" }}
              >
                KaamMitra {paidVerified ? "blue" : ""} verified worker
              </p>
              <p
                className="text-xs font-mono mt-1"
                style={{ color: paidVerified ? "#3b82f6" : "#16a34a" }}
              >
                {workerId}
              </p>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div
          className="border-t px-5 py-2 text-center"
          style={{
            background: paidVerified ? "#eff6ff" : "#f0fdf4",
            borderColor: paidVerified ? "#bfdbfe" : "#d1fae5",
          }}
        >
          <p
            className="text-xs"
            style={{ color: paidVerified ? "#1d4ed8" : "#166534" }}
          >
            KaamMitra — India ka Apna Job Platform 🇮🇳
          </p>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-6 print:hidden">
        <Button
          data-ocid="worker_id_card.download_button"
          onClick={handleDownload}
          className="w-full h-12 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          style={{ background: paidVerified ? "#2563eb" : "#16a34a" }}
        >
          <Download className="w-5 h-5" />
          Download / Print ID Card
        </Button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #worker-id-card, #worker-id-card * { visibility: visible; }
          #worker-id-card { position: absolute; left: 0; top: 0; width: 100%; max-width: none; box-shadow: none; border-radius: 0; }
        }
      `}</style>
    </div>
  );
}
