import { Router, Request, Response } from 'express';
import { supabaseAdmin, localStore, saveStore } from '../config/supabaseAdmin.js';
import { AuthUserSyncSchema } from '../shared/validators.js';

export const authRouter = Router();

authRouter.post('/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = AuthUserSyncSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.errors });
      return;
    }

    const { id, email, full_name, role, avatar_url } = parseResult.data;

    const existingIdx = localStore.profiles.findIndex(p => p.id === id);
    const profileData = {
      id,
      email,
      full_name,
      role,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
      updated_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      localStore.profiles[existingIdx] = { ...localStore.profiles[existingIdx], ...profileData };
    } else {
      localStore.profiles.push({ ...profileData, created_at: new Date().toISOString() });
    }
    saveStore(localStore);

    // Try Supabase upsert
    try {
      await supabaseAdmin.from('profiles').upsert(profileData);
    } catch (dbErr) {
      // Supabase table pending
    }

    res.json({ success: true, profile: profileData });
  } catch (err: any) {
    console.error('Error in /api/auth/sync:', err);
    res.status(500).json({ error: 'Failed to sync user profile', message: err.message });
  }
});

authRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  res.json({ success: true, user });
});

authRouter.get('/profiles', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, profiles: localStore.profiles });
});
