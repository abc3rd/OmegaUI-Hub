import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker
const customIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTYgMEMxMC40NzcgMCA2IDQuNDc3IDYgMTBDNiAxNy41IDE2IDMwIDE2IDMwQzE2IDMwIDI2IDE3LjUgMjYgMTBDMjYgNC40NzcgMjEuNTIzIDAgMTYgMFoiIGZpbGw9IiNlYTAwZWEiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
});

function LocationMarker({ position, setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      const newPos = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      setPosition(newPos);
      onLocationChange(newPos.lat, newPos.lng);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} icon={customIcon} /> : null;
}

export default function MapPicker({ latitude, longitude, onLocationChange }) {
  const [position, setPosition] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : { lat: 34.0522, lng: -118.2437 }
  );
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const fetchAddress = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(addr);
      onLocationChange(lat, lng, addr);
    } catch (e) {
      const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(addr);
      onLocationChange(lat, lng, addr);
    }
    setLoading(false);
  };

  const handleLocationChange = (lat, lng) => {
    fetchAddress(lat, lng);
  };

  return (
    <div className="space-y-3">
      <div className="h-64 rounded-2xl overflow-hidden border border-slate-800 relative">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>

      {address && (
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#ea00ea] animate-spin flex-shrink-0 mt-0.5" />
          ) : (
            <MapPin className="w-4 h-4 text-[#ea00ea] flex-shrink-0 mt-0.5" />
          )}
          <p className="text-xs text-slate-400 leading-relaxed">{address}</p>
        </div>
      )}
      
      <p className="text-xs text-slate-500 text-center">💡 Click on the map to adjust the incident location</p>
    </div>
  );
}