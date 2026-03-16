import { useCallback, useState } from "react";

declare const html2canvas: (
  element: HTMLElement,
  options?: Record<string, unknown>,
) => Promise<HTMLCanvasElement>;

export function useScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (typeof html2canvas === "undefined") {
      console.error("html2canvas is not loaded");
      return null;
    }
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: window.devicePixelRatio || 1,
        logging: false,
      });
      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Screenshot failed:", err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const downloadScreenshot = useCallback(
    async (filename = "kaammitra-screenshot.png") => {
      const dataUrl = await captureScreenshot();
      if (!dataUrl) return false;
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      return true;
    },
    [captureScreenshot],
  );

  const shareScreenshot = useCallback(
    async (filename = "kaammitra-screenshot.png") => {
      const dataUrl = await captureScreenshot();
      if (!dataUrl) return false;

      if (navigator.share && navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "KaamMitra",
              text: "Check out KaamMitra \u2014 India's job marketplace!",
              files: [file],
            });
            return true;
          }
        } catch (_err) {
          // share cancelled or not supported \u2014 fall through to download
        }
      }

      // Fallback: download
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      return true;
    },
    [captureScreenshot],
  );

  return {
    captureScreenshot,
    downloadScreenshot,
    shareScreenshot,
    isCapturing,
  };
}
