import React from 'react';
import { 
  Network, 
  Link2, 
  Clock, 
  Tag, 
  FileCode, 
  Image, 
  FileAudio, 
  Terminal, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { EvidenceCorrelation, DetectedError, EvidenceFile } from '../types';

interface EvidenceMatrixCardProps {
  correlations: EvidenceCorrelation[];
  detectedErrors: DetectedError[];
  evidenceFiles?: EvidenceFile[];
}

export const EvidenceMatrixCard: React.FC<EvidenceMatrixCardProps> = ({
  correlations,
  detectedErrors,
  evidenceFiles = [],
}) => {
  const getModalityIcon = (modality: string) => {
    const m = modality.toUpperCase();
    if (m.includes('IMAGE') || m.includes('SCREENSHOT')) return Image;
    if (m.includes('AUDIO') || m.includes('VOICE')) return FileAudio;
    if (m.includes('LOG')) return Terminal;
    if (m.includes('PDF')) return FileText;
    return FileCode;
  };

  const getCorrelationBadge = (type?: string) => {
    switch (type) {
      case 'TIMESTAMP_MATCH':
        return {
          label: 'Timestamp Match',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: Clock,
        };
      case 'ERROR_CODE_MATCH':
        return {
          label: 'Error Code Corroboration',
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: Tag,
        };
      default:
        return {
          label: 'Contextual Link',
          color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: Link2,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Cross-Modal Correlation Matrix */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Cross-Modal Correlation Matrix</h3>
              <p className="text-[11px] text-slate-400">
                AI context fusion linking disparate visual, textual, and acoustic diagnostic events
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {correlations.length} Correlated Links
          </span>
        </div>

        {correlations.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">
            Single modality analysis performed. Upload multiple heterogeneous inputs to generate cross-modal links.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {correlations.map((corr, idx) => {
              const badge = getCorrelationBadge(corr.correlation_type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">LINK-0{idx + 1}</span>
                  </div>

                  {/* Connected Evidence Nodes */}
                  <div className="flex items-center gap-2 py-2 text-xs font-mono font-medium text-slate-200">
                    <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 truncate max-w-[140px]" title={corr.file_a}>
                      {corr.file_a}
                    </span>
                    <Link2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 truncate max-w-[140px]" title={corr.file_b}>
                      {corr.file_b}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {corr.connection_details}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detected Errors & Modality Attribution Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-1">
          Detected Error Signatures & Attribution
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Modality-specific breakdown identifying where each fault condition was detected
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Error Signature</th>
                <th className="py-2.5 px-3">Source Modality</th>
                <th className="py-2.5 px-3">Origin File</th>
                <th className="py-2.5 px-3">Diagnostic Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {detectedErrors.map((err, i) => {
                const Icon = getModalityIcon(err.source_modality);
                return (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-rose-300">
                      {err.error_code}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        <Icon className="w-3 h-3 text-indigo-400" />
                        <span>{err.source_modality}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 truncate max-w-[160px]" title={err.file_name}>
                      {err.file_name}
                    </td>
                    <td className="py-3 px-3 text-slate-300 leading-relaxed">
                      {err.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
