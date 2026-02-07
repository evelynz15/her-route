import { ArrowLeft, ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { RouteOverview } from './RouteOverview';
import { SegmentDetail } from './SegmentDetail';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  nightMode: boolean;
  view: 'overview' | 'segment';
  selectedSegment: number | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onBackToOverview: () => void;
}

export function Sidebar({ nightMode, view, selectedSegment, collapsed, onToggleCollapse, onBackToOverview }: SidebarProps) {
  return (
    <>
      {/* Toggle Button - Desktop (right side) */}
      <div className="hidden md:block absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30">
        <button
          onClick={onToggleCollapse}
          className={`w-9 h-9 sm:w-10 sm:h-10 ${nightMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-50'} border-2 rounded-full flex items-center justify-center transition-all shadow-lg`}
        >
          {collapsed ? (
            <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${nightMode ? 'text-gray-300' : 'text-gray-600'}`} />
          ) : (
            <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${nightMode ? 'text-gray-300' : 'text-gray-600'}`} />
          )}
        </button>
      </div>

      {/* Toggle Button - Mobile (bottom center) */}
      <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={onToggleCollapse}
          className={`px-4 py-2 ${nightMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-50'} border-2 rounded-full flex items-center gap-2 transition-all shadow-lg`}
        >
          {collapsed ? (
            <>
              <ChevronUp className={`w-5 h-5 ${nightMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>Route Details</span>
            </>
          ) : (
            <>
              <ChevronDown className={`w-5 h-5 ${nightMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>Hide</span>
            </>
          )}
        </button>
      </div>

      {/* Sidebar Panel - Desktop (right side) */}
      <motion.div 
        className={`hidden md:flex relative ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l flex-col overflow-hidden`}
        initial={false}
        animate={{ 
          width: collapsed ? '0px' : 'min(400px, 90vw)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="flex-1 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'overview' ? (
                <RouteOverview nightMode={nightMode} />
              ) : (
                <div>
                  <div className={`sticky top-0 ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 sm:px-6 py-3 sm:py-4 z-10`}>
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
        className={`md:hidden absolute left-0 right-0 bottom-0 ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t rounded-t-3xl shadow-2xl overflow-hidden z-20`}
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
                <RouteOverview nightMode={nightMode} />
              ) : (
                <div>
                  <div className={`sticky top-0 ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 z-10`}>
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