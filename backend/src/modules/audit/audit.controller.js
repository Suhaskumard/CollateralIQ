import { getAuditTrail, logAuditEvent } from './audit.service.js';

export async function getTrail(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    res.json(await getAuditTrail(limit));
  } catch (err) { next(err); }
}

export async function log(req, res, next) {
  try {
    const { action, user, details } = req.body;
    if (!action) return res.status(400).json({ error: 'action is required' });
    const entry = await logAuditEvent({ action, user, details });
    res.status(201).json(entry);
  } catch (err) { next(err); }
}
