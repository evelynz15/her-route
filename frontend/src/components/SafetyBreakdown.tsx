import { Lightbulb, Activity } from 'lucide-react';
// import { Camera, Star } from 'lucide-react';

interface SafetyBreakdownProps {
  isSegment?: boolean;
  nightMode: boolean;
  lightingScore?: number;
  activityScore?: number;
}

function scoreColor(pct: number) {
  if (pct >= 75) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-orange-500';
}

function scoreDot(pct: number) {
  if (pct >= 75) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-orange-500';
}

export function SafetyBreakdown({ isSegment = false, nightMode, lightingScore, activityScore }: SafetyBreakdownProps) {
  const lightingPct = lightingScore != null ? Math.round(lightingScore * 100) : null;
  const activityPct = activityScore != null ? Math.round(activityScore * 100) : null;

  return (
    <div className="space-y-4">
      {/* Lighting */}
      <div className={`${nightMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} border rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span className={`font-medium ${nightMode ? 'text-white' : 'text-gray-900'}`}>Lighting</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${nightMode ? 'text-white' : 'text-gray-900'}`}>
              {lightingPct != null ? `${lightingPct}/100` : '—'}
            </span>
            {lightingPct != null && <div className={`w-3 h-3 rounded-full ${scoreDot(lightingPct)}`} />}
          </div>
        </div>
        <div className={`w-full ${nightMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
          <div
            className={`h-2 rounded-full transition-all ${lightingPct != null ? scoreColor(lightingPct) : 'bg-gray-400'}`}
            style={{ width: `${lightingPct ?? 0}%` }}
          />
        </div>
      </div>

      {/* Activity */}
      <div className={`${nightMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} border rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className={`font-medium ${nightMode ? 'text-white' : 'text-gray-900'}`}>Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${nightMode ? 'text-white' : 'text-gray-900'}`}>
              {activityPct != null ? `${activityPct}/100` : '—'}
            </span>
            {activityPct != null && <div className={`w-3 h-3 rounded-full ${scoreDot(activityPct)}`} />}
          </div>
        </div>
        <div className={`w-full ${nightMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
          <div
            className={`h-2 rounded-full transition-all ${activityPct != null ? scoreColor(activityPct) : 'bg-gray-400'}`}
            style={{ width: `${activityPct ?? 0}%` }}
          />
        </div>
      </div>

      {/* Cameras — commented out until data is available
      <div className={`${nightMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} border rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            <span className={`font-medium ${nightMode ? 'text-white' : 'text-gray-900'}`}>Cameras</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-600">Yes ✓</span>
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>
        <div className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {cameraCount} cameras on {isSegment ? 'segment' : 'route'}
        </div>
      </div> */}

      {/* User Reviews — commented out until data is available
      <div className={`${nightMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} border rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className={`font-medium ${nightMode ? 'text-white' : 'text-gray-900'}`}>User Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${nightMode ? 'text-white' : 'text-gray-900'}`}>{userRating}/5.0</span>
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>
        <div className="flex gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(userRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : nightMode ? 'text-gray-600' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <div className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Based on {reviewCount} reviews
        </div>
      </div> */}
    </div>
  );
}
