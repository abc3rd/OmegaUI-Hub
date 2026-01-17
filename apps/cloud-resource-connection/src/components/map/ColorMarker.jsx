import React from 'react';
import { Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';

const colorMap = {
    "blue-500": "#3b82f6",
    "purple-500": "#8b5cf6",
    "yellow-500": "#eab308",
    "green-500": "#22c55e",
    "cyan-500": "#06b6d4",
    "slate-500": "#64748b",
    "orange-500": "#f97316",
    "amber-500": "#f59e0b",
    "indigo-500": "#6366f1",
    "gray-500": "#6b7280",
    "red-500": "#ef4444",
    "teal-500": "#14b8a6",
    "rose-500": "#f43f5e",
    "slate-400": "#94a3b8"
};

const createMarkerIcon = (tailwindColorClass) => {
    const colorKey = tailwindColorClass.replace('bg-', '');
    const fillColor = colorMap[colorKey] || '#94a3b8';

    const iconMarkup = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${fillColor}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="white" fill-opacity="0.5"/>
      </svg>
    `;

    return divIcon({
        html: iconMarkup,
        className: 'bg-transparent border-0',
        iconSize: [40, 40],
        iconAnchor: [20, 40], // bottom center
        popupAnchor: [0, -40] // above the marker
    });
};

export default function ColorMarker({ position, color, ...props }) {
    const icon = createMarkerIcon(color);

    return (
        <Marker position={position} icon={icon} {...props}>
            {props.children}
        </Marker>
    );
}