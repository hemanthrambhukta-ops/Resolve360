export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ModalityType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'PDF' | 'LOG' | 'VIDEO';
export type UserRole = 'END_USER' | 'IT_SUPPORT' | 'ADMIN';

export interface DetectedError {
  error_code: string;
  source_modality: string;
  file_name: string;
  description: string;
}

export interface EvidenceCorrelation {
  id?: string;
  file_a: string;
  file_b: string;
  connection_details: string;
  correlation_type?: string;
}

export interface Ticket {
  id: string;
  ticket_code: string;
  user_id: string;
  title: string;
  domain: string;
  severity: Severity;
  status: TicketStatus;
  confidence_score: number;
  problem_summary: string;
  detected_errors: DetectedError[];
  possible_root_cause: string;
  user_resolution: string;
  technical_resolution: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceFile {
  id: string;
  ticket_id: string;
  file_name: string;
  file_type: ModalityType;
  file_path: string;
  file_size: number;
  extracted_context?: string;
  created_at: string;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  file_path: string;
  content_summary: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}
