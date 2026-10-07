import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  AlertCircle, 
  Zap, 
  Loader2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { MultimodalUploader, SelectedFile } from '../components/MultimodalUploader';
import { resolveIssue } from '../lib/api';
import { getCurrentProfile } from '../lib/supabaseClient';

export const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentProfile();

  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Software');
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const DOMAINS = [
    'Software',
    'Operating System',
    'Network',
    'Hardware',
    'Database',
    'Security',
  ];

  const handleApplyPreset = (preset: {
    description: string;
    domain: string;
    presetFiles: SelectedFile[];
  }) => {
    setDescription(preset.description);
    setDomain(preset.domain);
    setFiles(preset.presetFiles);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setErrorMsg('Please describe the technical problem in at least 10 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setLoadingStage(1);

    // Multi-stage progression animation
    const stageTimer1 = setTimeout(() => setLoadingStage(2), 2200);
    const stageTimer2 = setTimeout(() => setLoadingStage(3), 4500);

    try {
      const formData = new FormData();
      formData.append('user_description', description);
      formData.append('category_hint', domain);
      formData.append('user_id', currentUser.id);

      files.forEach((item) => {
        formData.append('files', item.file);
      });

      const response = await resolveIssue(formData);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (response.success && response.ticket) {
        // Navigate directly to the deep-dive resolution page
        navigate(`/tickets/${response.ticket.id}`);
      } else {
        throw new Error('Analysis completed but ticket record was not returned.');
      }
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.error('Resolution failure:', err);
      setErrorMsg(err.message || 'Multimodal diagnostic analysis failed. Please try again.');
      setLoading(false);
      setLoadingStage(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Multimodal Diagnostic Studio
              </h1>
              <p className="text-xs text-slate-400">
                Correlate text, screenshots, system logs, audio notes, and video with Gemini 3.8
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            6-Modality Ingestion Active
          </span>
        </div>
      </div>

      {/* Analysis Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Problem Description & Target Domain */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              1. Technical Problem Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the observed system failure, error codes, steps to reproduce, or user symptoms..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              2. Target Domain Category
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Domain Hint:</p>
              <p>Helps the cross-modal retriever prioritize domain runbooks and diagnostic schemas.</p>
            </div>
          </div>
        </div>

        {/* 2. Multimodal Uploader Zone */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-200">
            3. Multimodal Diagnostic Evidence (Up to 10 Files)
          </label>
          <MultimodalUploader
            files={files}
            onFilesChange={setFiles}
            onApplyPreset={handleApplyPreset}
          />
        </div>

        {/* Submit Action or Loading Multi-Stage Animation */}
        {!loading ? (
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Ready to synthesize <strong className="text-white">{files.length}</strong> attached evidence files.
            </p>

            <button
              type="submit"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze & Resolve Problem</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Multi-Stage Animated Diagnostic Progress Box */
          <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-500/40 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Executing Gemini 3.8 Multimodal Analysis Pipeline...
                </h3>
                <p className="text-xs text-slate-400">
                  Fusing heterogeneous inputs, extracting OCR/audio/log traces, and correlating root cause
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                loadingStage >= 1
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1. Ingestion & OCR</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Parsing logs, image dialogs, and audio waveform
                </p>
              </div>

              <div className={`p-3 rounded-xl border text-xs transition-all ${
                loadingStage >= 2
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <Layers className={`w-3.5 h-3.5 ${loadingStage >= 2 ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span>2. Context Fusion</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Aligning timestamps and error signatures
                </p>
              </div>

              <div className={`p-3 rounded-xl border text-xs transition-all ${
                loadingStage >= 3
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <ShieldCheck className={`w-3.5 h-3.5 ${loadingStage >= 3 ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span>3. Dual Synthesis</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Drafting User vs IT runbooks & saving ticket
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
