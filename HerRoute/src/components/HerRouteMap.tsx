import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HerRouteMapProps {
    nightMode: boolean;
    routeGenerated: boolean;
    onSegmentClick: (segmentId: number) => void;
    onMapReady: (resetFn: () => void) => void;
    route: {
        coords: { lat: number; lng: number }[];
        polyline?: string;
        distance_m?: number;
        duration_s?: number;
    } | null;
}

// Map Constants
const DEFAULT_CENTER: [number, number] = [43.4723, -80.5449]; // University of Waterloo

const getSafetyColor = (score: number): string => {
    if (score >= 80) return '#ec4899';
    if (score >= 70) return '#f472b6';
    if (score >= 50) return '#f9a8d4';
    return '#fdf2f8';
};

// Clean Marker Logic (No Icons, just a sleek pink dot)
const createPinkDot = () => {
    return L.divIcon({
        className: 'custom-pink-marker',
        html: `<div style="width: 14px; height: 14px; background: #ec4899; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(236, 72, 153, 0.6);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
};

const createStartMarker = () => L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;background:#22c55e;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
             <div style="width:7px;height:7px;background:white;border-radius:50%;"></div>
           </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const createDestinationMarker = () => L.divIcon({
    className: '',
    html: `<div style="width:28px;height:38px;position:relative;">
             <svg viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35));">
               <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#ec4899"/>
               <circle cx="14" cy="14" r="6" fill="white"/>
               <circle cx="14" cy="14" r="3.5" fill="#ec4899"/>
             </svg>
           </div>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
});


function MapViewHandler({ routeGenerated, routeCoords }: { routeGenerated: boolean; routeCoords: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (routeGenerated && routeCoords.length > 0) {
            const bounds = L.latLngBounds(routeCoords);
            map.flyToBounds(bounds, { padding: [60, 60], duration: 1.5, maxZoom: 17 });
        } else if (!routeGenerated) {
            map.setView(DEFAULT_CENTER, 15);
        }
    }, [routeGenerated, routeCoords, map]);
    return null;
}

export default function HerRouteMap({
    nightMode,
    routeGenerated,
    onMapReady,
    route,
}: HerRouteMapProps) {
    const mapRef = useRef<LeafletMap | null>(null);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <style>{`
                .leaflet-tile-pane {
                    /* 👇 HERE'S WHERE YOU EDIT MAP TILE SATURATION & OVERLAY */
                    filter: ${nightMode
                    ? 'brightness(0.3) contrast(1.1) saturate(3.8) hue-rotate(120deg)'
                    : 'saturate(2.0) brightness(1.02)'};
                    /* 
                    ☝️ EDIT THESE VALUES:
                    - brightness(): 0-1 = darker, 1+ = brighter
                    - contrast(): higher = more contrast
                    - saturate(): 0 = grayscale, 1 = normal, 2+ = vibrant
                    - hue-rotate(): shifts colors (0-360deg)
                    */
                    transition: filter 0.4s ease;
                }
                .custom-pink-marker { z-index: 1000 !important; }
                /* Ensure markers are NOT affected by tile filters */
                .leaflet-marker-pane,
                .leaflet-popup-pane {
                    filter: none !important;
                }
            `}</style>

            <MapContainer
                center={DEFAULT_CENTER}
                zoom={15}
                ref={mapRef}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" />
                <MapViewHandler
                    routeGenerated={routeGenerated}
                    routeCoords={route ? route.coords.map(c => [c.lat, c.lng] as [number, number]) : []}
                />


                {route && (
                    <>
                        {/* Glow layer */}
                        <Polyline
                            positions={route.coords.map(c => [c.lat, c.lng])}
                            pathOptions={{ color: '#ec4899', weight: 12, opacity: 0.2 }}
                        />

                        {/* Main line */}
                        <Polyline
                            positions={route.coords.map(c => [c.lat, c.lng])}
                            pathOptions={{
                                color: '#ec4899',
                                weight: 6,
                                opacity: 1,
                                lineCap: 'round',
                            }}
                        />

                        {/* Origin marker */}
                        <Marker
                            position={[route.coords[0].lat, route.coords[0].lng]}
                            icon={createStartMarker()}
                        />

                        {/* Destination marker */}
                        <Marker
                            position={[route.coords[route.coords.length - 1].lat, route.coords[route.coords.length - 1].lng]}
                            icon={createDestinationMarker()}
                        />
                    </>
                )}

            </MapContainer>
        </div>
    );
}