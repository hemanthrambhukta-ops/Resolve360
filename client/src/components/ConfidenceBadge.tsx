import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number; // 0.00 to 1.00
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score, size = 'md' }) => {
  const percentage = Math.round(score * 100);

  let colorScheme = {
    ring: 'stroke-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    text: 'text-emerald-400',
    label: 'High Confidence',
    Icon: ShieldCheck,
  };

  if (score < 0.60) {
    colorScheme = {
      ring: 'stroke-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      label: 'Low / Divergent Evidence',
      text: 'text-rose-400',
      Icon: AlertOctagon,
    };
  } else if (score < 0.85) {
    colorScheme = {
      ring: 'stroke-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      label: 'Moderate Confidence',
      text: 'text-amber-400',
      Icon: AlertTriangle,
    };
  }

  const { ring, bg, text, label, Icon } = colorScheme;

  // SVG Gauge calculations
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{percentage}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3.5 p-3 rounded-2xl glass-panel border border-slate-800">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            className={`${ring} transition-all duration-1000 ease-out`}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className={`absolute text-sm font-bold tracking-tight ${text}`}>
          {percentage}%
        </span>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <Icon className={`w-4 h-4 ${text}`} />
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
            {label}
          </h4>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {score >= 0.85 
            ? 'Cross-modal signals correlate seamlessly.'
            : score >= 0.60
            ? 'Moderate alignment across diagnostic inputs.'
            : 'Conflicting signals detected across evidence.'}
        </p>
      </div>
    </div>
  );
};
