import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
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
}

// McMaster University center
const MCMASTER_CENTER: [number, number] = [43.2609, -79.9192];

// Hardcoded route: Wilson Hall → Ron Joyce Stadium
const WILSON_HALL: [number, number] = [43.26230329628743, -79.91706003190853];
const RON_JOYCE_STADIUM: [number, number] = [43.266246100763226, -79.91702721896532];

// Simulated route segments with safety scores
const ROUTE_SEGMENTS = [
    {
        id: 1,
        name: 'Wilson Hall Path',
        coordinates: [
            WILSON_HALL,
            [43.2628, -79.9175],
            [43.2635, -79.9180],
        ] as [number, number][],
        safetyScore: 92,
        type: 'footway',
    },
    {
        id: 2,
        name: 'Main Street West',
        coordinates: [
            [43.2635, -79.9180],
            [43.2642, -79.9185],
            [43.2650, -79.9188],
        ] as [number, number][],
        safetyScore: 85,
        type: 'primary',
    },
    {
        id: 3,
        name: 'Stadium Approach',
        coordinates: [
            [43.2650, -79.9188],
            [43.2658, -79.9175],
            RON_JOYCE_STADIUM,
        ] as [number, number][],
        safetyScore: 88,
        type: 'secondary',
    },
];

// McMaster area roads with safety scores
const MCMASTER_ROADS = [
    {
        id: 101,
        name: 'Main Street West',
        coordinates: [
            [43.2590, -79.9250] as [number, number],
            [43.2595, -79.9200] as [number, number],
            [43.2600, -79.9150] as [number, number],
        ],
        safetyScore: 78,
        type: 'primary',
    },
    {
        id: 102,
        name: 'Sterling Street',
        coordinates: [
            [43.2650, -79.9220] as [number, number],
            [43.2650, -79.9180] as [number, number],
            [43.2650, -79.9140] as [number, number],
        ],
        safetyScore: 82,
        type: 'residential',
    },
    {
        id: 103,
        name: 'Forsyth Avenue',
        coordinates: [
            [43.2630, -79.9240] as [number, number],
            [43.2630, -79.9200] as [number, number],
            [43.2630, -79.9160] as [number, number],
        ],
        safetyScore: 75,
        type: 'residential',
    },
    {
        id: 104,
        name: 'Cootes Drive',
        coordinates: [
            [43.2580, -79.9200] as [number, number],
            [43.2600, -79.9200] as [number, number],
            [43.2620, -79.9200] as [number, number],
            [43.2640, -79.9200] as [number, number],
        ],
        safetyScore: 70,
        type: 'secondary',
    },
];

// Safety color mapping - ALL PINK SHADES
const getSafetyColor = (score: number): string => {
    if (score >= 80) return '#ec4899'; // Deep pink - very safe
    if (score >= 70) return '#f472b6'; // Pink - safe
    if (score >= 60) return '#f9a8d4'; // Light pink
    if (score >= 50) return '#fbcfe8'; // Very light pink
    if (score >= 40) return '#fce7f3'; // Very very light pink
    return '#fdf2f8'; // Palest pink - unsafe
};

