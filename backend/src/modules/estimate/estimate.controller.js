import { runValuation } from './estimate.service.js';
import { logEvent } from '../audit/audit.service.js';

export async function run(req, res, next) {
  try {
    const {
      address = 'Unknown',
      area, age, legal, occupancy,
      rent = 0, propertyType = 'residential',
      subtype = 'apartment', location = 'default',
    } = req.body;

    if (!area || !age || !legal || !occupancy) {
      return res.status(400).json({
        error: 'Missing required fields: area, age, legal, occupancy',
      });
    }

    const result = runValuation({ area, age, legal, occupancy, rent, propertyType, subtype, location });

    await logEvent({
      action: 'ESTIMATE_RUN',
      details: { address, area, age, legal, policy: result.policy, mv_low: result.mv_low, mv_high: result.mv_high },
    });

    res.json({ address, propertyType, subtype, area, age, ...result });
  } catch (err) { next(err); }
}
