// ── What-If Scenario Service ──────────────────────────────────────────────────
// Uses the same valuation engine to compare baseline vs adjusted scenarios.

import { runValuation } from '../estimate/estimate.service.js';

const DEFAULT_BASELINE = {
  area: 1250, age: 8, rent: 32000, floor: 5,
  legal: 'freehold_clear', occupancy: 'rented',
  propertyType: 'residential', subtype: 'apartment',
  location: 'whitefield', has_lift: true, docs_complete: true,
};

const MARKET_TO_LOCATION = {
  prime: 'koramangala',
  mid: 'whitefield',
  peripheral: 'sarjapur',
  distressed: 'kengeri',
};

export function analyzeScenario({ age, area, rent, floor, legal, market, occupancy, subtype, propertyType, has_lift, docs_complete }) {
  // Compute baseline
  const baseResult = runValuation(DEFAULT_BASELINE);

  // Build adjusted params
  const adjParams = {
    ...DEFAULT_BASELINE,
    age: age ?? DEFAULT_BASELINE.age,
    area: area ?? DEFAULT_BASELINE.area,
    rent: rent ?? DEFAULT_BASELINE.rent,
    floor: floor ?? DEFAULT_BASELINE.floor,
    legal: legal || DEFAULT_BASELINE.legal,
    occupancy: occupancy || DEFAULT_BASELINE.occupancy,
    propertyType: propertyType || DEFAULT_BASELINE.propertyType,
    subtype: subtype || DEFAULT_BASELINE.subtype,
    location: MARKET_TO_LOCATION[market] || DEFAULT_BASELINE.location,
    has_lift: has_lift !== undefined ? has_lift : DEFAULT_BASELINE.has_lift,
    docs_complete: docs_complete !== undefined ? docs_complete : DEFAULT_BASELINE.docs_complete,
  };

  const adjResult = runValuation(adjParams);

  // Compute deltas
  const deltas = {
    mv_base: adjResult.mv_base - baseResult.mv_base,
    resaleIndex: adjResult.resaleIndex - baseResult.resaleIndex,
    confidence: adjResult.confidence - baseResult.confidence,
    liquidityDiscount: adjResult.liquidityDiscount - baseResult.liquidityDiscount,
    timeLow: adjResult.timeLow - baseResult.timeLow,
  };

  // Build insight from explainability
  const insights = [];
  if (adjResult.positiveDrivers.length) {
    insights.push(adjResult.positiveDrivers[0].detail);
  }
  if (adjResult.negativeDrivers.length) {
    insights.push(adjResult.negativeDrivers[0].detail);
  }
  if (adjResult.policy !== baseResult.policy) {
    insights.push(`Policy changed from ${baseResult.policy} to ${adjResult.policy}`);
  }

  return {
    base: {
      mv_low: baseResult.mv_low, mv_base: baseResult.mv_base, mv_high: baseResult.mv_high,
      ri: baseResult.resaleIndex, ld: baseResult.liquidityDiscount,
      ts_low: baseResult.timeLow, ts_high: baseResult.timeHigh,
      confidence: baseResult.confidence, policy: baseResult.policy,
      distressValue: baseResult.distressValue,
    },
    adjusted: {
      mv_low: adjResult.mv_low, mv_base: adjResult.mv_base, mv_high: adjResult.mv_high,
      ri: adjResult.resaleIndex, ld: adjResult.liquidityDiscount,
      ts_low: adjResult.timeLow, ts_high: adjResult.timeHigh,
      confidence: adjResult.confidence, policy: adjResult.policy,
      distressValue: adjResult.distressValue,
      resaleBreakdown: adjResult.resaleBreakdown,
      confidenceBreakdown: adjResult.confidenceBreakdown,
      positiveDrivers: adjResult.positiveDrivers,
      negativeDrivers: adjResult.negativeDrivers,
      flags: adjResult.flags,
    },
    deltas,
    // Legacy compat
    mv_low: adjResult.mv_low, mv_high: adjResult.mv_high,
    ri: adjResult.resaleIndex,
    riDelta: deltas.resaleIndex,
    ld: adjResult.liquidityDiscount,
    ts_low: adjResult.timeLow, ts_high: adjResult.timeHigh,
    policy: adjResult.policy,
    insight: insights.join(' · ') || 'Adjust parameters to see scenario impact.',
  };
}
