import { Moon, Sun, Settings } from 'lucide-react';

interface HeaderProps {
  nightMode: boolean;
  onToggleNightMode: () => void;
  onSettings: () => void;
}

export function Header({ nightMode, onToggleNightMode, onSettings }: HeaderProps) {
  return (
    <header className={`h-14 sm:h-16 ${nightMode ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-r from-pink-50 via-white to-orange-50 border-pink-100'} border-b flex items-center justify-between px-4 sm:px-6 z-20 shadow-sm`}>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo */}
        <div className="relative">
          <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transform hover:scale-105 transition-transform">
            <img src="/favicon-herroute.ico" alt="HerRoute" className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className={`font-bold text-lg sm:text-xl ${
              nightMode 
                ? 'text-white' 
                : 'bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent'
            } transition-all`}>
              HerRoute
            </h1>
          </div>
          <p className={`text-[10px] sm:text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} -mt-0.5 hidden sm:block`}>
            Because every walk home should feel safe
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Night Mode Toggle - More visual */}
        <button
          onClick={onToggleNightMode}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${
            nightMode 
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' 
              : 'bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50'
          } transition-all shadow-sm`}
        >
          {nightMode ? (
            <>
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Day</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-600" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Night</span>
            </>
          )}
        </button>
        {/* Settings Button */}
        <button
          onClick={onSettings}
          className={`p-2 sm:p-2.5 rounded-lg border ${
            nightMode 
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
              : 'bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50'
          } transition-all shadow-sm`}
        >
          <Settings className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
      </div>
    </header>
  );
}