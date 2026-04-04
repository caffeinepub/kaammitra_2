import { useEffect, useRef, useState } from "react";

// ============================================================
// LOCKED LOGO CONSTANT — DO NOT MODIFY
// This logo text is permanently hardcoded.
// No prompt, API, or update may change this value.
// Visibility is controlled by showLogo only.
// ============================================================
const KAAMMITRA_LOGO_TEXT = "KaamMitra" as const;
const KAAMMITRA_TAGLINE = "Connecting Workers & Employers" as const;
const SHOW_LOGO_DEFAULT = true as const;

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // showLogo controls visibility only — never modification
  const [showLogo] = useState<boolean>(SHOW_LOGO_DEFAULT);
  const [phase, setPhase] = useState<
    "idle" | "logo" | "tagline" | "progress" | "done"
  >("idle");
  const [progress, setProgress] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── Vibration feedback on mount ──────────────────────────
  useEffect(() => {
    // Vibrate: short pattern [100ms on, 50ms off, 100ms on]
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  // ── Sound effect on logo phase ────────────────────────────
  const playLogoSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Gentle ascending chime: two sine tones fading in
      const playTone = (
        freq: number,
        startTime: number,
        duration: number,
        gain: number,
      ) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const t = ctx.currentTime;
      playTone(523.25, t, 0.6, 0.12); // C5
      playTone(659.25, t + 0.25, 0.6, 0.1); // E5
      playTone(783.99, t + 0.5, 0.8, 0.08); // G5
    } catch {
      // Sound is optional — silently ignore errors
    }
  };

  // ── Animation sequence ────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: playLogoSound is stable
  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("logo");
      playLogoSound();
    }, 100);

    const t2 = setTimeout(() => setPhase("tagline"), 900);
    const t3 = setTimeout(() => setPhase("progress"), 1400);

    // Progress bar fills over ~1.8s
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setProgress(Math.min(tick * 3.5, 100));
      if (tick >= 29) clearInterval(interval);
    }, 65);

    const t4 = setTimeout(() => {
      setPhase("done");
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(160deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
        opacity: phase === "done" ? 0 : 1,
        transition: phase === "done" ? "opacity 0.5s ease" : "none",
      }}
    >
      {/* Radial glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,140,0,0.18) 0%, transparent 70%)",
          opacity:
            phase === "logo" || phase === "tagline" || phase === "progress"
              ? 1
              : 0,
          transition: "opacity 1s ease",
          pointerEvents: "none",
        }}
      />

      {/* ── LOGO SECTION (visibility controlled by showLogo) ── */}
      {showLogo && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            opacity: phase === "idle" ? 0 : 1,
            transform:
              phase === "idle"
                ? "scale(0.7)"
                : phase === "done"
                  ? "scale(1.05)"
                  : "scale(1)",
            transition:
              "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Logo icon — hardcoded, not replaceable */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF8C00 0%, #FF4500 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 40px rgba(255,140,0,0.45), 0 0 80px rgba(255,69,0,0.2)",
              marginBottom: 22,
            }}
          >
            <span style={{ fontSize: 52, lineHeight: 1 }}>⚒️</span>
          </div>

          {/* App name — permanently locked constant */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#FFFFFF",
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
              letterSpacing: "-0.5px",
              lineHeight: 1,
              textShadow:
                "0 0 30px rgba(255,140,0,0.5), 0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {KAAMMITRA_LOGO_TEXT}
          </div>

          {/* Orange underline accent */}
          <div
            style={{
              width:
                phase === "logo" || phase === "tagline" || phase === "progress"
                  ? 120
                  : 0,
              height: 3,
              background:
                "linear-gradient(90deg, transparent, #FF8C00, transparent)",
              borderRadius: 2,
              marginTop: 8,
              transition: "width 0.8s ease 0.4s",
            }}
          />
        </div>
      )}

      {/* If showLogo is OFF, keep layout stable with a spacer */}
      {!showLogo && <div style={{ height: 180 }} />}

      {/* ── TAGLINE ── */}
      <div
        style={
          {
            marginTop: 20,
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255,200,100,0.9)",
            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            opacity: phase === "tagline" || phase === "progress" ? 1 : 0,
            transform:
              phase === "tagline" || phase === "progress"
                ? "translateY(0)"
                : "translateY(10px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            textAlign: "center",
            paddingHorizontal: 24,
          } as React.CSSProperties
        }
      >
        {KAAMMITRA_TAGLINE}
      </div>

      {/* ── PROGRESS BAR ── */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: phase === "progress" ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Track */}
        <div
          style={{
            width: "100%",
            height: 3,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Fill */}
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #FF8C00, #FFD700)",
              borderRadius: 10,
              boxShadow: "0 0 8px rgba(255,140,0,0.6)",
              transition: "width 0.06s linear",
            }}
          />
        </div>

        {/* Dot pulse loader */}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#FF8C00",
                animation: `kmPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── INDIA'S OWN badge ── */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: 1.5,
          fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          textTransform: "uppercase",
        }}
      >
        🇮🇳 India's Own Platform
      </div>

      <style>{`
        @keyframes kmPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
