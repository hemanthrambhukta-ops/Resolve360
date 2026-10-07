import multer from 'multer';

// In-memory buffer storage for direct upload to Supabase & base64 inline conversion for Gemini
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg',
  // PDF
  'application/pdf',
  // Logs & text
  'text/plain',
  'text/x-log',
  'application/json',
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/octet-stream', // often returned for .log or custom files
]);

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB maximum per file
    files: 10, // Max 10 combined files per analysis session
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const codeAndTextExts = [
      'png', 'jpg', 'jpeg', 'webp', 
      'mp3', 'wav', 'm4a', 'webm', 'ogg', 
      'pdf', 
      'log', 'txt', 'json', 'mp4',
      'py', 'js', 'ts', 'jsx', 'tsx', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'rb', 'php',
      'sh', 'bash', 'ps1', 'bat', 'cmd', 'sql', 'html', 'css', 'xml', 'yaml', 'yml', 'env', 'md', 'diff', 'patch'
    ];
    
    if (
      ALLOWED_MIME_TYPES.has(file.mimetype) || 
      (ext && codeAndTextExts.includes(ext)) ||
      file.mimetype.startsWith('text/') ||
      file.mimetype.includes('javascript') ||
      file.mimetype.includes('json') ||
      file.mimetype.includes('xml')
    ) {
      cb(null, true);
    } else {
      // Allow any text-like or diagnostic file to be safely processed
      cb(null, true);
    }
  },
});

export function getFileCategory(mimetype: string, originalname: string): 'IMAGE' | 'AUDIO' | 'PDF' | 'LOG' | 'VIDEO' | 'TEXT' {
  const ext = originalname.split('.').pop()?.toLowerCase() || '';

  if (mimetype.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return 'IMAGE';
  }
  if (mimetype.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) {
    return 'AUDIO';
  }
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    return 'PDF';
  }
  if (mimetype.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(ext)) {
    return 'VIDEO';
  }
  const codeExts = ['py', 'js', 'ts', 'jsx', 'tsx', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'rb', 'php', 'sh', 'sql', 'html', 'css', 'yaml', 'yml', 'json', 'log', 'txt'];
  if (codeExts.includes(ext) || mimetype.startsWith('text/') || mimetype.includes('json') || mimetype.includes('script')) {
    return 'LOG';
  }
  return 'TEXT';
}
