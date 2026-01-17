import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Edit3 } from "lucide-react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const eventTypeColors = {
  family: "#ec4899",
  political: "#3b82f6",
  educational: "#10b981",
  war_start: "#8b5cf6",
  war_end: "#eab308",
  cultural: "#f97316",
  economic: "#06b6d4",
  scientific: "#14b8a6",
  religious: "#a855f7",
  natural_disaster: "#78716c",
  celebration: "#fbbf24",
  tragedy: "#dc2626",
  achievement: "#22c55e",
  other: "#64748b"
};

const sentimentColors = {
  positive: "#eab308",
  negative: "#ef4444",
  neutral: "#94a3b8",
  progress: "#22c55e",
  regress: "#1e293b"
};

const getEventColor = (event) => {
  // Sentiment takes priority for the base color
  if (event.sentiment && sentimentColors[event.sentiment]) {
    return sentimentColors[event.sentiment];
  }
  
  // Otherwise use the first event type
  if (event.event_types && event.event_types.length > 0) {
    return eventTypeColors[event.event_types[0]] || "#64748b";
  }
  
  return "#64748b"; // Default gray
};

const createCustomIcon = (event) => {
  const types = event.event_types || [];
  const sentiment = event.sentiment;
  
  // For multi-type events, create a split marker
  if (types.length > 1) {
    const colors = types.map(t => eventTypeColors[t] || "#64748b").slice(0, 3);
    const segments = colors.length;
    const angleStep = 360 / segments;
    
    let gradientStops = colors.map((color, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      return `${color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');
    
    return new L.DivIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: conic-gradient(${gradientStops});
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 4px;
            left: 4px;
            width: 12px;
            height: 12px;
            background-color: rgba(255,255,255,0.3);
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  }
  
  // Single type with sentiment overlay
  const baseColor = getEventColor(event);
  const sentimentIndicator = sentiment && sentiment !== 'neutral' 
    ? `<div style="
        position: absolute;
        top: 2px;
        right: 2px;
        width: 8px;
        height: 8px;
        background-color: ${sentimentColors[sentiment]};
        border-radius: 50%;
        border: 1px solid white;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      "></div>`
    : '';
  
  return new L.DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${baseColor};
        width: 22px;
        height: 22px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 10px;
          height: 10px;
          background-color: rgba(255,255,255,0.3);
          border-radius: 50%;
        "></div>
        ${sentimentIndicator}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22]
  });
};

function MapClickHandler({ onMapClick, readOnly }) {
  useMapEvents({
    click(e) {
      if (!readOnly && onMapClick) {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    },
  });
  return null;
}

export default function InteractiveMap({ 
  events, 
  timeline, 
  onMapClick, 
  onEventEdit, 
  readOnly = false 
}) {
  const [mapKey, setMapKey] = useState(0);
  
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [events]);

  const eventsWithLocation = events.filter(event => 
    event.location && event.location.includes(',')
  );

  const getMapCenter = () => {
    if (eventsWithLocation.length === 0) return [20, 0];
    
    const lats = eventsWithLocation.map(e => parseFloat(e.location.split(',')[0]));
    const lngs = eventsWithLocation.map(e => parseFloat(e.location.split(',')[1]));
    
    return [
      lats.reduce((a, b) => a + b, 0) / lats.length,
      lngs.reduce((a, b) => a + b, 0) / lngs.length
    ];
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden rounded-2xl">
      <div className="h-96 relative">
        <MapContainer
          key={mapKey}
          center={getMapCenter()}
          zoom={eventsWithLocation.length > 0 ? 4 : 2}
          style={{ height: '100%', width: '100%' }}
          className="rounded-2xl"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler onMapClick={onMapClick} readOnly={readOnly} />
          
          {eventsWithLocation.map((event) => {
            const [lat, lng] = event.location.split(',').map(coord => parseFloat(coord.trim()));
            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker 
                key={event.id} 
                position={[lat, lng]}
                icon={createCustomIcon(event)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-64">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {event.title}
                      </h3>
                      {event.importance && (
                        <Badge 
                          variant="secondary" 
                          className={`ml-2 text-xs ${
                            event.importance === 'critical' ? 'bg-red-100 text-red-700' :
                            event.importance === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {event.importance}
                        </Badge>
                      )}
                    </div>
                    
                    {event.date && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date}</span>
                      </div>
                    )}
                    
                    {event.event_types && event.event_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {event.event_types.map((type, idx) => (
                          <Badge 
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${eventTypeColors[type]}20`,
                              color: eventTypeColors[type],
                              borderColor: `${eventTypeColors[type]}40`
                            }}
                          >
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {event.sentiment && event.sentiment !== 'neutral' && (
                      <Badge 
                        variant="secondary"
                        className="text-xs mb-2"
                        style={{ 
                          backgroundColor: `${sentimentColors[event.sentiment]}20`,
                          color: sentimentColors[event.sentiment],
                          borderColor: `${sentimentColors[event.sentiment]}40`
                        }}
                      >
                        {event.sentiment}
                      </Badge>
                    )}
                    
                    {event.description && (
                      <p className="text-xs text-slate-600 mb-3 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    
                    {!readOnly && onEventEdit && (
                      <Button
                        size="sm"
                        onClick={() => onEventEdit(event)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 rounded-lg"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit Event
                      </Button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {!readOnly && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 font-medium">
                Click map to add event
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}