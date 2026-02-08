import { Moon, Sun, Settings } from 'lucide-react';
import logo from '../assets/fixedHerRoute.svg?url';

export function Header({ nightMode, onToggleNightMode, onSettings }) {
  return (
    <header
      className={`h-14 sm:h-16 ${
        nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b flex items-center justify-between z-20`}
    >
      {/* LEFT: logo + name */}
      <div
        className="flex items-center gap-2 sm:gap-3"
        style={{ marginLeft: 15 }}   // ← ~halfway back, clean + reliable
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10">
          <img src={logo} alt="HerRoute" className="w-full h-full object-contain" />
        </div>
        <h1
          className={`font-bold text-lg sm:text-xl ${
            nightMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          HerRoute
        </h1>
      </div>

      {/* RIGHT: actions */}
      <div
        className="flex items-center gap-2 sm:gap-4"
        style={{ marginRight: 15 }}  // symmetry = chef’s kiss
      >
        <button
          onClick={onToggleNightMode}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
            nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          } transition-colors`}
        >
          {nightMode ? (
            <>
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">
                Day Mode
              </span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">
                Night Mode
              </span>
            </>
          )}
        </button>

        <button
          onClick={onSettings}
          className={`p-1.5 sm:p-2 rounded-lg ${
            nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          } transition-colors`}
        >
          <Settings
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              nightMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          />
        </button>
      </div>
    </header>
  );
}
