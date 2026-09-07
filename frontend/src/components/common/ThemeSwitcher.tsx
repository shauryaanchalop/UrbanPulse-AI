import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false, className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  if (compact) {
    // 3-button segmented switch for dense utility bars
    return (
      <div className={`inline-flex items-center bg-graphite-950 dark:bg-graphite-950 light:bg-slate-200 border border-graphite-700 dark:border-graphite-700 light:border-slate-300 p-0.5 rounded-sm ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              title={`${opt.label} Mode`}
              className={`p-1 rounded-sm text-[10px] font-mono transition-colors ${
                isActive
                  ? 'bg-graphite-800 dark:bg-graphite-800 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 font-bold shadow-sm'
                  : 'text-graphite-400 hover:text-slate-200 dark:text-graphite-400 dark:hover:text-slate-200 light:text-slate-500 light:hover:text-slate-900'
              }`}
            >
              <Icon className="w-3 h-3" />
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown style selector
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 bg-graphite-900 dark:bg-graphite-900 light:bg-slate-100 hover:bg-graphite-800 dark:hover:bg-graphite-800 light:hover:bg-slate-200 text-graphite-300 dark:text-graphite-300 light:text-slate-700 border border-graphite-700 dark:border-graphite-700 light:border-slate-300 text-[11px] font-mono rounded-sm transition-colors"
        title="Change application color theme"
      >
        <CurrentIcon className="w-3 h-3 text-brand" />
        <span className="capitalize">{theme}</span>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-graphite-900 dark:bg-graphite-900 light:bg-white border border-graphite-700 dark:border-graphite-700 light:border-slate-200 shadow-xl rounded-sm p-1 z-50 font-mono text-[11px]">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2 py-1 rounded-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-brand/10 text-brand font-bold'
                    : 'text-graphite-300 dark:text-graphite-300 light:text-slate-700 hover:bg-graphite-800 dark:hover:bg-graphite-800 light:hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
