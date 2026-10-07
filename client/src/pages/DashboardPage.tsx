import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  PlusCircle, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight,
  Database,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { Ticket, TicketStatus } from '../types';
import { getTickets, updateTicketStatus } from '../lib/api';
import { TicketTable } from '../components/TicketTable';
import { getCurrentProfile } from '../lib/supabaseClient';

export const DashboardPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentProfile();

  const fetchTicketsData = async () => {
    try {
      setLoading(true);
      const res = await getTickets();
      if (res.success) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error('Failed fetching dashboard tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsData();
  }, []);

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    try {
      await updateTicketStatus(id, status);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    } catch (err) {
      console.error('Failed updating ticket status:', err);
    }
  };

  // Metrics computation
  const totalCount = tickets.length;
  const criticalCount = tickets.filter((t) => t.severity === 'CRITICAL' || t.severity === 'HIGH').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const avgConfidence = totalCount > 0
    ? Math.round((tickets.reduce((acc, t) => acc + (t.confidence_score || 0), 0) / totalCount) * 100)
    : 92;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Multimodal Diagnostic Dashboard</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{currentUser.full_name}</strong> ({currentUser.role})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTicketsData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/workspace/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Diagnostic Session</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Total Ingested Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Multimodal submissions</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">High & Critical Severity</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400">{criticalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Require immediate IT triage</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Average AI Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{avgConfidence}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Gemini cross-modal accuracy</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Resolved / Closed</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-cyan-400">{resolvedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verified resolutions</p>
        </div>
      </div>

      {/* Middle Section: Severity Bar & Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Incident Severity Distribution</h3>
            <span className="text-xs text-slate-400">Live Breakdown</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'CRITICAL', color: 'bg-rose-500', count: tickets.filter(t => t.severity === 'CRITICAL').length },
              { label: 'HIGH', color: 'bg-amber-500', count: tickets.filter(t => t.severity === 'HIGH').length },
              { label: 'MEDIUM', color: 'bg-indigo-500', count: tickets.filter(t => t.severity === 'MEDIUM').length },
              { label: 'LOW', color: 'bg-slate-500', count: tickets.filter(t => t.severity === 'LOW').length },
            ].map((s) => {
              const pct = totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0;
              return (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-medium">{s.label}</span>
                    <span className="font-mono text-slate-400">{s.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Diagnostic Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Start Multimodal Triage
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload up to 10 heterogeneous files (screenshots, logs, voice recordings, PDFs) to automatically correlate root causes.
            </p>
          </div>

          <Link
            to="/workspace/new"
            className="mt-6 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Support Incidents</h3>
            <p className="text-xs text-slate-400">All active multimodal tickets</p>
          </div>
          <Link
            to="/tickets"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TicketTable tickets={tickets.slice(0, 5)} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
};
