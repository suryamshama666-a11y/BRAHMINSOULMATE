import dotenv from "dotenv";
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { scrubPII } from "./utils/scrub";
import { logger } from "./utils/logger";

// Load environment variables from .env.local first, then .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

// Import routes
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import matchingRoutes from "./routes/matching";
import messageRoutes from "./routes/messages";
import paymentRoutes from "./routes/payments";
import notificationRoutes from "./routes/notifications";
import eventRoutes from "./routes/events";
import vdateRoutes from "./routes/vdates";
import adminRoutes from "./routes/admin";
import successStoryRoutes from "./routes/success_stories";
import utilityRoutes from "./routes/utility";
import profileViewsRoutes from "./routes/profile-views";
import horoscopeRoutes from './routes/horoscope';
import analyticsRoutes from './routes/analytics';
import gdprRoutes from './routes/gdpr';
import healthRoutes from './routes/health';

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeInput } from "./middleware/sanitize";
import { csrfProtection, setCsrfToken } from "./middleware/csrf";
import { requestLogger } from "./middleware/requestLogger";
import { apiVersioning } from "./middleware/apiVersioning";
import { preventHardDelete } from "./middleware/softDelete";

// Import config
import { supabase } from "./config/supabase";

// Import services
import { cronService } from "./services/cron.service";
import { circuitBreakerService } from "./services/circuitBreaker";

// Database health check
const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    // Simple test query to check database connectivity
    const { data, error } = await supabase.rpc('ping');
    return !error;
  } catch (error) {
    logger.error('❌ Database health check failed:', error);
    return false;
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Environment validation for production safety
function validateEnvironment() {
  // Check if we're in mock mode (missing Supabase credentials)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isMockMode = !supabaseUrl || !supabaseKey;

  if (isMockMode) {
    logger.warn('⚠️  Running in MOCK MODE - Supabase credentials not configured');
    logger.warn('💡 Some features will be limited. Set up Supabase credentials for full functionality.');
    return;
  }

  // In production mode, validate all required vars
  if (process.env.NODE_ENV === 'production') {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
      logger.error('❌ CRITICAL: Missing required environment variables for production:');
      missing.forEach(varName => logger.error(`   - ${varName}`));
      logger.error('\n💡 Check your .env file and ensure all required variables are set.');
      process.exit(1);
    }
  }

  // Additional validation for URLs
  const urlVars = ['VITE_SUPABASE_URL', 'FRONTEND_URL'];
  for (const varName of urlVars) {
    const value = process.env[varName];
    if (value && !value.startsWith('http')) {
      logger.error(`❌ CRITICAL: ${varName} must be a valid URL starting with http/https`);
      process.exit(1);
    }
  }

  logger.info('✅ Environment validation passed');
}

// Validate environment on startup (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment();
}

// Sentry initialization
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
    environment: process.env.NODE_ENV || "development",
    
    // PII Scrubbing
    beforeSend(event, hint) {
      if (event.request && event.request.data) {
        event.request.data = scrubPII(event.request.data) as Record<string, unknown>;
      }
      if (event.extra) {
        event.extra = scrubPII(event.extra) as Record<string, unknown>;
      }
      return event;
    },
  });
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://www.google.com"],
        connectSrc: ["'self'", "https://api.razorpay.com", "wss:", "https:"],
        frameSrc: ["'self'", "https://meet.jit.si", "https://www.google.com"],
        sandbox: ['allow-forms', 'allow-scripts'],
      },
    },
    hsts: {
      maxAge: process.env.NODE_ENV === 'production' ? 31536000 : 0,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xXssProtection: true,
    dnsPrefetchControl: false,
    frameguard: { action: 'deny' },
  })
);

app.use(cookieParser());

// ✅ NEW: CSRF Protection
app.use(setCsrfToken);
app.use(csrfProtection);

// ✅ NEW: Request Correlation IDs
app.use(requestLogger);

// ✅ NEW: API Versioning
app.use(apiVersioning);

// ✅ NEW: Soft Delete Prevention
app.use(preventHardDelete);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8080',
  'http://localhost:8080',
  'http://localhost:5173',
  'https://brahminsoulmate.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for smoother profile browsing
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});
app.use(limiter);

// Body parsing middleware - with raw body capture for webhook signature verification
app.use(express.json({ 
  limit: "2mb",
  verify: (req: Request, _res: Response, buf: Buffer) => {
    if (req.originalUrl?.includes('/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Input sanitization (XSS prevention)
app.use(sanitizeInput);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

// Health check endpoint
app.get("/health", async (req, res) => {
  const health: Record<string, any> = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    checks: {},
  };

  try {
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth();
    health.checks.database = {
      status: dbHealth ? "healthy" : "unhealthy",
      message: dbHealth ? "Database connection successful" : "Failed to connect to database"
    };
    
    // Check Redis if configured
    if (process.env.REDIS_URL) {
      // Simple Redis ping check would go here
      health.checks.redis = { status: "healthy", message: "Redis configured" };
    }
    
    health.status = dbHealth ? "OK" : "DEGRADED";
  } catch (error) {
    health.status = "ERROR";
    health.error = error instanceof Error ? error.message : 'Unknown error';
  }

  res.status(health.status === "OK" ? 200 : (health.status === "DEGRADED" ? 206 : 500)).json(health);
});

// ✅ NEW: Circuit Breaker Status Endpoint
app.get("/health/circuit-breakers", (req, res) => {
  res.json(circuitBreakerService.getSummary());
});

// Readiness probe (checks basic envs and CORS origin)
app.get("/ready", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
  const warnings: string[] = [];
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    warnings.push(
      "Supabase envs missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY",
    );
  }
  if (
    process.env.FRONTEND_URL &&
    !/^https?:\/\//.test(process.env.FRONTEND_URL)
  ) {
    warnings.push(
      "FRONTEND_URL should be a full URL incl. protocol (http/https)",
    );
  }
  res.status(200).json({
    ok: true,
    frontendUrl,
    corsOriginConfigured: !!process.env.FRONTEND_URL,
    warnings,
  });
});

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile-views", profileViewsRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/vdates", vdateRoutes);
app.use("/api/success-stories", successStoryRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use("/api", utilityRoutes);

// The error handler must be before any other error middleware and after all controllers
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// 404 handler
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
let shutdownPromise: Promise<void> | null = null;

const shutdown = async () => {
  logger.info("🔄 Shutting down gracefully...");
  
  if (shutdownPromise) {
    await shutdownPromise;
    return;
  }
  
  const shutdown = new Promise<void>((resolve) => {
    // Stop cron jobs
    cronService.stop();
    
    // Give time for existing requests to complete
    setTimeout(() => {
      logger.warn("⏰ Shutdown timeout - forcing exit");
      resolve();
    }, 30000); // 30 second timeout
  });
  
  shutdownPromise = shutdown;
  await shutdownPromise;
  
  logger.info("✅ Shutdown complete");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("SIGQUIT", shutdown);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);

    // Start cron jobs
    cronService.start();
  });
}

export default app;
