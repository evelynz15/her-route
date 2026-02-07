interface SafetyCardProps {
  score: number;
  label: string;
  context: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  nightMode: boolean;
}

const colorConfig = {
  green: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    bar: 'bg-green-500',
    emoji: '🟢',
    bgNight: 'bg-green-900/30',
    textNight: 'text-green-300'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    bar: 'bg-yellow-500',
    emoji: '🟡',
    bgNight: 'bg-yellow-900/30',
    textNight: 'text-yellow-300'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    bar: 'bg-orange-500',
    emoji: '🟠',
    bgNight: 'bg-orange-900/30',
    textNight: 'text-orange-300'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    bar: 'bg-red-500',
    emoji: '🔴',
    bgNight: 'bg-red-900/30',
    textNight: 'text-red-300'
  }
};

export function SafetyCard({ score, label, context, color, nightMode }: SafetyCardProps) {
  const config = colorConfig[color];

  return (
    <div className={`${nightMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm`}>
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${nightMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          {score}
          <span className={`text-3xl ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>/100</span>
        </div>
      </div>
      
      <div className={`w-full ${nightMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-3 mb-4`}>
        <div
          className={`${config.bar} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      <div className="text-center mb-2">
        <span className={`inline-flex items-center gap-2 px-3 py-1 ${nightMode ? config.bgNight + ' ' + config.textNight : config.bg + ' ' + config.text} rounded-full font-semibold text-sm`}>
          {config.emoji} {label}
        </span>
      </div>
      
      <div className={`text-center text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {context}
      </div>
    </div>
  );
}