import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

const POSTER_URL =
  "/assets/generated/kaam-mitra-operator-unity-poster.dim_800x1400.png";
const POSTER_TITLE =
  "KaamMitra - \u092d\u093e\u0930\u0924 \u0915\u0947 \u0911\u092a\u0930\u0947\u091f\u0930\u094b\u0902 \u0915\u0940 \u0906\u0935\u093e\u091c\u093c: \u090f\u0915\u0924\u093e \u0914\u0930 \u0938\u0939\u093e\u092f\u0924\u093e";

export function OperatorPoster() {
  const navigate = useNavigate();

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: POSTER_TITLE,
          text: "KaamMitra - \u0911\u092a\u0930\u0947\u091f\u0930 \u090f\u0915\u0924\u093e \u0914\u0930 \u092d\u093e\u0930\u0924 \u092e\u093e\u0928\u0915 \u0930\u0947\u091f \u0915\u093e\u0930\u094d\u0921 2026",
          url: window.location.href,
        });
      } catch (_err) {
        // User cancelled share — fallback to download
        handleDownload();
      }
    } else {
      handleDownload();
    }
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href = POSTER_URL;
    link.download = "kaam-mitra-operator-unity-poster.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      "\u092a\u094b\u0938\u094d\u091f\u0930 \u0921\u093e\u0909\u0928\u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...",
    );
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `\ud83c\uddee\ud83c\uddf3 KaamMitra - \u092d\u093e\u0930\u0924 \u0915\u0947 \u0911\u092a\u0930\u0947\u091f\u0930\u094b\u0902 \u0915\u0940 \u0906\u0935\u093e\u091c\u093c \ud83d\udcaa\n\n\u092d\u093e\u0930\u0924 \u092e\u093e\u0928\u0915 \u0930\u0947\u091f \u0915\u093e\u0930\u094d\u0921 2026:\n\u2022 JCB: \u20b920,000\u201325,000\n\u2022 Excavator: \u20b925,000\u201335,000\n\u2022 Truck Driver: \u20b918,000\u201324,000\n\nKaamMitra App \u0938\u0947 \u091c\u0941\u0921\u093c\u0947\u0902: ${window.location.origin}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  const rateData = [
    {
      machine: "\ud83d\udea7 JCB",
      salary: "\u20b920k\u201325k",
      duty: "10 Hrs",
      ot: "1.5x",
    },
    {
      machine: "\u26cf\ufe0f Excavator",
      salary: "\u20b925k\u201335k",
      duty: "10 Hrs",
      ot: "1.5x",
    },
    {
      machine: "\ud83d\ude9b Truck Driver",
      salary: "\u20b918k\u201324k",
      duty: "12 Hrs",
      ot: "2x",
    },
    {
      machine: "\ud83c\udfd7\ufe0f Crane Operator",
      salary: "\u20b930k\u201340k",
      duty: "10 Hrs",
      ot: "1.5x",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Custom green header — standalone page, not using app layout */}
      <header
        className="sticky top-0 z-40 shadow-lg"
        style={{ background: "oklch(0.45 0.15 145)" }}
      >
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3 text-white">
          <button
            type="button"
            data-ocid="poster.back_button"
            onClick={() => navigate({ to: "/" })}
            className="p-2 rounded-xl hover:bg-white/20 transition-colors -ml-2"
            aria-label="\u0935\u093e\u092a\u0938 \u091c\u093e\u090f\u0902"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">
              \u0911\u092a\u0930\u0947\u091f\u0930 \u090f\u0915\u0924\u093e
              \u092a\u094b\u0938\u094d\u091f\u0930
            </h1>
            <p className="text-xs opacity-75">
              \u092d\u093e\u0930\u0924 \u092e\u093e\u0928\u0915
              \u0930\u0947\u091f \u0915\u093e\u0930\u094d\u0921 2026
            </p>
          </div>
          <button
            type="button"
            data-ocid="poster.download_button"
            onClick={handleDownload}
            className="p-2 rounded-xl hover:bg-white/20 transition-colors"
            aria-label="Download"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Poster Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-[500px] mx-auto px-4 pt-6"
      >
        <div className="rounded-2xl overflow-hidden shadow-xl border border-green-200">
          <img
            src={POSTER_URL}
            alt="KaamMitra \u0911\u092a\u0930\u0947\u091f\u0930 \u090f\u0915\u0924\u093e \u092a\u094b\u0938\u094d\u091f\u0930 - \u092d\u093e\u0930\u0924 \u092e\u093e\u0928\u0915 \u0930\u0947\u091f \u0915\u093e\u0930\u094d\u0921 2026"
            className="w-full h-auto block"
          />
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-5 space-y-3"
        >
          <Button
            data-ocid="poster.share_button"
            onClick={handleShare}
            className="w-full h-12 text-base font-bold text-white rounded-xl shadow-md gap-2"
            style={{ background: "oklch(0.45 0.15 145)" }}
          >
            <Share2 className="w-5 h-5" />
            Share / Download \u0915\u0930\u0947\u0902
          </Button>

          <Button
            data-ocid="poster.whatsapp_button"
            onClick={handleWhatsApp}
            className="w-full h-12 text-base font-bold text-white rounded-xl shadow-md gap-2"
            style={{ background: "oklch(0.52 0.18 145)" }}
          >
            <SiWhatsapp className="w-5 h-5" />
            WhatsApp \u092a\u0930 \u0936\u0947\u092f\u0930
            \u0915\u0930\u0947\u0902
          </Button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
            <div className="text-2xl mb-1">\ud83d\udcaa</div>
            <p className="text-xs font-bold text-green-800">
              \u090f\u0915\u0924\u093e \u092e\u0947\u0902
              \u0936\u0915\u094d\u0924\u093f
            </p>
            <p className="text-[11px] text-green-600 mt-0.5">Operator Unity</p>
          </div>
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-center">
            <div className="text-2xl mb-1">\ud83c\uddee\ud83c\uddf3</div>
            <p className="text-xs font-bold text-orange-800">
              \u092d\u093e\u0930\u0924 \u092e\u093e\u0928\u0915 \u0926\u0930
            </p>
            <p className="text-[11px] text-orange-600 mt-0.5">
              India Standard Rate
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
            <div className="text-2xl mb-1">\ud83d\udcde</div>
            <p className="text-xs font-bold text-blue-800">
              \u0932\u0947\u092c\u0930
              \u0939\u0947\u0932\u094d\u092a\u0932\u093e\u0907\u0928
            </p>
            <p className="text-[11px] text-blue-600 mt-0.5">155214</p>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center">
            <div className="text-2xl mb-1">\ud83d\udea8</div>
            <p className="text-xs font-bold text-red-800">
              \u0907\u092e\u0930\u091c\u0947\u0902\u0938\u0940
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">112</p>
          </div>
        </motion.div>

        {/* Rate Table Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-5 rounded-2xl border border-green-300 overflow-hidden shadow-sm"
        >
          <div
            className="text-white px-4 py-2.5"
            style={{ background: "oklch(0.45 0.15 145)" }}
          >
            <h2 className="font-bold text-sm">
              \ud83d\udcca \u092d\u093e\u0930\u0924 \u092e\u093e\u0928\u0915
              \u0930\u0947\u091f \u0915\u093e\u0930\u094d\u0921 2026
            </h2>
          </div>
          <div className="divide-y divide-green-100">
            {rateData.map((row, i) => (
              <div
                key={row.machine}
                data-ocid={`poster.rate.item.${i + 1}`}
                className={`grid grid-cols-4 text-xs px-3 py-2.5 ${
                  i % 2 === 0 ? "bg-white" : "bg-green-50"
                }`}
              >
                <span className="font-semibold text-foreground col-span-1">
                  {row.machine}
                </span>
                <span className="text-green-700 font-bold">{row.salary}</span>
                <span className="text-muted-foreground">{row.duty}</span>
                <span className="text-orange-600 font-semibold">{row.ot}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-50 px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground text-center">
              * \u092f\u0947 \u0926\u0930\u0947\u0902 \u092e\u093e\u0928\u0915
              \u0939\u0948\u0902,
              \u0935\u093e\u0938\u094d\u0924\u0935\u093f\u0915
              \u0926\u0930\u0947\u0902 \u0905\u0932\u0917 \u0939\u094b
              \u0938\u0915\u0924\u0940 \u0939\u0948\u0902
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-6 mt-4">
          <p>
            \u00a9 {new Date().getFullYear()}. Built with \u2764\ufe0f using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
