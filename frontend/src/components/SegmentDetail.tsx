import { MapPin, Star, AlertTriangle, Info } from 'lucide-react';
import { SafetyCard } from './SafetyCard';
import { SafetyBreakdown } from './SafetyBreakdown';
import { LeaveReviewModal } from './LeaveReviewModal';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

interface SegmentDetailProps {
  segmentId: number;
  nightMode: boolean;
}

const reviews = [
  {
    id: 1,
    rating: 4,
    text: "Pretty safe overall, but the lighting could be better near the construction zone.",
    time: "3 days ago"
  },
  {
    id: 2,
    rating: 3,
    text: "I usually avoid this section at night. The trees block some of the street lights.",
    time: "1 week ago"
  },
  {
    id: 3,
    rating: 5,
    text: "Actually felt quite safe walking here. Saw a few other people and a security patrol.",
    time: "2 weeks ago"
  }
];

export function SegmentDetail({ segmentId, nightMode }: SegmentDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReviewSubmit = (rating: number, review: string) => {
    console.log('Review submitted:', { segmentId, rating, review });
    // You can add toast notification here or update the reviews list
  };

  return (
    <>
      <div className="px-6 py-6 space-y-6">
        {/* Segment Title */}
        <div>
          <h2 className={`text-sm font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-2`}>
            SEGMENT DETAILS
          </h2>
          <div className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Node {segmentId}/12</div>
          <div className={`flex items-center gap-2 ${nightMode ? 'text-white' : 'text-gray-900'}`}>
            <MapPin className={`w-4 h-4 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className="font-medium">Main St (Oak → Elm)</span>
          </div>
        </div>

        {/* Segment Safety Score */}
        <SafetyCard
          score={72}
          label="CAUTION"
          context="⚠️ Lower than route average"
          color="orange"
          nightMode={nightMode}
        />

        {/* Safety Breakdown - Segment Specific */}
        <div>
          <h3 className={`font-semibold ${nightMode ? 'text-white' : 'text-gray-900'} mb-4`}>Safety Breakdown</h3>
          <SafetyBreakdown isSegment nightMode={nightMode} />
        </div>

        {/* Recent Reviews */}
        <div>
          <h3 className={`font-semibold ${nightMode ? 'text-white' : 'text-gray-900'} mb-4`}>Recent Reviews (3 of 12)</h3>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className={`${nightMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} border rounded-lg p-4`}>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : nightMode ? 'text-gray-600' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>"{review.text}"</p>
                <div className={`text-xs ${nightMode ? 'text-gray-500' : 'text-gray-500'}`}>{review.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <button className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-4 rounded-lg transition-colors">
          📖 Read All Reviews (12)
        </button>

        <button 
          onClick={() => setIsModalOpen(true)}
          className={`w-full border-2 font-semibold py-3 px-4 rounded-lg transition-colors ${
            nightMode 
              ? 'border-pink-500 text-pink-400 hover:bg-pink-900/20' 
              : 'border-pink-500 text-pink-600 hover:bg-pink-50'
          }`}
        >
          ✍️ Leave a Review
        </button>

        {/* Alternative Route Suggestion */}
        <div className={`${nightMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <div className="flex items-start gap-2 mb-2">
            <Info className={`w-5 h-5 ${nightMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`} />
            <div>
              <h4 className={`font-semibold ${nightMode ? 'text-blue-300' : 'text-blue-900'} mb-1`}>Alternative</h4>
              <p className={`text-sm ${nightMode ? 'text-blue-200' : 'text-blue-800'} mb-3`}>
                A slightly longer route via Elm St adds 3 minutes but improves safety score to 82/100.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                🔄 Show Alternative
              </button>
            </div>
          </div>
        </div>

        {/* Leave Review Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <LeaveReviewModal
              onClose={() => setIsModalOpen(false)}
              segmentId={segmentId}
              nightMode={nightMode}
              onSubmit={handleReviewSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}