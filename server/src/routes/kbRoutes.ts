import { Router, Request, Response } from 'express';
import { uploadMiddleware } from '../middleware/fileUpload.js';
import { supabaseAdmin, localStore, saveStore } from '../config/supabaseAdmin.js';
import { ai, GEMINI_MODEL } from '../config/gemini.js';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';

export const kbRouter = Router();

// GET /api/knowledge-base - Fetch knowledge base items
kbRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    let items = [...localStore.knowledge_base];

    try {
      let query = supabaseAdmin.from('knowledge_base').select('*').order('created_at', { ascending: false });
      if (category) query = query.eq('category', category as string);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        items = data;
      }
    } catch (e) {
      // Fallback
    }

    if (category) {
      items = items.filter(i => i.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.content_summary.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: items.length, items });
  } catch (err: any) {
    console.error('Error in GET /api/knowledge-base:', err);
    res.status(500).json({ error: 'Failed to fetch knowledge base', message: err.message });
  }
});

// POST /api/knowledge-base/upload - Upload new KB PDF document
kbRouter.post('/upload', uploadMiddleware.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { title, category } = req.body;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      try {
        const parsed = await pdfParse(file.buffer);
        extractedText = parsed.text;
      } catch (e) {
        extractedText = 'PDF document binary content';
      }
    } else {
      extractedText = file.buffer.toString('utf-8');
    }

    // Generate executive summary with Gemini
    let summary = 'Diagnostic document regarding system troubleshooting and configuration.';
    try {
      const prompt = `Summarize the following technical documentation in 2-3 concise paragraphs. Highlight key error codes, configuration parameters, and recommended troubleshooting steps:\n\n${extractedText.slice(0, 5000)}`;
      const aiResponse = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });
      if (aiResponse.text) {
        summary = aiResponse.text.trim();
      }
    } catch (aiErr) {
      console.warn('Gemini summary warning:', aiErr);
    }

    const newItem = {
      id: uuidv4(),
      title: title || file.originalname.replace(/\.[^/.]+$/, ''),
      category: category || 'General',
      file_path: `kb/${file.originalname}`,
      content_summary: summary,
      created_at: new Date().toISOString(),
    };

    localStore.knowledge_base.unshift(newItem);
    saveStore(localStore);

    try {
      await supabaseAdmin.from('knowledge_base').insert([newItem]);
    } catch (dbErr) {
      // Supabase table pending
    }

    res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    console.error('Error in POST /api/knowledge-base/upload:', err);
    res.status(500).json({ error: 'Failed to process knowledge base upload', message: err.message });
  }
});
