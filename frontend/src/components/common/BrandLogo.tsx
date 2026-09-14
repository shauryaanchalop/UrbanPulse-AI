import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitle = 'URBAN MOBILITY INTELLIGENCE',
  className = '',
  onClick
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const titleSizes = {
    sm: 'text-xs tracking-wider',
    md: 'text-sm tracking-wider',
    lg: 'text-lg tracking-widest'
  };

  const subSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[10px]'
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Precision Geometric Mark: Dual transit nodes with pulse */}
      <div className={`relative flex items-center justify-center bg-graphite-850 border border-graphite-700 rounded-sm p-1.5 shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-slate-400" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19L10 12L16 16L20 5" />
          <circle cx="4" cy="19" r="2" fill="#4A535D" stroke="none" />
          <circle cx="10" cy="12" r="2" fill="#4A535D" stroke="none" />
          <circle cx="16" cy="16" r="2" fill="#4A535D" stroke="none" />
        </svg>
        {/* Active Red Sensing Node Beacon */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
        </span>
      </div>

      {/* Modern Wordmark */}
      <div className="flex flex-col leading-none">
        <div className={`font-sans font-extrabold flex items-center ${titleSizes[size]}`}>
          <span className="text-theme-primary tracking-tight">URBANPULSE</span>
          <span className="text-brand font-black ml-1.5">AI</span>
        </div>
        {showSubtitle && (
          <span className={`font-sans font-semibold text-theme-muted tracking-wider mt-1 uppercase ${subSizes[size]}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
