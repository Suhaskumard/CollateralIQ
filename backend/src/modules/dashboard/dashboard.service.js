import { getAllCases } from '../portfolio/portfolio.service.js';

function normalizeConf(c) {
  if (typeof c === 'number') return c;
  if (c === 'high') return 85;
  if (c === 'medium') return 60;
  if (c === 'low') return 35;
  return 60;
}

export async function getMetricsService() {
  const cases = await getAllCases();
  cases.forEach(c => { c.confidence = normalizeConf(c.confidence); });
  const total = cases.length;

  const avgLtv = total
    ? Math.round(cases.reduce((s, c) => s + (c.ltvMax || 65), 0) / total)
    : 65;

  const avgRi = total
    ? Math.round(cases.reduce((s, c) => s + (c.resaleIndex || 72), 0) / total)
    : 72;

  const avgConfidence = total
    ? Math.round(cases.reduce((s, c) => s + (c.confidence || 60), 0) / total)
    : 60;

  const risk = { high: 0, medium: 0, low: 0 };
  cases.forEach(({ resaleIndex: ri = 72 }) => {
    if (ri >= 75)      risk.low++;
    else if (ri >= 55) risk.medium++;
    else               risk.high++;
  });

  const policyDist = { 'desktop-approve': 0, 'field-review': 0, 'legal-review': 0 };
  cases.forEach(({ policy = 'field-review' }) => {
    policyDist[policy] = (policyDist[policy] || 0) + 1;
  });

  const confidenceDist = { high: 0, medium: 0, low: 0 };
  cases.forEach(({ confidence = 60 }) => {
    if (confidence >= 75) confidenceDist.high++;
    else if (confidence >= 50) confidenceDist.medium++;
    else confidenceDist.low++;
  });

  // Location heatmap data
  const locationMap = {};
  cases.forEach(c => {
    const loc = c.location || c.address || 'Unknown';
    if (!locationMap[loc]) locationMap[loc] = { count: 0, totalRi: 0, totalMv: 0 };
    locationMap[loc].count++;
    locationMap[loc].totalRi += (c.resaleIndex || 72);
    locationMap[loc].totalMv += (c.mv_base || c.mv_low || 0);
  });
  const locationSummary = Object.entries(locationMap).map(([loc, d]) => ({
    location: loc, cases: d.count,
    avgRi: Math.round(d.totalRi / d.count),
    totalMv: Math.round(d.totalMv),
  })).sort((a, b) => b.cases - a.cases).slice(0, 8);

  // Top attention-needed cases (low RI or low confidence)
  const attentionCases = [...cases]
    .filter(c => (c.resaleIndex || 72) < 55 || (c.confidence || 60) < 50 || c.policy === 'legal-review')
    .sort((a, b) => (a.resaleIndex || 72) - (b.resaleIndex || 72))
    .slice(0, 5);

  // Portfolio value distribution
  const valueBands = { '<25L': 0, '25-50L': 0, '50-100L': 0, '100-200L': 0, '>200L': 0 };
  cases.forEach(c => {
    const mv = c.mv_base || c.mv_low || 0;
    if (mv < 25) valueBands['<25L']++;
    else if (mv < 50) valueBands['25-50L']++;
    else if (mv < 100) valueBands['50-100L']++;
    else if (mv < 200) valueBands['100-200L']++;
    else valueBands['>200L']++;
  });

  const recentCases = [...cases]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const totalPortfolioValue = cases.reduce((s, c) => s + (c.mv_base || c.mv_low || 0), 0);

  return {
    totalCases: total,
    avgLtv,
    avgResaleIndex: avgRi,
    avgConfidence,
    riskDistribution: risk,
    policyDistribution: policyDist,
    confidenceDistribution: confidenceDist,
    locationSummary,
    attentionCases,
    valueBands,
    recentCases,
    totalPortfolioValue: Math.round(totalPortfolioValue),
    portfolioHealth: avgRi >= 70 ? 'strong' : avgRi >= 55 ? 'moderate' : 'weak',
  };
}
