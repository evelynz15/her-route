import { useState } from 'react';
import { Search, X, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';

interface MapSectionProps {
  nightMode: boolean;
  routeGenerated: boolean;
  onDestinationSelect: () => void;
  onClearRoute: () => void;
  onNodeClick: (nodeId: number) => void;
}

const routeNodes = [
  { id: 1, x: 15, y: 20, safety: 85, color: '#22C55E' },
  { id: 2, x: 18, y: 25, safety: 82, color: '#22C55E' },
  { id: 3, x: 22, y: 32, safety: 78, color: '#84CC16' },
  { id: 4, x: 28, y: 38, safety: 75, color: '#84CC16' },
  { id: 5, x: 35, y: 42, safety: 68, color: '#FACC15' },
  { id: 6, x: 42, y: 45, safety: 65, color: '#FACC15' },
  { id: 7, x: 48, y: 50, safety: 58, color: '#FB923C' },
  { id: 8, x: 52, y: 56, safety: 72, color: '#FACC15' },
  { id: 9, x: 58, y: 62, safety: 80, color: '#22C55E' },
  { id: 10, x: 65, y: 68, safety: 85, color: '#22C55E' },
  { id: 11, x: 72, y: 72, safety: 88, color: '#22C55E' },
  { id: 12, x: 78, y: 78, safety: 90, color: '#16A34A' },
];

const cameras = [
  { id: 1, x: 25, y: 35 },
  { id: 2, x: 40, y: 48 },
  { id: 3, x: 55, y: 60 },
  { id: 4, x: 70, y: 70 },
];

const streetLights = [
  { id: 1, x: 20, y: 28 },
  { id: 2, x: 30, y: 40 },
  { id: 3, x: 38, y: 44 },
  { id: 4, x: 50, y: 54 },
  { id: 5, x: 60, y: 65 },
  { id: 6, x: 75, y: 75 },
];

const businesses = [
  { id: 1, x: 33, y: 43, name: '7-Eleven' },
  { id: 2, x: 68, y: 70, name: 'Tim Hortons' },
];

const suggestions = [
  { icon: '🏠', name: '36 Hunter St E, Hamilton, ON M6E 2C8', distance: '1.2 km', open24: false },
  { icon: '🏥', name: 'McMaster Medical Centre', distance: '0.8 km', open24: true },
  { icon: '🏪', name: '7-Eleven Store', distance: '0.5 km', open24: true },
  { icon: '📍', name: 'Campus Library', distance: '1.5 km', open24: false },
];

export function MapSection({ nightMode, routeGenerated, onDestinationSelect, onClearRoute, onNodeClick }: MapSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleSuggestionClick = (suggestionName: string) => {
    setSearchQuery(suggestionName);
    setShowSuggestions(false);
    onDestinationSelect();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onClearRoute();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ 
        x: e.touches[0].clientX - panOffset.x, 
        y: e.touches[0].clientY - panOffset.y 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      setPanOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  return (
    <div className="flex-1 relative bg-gray-50">
      {/* Search Bar */}
      <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-10 w-[90%] sm:w-[600px] max-w-[600px]">
        <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg border`}>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
            <Search className={`w-4 h-4 sm:w-5 sm:h-5 ${nightMode ? 'text-gray-400' : 'text-gray-400'} flex-shrink-0`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Where do you want to go?"
              className={`flex-1 outline-none text-sm sm:text-base ${nightMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900'}`}
            />
            {searchQuery && (
              <button 
                onClick={handleClearSearch}
                className={`p-1 ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded flex-shrink-0`}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          
          {showSuggestions && (
            <div className={`border-t ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors text-left`}
                  onClick={() => handleSuggestionClick(suggestion.name)}
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm sm:text-base truncate ${nightMode ? 'text-white' : 'text-gray-900'}`}>{suggestion.name}</div>
                    <div className={`text-xs sm:text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>{suggestion.distance} away</div>
                  </div>
                  {suggestion.open24 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex-shrink-0 hidden sm:inline">
                      Open 24/7
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 sm:top-6 right-4 sm:right-6 z-10 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className={`w-9 h-9 sm:w-10 sm:h-10 ${nightMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border rounded-lg shadow-md flex items-center justify-center transition-colors`}
        >
          <Plus className={`w-4 h-4 sm:w-5 sm:h-5 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
        <button 
          onClick={handleZoomOut}
          className={`w-9 h-9 sm:w-10 sm:h-10 ${nightMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border rounded-lg shadow-md flex items-center justify-center transition-colors`}
        >
          <Minus className={`w-4 h-4 sm:w-5 sm:h-5 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
      </div>

      {/* Map Canvas - Map stays the same regardless of night mode */}
      <div 
        className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing" 
        style={{ backgroundColor: '#F5F5F0' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Simulated map background with streets */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transition: isPanning ? 'none' : 'transform 0.2s',
            width: '100%',
            height: '100%'
          }}
        >
          <svg 
            className="absolute inset-0" 
            width="100%" 
            height="100%" 
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1000 1000"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E5DC" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="blueGlow">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#6366F1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Major streets */}
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#D9D9D0" strokeWidth="3" />
            <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#D9D9D0" strokeWidth="3" />
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#D9D9D0" strokeWidth="3" />
            <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#D9D9D0" strokeWidth="3" />
            
            {/* Green areas (parks) */}
            <rect x="10%" y="10%" width="15%" height="15%" fill="#E8F5E9" opacity="0.6" rx="8" />
            <rect x="70%" y="65%" width="20%" height="20%" fill="#E8F5E9" opacity="0.6" rx="8" />
            
            {routeGenerated && (
              <>
                {/* Route Path with color-coded segments */}
                {routeNodes.slice(0, -1).map((node, idx) => {
                  const nextNode = routeNodes[idx + 1];
                  const isHighlighted = hoveredSegment === idx || hoveredNode === node.id || hoveredNode === nextNode.id;
                  
                  return (
                    <g key={idx}>
                      {/* Glow effect when hovering */}
                      {isHighlighted && (
                        <motion.line
                          x1={`${node.x}%`}
                          y1={`${node.y}%`}
                          x2={`${nextNode.x}%`}
                          y2={`${nextNode.y}%`}
                          stroke={node.color}
                          strokeWidth="16"
                          strokeLinecap="round"
                          opacity="0.4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      {/* Main path segment */}
                      <line
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${nextNode.x}%`}
                        y2={`${nextNode.y}%`}
                        stroke={node.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        opacity={isHighlighted ? "1" : "0.9"}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredSegment(idx)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        onClick={() => onNodeClick(node.id)}
                      />
                    </g>
                  );
                })}
                
                {/* Route Nodes */}
                {routeNodes.map((node, idx) => {
                  const isThisNodeHighlighted = hoveredNode === node.id;
                  const isPrevSegmentHighlighted = idx > 0 && hoveredSegment === idx - 1;
                  const isNextSegmentHighlighted = hoveredSegment === idx;
                  const isNodeHighlighted = isThisNodeHighlighted || isPrevSegmentHighlighted || isNextSegmentHighlighted;
                  
                  return (
                    <g key={node.id}>
                      {isNodeHighlighted && (
                        <motion.circle
                          cx={`${node.x}%`}
                          cy={`${node.y}%`}
                          r="12"
                          fill="none"
                          stroke={node.color}
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.6 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      <circle
                        cx={`${node.x}%`}
                        cy={`${node.y}%`}
                        r={isNodeHighlighted ? "7" : "6"}
                        fill="white"
                        stroke={node.color}
                        strokeWidth={isNodeHighlighted ? "4" : "3"}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => onNodeClick(node.id)}
                      />
                    </g>
                  );
                })}
                
                {/* Destination marker */}
                <g>
                  <circle
                    cx={`${routeNodes[routeNodes.length - 1].x}%`}
                    cy={`${routeNodes[routeNodes.length - 1].y}%`}
                    r="10"
                    fill="#EC4899"
                  />
                  <circle
                    cx={`${routeNodes[routeNodes.length - 1].x}%`}
                    cy={`${routeNodes[routeNodes.length - 1].y}%`}
                    r="4"
                    fill="white"
                  />
                </g>
              </>
            )}
            
            {/* Current Location (glowing blue circle) - McMaster University */}
            <g>
              {/* Outer glow rings */}
              <motion.circle
                cx={`${routeNodes[0].x}%`}
                cy={`${routeNodes[0].y}%`}
                r="30"
                fill="url(#blueGlow)"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.2, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx={`${routeNodes[0].x}%`}
                cy={`${routeNodes[0].y}%`}
                r="20"
                fill="#6366F1"
                opacity="0.4"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Core circle */}
              <circle
                cx={`${routeNodes[0].x}%`}
                cy={`${routeNodes[0].y}%`}
                r="10"
                fill="#6366F1"
              />
              {/* Inner white dot */}
              <circle
                cx={`${routeNodes[0].x}%`}
                cy={`${routeNodes[0].y}%`}
                r="4"
                fill="white"
              />
            </g>
          </svg>
          
          {routeGenerated && (
            <>
              {/* Street Lights */}
              {streetLights.map((light) => (
                <div
                  key={light.id}
                  className="absolute w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-md pointer-events-none"
                  style={{ left: `${light.x}%`, top: `${light.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              ))}
              
              {/* 24/7 Businesses */}
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="absolute pointer-events-none"
                  style={{ left: `${business.x}%`, top: `${business.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 bg-white rounded-sm"></div>
                  </div>
                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md whitespace-nowrap text-xs font-medium text-gray-700">
                    {business.name}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}