import { Router, Request, Response } from 'express';
import { supabaseAdmin, localStore, saveStore } from '../config/supabaseAdmin.js';
import { StatusUpdateSchema } from '../shared/validators.js';

export const ticketRouter = Router();

// GET /api/tickets - Filterable list of tickets
ticketRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, severity, domain, search } = req.query;

    let tickets = [...localStore.tickets];

    // Try Supabase PostgreSQL first
    try {
      let query = supabaseAdmin.from('tickets').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status as string);
      if (severity) query = query.eq('severity', severity as string);
      if (domain) query = query.eq('domain', domain as string);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        tickets = data;
      }
    } catch (e) {
      // Fallback to local store
    }

    // Apply filtering to local store if Supabase wasn't used
    if (status) {
      tickets = tickets.filter(t => t.status === status);
    }
    if (severity) {
      tickets = tickets.filter(t => t.severity === severity);
    }
    if (domain) {
      tickets = tickets.filter(t => t.domain?.toLowerCase() === (domain as string).toLowerCase());
    }
    if (search) {
      const q = (search as string).toLowerCase();
      tickets = tickets.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.ticket_code?.toLowerCase().includes(q) ||
        t.problem_summary?.toLowerCase().includes(q) ||
        t.possible_root_cause?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: tickets.length, tickets });
  } catch (err: any) {
    console.error('Error in GET /api/tickets:', err);
    res.status(500).json({ error: 'Failed to retrieve tickets', message: err.message });
  }
});

// GET /api/tickets/:id - Full ticket details with evidence files and correlation matrix
ticketRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Search local store
    let ticket = localStore.tickets.find(t => t.id === id || t.ticket_code === id);
    let evidence_files = localStore.evidence_files.filter(e => e.ticket_id === (ticket?.id || id));
    let evidence_correlations = localStore.evidence_correlations.filter(c => c.ticket_id === (ticket?.id || id));

    // Also check Supabase PostgreSQL
    try {
      const { data: dbTicket } = await supabaseAdmin.from('tickets').select('*').eq('id', id).single();
      if (dbTicket) {
        ticket = dbTicket;
        const { data: dbFiles } = await supabaseAdmin.from('evidence_files').select('*').eq('ticket_id', id);
        if (dbFiles) evidence_files = dbFiles;
        const { data: dbCorrs } = await supabaseAdmin.from('evidence_correlations').select('*').eq('ticket_id', id);
        if (dbCorrs) evidence_correlations = dbCorrs;
      }
    } catch (e) {
      // Supabase query failed, keep local
    }

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found', id });
      return;
    }

    res.json({
      success: true,
      ticket,
      evidence_files,
      evidence_correlations,
    });
  } catch (err: any) {
    console.error('Error in GET /api/tickets/:id:', err);
    res.status(500).json({ error: 'Failed to fetch ticket details', message: err.message });
  }
});

// PATCH /api/tickets/:id/status - Update status or severity
ticketRouter.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = StatusUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid update payload', details: parseResult.error.errors });
      return;
    }

    const { status, severity } = parseResult.data;

    // Update in local store
    const ticketIdx = localStore.tickets.findIndex(t => t.id === id || t.ticket_code === id);
    if (ticketIdx !== -1) {
      if (status) localStore.tickets[ticketIdx].status = status;
      if (severity) localStore.tickets[ticketIdx].severity = severity;
      localStore.tickets[ticketIdx].updated_at = new Date().toISOString();
      saveStore(localStore);
    }

    // Update in Supabase
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (severity) updateData.severity = severity;
      await supabaseAdmin.from('tickets').update(updateData).eq('id', id);
    } catch (e) {
      // Supabase update fallback
    }

    const updated = localStore.tickets[ticketIdx];
    res.json({ success: true, ticket: updated });
  } catch (err: any) {
    console.error('Error in PATCH /api/tickets/:id/status:', err);
    res.status(500).json({ error: 'Failed to update ticket status', message: err.message });
  }
});
