
import React from 'react';

interface AnalogClockProps {
  date: Date;
  size?: number;
  theme?: 'light' | 'dark' | 'auto';
}

const AnalogClock: React.FC<AnalogClockProps> = ({ date, size = 120, theme = 'auto' }) => {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours();
  
  // Determine if it's day or night for the 'auto' theme
  const isNight = theme === 'dark' || (theme === 'auto' && (hours >= 18 || hours < 6));

  const sAngle = (seconds / 60) * 360;
  const mAngle = ((minutes + seconds / 60) / 60) * 360;
  const hAngle = (((hours % 12) + minutes / 60) / 12) * 360;

  const faceColor = isNight ? '#1e293b' : '#ffffff';
  const textColor = isNight ? '#f8fafc' : '#1e293b';
  const strokeColor = isNight ? '#334155' : '#e2e8f0';

  return (
    <div className="relative flex items-center justify-center transition-all duration-500" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
        {/* Face */}
        <circle cx="50" cy="50" r="48" fill={faceColor} stroke={strokeColor} strokeWidth="1" />
        
        {/* Markers */}
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="50" y1="6" x2="50" y2="10"
            transform={`rotate(${i * 30} 50 50)`}
            stroke={isNight ? '#475569' : '#cbd5e1'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* Numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const r = 36;
          const x = 50 + r * Math.sin(angle);
          const y = 50 - r * Math.cos(angle);
          return (
            <text
              key={num}
              x={x}
              y={y + 2}
              textAnchor="middle"
              fill={textColor}
              className="font-bold select-none"
              style={{ fontSize: '7px' }}
            >
              {num}
            </text>
          );
        })}

        {/* Hour Hand */}
        <line
          x1="50" y1="50" x2="50" y2="30"
          transform={`rotate(${hAngle} 50 50)`}
          stroke={textColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        
        {/* Minute Hand */}
        <line
          x1="50" y1="50" x2="50" y2="18"
          transform={`rotate(${mAngle} 50 50)`}
          stroke={textColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Second Hand */}
        <line
          x1="50" y1="50" x2="50" y2="12"
          transform={`rotate(${sAngle} 50 50)`}
          stroke="#ef4444"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Center Point */}
        <circle cx="50" cy="50" r="2.5" fill={textColor} />
        <circle cx="50" cy="50" r="1" fill="#ef4444" />
      </svg>
    </div>
  );
};

export default AnalogClock;
