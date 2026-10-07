import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Ticket, Severity, TicketStatus } from '../types';

interface TicketTableProps {
  tickets: Ticket[];
  onStatusChange?: (id: string, status: TicketStatus) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets, onStatusChange }) => {
  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'LOW':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CLOSED':
        return 'bg-slate-600/10 text-slate-400 border-slate-600/30';
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">No Tickets Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No diagnostic tickets match the selected criteria. Try adjusting your search query or start a new diagnostic session.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Ticket Code</th>
              <th className="py-3 px-4">Incident Title</th>
              <th className="py-3 px-4">Domain</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
              >
                {/* Code */}
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                  <Link to={`/tickets/${ticket.id}`} className="hover:underline">
                    {ticket.ticket_code}
                  </Link>
                </td>

                {/* Title */}
                <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs">
                  <Link to={`/tickets/${ticket.id}`} className="block truncate group-hover:text-indigo-300 transition-colors">
                    {ticket.title}
                  </Link>
                </td>

                {/* Domain */}
                <td className="py-3.5 px-4 text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                    {ticket.domain}
                  </span>
                </td>

                {/* Severity */}
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(ticket.severity)}`}>
                    {ticket.severity}
                  </span>
                </td>

                {/* Confidence */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-slate-300">
                      {Math.round(ticket.confidence_score * 100)}%
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {onStatusChange ? (
                    <select
                      value={ticket.status}
                      onChange={(e) => onStatusChange(ticket.id, e.target.value as TicketStatus)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[10px] font-semibold rounded px-2 py-1 border bg-slate-900 cursor-pointer ${getStatusBadge(ticket.status)}`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  )}
                </td>

                {/* Created */}
                <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                  {new Date(ticket.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>

                {/* View Details Action */}
                <td className="py-3.5 px-4 text-right">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-indigo-600 transition-colors"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
