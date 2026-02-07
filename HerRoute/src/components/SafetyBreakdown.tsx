import { Lightbulb, Camera, AlertCircle, Star } from 'lucide-react';

interface SafetyBreakdownProps {
  isSegment?: boolean;
  nightMode: boolean;
}

export function SafetyBreakdown({ isSegment = false, nightMode }: SafetyBreakdownProps) {
  const lightingScore = isSegment ? 68 : 85;
  const cameraCount = isSegment ? 2 : 12;
  const crimeRating = isSegment ? 'Medium' : 'Low';
  const crimeScore = isSegment ? 65 : 85;
  const incidents = isSegment ? 1 : 2;
  const userRating = isSegment ? 3.8 : 4.2;
  const reviewCount = isSegment ? 12 : 47;

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
            <span className={`font-bold ${nightMode ? 'text-white' : 'text-gray-900'}`}>{lightingScore}/100</span>
            <div className={`w-3 h-3 rounded-full ${lightingScore >= 75 ? 'bg-green-500' : lightingScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`} />
          </div>
        </div>
        <div className={`w-full ${nightMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2 mb-2`}>
          <div
            className={`h-2 rounded-full ${lightingScore >= 75 ? 'bg-green-500' : lightingScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
            style={{ width: `${lightingScore}%` }}
          />
        </div>
        <div className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {isSegment ? '3 street lamps' : '12 street lamps'}
        </div>
      </div>

      {/* Cameras */}
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
      </div>

      {/* Crime Risk */}
      <div className={`${nightMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} border rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={`font-medium ${nightMode ? 'text-white' : 'text-gray-900'}`}>Crime Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${nightMode ? 'text-white' : 'text-gray-900'}`}>{crimeRating}</span>
            <div className={`w-3 h-3 rounded-full ${crimeRating === 'Low' ? 'bg-green-500' : crimeRating === 'Medium' ? 'bg-yellow-500' : 'bg-orange-500'}`} />
          </div>
        </div>
        <div className={`w-full ${nightMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2 mb-2`}>
          <div
            className={`h-2 rounded-full ${crimeRating === 'Low' ? 'bg-green-500' : crimeRating === 'Medium' ? 'bg-yellow-500' : 'bg-orange-500'}`}
            style={{ width: `${crimeScore}%` }}
          />
        </div>
        <div className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {incidents} incident{incidents !== 1 ? 's' : ''} (6 months)
        </div>
      </div>

      {/* User Reviews */}
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
      </div>
    </div>
  );
}