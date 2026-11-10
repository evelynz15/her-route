import { Clock, MapPin, X } from 'lucide-react';
import { SafetyCard } from './SafetyCard';
import { SafetyBreakdown } from './SafetyBreakdown';

interface RouteOverviewProps {
  nightMode: boolean;
  route: {
    coords: { lat: number; lng: number }[];
    polyline?: string;
    distance_m?: number;
    duration_s?: number;
    safetyScore?: number;
    lightingScore?: number;
    activityScore?: number;
  } | null;
  origin?: string;
  destination?: string;
  onExit?: () => void;
}

function getSafetyDisplay(score: number): { label: string; color: 'green' | 'yellow' | 'orange' | 'red'; context: string } {
  if (score >= 80) return { label: 'SAFE', color: 'green', context: 'High safety rating for this route' };
  if (score >= 65) return { label: 'MOSTLY SAFE', color: 'yellow', context: 'Generally safe with some caution advised' };
  if (score >= 50) return { label: 'MODERATE', color: 'orange', context: 'Exercise caution on this route' };
  return { label: 'USE CAUTION', color: 'red', context: 'Low safety rating — consider alternatives' };
}


export function RouteOverview(
  { nightMode,
    route,
    origin,
    destination,
    onExit,
  }: RouteOverviewProps) {
  const safetyPct = route?.safetyScore != null ? Math.round(route.safetyScore * 100) : null;
  const safetyDisplay = safetyPct != null ? getSafetyDisplay(safetyPct) : null;

  return (
    <>
      <div className={`px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 relative ${nightMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Route Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-xs sm:text-sm font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              ROUTE OVERVIEW
            </h2>
            {onExit && (
              <button
                onClick={onExit}
                className={`p-1.5 rounded-full transition-colors ${nightMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                aria-label="Close route overview"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className={`flex items-center gap-2 ${nightMode ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>
            <span className="font-medium truncate">{origin}</span>
            <span className={`flex-shrink-0 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>→</span>
            <span className="font-medium truncate">{destination}</span>
          </div>
        </div>

        {/* Safety Score Card */}
        {safetyPct != null && safetyDisplay && (
          <SafetyCard
            score={safetyPct}
            label={safetyDisplay.label}
            context={safetyDisplay.context}
            color={safetyDisplay.color}
            nightMode={nightMode}
          />
        )}

        {/* Route Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className={`text-center p-3 sm:p-4 ${nightMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${nightMode ? 'text-gray-300' : 'text-gray-600'} mx-auto mb-1`} />
            <div className={`text-base sm:text-lg font-bold ${nightMode ? 'text-white' : 'text-gray-900'}`}>
              {route?.duration_s != null ? `${Math.round(route.duration_s / 60)} min` : '—'}
            </div>
            <div className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>Duration</div>
          </div>
          <div className={`text-center p-3 sm:p-4 ${nightMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${nightMode ? 'text-gray-300' : 'text-gray-600'} mx-auto mb-1`} />
            <div className={`text-base sm:text-lg font-bold ${nightMode ? 'text-white' : 'text-gray-900'}`}>
              {route?.distance_m != null ? `${Math.round((route.distance_m / 1000) * 10) / 10} km` : '—'}
            </div>
            <div className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>Distance</div>
          </div>
        </div>


        {/* Safety Breakdown */}
        <div>
          <h3 className={`font-semibold ${nightMode ? 'text-white' : 'text-gray-900'} mb-4`}>Safety Breakdown</h3>
          <SafetyBreakdown
            nightMode={nightMode}
            lightingScore={route?.lightingScore}
            activityScore={route?.activityScore}
          />
        </div>

      </div>

    </>
  );
}