import express from 'express';
import cors from 'cors';
import { CORS_ORIGINS } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import estimateRoutes  from './modules/estimate/estimate.routes.js';
import whatifRoutes    from './modules/whatif/whatif.routes.js';
import portfolioRoutes from './modules/portfolio/portfolio.routes.js';
import copilotRoutes   from './modules/copilot/copilot.routes.js';
import auditRoutes     from './modules/audit/audit.routes.js';

export function createApp() {
  const app = express();

  // ── Global middleware ──────────────────────────────────────────────────────
  app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
  app.use(express.json());

  // ── API routes ─────────────────────────────────────────────────────────────
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/estimate',  estimateRoutes);
  app.use('/api/whatif',    whatifRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  app.use('/api/copilot',   copilotRoutes);
  app.use('/api/audit',     auditRoutes);

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/', (_req, res) =>
    res.json({ status: 'ok', service: 'CollateralIQ API', version: '1.0.0' })
  );

  // ── Centralised error handler (must be last) ───────────────────────────────
  app.use(errorHandler);

  return app;
}
