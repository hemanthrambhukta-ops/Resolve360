// Re-export shared types for client usage
export interface ResolveRequest {
  user_description: string;
  category_hint?: string;
  user_id?: string;
}

export interface StatusUpdate {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AuthUserSync {
  id: string;
  email: string;
  full_name: string;
  role: 'END_USER' | 'IT_SUPPORT' | 'ADMIN';
  avatar_url?: string | null;
}
