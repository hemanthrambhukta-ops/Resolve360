import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Layers, 
  FileText, 
  Image, 
  FileAudio, 
  Terminal, 
  Video, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Share2
} from 'lucide-react';
import { Ticket, EvidenceFile, EvidenceCorrelation, TicketStatus, Severity } from '../types';
import { getTicketById, updateTicketStatus } from '../lib/api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ResolutionViewer } from '../components/ResolutionViewer';
import { EvidenceMatrixCard } from '../components/EvidenceMatrixCard';
import { TicketPDFExport } from '../components/TicketPDFExport';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [correlations, setCorrelations] = useState<EvidenceCorrelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<EvidenceFile | null>(null);

  const fetchTicketDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getTicketById(id);
      if (res.success) {
        setTicket(res.ticket);
        setEvidenceFiles(res.evidence_files || []);
        setCorrelations(res.evidence_correlations || []);
      }
    } catch (err) {
      console.error('Failed fetching ticket detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      await updateTicketStatus(ticket.id, newStatus);
      setTicket({ ...ticket, status: newStatus });
    } catch (err) {
      console.error('Failed updating ticket status:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading multimodal diagnostic record...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center glass-panel rounded-2xl border border-slate-800">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Ticket Record Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          The requested ticket does not exist or has been removed.
        </p>
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Ticket Catalog</span>
        </Link>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return Image;
      case 'AUDIO': return FileAudio;
      case 'PDF': return FileText;
      case 'LOG': return Terminal;
      case 'VIDEO': return Video;
      default: return FileCode;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <Link
            to="/tickets"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 mt-1"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {ticket.ticket_code}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                {ticket.domain}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                ticket.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                ticket.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                ticket.severity === 'MEDIUM' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                'bg-slate-500/10 text-slate-400 border-slate-500/30'
              }`}>
                {ticket.severity}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {ticket.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status select */}
          <select
            value={ticket.status}
            onChange={(e) => handleStatusUpdate(e.target.value as TicketStatus)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="OPEN">Status: OPEN</option>
            <option value="IN_PROGRESS">Status: IN_PROGRESS</option>
            <option value="RESOLVED">Status: RESOLVED</option>
            <option value="CLOSED">Status: CLOSED</option>
          </select>

          {/* PDF Report Export */}
          <TicketPDFExport
            ticket={ticket}
            evidenceFiles={evidenceFiles}
            correlations={correlations}
          />
        </div>
      </div>

      {/* Top Banner: Confidence Badge & Unified Problem Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Unified Multimodal Problem Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {ticket.problem_summary}
          </p>
          <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
            <span>•</span>
            <span>Attached Evidence: {evidenceFiles.length} files</span>
          </div>
        </div>

        <div>
          <ConfidenceBadge score={ticket.confidence_score} size="lg" />
        </div>
      </div>

      {/* Dual Resolution Engine Guide */}
      <ResolutionViewer
        userResolution={ticket.user_resolution}
        technicalResolution={ticket.technical_resolution}
        possibleRootCause={ticket.possible_root_cause}
        domain={ticket.domain}
      />

      {/* Evidence Attribution Matrix & Correlations */}
      <EvidenceMatrixCard
        correlations={correlations}
        detectedErrors={ticket.detected_errors || []}
        evidenceFiles={evidenceFiles}
      />

      {/* Attached Evidence Files Gallery */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Ingested Evidence Gallery</h3>
            <p className="text-[11px] text-slate-400">
              Raw artifacts submitted by the user and processed by the multimodal ingestion engine
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {evidenceFiles.length} Files
          </span>
        </div>

        {evidenceFiles.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center italic">
            No external files attached. Ticket generated from direct text problem statement.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {evidenceFiles.map((file) => {
              const FileIcon = getFileIcon(file.file_type);
              const isImage = file.file_type === 'IMAGE' && file.file_path;

              return (
                <div
                  key={file.id}
                  onClick={() => setPreviewFile(file)}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {isImage && (
                      <div className="w-full h-32 rounded-lg bg-slate-950 overflow-hidden mb-3 border border-slate-800">
                        <img
                          src={file.file_path}
                          alt={file.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <FileIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {file.file_type}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors" title={file.file_name}>
                      {file.file_name}
                    </p>

                    {file.extracted_context && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {file.extracted_context}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{(file.file_size / 1024).toFixed(1)} KB</span>
                    <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:underline">
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evidence File Inspect Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white truncate max-w-md">
                  {previewFile.file_name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {previewFile.file_type === 'IMAGE' ? (
                <img
                  src={previewFile.file_path}
                  alt={previewFile.file_name}
                  className="w-full rounded-xl border border-slate-800 max-h-80 object-contain mx-auto"
                />
              ) : previewFile.file_type === 'AUDIO' ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <audio controls src={previewFile.file_path} className="w-full" />
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {previewFile.extracted_context || 'Binary diagnostic file content.'}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span>File Type: {previewFile.file_type}</span>
              <a
                href={previewFile.file_path}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Open Raw Asset</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
