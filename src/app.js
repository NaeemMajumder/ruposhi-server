import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import routes from './routes/index.js';

const app = express();

// ─────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────
app.use(helmet());
app.use(hpp());

// Custom NoSQL Injection Sanitizer
// (express-mongo-sanitize Express 5 এ conflict করে)
const sanitizeInput = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitizeInput(obj[key]);
      }
    });
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.params) sanitizeInput(req.params);
  next();
});

// ─────────────────────────────────────────
// CORS
// ─────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─────────────────────────────────────────
// Body Parser
// ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─────────────────────────────────────────
// Compression & Logging
// ─────────────────────────────────────────
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────
// Global Rate Limiter
// ─────────────────────────────────────────
app.use('/api', globalLimiter);

// ─────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ruposhi API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────
app.use('/api/v1', routes);

// ─────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;