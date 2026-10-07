import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authMiddleware } from './middleware/authMiddleware.js';
import { resolveRouter } from './routes/resolveRoutes.js';
import { ticketRouter } from './routes/ticketRoutes.js';
import { kbRouter } from './routes/kbRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { GEMINI_MODEL } from './config/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Cross-Origin Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Body Parser with 50MB Payload Limits for rich multimodal diagnostic logs & JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads fallback
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Global Auth Context Middleware
app.use(authMiddleware);

// API Routes (mounted with /api prefix and direct aliases)
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/resolve', resolveRouter);
app.use('/resolve', resolveRouter);

app.use('/api/tickets', ticketRouter);
app.use('/tickets', ticketRouter);

app.use('/api/knowledge-base', kbRouter);
app.use('/knowledge-base', kbRouter);

// Health check endpoint
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'Resolve 360 Multimodal Support Engine',
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred in the support pipeline.',
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`   RESOLVE 360 BACKEND RUNNING ON PORT ${PORT}      `);
  console.log(`   AI Engine Model: ${GEMINI_MODEL}              `);
  console.log(`   Health Check: http://localhost:${PORT}/api/health `);
  console.log(`====================================================`);
});
