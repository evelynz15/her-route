import { X, Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LeaveReviewModalProps {
  nightMode: boolean;
  segmentId: number;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

export function LeaveReviewModal({ nightMode, segmentId, onClose, onSubmit }: LeaveReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0 && review.trim()) {
      onSubmit(rating, review);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 ${nightMode ? 'border-gray-700' : 'border-gray-200'} border-b flex-shrink-0`}>
              <div>
                <h2 className={`text-xl font-semibold ${nightMode ? 'text-white' : 'text-gray-900'}`}>
                  Leave a Review
                </h2>
                <p className={`text-sm mt-1 ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Segment {segmentId} / 12
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-5 h-5 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Rating Section */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  How safe did you feel on this segment?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= displayRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : nightMode
                            ? 'text-gray-600'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <motion.p 
                    className={`text-sm mt-2 ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {rating === 1 && '⚠️ Very unsafe'}
                    {rating === 2 && '😟 Somewhat unsafe'}
                    {rating === 3 && '😐 Neutral'}
                    {rating === 4 && '😊 Safe'}
                    {rating === 5 && '✨ Very safe'}
                  </motion.p>
                )}
              </div>

              {/* Review Text Area */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Share your experience
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell others about the lighting, visibility, foot traffic, or anything that impacted your safety..."
                  className={`w-full p-4 rounded-lg border-2 ${
                    nightMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } outline-none focus:border-pink-500 transition-colors resize-none`}
                  rows={6}
                  maxLength={500}
                />
                <div className={`text-xs mt-2 text-right ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {review.length} / 500 characters
                </div>
              </div>

              {/* Tips */}
              <div className={`${nightMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                <p className={`text-sm ${nightMode ? 'text-blue-300' : 'text-blue-900'} font-semibold mb-2`}>
                  💡 Tips for helpful reviews:
                </p>
                <ul className={`text-xs ${nightMode ? 'text-blue-200' : 'text-blue-800'} space-y-1`}>
                  <li>• Mention specific lighting conditions</li>
                  <li>• Note if you saw other people walking</li>
                  <li>• Describe any security features you noticed</li>
                  <li>• Share the time of day you walked this route</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex gap-3 p-6 ${nightMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
              <button
                onClick={onClose}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
                  nightMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!rating || !review.trim()}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  !rating || !review.trim()
                    ? nightMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                <Send className="w-4 h-4" />
                Submit Review
              </button>
            </div>
          </>
        ) : (
          /* Success Message */
          <motion.div 
            className="p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div 
              className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Star className="w-12 h-12 text-pink-600 fill-pink-600" />
            </motion.div>
            <h3 className={`text-2xl font-bold mb-2 ${nightMode ? 'text-white' : 'text-gray-900'}`}>
              Thank You!
            </h3>
            <p className={`${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your review helps make HerRoute safer for everyone in the community! 💖
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}