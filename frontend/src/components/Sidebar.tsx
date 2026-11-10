import { ArrowLeft, ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { RouteOverview } from './RouteOverview';
import { SegmentDetail } from './SegmentDetail';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  nightMode: boolean;
  view: 'overview' | 'segment';
  selectedSegment: number | null;
  collapsed: boolean;
  route: {
        coords: { lat: number; lng: number }[];
        polyline?: string;
        distance_m?: number;
        duration_s?: number;
        safetyScore?: number;
    } | null;
  origin: string;
  destination: string;
  onToggleCollapse: () => void;
  onBackToOverview: () => void;
  onExit: () => void;
}

export function Sidebar(
  { nightMode,
    view,
    selectedSegment,
    collapsed,
    onToggleCollapse,
    onBackToOverview,
    onExit,
    route,
    origin,
    destination,
  }: SidebarProps) {
  return (
    <>
      {/* Slide-back button - Desktop (right edge, only when collapsed) */}
      <AnimatePresence>
        {collapsed && (
          <motion.div
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              onClick={onToggleCollapse}
              className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
                nightMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-pink-400 border border-gray-700'
                  : 'bg-white hover:bg-pink-50 text-pink-500 border border-pink-200'
              }`}
              aria-label="Open route details"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-back button - Mobile (bottom center, only when collapsed) */}
      <AnimatePresence>
        {collapsed && (
          <motion.div
            className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <button
              onClick={onToggleCollapse}
              className={`px-4 py-2.5 border-2 rounded-full flex items-center gap-2 shadow-lg transition-colors ${
                nightMode
                  ? 'bg-gray-800 border-pink-700 hover:bg-gray-700 text-pink-400'
                  : 'bg-white border-pink-300 hover:bg-pink-50 text-pink-500'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-semibold">Route Details</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Panel - Desktop (right side) */}
      <motion.div 
        className={`hidden md:flex relative ${nightMode ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-b from-pink-50 via-white to-orange-50 border-pink-100'} border-l flex-col overflow-hidden`}
        initial={false}
        animate={{ 
          width: collapsed ? '0px' : 'min(400px, 90vw)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'overview' ? (
                <RouteOverview
                  nightMode={nightMode}
                  route={route}
                  origin={origin}
                  destination={destination}
                  onExit={onExit}
                />
              ) : (
                <div>
                  <div className={`sticky top-0 ${nightMode ? 'bg-gray-900/95 border-gray-700' : 'bg-pink-50/95 border-pink-100'} backdrop-blur-sm border-b px-4 sm:px-6 py-3 sm:py-4 z-10`}>
                    <button
                      onClick={onBackToOverview}
                      className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Route Overview
                    </button>
                  </div>
                  <SegmentDetail nightMode={nightMode} segmentId={selectedSegment || 7} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sidebar Panel - Mobile (bottom sheet) */}
      <motion.div 
        className={`md:hidden absolute left-0 right-0 bottom-0 ${nightMode ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-b from-pink-50 via-white to-orange-50 border-pink-100'} border-t rounded-t-3xl shadow-2xl overflow-hidden z-20`}
        initial={false}
        animate={{ 
          height: collapsed ? '0px' : '65vh',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="flex-1 overflow-y-auto h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Drag handle indicator */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1.5 rounded-full ${nightMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              </div>
              
              {view === 'overview' ? (
                <RouteOverview
                  nightMode={nightMode}
                  route={route}
                  origin={origin}
                  destination={destination}
                  onExit={onExit}
                />
              ) : (
                <div>
                  <div className={`sticky top-0 ${nightMode ? 'bg-gray-900/95 border-gray-700' : 'bg-pink-50/95 border-pink-100'} backdrop-blur-sm border-b px-4 py-3 z-10`}>
                    <button
                      onClick={onBackToOverview}
                      className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Route Overview
                    </button>
                  </div>
                  <SegmentDetail nightMode={nightMode} segmentId={selectedSegment || 7} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}