import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, X, List, Map as MapIcon, Star, ExternalLink } from "lucide-react";
import { useEvents, usePlaces } from "@/hooks/useKultour";
import { formatShortDate, formatPrice, cn, PLACE_CATEGORY_LABELS } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { Event, Place } from "@/types";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom colored markers
function createIcon(color: string, emoji: string) {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 36px; height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px; line-height:1">${emoji}</span>
      </div>
    `,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

const eventIcon = createIcon("#1A4FFF", "🎭");
const placeIcon  = createIcon("#10B981", "📍");

// ─── Layer type selector ──────────────────────────────────
type LayerType = "all" | "events" | "places";

function LayerSelector({ active, onChange }: { active: LayerType; onChange: (l: LayerType) => void }) {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-2xl shadow-card-hover p-1.5 flex gap-1">
      {(["all", "events", "places"] as LayerType[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 capitalize",
            active === l
              ? "bg-brand-blue-500 text-white shadow-soft"
              : "text-surface-600 hover:bg-surface-100"
          )}
        >
          {l === "all" ? "Todo" : l === "events" ? "Eventos" : "Lugares"}
        </button>
      ))}
    </div>
  );
}

// ─── Selected item panel (floating) ──────────────────────
function SelectedPanel({
  item,
  type,
  onClose,
}: {
  item: Event | Place | null;
  type: "event" | "place";
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-3xl shadow-card-hover p-5 max-w-md mx-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-surface-100 transition-colors"
        >
          <X className="w-4 h-4 text-surface-500" />
        </button>

        <div className="flex gap-4">
          {/* Image thumbnail */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
            {(item as any).imageUrl ? (
              <img src={(item as any).imageUrl} alt={item.name || (item as Event).title} className="w-full h-full object-cover" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center text-3xl", type === "event" ? "bg-brand-blue-100" : "bg-brand-green-100")}>
                {type === "event" ? "🎭" : "📍"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="badge mb-1.5 text-xs" style={{ background: type === "event" ? "#EEF3FF" : "#EDFDF5", color: type === "event" ? "#1A4FFF" : "#059669" }}>
              {type === "event" ? "Evento" : "Lugar"}
            </div>
            <h3 className="font-display font-bold text-surface-900 text-base truncate">
              {type === "event" ? (item as Event).title : (item as Place).name}
            </h3>
            <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {type === "event" ? (item as Event).venue : (item as Place).address}
            </p>

            {type === "event" && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-surface-500">{formatShortDate((item as Event).date)}</span>
                <span className="text-xs font-semibold text-brand-blue-600">
                  {formatPrice((item as Event).price, (item as Event).isFree)}
                </span>
              </div>
            )}
            {type === "place" && (item as Place).rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-3.5 h-3.5 text-brand-orange-500 fill-brand-orange-500" />
                <span className="text-xs font-semibold text-surface-700">{(item as Place).rating?.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {type === "event" && (
          <Link
            to={`/events/${item.id}`}
            className="btn-primary w-full justify-center mt-4 text-sm py-2.5"
          >
            Ver evento
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Map Page ────────────────────────────────────────
const LA_PAZ_CENTER: [number, number] = [-16.5, -68.15];

export default function MapPage() {
  const [layer, setLayer] = useState<LayerType>("all");
  const [selectedItem, setSelectedItem] = useState<{ item: Event | Place; type: "event" | "place" } | null>(null);

  const { data: eventsData } = useEvents({ limit: 100 });
  const { data: placesData } = usePlaces({ limit: 100 });

  const events = eventsData?.events.filter((e) => e.latitude && e.longitude) || [];
  const places = placesData?.places.filter((p) => p.latitude && p.longitude) || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header strip */}
      <div className="bg-white border-b border-surface-100 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-surface-700">
          <MapIcon className="w-5 h-5 text-brand-blue-500" />
          <h1 className="font-display font-bold">Mapa de La Paz</h1>
        </div>
        <div className="flex items-center gap-2 ml-auto text-sm text-surface-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue-500 inline-block" />
            {events.length} eventos
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-green-500 inline-block" />
            {places.length} lugares
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={LA_PAZ_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Event markers */}
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
                    <p className="font-bold text-surface-900 text-sm mb-1">{event.title}</p>
                    <p className="text-xs text-surface-500">{event.venue}</p>
                    <p className="text-xs font-semibold text-brand-blue-600 mt-1">{formatPrice(event.price, event.isFree)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Place markers */}
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
                    <p className="font-bold text-surface-900 text-sm mb-1">{place.name}</p>
                    <p className="text-xs text-surface-500">{PLACE_CATEGORY_LABELS[place.category]}</p>
                    {place.rating && (
                      <p className="text-xs font-semibold text-brand-orange-600 mt-1">⭐ {place.rating}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Layer selector overlay */}
        <LayerSelector active={layer} onChange={setLayer} />

        {/* Selected item panel */}
        {selectedItem && (
          <SelectedPanel
            item={selectedItem.item}
            type={selectedItem.type}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
    </div>
  );
}
