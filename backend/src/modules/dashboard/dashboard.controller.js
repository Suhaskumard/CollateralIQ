import { getMetricsService } from './dashboard.service.js';

export async function getMetrics(_req, res, next) {
  try {
    const data = await getMetricsService();
    res.json(data);
  } catch (err) { next(err); }
}
