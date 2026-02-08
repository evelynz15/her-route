import { useState } from "react";
import { Search, X } from "lucide-react";
import HerRouteMap from "./HerRouteMap";

interface MapSectionProps {
  nightMode: boolean;
  routeGenerated: boolean;
  onDestinationSelect: () => void;
  onClearRoute: () => void;
  onNodeClick: (nodeId: number) => void;
  onResetView: (resetFn: () => void) => void;
}

export function MapSection({
  nightMode,
  routeGenerated,
  onDestinationSelect,
  onClearRoute,
  onNodeClick,
  onResetView,
}: MapSectionProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    { icon: '🏛️', name: 'Wilson Hall', distance: '0 km' },
    { icon: '🏟️', name: 'Ron Joyce Stadium', distance: '0.5 km' },
    { icon: '📚', name: 'Mills Library', distance: '0.3 km' },
    { icon: '☕', name: 'Tim Hortons - Campus', distance: '0.2 km' },
  ];

  return (
    <div
      className="flex-1 relative h-full"
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* Search Bar - Lower position with 75% opacity */}
      <div
        style={{
          position: 'absolute',
          top: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '600px',
          pointerEvents: 'none', // Allow clicks to pass through wrapper
        }}
      >
        <div
          className={`rounded-xl shadow-2xl border backdrop-blur-md ${nightMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          style={{ 
            pointerEvents: 'auto',
            backgroundColor: nightMode ? 'rgba(31, 41, 55, 0.75)' : 'rgba(255, 255, 255, 0.75)'
          }}
        >
          {/* Search Input */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
            <Search className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${nightMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue.trim()) {
                  onDestinationSelect();
                  setShowSuggestions(false);
                }
              }}
              placeholder="Where do you want to go?"
              className={`flex-1 outline-none text-sm sm:text-base bg-transparent ${nightMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                }`}
            />
            {(searchValue || routeGenerated) && (
              <button
                onClick={() => {
                  if (routeGenerated) {
                    onClearRoute();
                  }
                  setSearchValue('');
                  setShowSuggestions(false);
                }}
                className={`p-1 rounded-full hover:bg-opacity-80 flex-shrink-0 transition-colors ${nightMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  }`}
              >
                <X className={`w-4 h-4 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && !routeGenerated && (
            <div className={`border-t ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchValue(suggestion.name);
                    onDestinationSelect();
                    setShowSuggestions(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${idx === suggestions.length - 1 ? '' : `border-b ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}`}
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs sm:text-sm font-medium truncate ${nightMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {suggestion.name}
                    </div>
                    <div className="text-xs">
                      <span className={nightMode ? 'text-gray-400' : 'text-gray-500'}>
                        {suggestion.distance}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaflet Map - z-index: 1 */}
      <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <HerRouteMap
          nightMode={nightMode}
          routeGenerated={routeGenerated}
          onSegmentClick={(segmentId) => {
            onNodeClick(segmentId);
          }}
          onMapReady={(resetFn) => {
            onResetView(resetFn);
          }}
        />
      </div>
    </div>
  );
}
