"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketResolutionAISchema = exports.AuthUserSyncSchema = exports.StatusUpdateSchema = exports.ResolveRequestSchema = void 0;
const zod_1 = require("zod");
exports.ResolveRequestSchema = zod_1.z.object({
    user_description: zod_1.z.string().min(10, 'Please provide at least 10 characters describing the issue.'),
    category_hint: zod_1.z.string().optional(),
    user_id: zod_1.z.string().uuid().optional(),
});
exports.StatusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});
exports.AuthUserSyncSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    full_name: zod_1.z.string().min(2),
    role: zod_1.z.enum(['END_USER', 'IT_SUPPORT', 'ADMIN']).default('END_USER'),
    avatar_url: zod_1.z.string().url().optional().nullable(),
});
exports.TicketResolutionAISchema = zod_1.z.object({
    title: zod_1.z.string(),
    domain: zod_1.z.string(),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    confidence_score: zod_1.z.number().min(0).max(1),
    problem_summary: zod_1.z.string(),
    detected_errors: zod_1.z.array(zod_1.z.object({
        error_code: zod_1.z.string(),
        source_modality: zod_1.z.string(),
        file_name: zod_1.z.string(),
        description: zod_1.z.string(),
    })),
    possible_root_cause: zod_1.z.string(),
    evidence_correlations: zod_1.z.array(zod_1.z.object({
        file_a: zod_1.z.string(),
        file_b: zod_1.z.string(),
        connection_details: zod_1.z.string(),
    })),
    user_resolution: zod_1.z.string(),
    technical_resolution: zod_1.z.string(),
});
