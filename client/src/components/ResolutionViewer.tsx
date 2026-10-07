import React, { useState } from 'react';
import { 
  Users, 
  Terminal, 
  CheckCircle, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  Cpu,
  BookOpen
} from 'lucide-react';

interface ResolutionViewerProps {
  userResolution: string;
  technicalResolution: string;
  possibleRootCause: string;
  domain?: string;
}

export const ResolutionViewer: React.FC<ResolutionViewerProps> = ({
  userResolution,
  technicalResolution,
  possibleRootCause,
  domain,
}) => {
  const [activeTab, setActiveTab] = useState<'USER' | 'TECHNICAL'>('USER');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === 'USER' ? userResolution : technicalResolution;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert markdown/numbered steps into visually distinct checklist items
  const renderFormattedGuide = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);

    return (
      <div className="space-y-3">
        {lines.map((line, idx) => {
          const isCode = line.startsWith('`') || line.includes('`');
          const isCommand = line.trim().startsWith('$') || line.trim().startsWith('Get-') || line.trim().startsWith('docker') || line.trim().startsWith('npm');

          if (isCommand) {
            return (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 flex items-center justify-between">
                <span>{line}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(line.replace(/^\$\s*/, ''))}
                  className="p-1 rounded text-slate-500 hover:text-white"
                  title="Copy command"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {line.replace(/^\d+[\.\)]\s*/, '')}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Root Cause Banner */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400">
              Hypothesized Root Cause
            </span>
            {domain && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                {domain}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1 leading-relaxed">
            {possibleRootCause}
          </p>
        </div>
      </div>

      {/* Dual Resolution Mode Tabs */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('USER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'USER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User-Friendly Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('TECHNICAL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'TECHNICAL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>IT Technical Manual</span>
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Steps'}</span>
        </button>
      </div>

      {/* Resolution Content Area */}
      <div className="p-6">
        {activeTab === 'USER' ? (
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Simplified Step-by-Step Instructions for Everyday Users</span>
            </div>
            {renderFormattedGuide(userResolution)}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-purple-400">
              <Terminal className="w-4 h-4" />
              <span>Deep Diagnostic Remediation, CLI Commands & System Flags</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {technicalResolution}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
