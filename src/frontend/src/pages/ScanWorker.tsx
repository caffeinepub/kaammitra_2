import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Phone, Search, UserX } from "lucide-react";
import { useState } from "react";
import { BlueBadge } from "../components/BlueBadge";
import {
  getOnlineStatus,
  getVerificationRecord,
  getWorkerRatingStats,
  isWorkerPaidVerified,
  loadAllExtendedById,
  loadAllVerificationRecords,
} from "../lib/constants";

function getAllWorkerProfiles(): Record<string, Record<string, string>> {
  try {
    const raw = localStorage.getItem("kaam_mitra_worker_profiles");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function ScanWorker() {
  const navigate = useNavigate();
  const [mobileQuery, setMobileQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const allExtended = loadAllExtendedById();
  const allVerification = loadAllVerificationRecords();
  const allProfiles = getAllWorkerProfiles();

  // Also check workerProfile in localStorage (the current user's profile)
  const workerProfileRaw = localStorage.getItem("workerProfile");
  const currentWorkerProfile = workerProfileRaw
    ? (JSON.parse(workerProfileRaw) as Record<string, string>)
    : null;

  const foundWorker =
    searched && mobileQuery
      ? (() => {
          const ext = allExtended[mobileQuery];
          if (!ext) {
            // Try current workerProfile
            if (currentWorkerProfile?.mobile === mobileQuery) {
              return {
                ext: null,
                profile: currentWorkerProfile,
                verRec:
                  allVerification.find((r) => r.mobile === mobileQuery) ?? null,
              };
            }
            return null;
          }
          const profile = allProfiles[mobileQuery] ?? null;
          const verRec =
            allVerification.find((r) => r.mobile === mobileQuery) ?? null;
          return { ext, profile, verRec };
        })()
      : null;

  function handleSearch() {
    setSearched(true);
  }

  return (
    <div className="page-container pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/find-worker" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors -ml-2"
          data-ocid="scan_worker.back_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-black">
          Worker Profile Lookup
        </h1>
      </div>

      <Tabs defaultValue="mobile">
        <TabsList className="w-full mb-5" data-ocid="scan_worker.tab">
          <TabsTrigger
            value="mobile"
            className="flex-1"
            data-ocid="scan_worker.mobile_tab"
          >
            📱 Enter Mobile
          </TabsTrigger>
          <TabsTrigger
            value="qr"
            className="flex-1"
            data-ocid="scan_worker.qr_tab"
          >
            📷 QR Scanner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile">
          <div className="flex gap-2 mb-6">
            <Input
              data-ocid="scan_worker.mobile_input"
              value={mobileQuery}
              onChange={(e) => {
                setMobileQuery(e.target.value);
                setSearched(false);
              }}
              placeholder="Worker mobile number darj karein"
              maxLength={10}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              data-ocid="scan_worker.search_button"
            >
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
          </div>

          {searched && !foundWorker && (
            <div
              className="card-elevated p-10 text-center"
              data-ocid="scan_worker.empty_state"
            >
              <UserX className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-bold">Worker Nahi Mila</p>
              <p className="text-sm text-muted-foreground mt-1">
                Is mobile number par koi verified worker nahi mila.
              </p>
            </div>
          )}

          {foundWorker &&
            (() => {
              const { ext, profile, verRec } = foundWorker;
              const mobile = mobileQuery;
              const name = profile?.name || ext?.mobile || mobile;
              const category = profile?.category || verRec?.category || "";
              const experience = profile?.experience || "";
              const salary = profile?.salary || "";
              const city = ext?.city || profile?.city || "";
              const isPaidVerified = isWorkerPaidVerified(mobile);
              const isVerified =
                verRec?.status === "verified" || isPaidVerified;
              const onlineStatus = ext ? getOnlineStatus(ext.mobile) : null;
              const isOnline = onlineStatus?.isOnline ?? false;
              const ratingStats = getWorkerRatingStats(mobile);

              return (
                <div
                  className="card-elevated p-5 space-y-4"
                  data-ocid="scan_worker.result_card"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-black text-blue-700 shrink-0">
                      {name[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-lg">{name}</p>
                        {isPaidVerified && <BlueBadge size="md" />}
                        {ext && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOnline ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category || "Category N/A"}
                      </p>
                      {isVerified && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                          ✅ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs">City</p>
                      <p className="font-semibold">{city || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs">
                        Experience
                      </p>
                      <p className="font-semibold">{experience || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs">
                        Daily Rate
                      </p>
                      <p className="font-semibold">
                        {salary ? `₹${salary}/day` : "—"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs">Rating</p>
                      <p className="font-semibold">
                        {ratingStats.count > 0
                          ? `⭐ ${ratingStats.avg.toFixed(1)}`
                          : "No ratings"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`tel:${mobile}`}
                      className="flex-1"
                      data-ocid="scan_worker.call_button"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                    </a>
                    <a
                      href={`https://wa.me/91${mobile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                      data-ocid="scan_worker.whatsapp_button"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-green-600 border-green-300"
                      >
                        💬 WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })()}
        </TabsContent>

        <TabsContent value="qr">
          <div className="card-elevated p-10 text-center">
            <span className="text-5xl mb-4 block">📷</span>
            <p className="font-bold">QR Scanner</p>
            <p className="text-sm text-muted-foreground mt-2">
              QR scanner coming soon — please use mobile search above.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