// Custom pink marker for start/end
const createPinkMarker = () => {
    return L.divIcon({
        className: 'custom-pink-marker',
        html: `
      <div style="
        width: 30px;
        height: 30px;
        background: #ec4899;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-size: 16px;
        ">📍</div>
      </div>
    `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

// Custom pin icon for current location
const customLocationIcon = L.icon({
    iconUrl: '/custom-pin.svg',
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    className: 'custom-pin-marker'
});

// Component to handle map reset
function MapController({ onMapReady }: { onMapReady: (resetFn: () => void) => void }) {
    const map = useMap();

    useEffect(() => {
        const resetView = () => {
            map.setView(MCMASTER_CENTER, 15);
        };
        onMapReady(resetView);
    }, [map, onMapReady]);

    return null;
}

export default function HerRouteMap({
    nightMode,
    routeGenerated,
    onSegmentClick,
    onMapReady,
}: HerRouteMapProps) {
    const mapRef = useRef<LeafletMap | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [allRoads, setAllRoads] = useState<any[]>([]);
    const [showAllRoads, setShowAllRoads] = useState(true);
    const [loading, setLoading] = useState(true);

    // Load all roads from JSON
    useEffect(() => {
        fetch('/roads_simplified.json')
            .then(res => res.json())
            .then(data => {
                const roadsWithScores = data.map((road: any) => ({
                    ...road,
                    safetyScore: Math.floor(40 + Math.random() * 55),
                }));
                setAllRoads(roadsWithScores);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (mapRef.current) {
            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 100);
        }
    }, [routeGenerated]);

    return (
        <>
            <style>{`
                /* Day/Night Mode - Apply filters ONLY to tile layers, not markers */
                .leaflet-tile-pane {
                    filter: ${nightMode 
                        ? `
                            brightness(0.3)
                            contrast(1.1)
                            saturate(3.8)
                            hue-rotate(120deg)
                        `
                        : `
                            saturate(2.5) 
                            brightness(1.05)
                            hue-rotate(5deg)
                            saturate(2.1)
                            brightness(1.1)
                            contrast(1.05)
                        `
                    };
                    transition: filter 0.3s ease;
                }
                
                /* Ensure markers are NOT affected by any filters */
                .leaflet-marker-pane,
                .leaflet-popup-pane,
                .custom-pin-marker,
                .custom-pink-marker {
                    filter: none !important;
                }
                
                /* Ensure polylines (routes) are NOT affected by tile filters */
                .leaflet-overlay-pane svg {
                    filter: none !important;
                }
            `}</style>
            
            {/* Toggle Button - Bottom Left */}
            <button
                onClick={() => setShowAllRoads(!showAllRoads)}
                className={`fixed bottom-6 left-6 z-[9999] px-4 py-2 rounded-lg shadow-lg font-semibold text-sm transition-all ${
                    showAllRoads 
                        ? 'bg-pink-500 text-white hover:bg-pink-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{ zIndex: 9999 }}
            >
                {showAllRoads ? '🗺️ Hide All Roads' : '🗺️ Show All Roads'}
            </button>
            
            <div style={{ height: '100%', width: '100%' }}>
                <MapContainer
                    center={MCMASTER_CENTER}
                    zoom={15}
                    ref={mapRef}
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    zoomControl={true}
                    whenReady={() => setMapReady(true)}
                >
                    <TileLayer
                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    />

                <MapController onMapReady={onMapReady} />

                {/* All roads from JSON - toggleable - ALL PINK */}
                {showAllRoads && allRoads.map((road, idx) => (
                    <Polyline
                        key={`road-${idx}`}
                        positions={road.coordinates}
                        pathOptions={{
                            color: getSafetyColor(road.safetyScore),
                            weight: 3,
                            opacity: 0.5,
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>Road Segment {idx + 1}</strong><br />
                                <div className="mt-1" style={{ color: getSafetyColor(road.safetyScore) }}>
                                    Safety: {road.safetyScore}/100
                                </div>
                            </div>
                        </Popup>
                    </Polyline>
                ))}

                {/* Generated route - shows when routeGenerated is true - ALL PINK */}
                {routeGenerated && (
                    <>
                        {/* Route segments */}
                        {ROUTE_SEGMENTS.map((segment, idx) => (
                            <Polyline
                                key={segment.id}
                                positions={segment.coordinates}
                                pathOptions={{
                                    color: getSafetyColor(segment.safetyScore),
                                    weight: 8,
                                    opacity: 1,
                                }}
                                eventHandlers={{
                                    click: () => onSegmentClick(segment.id),
                                }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <strong>Segment {idx + 1}: {segment.name}</strong><br />
                                        <span className="text-gray-600">{segment.type}</span><br />
                                        <div className="mt-2" style={{ color: getSafetyColor(segment.safetyScore) }}>
                                            <strong>Safety: {segment.safetyScore}/100</strong>
                                        </div>
                                        <button
                                            onClick={() => onSegmentClick(segment.id)}
                                            className="mt-2 px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </Popup>
                            </Polyline>
                        ))}

                        {/* Start marker - Wilson Hall */}
                        <Marker position={WILSON_HALL} icon={createPinkMarker()}>
                            <Popup>
                                <div className="text-center">
                                    <strong className="text-pink-500">🏛️ Start</strong><br />
                                    <small className="text-gray-600">Wilson Hall</small>
                                </div>
                            </Popup>
                        </Marker>

                        {/* End marker - Ron Joyce Stadium */}
                        <Marker position={RON_JOYCE_STADIUM} icon={createPinkMarker()}>
                            <Popup>
                                <div className="text-center">
                                    <strong className="text-pink-500">🏟️ Destination</strong><br />
                                    <small className="text-gray-600">Ron Joyce Stadium</small>
                                </div>
                            </Popup>
                        </Marker>
                    </>
                )}

                {/* Current location marker - always visible */}
                <Marker position={MCMASTER_CENTER} icon={customLocationIcon}>
                    <Popup>
                        <div className="text-center">
                            <strong className="text-pink-500">📍 Your Location</strong><br />
                            <small className="text-gray-600">McMaster University</small>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
            </div>
        </>
    );
}
