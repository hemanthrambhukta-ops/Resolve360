import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image, 
  FileAudio, 
  FileText, 
  Terminal, 
  Video, 
  X, 
  Mic, 
  Sparkles, 
  Info,
  CheckCircle,
  FileCode
} from 'lucide-react';
import { AudioRecorderModal } from './AudioRecorderModal';

export interface SelectedFile {
  id: string;
  file: File;
  previewUrl?: string;
  category: 'IMAGE' | 'AUDIO' | 'PDF' | 'LOG' | 'VIDEO' | 'TEXT';
}

interface MultimodalUploaderProps {
  files: SelectedFile[];
  onFilesChange: (files: SelectedFile[]) => void;
  onApplyPreset?: (preset: {
    description: string;
    domain: string;
    presetFiles: SelectedFile[];
  }) => void;
}

export const MultimodalUploader: React.FC<MultimodalUploaderProps> = ({
  files,
  onFilesChange,
  onApplyPreset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getCategory = (file: File): 'IMAGE' | 'AUDIO' | 'PDF' | 'LOG' | 'VIDEO' | 'TEXT' => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'IMAGE';
    if (file.type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'webm', 'ogg'].includes(ext)) return 'AUDIO';
    if (file.type === 'application/pdf' || ext === 'pdf') return 'PDF';
    if (file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext)) return 'VIDEO';
    if (['log', 'txt', 'json'].includes(ext)) return 'LOG';
    return 'TEXT';
  };

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    const array = Array.from(incomingFiles);
    if (files.length + array.length > 10) {
      alert('Maximum 10 files can be uploaded per analysis session.');
      return;
    }

    const newItems: SelectedFile[] = array.map((file) => {
      const category = getCategory(file);
      let previewUrl: string | undefined;
      if (category === 'IMAGE' || category === 'AUDIO' || category === 'VIDEO') {
        previewUrl = URL.createObjectURL(file);
      }
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        category,
      };
    });

    onFilesChange([...files, ...newItems]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'IMAGE':
        return { icon: Image, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'AUDIO':
        return { icon: FileAudio, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'PDF':
        return { icon: FileText, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'LOG':
        return { icon: Terminal, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'VIDEO':
        return { icon: Video, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      default:
        return { icon: FileCode, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
  };

  // 1-Click diagnostic presets for instantaneous evaluation
  const applyPresetScenario = (presetKey: string) => {
    if (!onApplyPreset) return;

    if (presetKey === 'postgres') {
      const logContent = `2026-10-07 14:22:15.112 UTC [20412] LOG: connection received: host=10.0.4.81 port=43901
2026-10-07 14:22:18.420 UTC [20412] FATAL: remaining connection slots are reserved for non-replication superuser connections
2026-10-07 14:22:18.422 UTC [20412] DETAIL: Active sessions: 100/100 connections occupied.
2026-10-07 14:22:19.011 UTC [9112] ERROR: Pool acquire timeout after 30000ms at pg-pool/index.js:384`;
      const logFile = new File([logContent], 'postgres_pool_exhaustion.log', { type: 'text/plain' });

      // Create dummy image canvas data
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, 400, 200);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('HTTP 503: Service Unavailable', 30, 80);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText('Unable to acquire database connection from pool.', 30, 110);
      }
      canvas.toBlob((blob) => {
        const screenshotFile = new File([blob || ''], 'checkout_error_dialog.png', { type: 'image/png' });
        
        onApplyPreset({
          domain: 'Database',
          description: 'Production payment checkout service is failing with 503 Service Unavailable. Customers cannot finalize orders. Attached the database cluster stderr log and the customer screenshot.',
          presetFiles: [
            {
              id: `log-${Date.now()}`,
              file: logFile,
              category: 'LOG',
            },
            {
              id: `img-${Date.now()}`,
              file: screenshotFile,
              previewUrl: canvas.toDataURL(),
              category: 'IMAGE',
            },
          ],
        });
      }, 'image/png');
    } else if (presetKey === 'bsod') {
      const dumpLog = `Microsoft (R) Windows Debugger Version 10.0.22621.1 AMD64
BugCheck 3B, {c0000005, fffff806543a2100, ffffd000214a1000, 0}
Probably caused by : nvlddmkm.sys ( nvlddmkm+43a210 )
DEFAULT_BUCKET_ID: WIN8_DRIVER_FAULT
PROCESS_NAME: blender.exe
STACK_TEXT:
ffffd000'214a1200 fffff806'543a2100 : nvlddmkm+0x43a210
ffffd000'214a1230 fffff806'54110900 : nvlddmkm+0x1ae900
FAILURE_BUCKET_ID: 0x3B_nvlddmkm+43a210`;
      const dumpFile = new File([dumpLog], 'minidump_0x3B_analysis.txt', { type: 'text/plain' });

      onApplyPreset({
        domain: 'Operating System',
        description: '3D workstation crashes to Blue Screen (SYSTEM_SERVICE_EXCEPTION 0x0000003B) whenever rendering starts in Blender. Minidump crash report attached.',
        presetFiles: [
          {
            id: `bsod-${Date.now()}`,
            file: dumpFile,
            category: 'LOG',
          },
        ],
      });
    } else if (presetKey === 'oauth') {
      const oauthLog = `[2026-10-07T14:35:01Z] [ERROR] [auth-microservice] Token verification failed: JsonWebTokenError: jwt signature is invalid
[2026-10-07T14:35:01Z] [WARN] [ingress-nginx] CORS header 'Access-Control-Allow-Origin' missing from 401 response
[2026-10-07T14:35:02Z] [DEBUG] Expected RS256 with key ID 'auth0-key-2026-a', received unrecognized kid 'legacy-2024'`;
      const oauthFile = new File([oauthLog], 'api_gateway_auth_trace.log', { type: 'text/plain' });

      onApplyPreset({
        domain: 'Security',
        description: 'Single Sign-On (SSO) login loops back to the login screen with a 401 Unauthorized token error. CORS errors appear in the browser console.',
        presetFiles: [
          {
            id: `oauth-${Date.now()}`,
            file: oauthFile,
            category: 'LOG',
          },
        ],
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Quick Fill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">
            Quick Diagnostic Presets (1-Click Evaluation):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPresetScenario('postgres')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            PostgreSQL 503 Pool Saturation
          </button>
          <button
            type="button"
            onClick={() => applyPresetScenario('bsod')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
          >
            Windows BSOD 0x3B Kernel
          </button>
          <button
            type="button"
            onClick={() => applyPresetScenario('oauth')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            OAuth JWT Rejection
          </button>
        </div>
      </div>

      {/* Multimodal Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/30 shadow-xl shadow-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.webm,.pdf,.log,.txt,.json,.mp4"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
          }}
        />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-white mb-1">
            Drag & Drop Multimodal Diagnostic Files
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            Ingest heterogeneous signals simultaneously: Screenshots, System Logs, Audio Voice Notes, PDF Manuals, or Screen Recording Videos.
          </p>

          {/* Supported Modalities Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Screenshots (.png, .jpg, .webp)', icon: Image },
              { label: 'Voice Notes (.mp3, .wav, .m4a)', icon: FileAudio },
              { label: 'Documentation (.pdf)', icon: FileText },
              { label: 'System Logs (.log, .txt, .json)', icon: Terminal },
              { label: 'Screen Recordings (.mp4, .webm)', icon: Video },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  <Icon className="w-3 h-3 text-indigo-400" />
                  <span>{m.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voice Recorder Action Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsAudioModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm"
        >
          <Mic className="w-4 h-4 text-indigo-400" />
          <span>Record Spoken Voice Explanation</span>
        </button>

        <span className="text-xs text-slate-400">
          Attached: <strong className="text-white">{files.length}</strong> / 10 files
        </span>
      </div>

      {/* Attached Files Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {files.map((item) => {
            const { icon: CategoryIcon, color } = getCategoryBadge(item.category);
            return (
              <div
                key={item.id}
                className="relative flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden group"
              >
                {/* Media Thumbnail or Icon */}
                {item.previewUrl && item.category === 'IMAGE' ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 ${color}`}>
                    <CategoryIcon className="w-6 h-6" />
                  </div>
                )}

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-200 truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${color}`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatFileSize(item.file.size)}
                    </span>
                  </div>
                </div>

                {/* Remove File Button */}
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* In-Browser Voice Recording Modal */}
      <AudioRecorderModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onAudioRecorded={(audioFile) => {
          handleFilesAdded([audioFile]);
        }}
      />
    </div>
  );
};
