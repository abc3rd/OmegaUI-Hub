import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function DonationHeatmap() {
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['allDonationsWithLocation'],
    queryFn: () => base44.entities.Donation.filter({ latitude: { $exists: true } }),
    refetchInterval: 60000 // Refresh every minute
  });

  const mapCenter = [26.6406, -81.8723]; // Fort Myers default

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-rose-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border-2 border-slate-200">
      <MapContainer center={mapCenter} zoom={12} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {donations.map(donation => (
          <CircleMarker
            key={donation.id}
            center={[donation.latitude, donation.longitude]}
            radius={10}
            pathOptions={{
              color: 'red',
              fillColor: 'red',
              fillOpacity: 0.2,
              weight: 0 // No border
            }}
          >
            <Popup>
              Donation of ${donation.grossAmount.toFixed(2)}
              <br />
              On {new Date(donation.created_date).toLocaleDateString()}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}