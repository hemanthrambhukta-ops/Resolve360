import { supabaseAdmin } from '../config/supabaseAdmin.js';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function uploadEvidenceFile(
  file: Express.Multer.File,
  ticketId: string
): Promise<{ filePath: string; publicUrl: string }> {
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${ticketId}/${Date.now()}_${sanitizedName}`;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('evidence-files')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.warn(`Supabase storage upload error (${error.message}), falling back to local static store.`);
      return saveLocally(file, sanitizedName);
    }

    const { data: publicData } = supabaseAdmin.storage
      .from('evidence-files')
      .getPublicUrl(storagePath);

    return {
      filePath: storagePath,
      publicUrl: publicData.publicUrl,
    };
  } catch (err: any) {
    console.warn(`Storage exception (${err.message}), storing locally.`);
    return saveLocally(file, sanitizedName);
  }
}

function saveLocally(file: Express.Multer.File, sanitizedName: string): { filePath: string; publicUrl: string } {
  const localFileName = `${Date.now()}_${sanitizedName}`;
  const localFilePath = path.join(UPLOADS_DIR, localFileName);
  fs.writeFileSync(localFilePath, file.buffer);
  return {
    filePath: `local/${localFileName}`,
    publicUrl: `/uploads/${localFileName}`,
  };
}
