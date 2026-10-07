import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kmmsbwhivscxmmyscvtz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// File-backed persistence fallback in case Supabase PostgreSQL tables are pending migration in SQL Editor
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface LocalStore {
  tickets: any[];
  evidence_files: any[];
  evidence_correlations: any[];
  knowledge_base: any[];
  profiles: any[];
}

const defaultStore: LocalStore = {
  tickets: [
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      ticket_code: 'RES-2026-0042',
      user_id: 'd0000000-0000-0000-0000-000000000001',
      title: 'PostgreSQL Connection Pool Saturation & Backend 503 Outage',
      domain: 'Database',
      severity: 'CRITICAL',
      status: 'OPEN',
      confidence_score: 0.96,
      problem_summary: 'Application backend experienced repeated 503 Service Unavailable drops due to PostgreSQL pool exhaustion. Correlated server logs at 14:22 UTC with Grafana spike and client-side error dialog.',
      detected_errors: [
        {
          error_code: 'FATAL: remaining connection slots are reserved for non-replication superuser connections',
          source_modality: 'LOG',
          file_name: 'postgres_stderr.log',
          description: 'Max connections limit (100) reached, blocking incoming microservice queries.'
        },
        {
          error_code: 'HTTP 503 Service Unavailable',
          source_modality: 'IMAGE',
          file_name: 'checkout_error_screenshot.png',
          description: 'Payment gateway checkout timed out during database acquire phase.'
        }
      ],
      possible_root_cause: 'Node.js connection pool size set to default 10 without PgBouncer multiplexing; background cron job spawned 40 concurrent workers holding idle transactions.',
      evidence_correlations: [
        {
          file_a: 'postgres_stderr.log',
          file_b: 'checkout_error_screenshot.png',
          connection_details: 'Log timestamp 14:22:18 corresponds exactly to the 503 response timestamp on the checkout UI'
        }
      ],
      user_resolution: '1. Refresh browser after 2 minutes.\n2. Clear local browser session storage.\n3. The engineering team has scaled connection capacity and stabilized the checkout service.',
      technical_resolution: '1. Adjust postgresql.conf max_connections = 300\n2. Deploy PgBouncer in transaction pooling mode:\n   pool_mode = transaction\n   default_pool_size = 50\n   reserve_pool_size = 10\n3. Set idle_in_transaction_session_timeout = 30000',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      ticket_code: 'RES-2026-0078',
      user_id: 'd0000000-0000-0000-0000-000000000001',
      title: 'Windows Kernel BSOD 0x0000003B Graphic Subsystem Crash',
      domain: 'Operating System',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      confidence_score: 0.91,
      problem_summary: 'Workstation encountered sudden blue screen (SYSTEM_SERVICE_EXCEPTION) during high-load render task. Minidump correlates with audio voice description of fan throttling.',
      detected_errors: [
        {
          error_code: '0x0000003B (SYSTEM_SERVICE_EXCEPTION)',
          source_modality: 'LOG',
          file_name: 'eventvwr_system.log',
          description: 'Kernel memory fault initiated in nvlddmkm.sys driver code offset 0x43a210.'
        },
        {
          error_code: 'Spoken fan whine & freeze',
          source_modality: 'AUDIO',
          file_name: 'engineer_voice_note.m4a',
          description: 'User reported high pitch acoustic noise immediately preceding screen freeze.'
        }
      ],
      possible_root_cause: 'Outdated NVIDIA Studio Driver 551.23 interacting with Windows 11 24H2 memory integrity virtualization (VBS).',
      evidence_correlations: [
        {
          file_a: 'eventvwr_system.log',
          file_b: 'engineer_voice_note.m4a',
          connection_details: 'Acoustic report matches the kernel dump timestamp within a 3-second window'
        }
      ],
      user_resolution: '1. Boot workstation into Safe Mode by holding Shift while restarting.\n2. Download latest certified GPU driver package.\n3. Run clean installation wizard and reboot normally.',
      technical_resolution: '1. Execute DDU (Display Driver Uninstaller) in Safe Mode with /clean /restart flags.\n2. Set Windows Registry TdrDelay:\n   [HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers]\n   "TdrDelay"=dword:00000008\n3. Install clean WHQL driver v572.16 without GeForce Experience telemetries.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    }
  ],
  evidence_files: [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      ticket_id: 'b1111111-1111-1111-1111-111111111111',
      file_name: 'postgres_stderr.log',
      file_type: 'LOG',
      file_path: 'https://kmmsbwhivscxmmyscvtz.supabase.co/storage/v1/object/public/evidence-files/seed/postgres_stderr.log',
      file_size: 42100,
      extracted_context: 'FATAL: remaining connection slots are reserved for non-replication superuser connections',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      ticket_id: 'b1111111-1111-1111-1111-111111111111',
      file_name: 'checkout_error_screenshot.png',
      file_type: 'IMAGE',
      file_path: 'https://kmmsbwhivscxmmyscvtz.supabase.co/storage/v1/object/public/evidence-files/seed/checkout_error_screenshot.png',
      file_size: 154200,
      extracted_context: 'HTTP 503 error dialog on customer checkout page',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  ],
  evidence_correlations: [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      ticket_id: 'b1111111-1111-1111-1111-111111111111',
      source_evidence_id: 'e1111111-1111-1111-1111-111111111111',
      target_evidence_id: 'e2222222-2222-2222-2222-222222222222',
      correlation_type: 'TIMESTAMP_MATCH',
      description: 'Timestamp 14:22:18 matches across log exception and frontend 503 error',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  ],
  knowledge_base: [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      title: 'PostgreSQL Connection Pool & Max Connections Troubleshooting Guide',
      category: 'Database',
      file_path: 'kb/postgres-connection-pool-guide.pdf',
      content_summary: 'Comprehensive guide on resolving FATAL: remaining connection slots reserved for non-replication superuser connections. Covers PgBouncer pooling parameters, pool size formula: pool_size = ((core_count * 2) + effective_spindle_count), and TCP keepalive tuning.',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      title: 'Windows Kernel BSOD 0x0000003B & GPU Driver Crash Recovery Manual',
      category: 'Operating System',
      file_path: 'kb/windows-bsod-gpu-driver-recovery.pdf',
      content_summary: 'Covers SYSTEM_SERVICE_EXCEPTION (0x0000003B) triggered by graphics driver memory corruptions (nvlddmkm.sys / amdkmdag.sys). Includes Display Driver Uninstaller (DDU) safe mode workflow, TdrDelay registry edits, and clean reinstall instructions.',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      title: 'OAuth 2.0 & JWT Expired Signature Handshake Diagnostics',
      category: 'Security',
      file_path: 'kb/oauth2-jwt-token-rejection-guide.pdf',
      content_summary: 'Standard operating procedures for debugging 401 Unauthorized token rejections, clock skew tolerances, CORS preflight header mismatches, and public key rotation issues across reverse proxies like Nginx and Cloudflare.',
      created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
    {
      id: 'a4444444-4444-4444-4444-444444444444',
      title: 'Microservice Network Timeout & DNS NXDOMAIN Resolution Runbook',
      category: 'Network',
      file_path: 'kb/microservice-dns-timeout-runbook.pdf',
      content_summary: 'Step-by-step diagnostic workflow for intermittent ETIMEDOUT and DNS resolution drops in Kubernetes clusters and Docker bridges. Covers CoreDNS tuning, ndots:5 optimization, and TCP socket recycling.',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    }
  ],
  profiles: [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      email: 'alex.support@resolve360.internal',
      full_name: 'Alex Rivera (IT Lead)',
      role: 'IT_SUPPORT',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      email: 'demo.user@resolve360.internal',
      full_name: 'Sarah Chen (End User)',
      role: 'END_USER',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]
};

function initStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading store.json, using defaults:', err);
  }
  saveStore(defaultStore);
  return defaultStore;
}

export function saveStore(store: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

export const localStore = initStore();
