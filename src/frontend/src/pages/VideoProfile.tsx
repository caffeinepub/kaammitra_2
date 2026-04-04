import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Share2, Video } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const VIDEO_KEY = "worker_video_profile";

export function VideoProfile() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(() =>
    localStorage.getItem(VIDEO_KEY),
  );

  const workerName = (() => {
    try {
      const p = localStorage.getItem("kaam_mitra_my_extended");
      return p ? JSON.parse(p).name || "Worker" : "Worker";
    } catch {
      return "Worker";
    }
  })();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video bahut badi hai! 50MB se chhoti video upload karein.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem(VIDEO_KEY, dataUrl);
      setVideoSrc(dataUrl);
      toast.success("Video profile save ho gaya! 🎬");
    };
    reader.readAsDataURL(file);
  }

  function shareProfile() {
    const text = `KaamMitra par mera video profile dekhein! Worker: ${workerName} — https://kaammitra.in`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
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
          data-ocid="video_profile.back_button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1 text-white/80 text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <Video className="w-8 h-8" />
          <div>
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "22px",
                fontWeight: 800,
                margin: 0,
              }}
            >
              Video Profile
            </h1>
            <p style={{ fontSize: "12px", opacity: 0.85, margin: 0 }}>
              Apna 30 second ka video banayein
            </p>
          </div>
        </div>
      </div>

      {videoSrc ? (
        <div className="mb-5">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: "#000" }}
          >
            <video
              data-ocid="video_profile.canvas_target"
              src={videoSrc}
              controls
              className="w-full"
              style={{ maxHeight: "350px" }}
            >
              <track kind="captions" />
            </video>
            <div
              className="absolute bottom-3 left-3 rounded-lg px-3 py-1 text-white text-xs font-bold"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              👷 {workerName}
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <Button
              data-ocid="video_profile.upload_button"
              variant="outline"
              className="flex-1"
              onClick={() => fileRef.current?.click()}
            >
              🔄 Change Video
            </Button>
            <Button
              data-ocid="video_profile.share_button"
              className="flex-1 font-bold"
              style={{ background: "#25D366", color: "white", border: "none" }}
              onClick={shareProfile}
            >
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      ) : (
        <div
          data-ocid="video_profile.dropzone"
          className="mb-5 rounded-2xl p-10 text-center cursor-pointer"
          style={{
            border: "2px dashed #FF6F00",
            background: "#FFF8F0",
          }}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        >
          <div className="text-5xl mb-3">🎥</div>
          <p
            className="font-bold text-foreground mb-1"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Upload Short Video
          </p>
          <p className="text-xs text-muted-foreground">
            Max 30 seconds • Apna kaam dikhao
          </p>
          <Button
            data-ocid="video_profile.upload_button"
            className="mt-4 font-bold"
            style={{ background: "#FF6F00", color: "white", border: "none" }}
          >
            📱 Video Select Karein
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Tips */}
      <Card>
        <CardContent className="p-4">
          <h3
            className="font-bold text-sm mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#E65100" }}
          >
            💡 Video Tips
          </h3>
          <div className="space-y-2">
            {[
              "⏱️ 30 second ka chhota video banayein",
              "🗣️ Hindi mein clearly baat karein",
              "🔨 Apna kaam aur skill dikhayein",
              "💡 Achhi roshni mein video banayein",
              "📱 Phone seedha pakad ke banayein",
            ].map((tip) => (
              <p key={tip} className="text-xs text-muted-foreground flex gap-2">
                {tip}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share button at bottom */}
      {videoSrc && (
        <Button
          data-ocid="video_profile.secondary_button"
          onClick={shareProfile}
          className="w-full mt-4 py-5 font-bold rounded-2xl"
          style={{ background: "#FF6F00", color: "white", border: "none" }}
        >
          📤 WhatsApp Par Profile Share Karo
        </Button>
      )}
    </div>
  );
}
