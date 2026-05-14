import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, MapContainerProps } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  MapPin,
  X,
  Map as MapIcon,
  Star,
  ExternalLink,
  Heart,
  ZoomIn,
  ZoomOut,
  Layers,
  Share2,
  Compass,
  Wind,
  Clock,
  Navigation2,
  Loader2,
} from "lucide-react";
import { useEvents, usePlaces } from "@/hooks/useKultour";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { useAuthModal } from "@/components/shared/AuthModal";
import {
  formatShortDate,
  formatPrice,
  cn,
  PLACE_CATEGORY_LABELS,
} from "@/lib/utils";
import { Link } from "react-router-dom";
import type { Event, Place } from "@/types";
import {
  useGeolocation,
  calculateDistance,
  isWithinRadius,
} from "@/hooks/useGeolocation";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createMarkerIcon(
  color: string,
  iconType: "event" | "place",
  size: number = 36
) {
  const iconSvg = iconType === "event" 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.floor(size * 0.5)}" height="${Math.floor(size * 0.5)}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.floor(size * 0.5)}" height="${Math.floor(size * 0.5)}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: ${size}px; height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
      ">
        <div style="transform: rotate(45deg);">${iconSvg}</div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function createUserIcon(isPulsing: boolean = false) {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          background: #FF6B35;
          width: 24px; height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(255,107,53,0.4);
          display: flex; align-items: center; justify-content: center;
        ">
          <svg style="transform: rotate(0deg);" width="12" height="12" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="8" r="4"/>
            <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/>
          </svg>
        </div>
        ${
          isPulsing
            ? `
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,107,53,0.3);
          animation: userPulse 1.5s ease-out infinite;
          pointer-events: none;
        "/>
        <style>
          @keyframes userPulse {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
          }
        </style>
        `
            : ""
        }
      </div>
    `,
    className: "user-marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

const eventIcon = createMarkerIcon("#1A4FFF", "event");
const placeIcon = createMarkerIcon("#10B981", "place");
const userIconStatic = createUserIcon(false);
const userIconPulsing = createUserIcon(true);

type LayerType = "all" | "events" | "places";
type MapType = "streets" | "satellite";

const MAP_URLS = {
  streets:
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

const MAP_ATTRIBUTIONS = {
  streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  satellite: '&copy; <a href="https://www.esri.com/">Esri</a>',
};

const LA_PAZ_CENTER: [number, number] = [-16.5, -68.15];
const GEOFENCE_RADIUS = 500;

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onToggleMapType: () => void;
  mapType: MapType;
}

function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onToggleMapType,
  mapType,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white dark:bg-surface-800 rounded-xl shadow-card-hover dark:shadow-card-hover-dark flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
        title="Acercar"
      >
        <ZoomIn className="w-5 h-5 text-surface-700 dark:text-surface-200" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white dark:bg-surface-800 rounded-xl shadow-card-hover dark:shadow-card-hover-dark flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
        title="Alejar"
      >
        <ZoomOut className="w-5 h-5 text-surface-700 dark:text-surface-200" />
      </button>
      <button
        onClick={onRecenter}
        className="w-10 h-10 bg-white dark:bg-surface-800 rounded-xl shadow-card-hover dark:shadow-card-hover-dark flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
        title="Centrar en La Paz"
      >
        <Compass className="w-5 h-5 text-surface-700 dark:text-surface-200" />
      </button>
      <button
        onClick={onToggleMapType}
        className="w-10 h-10 bg-white dark:bg-surface-800 rounded-xl shadow-card-hover dark:shadow-card-hover-dark flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
        title={`Cambiar a mapa ${mapType === "streets" ? "satélite" : "callejero"}`}
      >
        <Layers className="w-5 h-5 text-surface-700 dark:text-surface-200" />
      </button>
    </div>
  );
}

interface LocationButtonProps {
  onClick: () => void;
  loading: boolean;
  hasLocation: boolean;
}

function LocationButton({ onClick, loading, hasLocation }: LocationButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
        hasLocation
          ? "bg-brand-orange-500 text-white"
          : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-600"
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Navigation2 className="w-4 h-4" />
      )}
      <span>{loading ? "Obteniendo..." : "Mi ubicación"}</span>
    </motion.button>
  );
}

function LayerSelector({
  active,
  onChange,
}: {
  active: LayerType;
  onChange: (l: LayerType) => void;
}) {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-surface-800 rounded-2xl shadow-card-hover dark:shadow-card-hover-dark p-1.5 flex gap-1">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
          active === "all"
            ? "bg-brand-purple-500 text-white shadow-soft"
            : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
        )}
      >
        <MapIcon className="w-3.5 h-3.5" />
        Todo
      </button>
      <button
        onClick={() => onChange("events")}
        className={cn(
          "px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
          active === "events"
            ? "bg-brand-blue-500 text-white shadow-soft"
            : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
        )}
      >
        <Star className="w-3.5 h-3.5" /> Eventos
      </button>
      <button
        onClick={() => onChange("places")}
        className={cn(
          "px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
          active === "places"
            ? "bg-brand-green-500 text-white shadow-soft"
            : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
        )}
      >
        <MapPin className="w-3.5 h-3.5" /> Lugares
      </button>
    </div>
  );
}

function GeofenceAlert({
  name,
  distance,
  onDismiss,
}: {
  name: string;
  distance: number;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-20 left-4 right-4 z-[1001] bg-gradient-to-r from-brand-orange-500 to-orange-500 text-white rounded-2xl shadow-card-hover p-4 max-w-md mx-auto"
    >
      <div className="flex items-start gap-3">
        <Navigation2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <p className="font-semibold text-sm">¡Estás cerca!</p>
          <p className="text-xs opacity-90 mt-0.5">
            {name} está a solo {Math.round(distance)}m de distancia
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

interface SelectedPanelProps {
  item: Event | Place | null;
  type: "event" | "place";
  onClose: () => void;
  onSaveFavorite: () => void;
  isFav: boolean;
  userPosition: { lat: number; lng: number } | null;
  nearbyItems?: { id: string; title: string; type: "event" | "place" }[];
}

function SelectedPanel({
  item,
  type,
  onClose,
  onSaveFavorite,
  isFav,
  userPosition,
  nearbyItems = [],
}: SelectedPanelProps) {
  if (!item) return null;

  const lat =
    type === "event"
      ? (item as Event).latitude
      : (item as Place).latitude;
  const lng =
    type === "event"
      ? (item as Event).longitude
      : (item as Place).longitude;
  const name =
    type === "event"
      ? (item as Event).title
      : (item as Place).name;
  const address =
    type === "event"
      ? (item as Event).venue
      : (item as Place).address;

  const googleMapsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const shareUrl = `${window.location.origin}/${type === "event" ? "events" : "places"}/${item.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Mira este ${type === "event" ? "evento" : "lugar"} en Kultour`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const distance =
    userPosition && lat && lng
      ? calculateDistance(userPosition.lat, userPosition.lng, lat, lng)
      : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3, type: "spring", damping: 25 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) {
            onClose();
          }
        }}
        className="absolute bottom-4 left-4 right-4 z-[1000] bg-white dark:bg-surface-800 rounded-3xl shadow-card-hover dark:shadow-card-hover-dark p-5 max-w-md mx-auto touch-none"
      >
        <div className="w-12 h-1.5 bg-surface-300 dark:bg-surface-600 rounded-full mx-auto mb-4" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <X className="w-4 h-4 text-surface-500 dark:text-surface-400" />
        </button>

        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
            {(item as any).imageUrl ? (
              <img
                src={(item as any).imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full flex items-center justify-center",
                  type === "event"
                    ? "bg-brand-blue-100 dark:bg-brand-blue-900/30"
                    : "bg-brand-green-100 dark:bg-brand-green-900/30"
                )}
              >
                {type === "event" ? (
                  <Star className="w-8 h-8 text-brand-blue-500" />
                ) : (
                  <MapPin className="w-8 h-8 text-brand-green-500" />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="badge mb-1.5 text-xs"
              style={{
                background:
                  type === "event" ? "#EEF3FF" : "#EDFDF5",
                color: type === "event" ? "#1A4FFF" : "#059669",
              }}
            >
              {type === "event" ? "Evento" : "Lugar"}
            </div>
            <h3 className="font-display font-bold text-surface-900 dark:text-surface-100 text-base truncate">
              {name}
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {address}
            </p>

            {type === "event" && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatShortDate((item as Event).date)}
                </span>
                <span className="text-xs font-semibold text-brand-blue-600 dark:text-brand-blue-400">
                  {formatPrice((item as Event).price, (item as Event).isFree)}
                </span>
              </div>
            )}
            {type === "place" && (item as Place).rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-3.5 h-3.5 text-brand-orange-500 fill-brand-orange-500" />
                <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                  {(item as Place).rating?.toFixed(1)}
                </span>
              </div>
            )}
            {distance && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-brand-orange-600 dark:text-brand-orange-400">
                <Navigation2 className="w-3 h-3" />
                A {Math.round(distance)}m de ti
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-surface-50 dark:bg-surface-700 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
            <Wind className="w-4 h-4" />
            <span>Clima en La Paz</span>
            <span className="ml-auto font-medium text-surface-700 dark:text-surface-300">
              Soleado, 18°C
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {type === "event" && (
            <Link
              to={`/events/${item.id}`}
              className="btn-primary flex-1 justify-center text-sm py-2.5"
            >
              Ver evento
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          {type === "place" && (
            <Link
              to={`/places/${item.id}`}
              className="btn-primary flex-1 justify-center text-sm py-2.5"
            >
              Ver lugar
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            Cómo llegar
          </a>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onSaveFavorite}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              isFav
                ? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
                : "bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
            )}
            title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            title="Compartir"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>

        {nearbyItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-2">
              Cercanos
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {nearbyItems.slice(0, 3).map((nearby) => (
                <Link
                  key={nearby.id}
                  to={`/${nearby.type === "event" ? "events" : "places"}/${nearby.id}`}
                  className="flex-shrink-0 px-3 py-2 bg-surface-50 dark:bg-surface-700 rounded-xl text-xs hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors"
                >
                  <p className="font-medium text-surface-700 dark:text-surface-200 truncate max-w-[100px]">
                    {nearby.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function MapCenterHandler({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (zoom) {
      map.flyTo(center, zoom, { duration: 1 });
    } else {
      map.flyTo(center, map.getZoom(), { duration: 1 });
    }
  }, [center, zoom, map]);

  return null;
}

interface MapControllerProps {
  onMapReady: (map: L.Map) => void;
}

function MapController({ onMapReady }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const [layer, setLayer] = useState<LayerType>("all");
  const [mapType, setMapType] = useState<MapType>("streets");
  const [selectedItem, setSelectedItem] = useState<{
    item: Event | Place;
    type: "event" | "place";
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(LA_PAZ_CENTER);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [geofenceAlert, setGeofenceAlert] = useState<{
    name: string;
    distance: number;
  } | null>(null);
  const [isPulsing] = useState(true);
  const [showGeofenceAlert, setShowGeofenceAlert] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const geofenceNotifiedRef = useRef<Set<string>>(new Set());

  // Handle URL params for centering on specific location
  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");
  const urlZoom = searchParams.get("zoom");
  const urlTitle = searchParams.get("title");

  const [urlLocation, setUrlLocation] = useState<{ lat: number; lng: number; title: string } | null>(null);

  useEffect(() => {
    if (urlLat && urlLng) {
      const lat = parseFloat(urlLat);
      const lng = parseFloat(urlLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(urlZoom ? parseInt(urlZoom) : 16);
        setUrlLocation({ lat, lng, title: urlTitle || "Ubicación del evento" });
      }
    }
  }, [urlLat, urlLng, urlZoom, urlTitle]);

  const { isAuthenticated } = useAuthStore();
  const { open } = useAuthModal();
  const { isFavorite } = useFavoritesStore();
  const toggleFavorite = useToggleFavorite();

  const { data: eventsData, refetch: refetchEvents } = useEvents({ limit: 100 });
  const { data: placesData, refetch: refetchPlaces } = usePlaces({ limit: 100 });

  const events = eventsData?.events.filter((e) => e.latitude && e.longitude) || [];
  const places = placesData?.places.filter((p) => p.latitude && p.longitude) || [];

  const {
    loading: geoLoading,
    error: geoError,
    position: userPosition,
    getCurrentPosition,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
  });

  const handleMyLocation = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  const hasCenteredOnUser = useRef(false);

  useEffect(() => {
    if (userPosition && !hasCenteredOnUser.current) {
      hasCenteredOnUser.current = true;
      setMapCenter([userPosition.lat, userPosition.lng]);
      setMapZoom(15);
    }
  }, [userPosition]);

  useEffect(() => {
    if (!userPosition || !showGeofenceAlert) return;

    const nearbyPlace = places.find(
      (p) =>
        p.latitude &&
        p.longitude &&
        !geofenceNotifiedRef.current.has(p.id) &&
        isWithinRadius(
          userPosition.lat,
          userPosition.lng,
          p.latitude,
          p.longitude,
          GEOFENCE_RADIUS
        )
    );

    if (nearbyPlace) {
      geofenceNotifiedRef.current.add(nearbyPlace.id);
      setGeofenceAlert({
        name: nearbyPlace.name,
        distance: calculateDistance(
          userPosition.lat,
          userPosition.lng,
          nearbyPlace.latitude!,
          nearbyPlace.longitude!
        ),
      });
    }
  }, [userPosition, places, showGeofenceAlert]);

  const handleRecenter = useCallback(() => {
    setMapCenter(LA_PAZ_CENTER);
    setMapZoom(13);
  }, []);

  const handleToggleMapType = useCallback(() => {
    setMapType((prev) => (prev === "streets" ? "satellite" : "streets"));
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleRefresh = useCallback(() => {
    refetchEvents();
    refetchPlaces();
  }, [refetchEvents, refetchPlaces]);

  const getNearbyItems = useCallback(() => {
    if (!userPosition || !selectedItem) return [];
    
    const itemLat = selectedItem.type === "event" 
      ? (selectedItem.item as Event).latitude 
      : (selectedItem.item as Place).latitude;
    const itemLng = selectedItem.type === "event" 
      ? (selectedItem.item as Event).longitude 
      : (selectedItem.item as Place).longitude;
    
    if (!itemLat || !itemLng) return [];

    const nearby: { id: string; title: string; type: "event" | "place" }[] = [];

    events.forEach((e) => {
      if (e.id !== selectedItem.item.id && e.latitude && e.longitude) {
        const dist = calculateDistance(itemLat, itemLng, e.latitude, e.longitude);
        if (dist <= 1000) {
          nearby.push({ id: e.id, title: e.title, type: "event" });
        }
      }
    });

    places.forEach((p) => {
      if (p.id !== selectedItem.item.id && p.latitude && p.longitude) {
        const dist = calculateDistance(itemLat, itemLng, p.latitude, p.longitude);
        if (dist <= 1000) {
          nearby.push({ id: p.id, title: p.name, type: "place" });
        }
      }
    });

    return nearby.sort(() => Math.random() - 0.5).slice(0, 5);
  }, [userPosition, selectedItem, events, places]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-surface-700 dark:text-surface-200">
          <MapIcon className="w-5 h-5 text-brand-blue-500 dark:text-brand-blue-400" />
          <h1 className="font-display font-bold">Mapa de La Paz</h1>
        </div>
        <div className="ml-auto">
          <LocationButton
            onClick={handleMyLocation}
            loading={geoLoading}
            hasLocation={!!userPosition}
          />
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue-500 dark:bg-brand-blue-400 inline-block" />
            {events.length} eventos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-green-500 dark:bg-brand-green-400 inline-block" />
            {places.length} lugares
          </span>
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={LA_PAZ_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          dragging={true}
          touchZoom={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          keyboard={true}
        >
          <MapController onMapReady={handleMapReady} />
          <MapCenterHandler center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution={MAP_ATTRIBUTIONS[mapType]}
            url={MAP_URLS[mapType]}
          />

          {(layer === "all" || layer === "events") &&
            events.map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude!, event.longitude!]}
                icon={eventIcon}
                eventHandlers={{
                  click: () => setSelectedItem({ item: event, type: "event" }),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-surface-900 text-sm mb-1">
                      {event.title}
                    </p>
                    <p className="text-xs text-surface-500">
                      {event.venue}
                    </p>
                    <p className="text-xs font-semibold text-blue-600 mt-1">
                      {formatPrice(event.price, event.isFree)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {(layer === "all" || layer === "places") &&
            places.map((place) => (
              <Marker
                key={place.id}
                position={[place.latitude!, place.longitude!]}
                icon={placeIcon}
                eventHandlers={{
                  click: () => setSelectedItem({ item: place, type: "place" }),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-surface-900 text-sm mb-1">
                      {place.name}
                    </p>
                    <p className="text-xs text-surface-500">
                      {PLACE_CATEGORY_LABELS[place.category]}
                    </p>
                    {place.rating && (
                      <p className="text-xs font-semibold text-orange-600 mt-1 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-brand-orange-500 text-brand-orange-500" /> {place.rating}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

          {userPosition && (
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={isPulsing ? userIconPulsing : userIconStatic}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sm">Tu ubicación</p>
                  {userPosition.accuracy && (
                    <p className="text-xs text-surface-500 mt-1">
                      Precisión: ±{Math.round(userPosition.accuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {urlLocation && (
            <Marker
              position={[urlLocation.lat, urlLocation.lng]}
              icon={createMarkerIcon("#FF6B35", "event", 40)}
              zIndexOffset={999}
            >
              <Popup>
                <div className="text-center min-w-[200px]">
                  <p className="font-bold text-surface-900 text-sm mb-1">
                    {urlLocation.title}
                  </p>
                  <p className="text-xs text-surface-500">Ubicación del evento</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <LayerSelector active={layer} onChange={setLayer} />

        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          onToggleMapType={handleToggleMapType}
          mapType={mapType}
        />

        {geofenceAlert && (
          <GeofenceAlert
            name={geofenceAlert.name}
            distance={geofenceAlert.distance}
            onDismiss={() => setShowGeofenceAlert(false)}
          />
        )}

        {geoError && geoError === "PERMISSION_DENIED" && (
          <div className="absolute top-20 left-4 right-4 z-[1001] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 max-w-md mx-auto">
            <p className="text-sm text-red-700 dark:text-red-300">
              Permisos de ubicación denegados. Habilita los permisos del navegador para ver tu ubicación en el mapa.
            </p>
          </div>
        )}

        {selectedItem && (
          <SelectedPanel
            item={selectedItem.item}
            type={selectedItem.type}
            onClose={() => setSelectedItem(null)}
            onSaveFavorite={() => {
              if (!isAuthenticated) {
                open("login");
                return;
              }
              const { item, type } = selectedItem;
              if (type === "event") {
                toggleFavorite(item.id);
              } else {
                toggleFavorite(undefined, item.id);
              }
            }}
            isFav={
              selectedItem.type === "event"
                ? isFavorite(selectedItem.item.id)
                : isFavorite(undefined, selectedItem.item.id)
            }
            userPosition={userPosition}
            nearbyItems={getNearbyItems()}
          />
        )}
      </div>
    </div>
  );
}