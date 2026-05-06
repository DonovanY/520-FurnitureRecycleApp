import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix webpack stripping Leaflet's default icon paths
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Module-level cache so geocoding survives re-renders
const geocodeCache = {};

async function geocodeCity(city) {
  if (city in geocodeCache) return geocodeCache[city];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const result = data[0]
      ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      : null;
    geocodeCache[city] = result;
    return result;
  } catch {
    geocodeCache[city] = null;
    return null;
  }
}

// Deterministic per-listing jitter so same-city items don't stack on one pin
function jitter(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return {
    lat: ((h & 0xffff) / 0xffff - 0.5) * 0.004,
    lng: (((h >>> 16) & 0xffff) / 0xffff - 0.5) * 0.004,
  };
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView([positions[0][0], positions[0][1]], 14);
    } else {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
}

const CONDITION_LABEL = {
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export default function MapView({ listings }) {
  const [markers, setMarkers] = useState([]);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (!listings.length) return;

    let cancelled = false;
    setGeocoding(true);

    async function geocodeAll() {
      const uniqueCities = [...new Set(listings.map((l) => l.city).filter(Boolean))];

      const cityCoords = {};
      for (const city of uniqueCities) {
        if (cancelled) return;
        cityCoords[city] = await geocodeCity(city);
        // Respect Nominatim's 1 req/s rate limit
        await new Promise((r) => setTimeout(r, 250));
      }

      if (cancelled) return;

      const built = listings
        .filter((l) => l.city && cityCoords[l.city])
        .map((l) => {
          const { lat, lng } = jitter(l.id);
          return {
            listing: l,
            lat: cityCoords[l.city].lat + lat,
            lng: cityCoords[l.city].lng + lng,
          };
        });

      setMarkers(built);
      setGeocoding(false);
    }

    geocodeAll();
    return () => {
      cancelled = true;
    };
  }, [listings]);

  const bounds = markers.map((m) => [m.lat, m.lng]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100" style={{ height: 420 }}>
      {geocoding && markers.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/80 text-sm text-gray-400">
          Loading map…
        </div>
      )}

      <MapContainer
        center={[42.37, -72.52]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds.length > 0 && <FitBounds positions={bounds} />}

        {markers.map(({ listing, lat, lng }) => (
          <Marker key={listing.id} position={[lat, lng]}>
            <Popup minWidth={180}>
              <div style={{ fontFamily: "inherit" }}>
                {listing.primary_image_url && (
                  <img
                    src={listing.primary_image_url}
                    alt={listing.title}
                    style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 4, marginBottom: 6 }}
                  />
                )}
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{listing.title}</p>
                <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>
                  {CONDITION_LABEL[listing.condition_level] ?? listing.condition_level} · {listing.city}
                </p>
                <Link
                  to={`/item/${listing.id}`}
                  style={{ color: "#16a34a", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
