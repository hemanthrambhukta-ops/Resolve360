import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  FileText, 
  Image, 
  FileAudio, 
  Terminal, 
  Video, 
  ShieldCheck, 
  Network, 
  Zap,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multimodal AI Support Engine • Powered by Gemini 3.8 & Supabase</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Eliminate Support Silos with{' '}
          <span className="text-gradient">Multimodal AI Context Fusion</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Ingest text, images, voice notes, PDFs, system logs, and screen recordings simultaneously. 
          Correlate visual glitches with log exceptions and generate evidence-backed dual-tier resolutions in seconds.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/workspace/new"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all"
          >
            <span>Launch Diagnostic Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all"
          >
            <span>View Incident Dashboard</span>
          </Link>
        </div>

        {/* Interactive Architecture Flow Diagram */}
        <div className="mt-20 glass-panel-glow rounded-3xl p-6 md:p-10 border border-indigo-500/30 max-w-5xl mx-auto text-left">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                PLATFORM ARCHITECTURE
              </span>
              <h3 className="text-lg md:text-xl font-bold text-white mt-0.5">
                Heterogeneous Multimodal Diagnostic Pipeline
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Pipeline Active
            </span>
          </div>

          {/* Diagram Nodes */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* 1. Ingestion Modalities */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Layers className="w-4 h-4" />
                <span>1. HETEROGENEOUS INGESTION</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                6 parallel diagnostic formats unified in 1 session:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <Image className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Screenshots</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <FileAudio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voice Audio</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>System Logs</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDF Manuals</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Screen Rec</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>User Text</span>
                </div>
              </div>
            </div>

            {/* 2. Gemini Multimodal Fusion Core */}
            <div className="space-y-3 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Cpu className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>2. CONTEXT FUSION ENGINE</span>
              </div>
              <p className="text-xs text-slate-300">
                Gemini 3.8 Flash correlates visual timestamps with log exceptions and audio cues:
              </p>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-950/90 border border-indigo-500/30 text-indigo-200">
                  • Timestamp Alignment (14:22 UTC)
                </div>
                <div className="p-2 rounded-lg bg-slate-950/90 border border-indigo-500/30 text-indigo-200">
                  • OCR Dialog Corroboration
                </div>
                <div className="p-2 rounded-lg bg-slate-950/90 border border-indigo-500/30 text-indigo-200">
                  • Evidence Attribution Matrix
                </div>
              </div>
            </div>

            {/* 3. Dual Tier Resolution & Storage */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>3. DUAL RESOLUTION OUTPUT</span>
              </div>
              <p className="text-xs text-slate-400">
                Actionable deliverables synthesized for both audiences:
              </p>
              <div className="space-y-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <strong>User Guide:</strong> Jargon-free checklist for everyday employees
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <strong>IT Runbook:</strong> Root cause, CLI scripts, and registry keys
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <strong>PostgreSQL Ticket:</strong> Stored with score & evidence links
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
            ENTERPRISE CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Built for Modern IT Helpdesks & DevOps Teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Cross-Modal Retrieval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Match visual error dialogs in screenshots against indexed PDF manuals, troubleshooting runbooks, and historical resolution logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Evidence Attribution Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every diagnosis is accompanied by a mathematical confidence rating and explicit citations specifying which file provided each clue.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Ticket Lifecycle</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant generation of structured incident codes (`RES-2026-XXXX`), severity tagging, status workflow, and downloadable PDF reports.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
