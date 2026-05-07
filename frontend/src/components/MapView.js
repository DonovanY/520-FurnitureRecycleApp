import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Fix webpack stripping Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Inject pulse animation once
if (typeof document !== "undefined" && !document.getElementById("user-loc-style")) {
  const style = document.createElement("style");
  style.id = "user-loc-style";
  style.textContent = `
    @keyframes user-loc-pulse {
      0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.7; }
      100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
    }
    .user-loc-pulse { animation: user-loc-pulse 1.8s ease-out infinite; }
  `;
  document.head.appendChild(style);
}

// Blue dot with pulsing ripple for the user's own position
const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:40px;height:40px;">
      <div class="user-loc-pulse" style="position:absolute;top:50%;left:50%;width:36px;height:36px;background:rgba(37,99,235,0.25);border-radius:50%;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);z-index:2;"></div>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const DEFAULT_ZOOM = 14;

// Module-level geocode cache — survives re-renders
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

// Flies to the user's location once coordinates arrive
function LocationSetter({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], DEFAULT_ZOOM, { animate: true });
    }
  }, [map, userLocation]);
  return null;
}

// Listens to pan/zoom and pushes the currently visible listings to the parent
function BoundsTracker({ markers, onVisibleChange }) {
  const map = useMap();

  const updateVisible = useCallback(() => {
    const bounds = map.getBounds();
    const visible = markers
      .filter((m) => bounds.contains([m.lat, m.lng]))
      .map((m) => m.listing);
    onVisibleChange(visible);
  }, [map, markers, onVisibleChange]);

  useMapEvents({ moveend: updateVisible, zoomend: updateVisible });

  // Re-run whenever the geocoded marker set changes
  useEffect(() => {
    updateVisible();
  }, [updateVisible]);

  return null;
}

// When the search changes the listing set, pan to fit any off-screen markers
function FitBoundsOnChange({ markers }) {
  const map = useMap();
  const prevKeyRef = useRef("");

  useEffect(() => {
    if (!markers.length) return;
    const key = markers.map((m) => m.listing.id).sort().join(",");
    if (key === prevKeyRef.current) return; // same set — user just panned, don't interfere
    prevKeyRef.current = key;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    if (!map.getBounds().intersects(bounds)) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: DEFAULT_ZOOM });
    }
  }, [map, markers]);

  return null;
}

const CONDITION_LABEL = {
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

// Geolocation states: "pending" | "granted" | "denied"
export default function MapView({ listings, onVisibleChange, onSelectListing }) {
  const [markers, setMarkers] = useState([]);
  const [geocoding, setGeocoding] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState("pending"); // pending | granted | denied

  // Request device location once on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { timeout: 10000 }
    );
  }, []);

  // Geocode city names whenever listings change
  useEffect(() => {
    if (!listings.length) {
      setMarkers([]);
      return;
    }

    let cancelled = false;
    setGeocoding(true);

    async function geocodeAll() {
      const uniqueCities = [...new Set(listings.map((l) => l.city).filter(Boolean))];

      const cityCoords = {};
      for (const city of uniqueCities) {
        if (cancelled) return;
        cityCoords[city] = await geocodeCity(city);
        await new Promise((r) => setTimeout(r, 250)); // Nominatim rate limit
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
    return () => { cancelled = true; };
  }, [listings]);

  // While waiting for browser geolocation response, show a prompt screen
  if (geoStatus === "pending") {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-center"
        style={{ height: 420 }}
      >
        <svg className="w-8 h-8 text-gray-400 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-600">Requesting your location…</p>
        <p className="text-xs text-gray-400 mt-1">Please allow location access in your browser</p>
      </div>
    );
  }

  // If geolocation was denied, show map but with a banner notice
  const deniedBanner = geoStatus === "denied" && (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      Location access denied — pan the map to your area manually
    </div>
  );

  // Initial center: user location if granted, otherwise a neutral low-zoom world view
  const initCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [20, 0];
  const initZoom = userLocation ? DEFAULT_ZOOM : 2;

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ height: 420 }}
    >
      {deniedBanner}

      {geocoding && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-3 py-1.5 rounded-full shadow-md">
          Loading markers…
        </div>
      )}

      <MapContainer
        center={initCenter}
        zoom={initZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Smooth fly-to once location arrives */}
        {userLocation && <LocationSetter userLocation={userLocation} />}

        {/* Blue dot at user's position */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Keeps scroll list in sync with the visible map area */}
        <BoundsTracker markers={markers} onVisibleChange={onVisibleChange} />

        {/* Pan to show markers when search changes the result set */}
        <FitBoundsOnChange markers={markers} />

        {markers.map(({ listing, lat, lng }) => (
          <Marker
            key={listing.id}
            position={[lat, lng]}
            eventHandlers={{ click: () => onSelectListing?.(listing.id) }}
          >
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
