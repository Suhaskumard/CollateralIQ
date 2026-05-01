import { getAllCases } from '../portfolio/portfolio.service.js';

export async function getMetricsService() {
  const cases = await getAllCases();
  const total = cases.length;

  const avgLtv = total
    ? Math.round(cases.reduce((s, c) => s + (c.ltvMax || 65), 0) / total)
    : 65;

  const avgRi = total
    ? Math.round(cases.reduce((s, c) => s + (c.resaleIndex || 72), 0) / total)
    : 72;

  const risk = { high: 0, medium: 0, low: 0 };
  cases.forEach(({ resaleIndex: ri = 72 }) => {
    if (ri >= 75)      risk.low++;
    else if (ri >= 55) risk.medium++;
    else               risk.high++;
  });

  const recentCases = [...cases]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    totalCases: total,
    avgLtv,
    avgResaleIndex: avgRi,
    riskDistribution: risk,
    recentCases,
    portfolioHealth: avgRi >= 70 ? 'strong' : avgRi >= 55 ? 'moderate' : 'weak',
  };
}
