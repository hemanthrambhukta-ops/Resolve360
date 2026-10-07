import { Router, Request, Response } from 'express';
import { uploadMiddleware, getFileCategory } from '../middleware/fileUpload.js';
import { runMultimodalResolution, MediaPart } from '../services/aiService.js';
import { uploadEvidenceFile } from '../services/storageService.js';
import { supabaseAdmin, localStore, saveStore } from '../config/supabaseAdmin.js';
import { ResolveRequestSchema } from '../shared/validators.js';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';

export const resolveRouter = Router();

resolveRouter.post('/', uploadMiddleware.array('files', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.body;
    const validationResult = ResolveRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
      return;
    }

    const { user_description, category_hint } = validationResult.data;
    const files = (req.files as Express.Multer.File[]) || [];
    const userId = req.user?.id || 'd0000000-0000-0000-0000-000000000001';
    const ticketId = uuidv4();
    const ticketCode = `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Prepare multimodal parts and extract text from documents / logs
    const mediaParts: MediaPart[] = [];
    const extractedFileContexts: Array<{
      file_name: string;
      category: 'IMAGE' | 'AUDIO' | 'PDF' | 'LOG' | 'VIDEO' | 'TEXT';
      extracted_context: string;
      file_size: number;
      buffer: Buffer;
      mimetype: string;
      originalFile: Express.Multer.File;
    }> = [];

    let additionalDocContext = '';

    for (const file of files) {
      const category = getFileCategory(file.mimetype, file.originalname);
      let contextSummary = '';

      if (category === 'LOG' || category === 'TEXT') {
        const textContent = file.buffer.toString('utf-8');
        contextSummary = textContent.slice(0, 3000); // first 3000 chars of log/text
        additionalDocContext += `\n[FILE: ${file.originalname} (SYSTEM LOG)]:\n${textContent.slice(0, 4000)}\n`;
      } else if (category === 'PDF') {
        try {
          const pdfData = await pdfParse(file.buffer);
          contextSummary = pdfData.text.slice(0, 2000);
          additionalDocContext += `\n[FILE: ${file.originalname} (PDF DOCUMENTATION)]:\n${pdfData.text.slice(0, 4000)}\n`;
        } catch (pdfErr) {
          console.warn('PDF parse warning, sending as binary inline data:', pdfErr);
          // Send PDF binary to Gemini
          mediaParts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: file.buffer.toString('base64'),
            },
          });
        }
      } else if (['IMAGE', 'AUDIO', 'VIDEO'].includes(category)) {
        // Feed directly as multimodal inlineData into Gemini 3.8 / 2.5 Flash
        mediaParts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString('base64'),
          },
        });
        contextSummary = `Raw multimodal ${category.toLowerCase()} binary stream (${(file.size / 1024).toFixed(1)} KB)`;
      }

      extractedFileContexts.push({
        file_name: file.originalname,
        category,
        extracted_context: contextSummary,
        file_size: file.size,
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalFile: file,
      });
    }

    // Build the unified multimodal prompt for Gemini
    const textPrompt = `
DIAGNOSTIC EVIDENCE SUBMISSION:
User Problem Statement: "${user_description}"
${category_hint ? `User Selected Domain Hint: ${category_hint}` : ''}

Attached Heterogeneous Files Count: ${files.length}
File Inventory:
${extractedFileContexts.map((f, i) => `${i + 1}. ${f.file_name} [${f.category}] (${f.file_size} bytes)`).join('\n')}

${additionalDocContext ? `\n--- EXTRACTED LOGS & DOCUMENTATION CONTENT ---\n${additionalDocContext}\n--- END EXTRACTED CONTENT ---` : ''}

Synthesize all visual, auditory, textual, and log signals into a unified problem diagnosis conforming strictly to the requested schema. Provide dual resolutions (User-Friendly Guide vs. IT Technical Commands) and explicit evidence correlations.
`;

    // Execute multimodal analysis via Gemini
    console.log(`Starting multimodal resolution for ticket ${ticketCode} with ${mediaParts.length} media parts and ${files.length} total files...`);
    const aiAnalysis = await runMultimodalResolution(textPrompt, mediaParts);

    // Upload files to Supabase Storage and build evidence records
    const uploadedEvidenceRecords: any[] = [];
    for (const item of extractedFileContexts) {
      const storageResult = await uploadEvidenceFile(item.originalFile, ticketId);
      const evidenceId = uuidv4();

      uploadedEvidenceRecords.push({
        id: evidenceId,
        ticket_id: ticketId,
        file_name: item.file_name,
        file_type: item.category,
        file_path: storageResult.publicUrl,
        file_size: item.file_size,
        extracted_context: item.extracted_context || `Processed ${item.category}`,
        created_at: new Date().toISOString(),
      });
    }

    // Build evidence correlation records
    const correlationRecords: any[] = (aiAnalysis.evidence_correlations || []).map((corr: any) => {
      const sourceMatch = uploadedEvidenceRecords.find(e => e.file_name.toLowerCase().includes(corr.file_a.toLowerCase()));
      const targetMatch = uploadedEvidenceRecords.find(e => e.file_name.toLowerCase().includes(corr.file_b.toLowerCase()));

      return {
        id: uuidv4(),
        ticket_id: ticketId,
        source_evidence_id: sourceMatch ? sourceMatch.id : null,
        target_evidence_id: targetMatch ? targetMatch.id : null,
        correlation_type: corr.file_a.includes('.log') && corr.file_b.includes('.png') ? 'TIMESTAMP_MATCH' : 'CONTEXTUAL_LINK',
        description: corr.connection_details || `Correlation between ${corr.file_a} and ${corr.file_b}`,
        created_at: new Date().toISOString(),
      };
    });

    // Assemble the complete ticket object
    const newTicket = {
      id: ticketId,
      ticket_code: ticketCode,
      user_id: userId,
      title: aiAnalysis.title || 'Diagnostic Analysis',
      domain: aiAnalysis.domain || category_hint || 'Software',
      severity: aiAnalysis.severity || 'MEDIUM',
      status: 'OPEN',
      confidence_score: aiAnalysis.confidence_score ?? 0.85,
      problem_summary: aiAnalysis.problem_summary,
      detected_errors: aiAnalysis.detected_errors || [],
      possible_root_cause: aiAnalysis.possible_root_cause,
      user_resolution: aiAnalysis.user_resolution,
      technical_resolution: aiAnalysis.technical_resolution,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to local persistence store
    localStore.tickets.unshift(newTicket);
    localStore.evidence_files.push(...uploadedEvidenceRecords);
    localStore.evidence_correlations.push(...correlationRecords);
    saveStore(localStore);

    // Attempt direct Supabase PostgreSQL persistence
    try {
      await supabaseAdmin.from('tickets').insert([newTicket]);
      if (uploadedEvidenceRecords.length > 0) {
        await supabaseAdmin.from('evidence_files').insert(uploadedEvidenceRecords);
      }
      if (correlationRecords.length > 0) {
        await supabaseAdmin.from('evidence_correlations').insert(correlationRecords);
      }
    } catch (dbErr: any) {
      console.warn('Supabase DB write notice (table pending in SQL editor):', dbErr.message);
    }

    res.status(201).json({
      success: true,
      ticket: newTicket,
      evidence_files: uploadedEvidenceRecords,
      evidence_correlations: correlationRecords,
    });
  } catch (error: any) {
    console.error('Error handling /api/resolve:', error);
    res.status(500).json({
      error: 'Multimodal analysis failed',
      message: error.message || 'An unexpected error occurred during multimodal processing.',
    });
  }
});
