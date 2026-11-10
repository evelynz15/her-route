import { useState } from "react";
import { Search, X, Loader2, MapPin } from "lucide-react";
import HerRouteMap from "./HerRouteMap";

interface MapSectionProps {
  nightMode: boolean;
  routeGenerated: boolean;
  routeLoading: boolean;
  onDestinationSelect: (destination: string) => void;
  onDestinationChanged: (destination: string) => void;
  onOriginChanged: (origin: string) => void;
  onOriginSelect: (origin: string) => void;
  onClearRoute: () => void;
  onNodeClick: (nodeId: number) => void;
  onResetView: (resetFn: () => void) => void;
  suggestions: any[];
  originSuggestions: any[];
  route: {
    coords: { lat: number; lng: number }[];
    polyline?: string;
    distance_m?: number;
    duration_s?: number;
  } | null;
}

export function MapSection({
  nightMode,
  routeGenerated,
  routeLoading,
  onDestinationSelect,
  onDestinationChanged,
  onOriginChanged,
  onOriginSelect,
  onClearRoute,
  onNodeClick,
  onResetView,
  suggestions,
  originSuggestions,
  route,
}: MapSectionProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [originValue, setOriginValue] = useState("");
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [originConfirmed, setOriginConfirmed] = useState(false);

  const handleDestinationClick = (destinationName: string) => {
    setSearchValue(destinationName);
    onDestinationSelect(destinationName);
    setShowSuggestions(false);
  };

  const handleOriginClick = (originName: string) => {
    setOriginValue(originName);
    onOriginSelect(originName);
    setShowOriginSuggestions(false);
    setOriginConfirmed(true);
  };

  return (
    <div className="flex-1 relative h-full" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
          position: 'absolute',
          top: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '600px',
          pointerEvents: 'none',
        }}>
        <div
          className={`rounded-2xl shadow-2xl border backdrop-blur-md overflow-hidden ${nightMode ? 'border-gray-700' : 'border-gray-200'}`}
          style={{
            pointerEvents: 'auto',
            backgroundColor: nightMode ? 'rgba(31, 41, 55, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          }}
        >
          {/* Loading progress bar */}
          {routeLoading && (
            <div className="h-0.5 w-full overflow-hidden rounded-t-2xl">
              <div
                className="h-full bg-pink-500"
                style={{
                  width: '40%',
                  animation: 'loading-slide 1.2s ease-in-out infinite',
                }}
              />
              <style>{`
                @keyframes loading-slide {
                  0%   { transform: translateX(-100%); }
                  100% { transform: translateX(350%); }
                }
              `}</style>
            </div>
          )}
          {/* Origin row */}
          <div className="flex items-center gap-3 px-4 py-4">
            {/* Origin dot icon */}
            <div className="flex-shrink-0 flex flex-col items-center" style={{ width: 20 }}>
              <div className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white" />
            </div>
            <input
              type="text"
              value={originValue}
              onChange={(e) => {
                setOriginValue(e.target.value);
                setShowOriginSuggestions(true);
                if (e.target.value.trim()) onOriginChanged(e.target.value);
              }}
              onFocus={() => setShowOriginSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && originValue.trim()) handleOriginClick(originValue);
              }}
              placeholder="Enter starting point..."
              className={`flex-1 outline-none bg-transparent text-sm ${nightMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
            {originValue && (
              <button
                onClick={() => { setOriginValue(''); onOriginSelect(''); setShowOriginSuggestions(false); setOriginConfirmed(false); setSearchValue(''); onClearRoute(); }}
                className={`p-1 rounded-full flex-shrink-0 ${nightMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Connector + Destination row — only when origin confirmed */}
          {originConfirmed && (
            <>
              {/* Dotted vertical line */}
              <div className="flex items-center px-4">
                <div className="flex flex-col items-center" style={{ width: 20 }}>
                  <div style={{ width: 2, height: 18, backgroundImage: 'repeating-linear-gradient(to bottom, #9ca3af 0px, #9ca3af 4px, transparent 4px, transparent 8px)' }} />
                </div>
                <div className={`flex-1 border-t ${nightMode ? 'border-gray-700' : 'border-gray-100'}`} />
              </div>

              {/* Destination row */}
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 20 }}>
                  {routeLoading
                    ? <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                    : <MapPin className="w-4 h-4 text-pink-500" style={{ fill: '#ec4899', stroke: 'white', strokeWidth: 1.5 }} />
                  }
                </div>
                <input
                  type="text"
                  value={searchValue}
                  disabled={routeLoading}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    if (!e.target.value.trim()) return;
                    onDestinationChanged(e.target.value);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchValue.trim()) handleDestinationClick(searchValue);
                  }}
                  placeholder={routeLoading ? "Finding safest route..." : "Enter destination..."}
                  className={`flex-1 outline-none bg-transparent text-sm ${nightMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                />
                {(searchValue || routeGenerated) && !routeLoading && (
                  <button
                    onClick={() => { onClearRoute(); setSearchValue(''); setShowSuggestions(false); }}
                    className={`p-1 rounded-full flex-shrink-0 ${nightMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Origin suggestions */}
          {showOriginSuggestions && !routeGenerated && originSuggestions.length > 0 && (
            <div className={`border-t ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
              {originSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOriginClick(suggestion.description)}
                  className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${idx === originSuggestions.length - 1 ? 'rounded-b-2xl' : `border-b ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}`}
                >
                  <Search className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <div className={`text-sm ${nightMode ? 'text-white' : 'text-gray-900'}`}>{suggestion.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Destination suggestions */}
          {showSuggestions && !routeGenerated && suggestions.length > 0 && (
            <div className={`border-t ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDestinationClick(suggestion.description)}
                  className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${idx === suggestions.length - 1 ? 'rounded-b-2xl' : `border-b ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}`}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <div className={`text-sm ${nightMode ? 'text-white' : 'text-gray-900'}`}>{suggestion.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <HerRouteMap
          nightMode={nightMode}
          routeGenerated={routeGenerated}
          route={route}
          onSegmentClick={(segmentId) => onNodeClick(segmentId)}
          onMapReady={(resetFn) => onResetView(resetFn)}
        />
      </div>
    </div>
  );
}