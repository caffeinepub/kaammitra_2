import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, IdCard } from "lucide-react";
import {
  CATEGORY_EMOJIS,
  getMyExtendedProfile,
  getVerificationRecord,
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
  const workerId = mobile ? `WM-${mobile.slice(-6)}` : "WM-000000";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const verRecord = mobile ? getVerificationRecord(mobile) : null;
  const profileUrl = `${window.location.origin}/worker-profile?mobile=${mobile}`;
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
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <button
          type="button"
          onClick={() => navigate({ to: "/settings" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-black">My ID Card</h1>
      </div>

      {/* ID Card */}
      <div
        id="worker-id-card"
        className="max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl border border-green-200 bg-white"
      >
        {/* Green Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs font-semibold tracking-wider uppercase">
              KaamMitra
            </p>
            <p className="text-white text-base font-display font-black">
              Worker ID Card
            </p>
          </div>
          <div className="text-2xl">🪪</div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shrink-0 border-2 border-green-200">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-display font-black text-lg text-foreground leading-tight">
                {name}
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {workerId}
              </p>
              {category && (
                <p className="text-sm font-semibold text-green-700 mt-1">
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
                <p className="text-xs text-muted-foreground">💰 Expected Pay</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  ₹{salary}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground">📋 Status</p>
              <p className="text-xs font-semibold mt-0.5">
                {verRecord?.status === "verified" ? (
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
          <div className="flex items-center gap-4 bg-green-50 rounded-xl p-3 border border-green-100">
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
              <p className="text-xs font-bold text-green-800">
                Scan to View Profile
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                KaamMitra verified worker
              </p>
              <p className="text-xs text-green-600 font-mono mt-1">
                {workerId}
              </p>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="bg-green-50 border-t border-green-100 px-5 py-2 text-center">
          <p className="text-xs text-green-700">
            KaamMitra — India ka Apna Job Platform 🇮🇳
          </p>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-6 print:hidden">
        <Button
          data-ocid="worker_id_card.download_button"
          onClick={handleDownload}
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
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
