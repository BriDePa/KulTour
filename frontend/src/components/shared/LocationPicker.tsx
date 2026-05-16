import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Crosshair, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER: [number, number] = [-16.5, -68.15];
const DEFAULT_ZOOM = 13;

function createDivIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 32px; height: 32px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

export default function LocationPicker({ initialLat, initialLng, onLocationChange, height = "300px" }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  const handlePick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationChange]);

  return (
    <div className="space-y-2">
      <div className="relative" style={{ height }}>
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="w-full h-full rounded-2xl z-0"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          {position && (
            <>
              <Marker
                position={position}
                icon={createDivIcon("#1A4FFF")}
                ref={markerRef}
              />
              <FlyTo lat={position[0]} lng={position[1]} />
            </>
          )}
        </MapContainer>

        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className={cn(
              "w-10 h-10 bg-white dark:bg-surface-800 rounded-xl shadow-soft flex items-center justify-center",
              "text-surface-600 dark:text-surface-300 hover:text-brand-blue-500 dark:hover:text-brand-blue-400",
              "transition-all active:scale-95 border border-surface-200 dark:border-surface-700",
              isLocating && "animate-pulse"
            )}
            title="Usar mi ubicación"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {position ? (
        <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-brand-blue-500 flex-shrink-0" />
          <span>
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        </div>
      ) : (
        <p className="text-xs text-surface-400 dark:text-surface-500 text-center">
          Haz clic en el mapa para marcar la ubicación
        </p>
      )}
    </div>
  );
}
