import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Worker } from "../backend.d";
import { useGetAllWorkers } from "../hooks/useQueries";
import {
  CATEGORIES,
  CATEGORY_EMOJIS,
  type WorkerExtended,
  formatLastSeen,
  getOnlineStatus,
  getVerificationRecord,
  getWorkerRatingStats,
  loadAllExtendedById,
} from "../lib/constants";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface WorkerMarker {
  worker: Worker;
  ext: WorkerExtended;
  lat: number;
  lng: number;
  dist: number;
}

export function WorkerMap() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [category, setCategory] = useState("all");
  const [radius, setRadius] = useState(10);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const { data: workers } = useGetAllWorkers(
    category !== "all" ? category : undefined,
  );
  const extById = loadAllExtendedById();

  // Load Leaflet from CDN
  useEffect(() => {
    // Load CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // Load JS
    if ((window as any).L) {
      setMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    script.onerror = () =>
      toast.error("Map load nahi hua. Internet check karein.");
    document.head.appendChild(script);
  }, []);

  // Get GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        // Default to Delhi if GPS denied
        setUserCoords({ lat: 28.6139, lng: 77.209 });
        setGpsLoading(false);
      },
    );
  }, []);

  // Init/update map
  useEffect(() => {
    if (!mapReady || !mapRef.current || !userCoords) return;
    const L = (window as any).L;
    if (!L) return;

    // Init map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [userCoords.lat, userCoords.lng],
        12,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 12);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers (except tiles)
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // User location blue dot
    const userIcon = L.divIcon({
      className: "",
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .bindPopup("<b>📍 Aapki Location</b>")
      .addTo(map);

    // Radius circle
    L.circle([userCoords.lat, userCoords.lng], {
      color: "#22c55e",
      fillColor: "#22c55e",
      fillOpacity: 0.05,
      weight: 1,
      radius: radius * 1000,
    }).addTo(map);

    // Worker markers
    const workersToShow: WorkerMarker[] = [];
    for (const w of workers ?? []) {
      const ext = extById[w.id.toString()];
      if (!ext?.lat || !ext?.lng) continue;
      const dist = haversineKm(
        userCoords.lat,
        userCoords.lng,
        ext.lat,
        ext.lng,
      );
      if (dist > radius) continue;
      workersToShow.push({ worker: w, ext, lat: ext.lat, lng: ext.lng, dist });
    }
    workersToShow.sort((a, b) => a.dist - b.dist);
    const top50 = workersToShow.slice(0, 50);

    for (const wm of top50) {
      const { worker, ext, lat, lng, dist } = wm;
      const isAvailable = ext.availability === "available";
      const color = isAvailable ? "#16a34a" : "#dc2626";
      const ratingStats = getWorkerRatingStats(worker.id.toString());
      const verStatus = getVerificationRecord(ext.mobile)?.status;
      const onlineStat = getOnlineStatus(ext.mobile);

      const workerIcon = L.divIcon({
        className: "",
        html: `<div data-ocid="worker_map.map_marker" style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold">${CATEGORY_EMOJIS[worker.category] || "👷"}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const ratingHtml =
        ratingStats.count > 0
          ? `<br><span style="color:#f59e0b">⭐ ${ratingStats.avg} (${ratingStats.count})</span>`
          : "";
      const verHtml = verStatus === "verified" ? " ✅" : "";
      const onlineHtml = onlineStat?.isOnline
        ? "<span style='color:#16a34a'>● Online</span>"
        : onlineStat
          ? `<span style='color:#9ca3af'>● ${formatLastSeen(onlineStat.lastSeen)}</span>`
          : "";

      const popupHtml = `
        <div style="min-width:160px">
          <b style="font-size:13px">${worker.name}${verHtml}</b><br>
          <span style="color:#6b7280;font-size:11px">${CATEGORY_EMOJIS[worker.category] || ""} ${worker.category}</span><br>
          <span style="color:#6b7280;font-size:11px">📍 ${dist.toFixed(1)}km away</span><br>
          <span style="font-size:11px">${isAvailable ? "<span style='color:#16a34a'>🟢 Available</span>" : "<span style='color:#dc2626'>🔴 Busy</span>"}</span>
          ${ratingHtml}<br>
          ${onlineHtml ? `<span style="font-size:10px">${onlineHtml}</span><br>` : ""}
          <div style="margin-top:8px;display:flex;gap:6px">
            ${ext.mobile ? `<a href="tel:${ext.mobile}" style="background:#16a34a;color:white;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:bold;text-decoration:none">📞 Call</a>` : ""}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="background:#3b82f6;color:white;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:bold;text-decoration:none">🧭 Directions</a>
          </div>
        </div>
      `;

      L.marker([lat, lng], { icon: workerIcon })
        .bindPopup(popupHtml, { maxWidth: 220 })
        .addTo(map);
    }
  }, [mapReady, userCoords, workers, extById, radius]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  function handleRefresh() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        toast.success("📍 Location update ho gayi!");
      },
      () => {
        setGpsLoading(false);
        toast.error("Location access denied");
      },
    );
  }

  return (
    <div
      data-ocid="worker_map.page"
      className="flex flex-col"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* Toolbar */}
      <div className="bg-card border-b border-border px-3 py-2 flex gap-2 flex-wrap shrink-0">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            data-ocid="worker_map.category_select"
            className="h-9 flex-1 min-w-[130px] text-xs"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_EMOJIS[c]} {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={radius.toString()}
          onValueChange={(v) => setRadius(Number(v))}
        >
          <SelectTrigger
            data-ocid="worker_map.radius_select"
            className="h-9 w-24 text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 km</SelectItem>
            <SelectItem value="10">10 km</SelectItem>
            <SelectItem value="20">20 km</SelectItem>
          </SelectContent>
        </Select>

        <Button
          data-ocid="worker_map.refresh_button"
          size="sm"
          variant="outline"
          className="h-9 px-3"
          onClick={handleRefresh}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3 text-xs"
          onClick={() => navigate({ to: "/find-worker" })}
        >
          <MapPin className="w-3 h-3 mr-1" /> List
        </Button>
      </div>

      {/* Map container */}
      <div className="relative flex-1">
        {(!mapReady || gpsLoading) && (
          <div className="absolute inset-0 bg-muted/80 flex flex-col items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-semibold text-foreground">
              Map load ho rahi hai...
            </p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="bg-card border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />{" "}
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Busy
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> You
        </span>
      </div>
    </div>
  );
}
