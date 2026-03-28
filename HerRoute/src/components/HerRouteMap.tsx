import { useEffect, useRef, useState } from 'react';
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
const MCMASTER_CENTER: [number, number] = [43.2609, -79.9192];
const WILSON_HALL: [number, number] = [43.262303, -79.917060];
const BRUCE_TRAIL_DESTINATION: [number, number] = [43.2543, -79.9142]; // Near Ainslie Ave

/**
 * UPDATED ROAD PATH
 * Starts from McMaster Center (where the custom pin is!) -> Sterling -> Emerson -> Ainslie Ave.
 * This creates that "L" shape near the Bruce Trail without crossing grass.
 */
const HARDCODED_WALK_PATH: [number, number][] = [
    MCMASTER_CENTER, // Starting from your custom pin location! 📍
    [43.2622, -79.9192], // Corner of Sterling & Forsyth
    [43.2595, -79.9195], // Intersection at Main St W & Emerson
    [43.2580, -79.9190], // Emerson St & Whitney Ave
    [43.2555, -79.9180], // Emerson St & Ainslie Ave
    [43.2548, -79.9155], // Ainslie Ave heading East
    BRUCE_TRAIL_DESTINATION // Destination near the Trail
];

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

// Custom SVG Pin for Current Location
const createCustomPin = () => {
    return L.icon({
        iconUrl: '/custom-pin.svg',
        iconSize: [40, 60],
        iconAnchor: [20, 60],
        popupAnchor: [0, -60],
        className: 'custom-pin-marker'
    });
};

function MapViewHandler({ routeGenerated }: { routeGenerated: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (routeGenerated) {
            map.flyTo(BRUCE_TRAIL_DESTINATION, 16, { duration: 1.5 });
        } else {
            map.setView(MCMASTER_CENTER, 15);
        }
    }, [routeGenerated, map]);
    return null;
}

export default function HerRouteMap({
    nightMode,
    routeGenerated,
    onMapReady,
    route,
}: HerRouteMapProps) {
    const mapRef = useRef<LeafletMap | null>(null);
    const [allRoads, setAllRoads] = useState<any[]>([]);
    console.log("in herroutemap:", route)
    useEffect(() => {
        fetch('/roads_simplified.json')
            .then(res => res.json())
            .then(data => {
                const roadsWithScores = data.map((road: any) => ({
                    ...road,
                    safetyScore: Math.floor(40 + Math.random() * 55),
                }));
                setAllRoads(roadsWithScores);
            })
            .catch(() => console.warn("Road data not found."));
    }, []);

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
                .custom-pin-marker { 
                    z-index: 1001 !important; 
                    filter: none !important;
                }
                /* Ensure markers are NOT affected by tile filters */
                .leaflet-marker-pane,
                .leaflet-popup-pane {
                    filter: none !important;
                }
            `}</style>

            <MapContainer
                center={MCMASTER_CENTER}
                zoom={15}
                ref={mapRef}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" />
                <MapViewHandler routeGenerated={routeGenerated} />

                {/* Safety Heatmap Roads - Always Visible */}
                {allRoads.map((road, idx) => (
                    <Polyline
                        key={`road-${idx}`}
                        positions={road.coordinates}
                        pathOptions={{
                            color: getSafetyColor(road.safetyScore),
                            weight: 3,
                            opacity: 0.3,
                        }}
                    />
                ))}

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
                    </>
                )}

                <Polyline
                    positions={[
                        [43.2609, -79.9192],
                        [43.2623, -79.9170],
                    ]}
                    pathOptions={{ color: 'red', weight: 6, opacity: 1 }}
                />

                {/* Current location marker - Custom Pin - Always Visible */}
                <Marker position={MCMASTER_CENTER} icon={createCustomPin()}>
                    <Popup>
                        <div className="text-center">
                            <strong className="text-pink-500">📍 Your Location</strong><br />
                            <small className="text-gray-600">McMaster University</small>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}