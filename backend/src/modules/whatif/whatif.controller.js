import { analyzeScenario } from './whatif.service.js';

export async function analyze(req, res, next) {
  try {
    const { age = 8, area = 1250, rent = 32000, floor = 5, legal = 'freehold_clear', market = 'mid' } = req.body;
    const result = analyzeScenario({ age: +age, area: +area, rent: +rent, floor: +floor, legal, market });
    res.json(result);
  } catch (err) { next(err); }
}
