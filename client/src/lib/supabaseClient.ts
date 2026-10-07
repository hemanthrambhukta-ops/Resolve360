import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmmsbwhivscxmmyscvtz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXNid2hpdnNjeG1teXNjdnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjg5ODQsImV4cCI6MjEwNjg0NDk4NH0.wF2ounlkanU6vk6fsIsOVadF9iBnFlHF6iriN5dIjeQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'alex.support@resolve360.internal',
    full_name: 'Alex Rivera (IT Lead)',
    role: 'IT_SUPPORT',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    email: 'sarah.chen@resolve360.internal',
    full_name: 'Sarah Chen (End User)',
    role: 'END_USER',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
];

export function getCurrentProfile(): UserProfile {
  const stored = localStorage.getItem('resolve360_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }
  return DEMO_PROFILES[0];
}

export function setCurrentProfile(profile: UserProfile): void {
  localStorage.setItem('resolve360_user', JSON.stringify(profile));
  window.dispatchEvent(new Event('auth_state_changed'));
}
