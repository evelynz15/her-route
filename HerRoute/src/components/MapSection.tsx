import { useState } from "react";
import { Search, X } from "lucide-react";
import HerRouteMap from "./HerRouteMap";

interface MapSectionProps {
  nightMode: boolean;
  routeGenerated: boolean;
  onDestinationSelect: (destination: string) => void;
  onDestinationChanged: (destination: string) => void;
  onClearRoute: () => void;
  onNodeClick: (nodeId: number) => void;
  onResetView: (resetFn: () => void) => void;
}

export function MapSection({
  nightMode,
  routeGenerated,
  onDestinationSelect,
  onDestinationChanged,
  onClearRoute,
  onNodeClick,
  onResetView,
}: MapSectionProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  //const [selectedDestination, setSelectedDestination] = useState<string>("87 Dalewood Crescent");

  // Removed icons from here
  const suggestions = [
    { name: '87 Dalewood Crescent', distance: '1.2 km' },
    { name: 'Wilson Hall', distance: '0 km' },
    { name: 'Mills Library', distance: '0.3 km' },
    { name: 'Tim Hortons - Campus', distance: '0.2 km' },
  ];

  const handleDestinationClick = (destinationName: string) => {
    setSearchValue(destinationName);
    //setSelectedDestination(destinationName);
    onDestinationSelect(destinationName);
    setShowSuggestions(false);
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
        <div className={`rounded-xl shadow-2xl border backdrop-blur-md ${nightMode ? 'border-gray-700' : 'border-gray-200'}`}
          style={{ 
            pointerEvents: 'auto',
            backgroundColor: nightMode ? 'rgba(31, 41, 55, 0.75)' : 'rgba(255, 255, 255, 0.75)'
          }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <Search className="w-5 h-5 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                if (!e.target.value.trim()) return;
                onDestinationChanged(e.target.value)
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue.trim()) {
                  handleDestinationClick(searchValue);
                }
              }}
              placeholder="Enter destination..."
              className={`flex-1 outline-none bg-transparent ${nightMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
            {(searchValue || routeGenerated) && (
              <button onClick={() => { onClearRoute(); setSearchValue(''); setShowSuggestions(false); }}
                className={`p-1 rounded-full ${nightMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {showSuggestions && !routeGenerated && (
            <div className={`border-t ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDestinationClick(suggestion.name)}
                  className={`w-full text-left px-5 py-3 flex flex-col transition-colors ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${idx === suggestions.length - 1 ? '' : `border-b ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}`}
                >
                  <div className={`text-sm font-medium ${nightMode ? 'text-white' : 'text-gray-900'}`}>{suggestion.name}</div>
                  <div className="text-xs text-gray-500">{suggestion.distance}</div>
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
          onSegmentClick={(segmentId) => onNodeClick(segmentId)}
          onMapReady={(resetFn) => onResetView(resetFn)}
        />
      </div>
    </div>
  );
}