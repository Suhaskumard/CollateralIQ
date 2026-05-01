import { runValuation } from './estimate.service.js';
import { logEvent } from '../audit/audit.service.js';

export async function run(req, res, next) {
  try {
    const {
      address = '',
      area, age, legal, occupancy,
      rent = 0, propertyType = 'residential',
      subtype = 'apartment', location = 'default',
      lat, lon, floor = 1, has_lift = true,
      monthly_rent, docs_complete = true,
      building_name = '',
    } = req.body;

    if (!area || age === undefined || !legal || !occupancy) {
      return res.status(400).json({
        error: 'Missing required fields: area, age, legal, occupancy',
      });
    }

    const result = runValuation({
      area: +area, age: +age, legal, occupancy,
      rent: +(monthly_rent || rent) || 0,
      propertyType, subtype, location,
      floor: +floor, has_lift: !!has_lift,
      docs_complete: !!docs_complete, address,
    });

    await logEvent({
      action: 'ESTIMATE_RUN',
      details: {
        address, area, age, legal, policy: result.policy,
        mv_low: result.mv_low, mv_high: result.mv_high, mv_base: result.mv_base,
        confidence: result.confidence, resaleIndex: result.resaleIndex,
        modelVersion: result.modelVersion,
      },
    });

    res.json({
      address, propertyType, subtype, area: +area, age: +age,
      lat, lon, floor: +floor, building_name,
      ...result,
    });
  } catch (err) { next(err); }
}
