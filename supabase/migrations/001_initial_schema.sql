-- ==============================================================================
-- RESOLVE 360 - INITIAL DATABASE SCHEMA & POLICIES
-- Multimodal AI Technical Support & Ticket Resolution Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('END_USER', 'IT_SUPPORT', 'ADMIN')) DEFAULT 'END_USER',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) DEFAULT 'OPEN',
  confidence_score NUMERIC(3, 2) NOT NULL,
  problem_summary TEXT NOT NULL,
  detected_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  possible_root_cause TEXT NOT NULL,
  user_resolution TEXT NOT NULL,
  technical_resolution TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. EVIDENCE FILES TABLE
CREATE TABLE IF NOT EXISTS public.evidence_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('TEXT', 'IMAGE', 'AUDIO', 'PDF', 'LOG', 'VIDEO')),
  file_path TEXT NOT NULL,
  file_size INT NOT NULL,
  extracted_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CROSS-MODAL CORRELATION MATRIX TABLE
CREATE TABLE IF NOT EXISTS public.evidence_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  source_evidence_id UUID REFERENCES public.evidence_files(id) ON DELETE SET NULL,
  target_evidence_id UUID REFERENCES public.evidence_files(id) ON DELETE SET NULL,
  correlation_type TEXT NOT NULL, -- e.g., 'TIMESTAMP_MATCH', 'ERROR_CODE_MATCH', 'CONTEXTUAL_LINK'
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. KNOWLEDGE BASE DOCUMENTS
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile or IT/Admin view all" ON public.profiles;
CREATE POLICY "Users can view their own profile or IT/Admin view all" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('IT_SUPPORT', 'ADMIN'))
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tickets Policies
DROP POLICY IF EXISTS "Users can view their own tickets or IT/Admins view all" ON public.tickets;
CREATE POLICY "Users can view their own tickets or IT/Admins view all" ON public.tickets
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('IT_SUPPORT', 'ADMIN'))
  );

DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.tickets;
CREATE POLICY "Users can insert their own tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "IT/Admins can update tickets" ON public.tickets;
CREATE POLICY "IT/Admins can update tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('IT_SUPPORT', 'ADMIN'))
  );

-- Evidence Files Policies
DROP POLICY IF EXISTS "Access evidence files associated with accessible tickets" ON public.evidence_files;
CREATE POLICY "Access evidence files associated with accessible tickets" ON public.evidence_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = evidence_files.ticket_id 
      AND (tickets.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('IT_SUPPORT', 'ADMIN')))
    )
  );

-- Evidence Correlations Policies
DROP POLICY IF EXISTS "Access correlations for accessible tickets" ON public.evidence_correlations;
CREATE POLICY "Access correlations for accessible tickets" ON public.evidence_correlations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = evidence_correlations.ticket_id 
      AND (tickets.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('IT_SUPPORT', 'ADMIN')))
    )
  );

-- Knowledge Base Policies
DROP POLICY IF EXISTS "Knowledge base accessible to authenticated users" ON public.knowledge_base;
CREATE POLICY "Knowledge base accessible to authenticated users" ON public.knowledge_base
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "IT/Admins can insert knowledge base" ON public.knowledge_base;
CREATE POLICY "IT/Admins can insert knowledge base" ON public.knowledge_base
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('IT_SUPPORT', 'ADMIN'))
  );

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence-files', 'evidence-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for evidence-files bucket
DROP POLICY IF EXISTS "Public evidence files access" ON storage.objects;
CREATE POLICY "Public evidence files access" ON storage.objects
  FOR SELECT USING (bucket_id = 'evidence-files');

DROP POLICY IF EXISTS "Authenticated users upload evidence" ON storage.objects;
CREATE POLICY "Authenticated users upload evidence" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'evidence-files');

-- ==============================================================================
-- SEED DATA: KNOWLEDGE BASE ARTICLES
-- ==============================================================================

INSERT INTO public.knowledge_base (id, title, category, file_path, content_summary)
VALUES 
  (
    'a1111111-1111-1111-1111-111111111111',
    'PostgreSQL Connection Pool & Max Connections Troubleshooting Guide',
    'Database',
    'kb/postgres-connection-pool-guide.pdf',
    'Comprehensive guide on resolving FATAL: remaining connection slots reserved for non-replication superuser connections. Covers PgBouncer pooling parameters, pool size formula: pool_size = ((core_count * 2) + effective_spindle_count), and TCP keepalive tuning.'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Windows Kernel BSOD 0x0000003B & GPU Driver Crash Recovery Manual',
    'Operating System',
    'kb/windows-bsod-gpu-driver-recovery.pdf',
    'Covers SYSTEM_SERVICE_EXCEPTION (0x0000003B) triggered by graphics driver memory corruptions (nvlddmkm.sys / amdkmdag.sys). Includes Display Driver Uninstaller (DDU) safe mode workflow, TdrDelay registry edits, and clean reinstall instructions.'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'OAuth 2.0 & JWT Expired Signature Handshake Diagnostics',
    'Security',
    'kb/oauth2-jwt-token-rejection-guide.pdf',
    'Standard operating procedures for debugging 401 Unauthorized token rejections, clock skew tolerances, CORS preflight header mismatches, and public key rotation issues across reverse proxies like Nginx and Cloudflare.'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Microservice Network Timeout & DNS NXDOMAIN Resolution Runbook',
    'Network',
    'kb/microservice-dns-timeout-runbook.pdf',
    'Step-by-step diagnostic workflow for intermittent ETIMEDOUT and DNS resolution drops in Kubernetes clusters and Docker bridges. Covers CoreDNS tuning, ndots:5 optimization, and TCP socket recycling.'
  )
ON CONFLICT (id) DO NOTHING;
