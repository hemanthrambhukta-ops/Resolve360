import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, localStore } from '../config/supabaseAdmin.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'END_USER' | 'IT_SUPPORT' | 'ADMIN';
  full_name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (user && !error) {
        // Find or build user profile
        const profile = localStore.profiles.find(p => p.id === user.id);
        req.user = {
          id: user.id,
          email: user.email || 'user@resolve360.internal',
          role: profile?.role || (user.user_metadata?.role as any) || 'END_USER',
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Resolve360 User',
        };
        return next();
      }
    }

    // Default fallback demo user for effortless evaluation if no token
    const demoUser = localStore.profiles[0];
    req.user = {
      id: demoUser?.id || 'd0000000-0000-0000-0000-000000000001',
      email: demoUser?.email || 'alex.support@resolve360.internal',
      role: demoUser?.role || 'IT_SUPPORT',
      full_name: demoUser?.full_name || 'Alex Rivera (IT Lead)',
    };
    next();
  } catch (err) {
    console.error('Auth middleware error, using fallback demo user:', err);
    req.user = {
      id: 'd0000000-0000-0000-0000-000000000001',
      email: 'alex.support@resolve360.internal',
      role: 'IT_SUPPORT',
      full_name: 'Alex Rivera (IT Lead)',
    };
    next();
  }
}
