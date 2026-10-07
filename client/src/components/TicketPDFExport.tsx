import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, FileDown, Check } from 'lucide-react';
import { Ticket, EvidenceFile, EvidenceCorrelation } from '../types';

interface TicketPDFExportProps {
  ticket: Ticket;
  evidenceFiles?: EvidenceFile[];
  correlations?: EvidenceCorrelation[];
}

export const TicketPDFExport: React.FC<TicketPDFExportProps> = ({
  ticket,
  evidenceFiles = [],
  correlations = [],
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const generatePDF = () => {
    setDownloading(true);

    try {
      const doc = new jsPDF();
      let y = 20;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(99, 102, 241); // indigo-500
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('RESOLVE 360', 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Multimodal AI Technical Support & Incident Report', 14, 26);

      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 26);

      y = 45;

      // Incident Details Grid
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(`${ticket.ticket_code}: ${ticket.title}`, 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Domain: ${ticket.domain}   |   Severity: ${ticket.severity}   |   Status: ${ticket.status}   |   Confidence: ${Math.round(ticket.confidence_score * 100)}%`, 14, y);
      y += 12;

      // Line separator
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, 196, y);
      y += 8;

      // Problem Summary
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('1. UNIFIED PROBLEM SUMMARY', 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitSummary = doc.splitTextToSize(ticket.problem_summary, 180);
      doc.text(splitSummary, 14, y);
      y += splitSummary.length * 5 + 6;

      // Root Cause
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('2. HYPOTHESIZED ROOT CAUSE', 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitRoot = doc.splitTextToSize(ticket.possible_root_cause, 180);
      doc.text(splitRoot, 14, y);
      y += splitRoot.length * 5 + 6;

      // Detected Errors
      if (ticket.detected_errors && ticket.detected_errors.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('3. DETECTED ERRORS & MODALITY ATTRIBUTION', 14, y);
        y += 6;

        ticket.detected_errors.forEach((err, idx) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(190, 18, 60);
          doc.text(`• [${err.source_modality}] ${err.error_code} (${err.file_name})`, 16, y);
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`  Description: ${err.description}`, 16, y);
          y += 6;
        });
        y += 4;
      }

      // Check if page break needed
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      // User Friendly Resolution
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('4. USER-FRIENDLY RESOLUTION GUIDE', 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitUserRes = doc.splitTextToSize(ticket.user_resolution, 180);
      doc.text(splitUserRes, 14, y);
      y += splitUserRes.length * 5 + 8;

      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      // IT Technical Resolution
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('5. IT TECHNICAL RESOLUTION & RUNBOOK', 14, y);
      y += 6;

      doc.setFontSize(8.5);
      doc.setFont('courier', 'normal');
      doc.setTextColor(15, 23, 42);
      const splitTechRes = doc.splitTextToSize(ticket.technical_resolution, 180);
      doc.text(splitTechRes, 14, y);

      // Save PDF
      doc.save(`${ticket.ticket_code}_diagnostic_report.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Failed generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={downloading}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
      title="Export Ticket as PDF Report"
    >
      {downloaded ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400">PDF Downloaded</span>
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 text-indigo-400" />
          <span>Export PDF Report</span>
        </>
      )}
    </button>
  );
};
