import { z } from 'zod';

export const ResolveRequestSchema = z.object({
  user_description: z.string().min(10, 'Please provide at least 10 characters describing the issue.'),
  category_hint: z.string().optional(),
  user_id: z.string().uuid().optional(),
});

export const StatusUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const AuthUserSyncSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.enum(['END_USER', 'IT_SUPPORT', 'ADMIN']).default('END_USER'),
  avatar_url: z.string().url().optional().nullable(),
});

export const TicketResolutionAISchema = z.object({
  title: z.string(),
  domain: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence_score: z.number().min(0).max(1),
  problem_summary: z.string(),
  detected_errors: z.array(
    z.object({
      error_code: z.string(),
      source_modality: z.string(),
      file_name: z.string(),
      description: z.string(),
    })
  ),
  possible_root_cause: z.string(),
  evidence_correlations: z.array(
    z.object({
      file_a: z.string(),
      file_b: z.string(),
      connection_details: z.string(),
    })
  ),
  user_resolution: z.string(),
  technical_resolution: z.string(),
});

export type ResolveRequest = z.infer<typeof ResolveRequestSchema>;
export type StatusUpdate = z.infer<typeof StatusUpdateSchema>;
export type AuthUserSync = z.infer<typeof AuthUserSyncSchema>;
export type TicketResolutionAI = z.infer<typeof TicketResolutionAISchema>;
