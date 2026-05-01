import { getAllCases, saveCase, deleteCase } from './portfolio.service.js';
import { logEvent } from '../audit/audit.service.js';

export async function list(_req, res, next) {
  try {
    res.json(await getAllCases());
  } catch (err) { next(err); }
}

export async function save(req, res, next) {
  try {
    const entry = await saveCase(req.body);
    await logEvent({ action: 'CASE_SAVED', details: { id: entry.id, address: entry.address } });
    res.status(201).json(entry);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await deleteCase(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Case not found' });
    await logEvent({ action: 'CASE_DELETED', details: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
}
