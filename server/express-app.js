import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.js";
import trackingRouter from "./routes/tracking.js";
import activitiesRouter from "./routes/activities.js";
import goalsRouter from "./routes/goals.js";
import activityBoardRouter from "./routes/activityBoard.js";
import badgesRouter from "./routes/badges.js";
import healthRouter from "./routes/health.js";
import cookieParser from "cookie-parser";
import debugRoutes from "./routes/debug.js";
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from "./middlewares/errorHandler.js";
import { getCORSConfig, isProduction } from "./utils/envValidation.js";
import { requestLogger, errorLogger } from "./utils/logger.js";
import { winstonRequestLogger, winstonErrorLogger } from "./middlewares/winstonRequestLogger.js";
import { winstonLogger } from "./utils/winstonLogger.js";

const corsConfig = getCORSConfig();

export default async function expressApp(app) {
  const appLogger = winstonLogger.child('EXPRESS');

  // Set up global error handlers first
  handleUnhandledRejection();
  handleUncaughtException();

  appLogger.startup('Initializing Express application');

  app.use(bodyParser.json());
  app.use(cookieParser());
  app.set("trust proxy", 1); // safe even when hitting EC2 directly

  // Request logging middleware (Winston)
  app.use(winstonRequestLogger);

  // CORS configuration
  app.use(
    cors({
      origin: corsConfig.origin,
      credentials: corsConfig.credentials,
    })
  );

  // Health check routes (no auth required)
  app.use("/health", healthRouter);

  // API routes
  app.use("/api/auth", authRouter);
  app.use("/api/track", trackingRouter);
  app.use("/api/activities", activitiesRouter);
  app.use("/api/goals", goalsRouter);
  app.use("/api/board", activityBoardRouter);
  app.use("/api/badges", badgesRouter);

  // Debug routes (non-production only)
  if (!isProduction()) {
    app.use("/api", debugRoutes);
  }

  // Error logging middleware (Winston)
  app.use(winstonErrorLogger);

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  appLogger.startup('Express application configured successfully');
}
