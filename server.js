import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS — allow frontend URL(s) from env (Vercel in prod, localhost in dev)
// Configure either:
// - FRONTEND_URL (single origin)
// - FRONTEND_ORIGINS (comma-separated origins)
const allowedOrigins = [
  ...(process.env.FRONTEND_ORIGINS
    ? process.env.FRONTEND_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Support exact match or prefix match for common hosting (https://domain)
      const isAllowed = allowedOrigins.some((o) => origin === o || origin.startsWith(o));
      if (isAllowed) return callback(null, true);

      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Set security headers (allow cross-origin for static images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Serve static files from the upload directory
app.use('/uploads', express.static(path.join(__dirname, 'upload')));

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TaskFlow server is up and running' });
});

// Catch-all 404 handler
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle server startup/runtime errors gracefully
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port or kill the process using it.`);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
