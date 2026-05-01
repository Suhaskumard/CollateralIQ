// ── Estimate Service ──────────────────────────────────────────────────────────
// Hedonic valuation model based on Karnataka circle rates and RBI LTV norms.

const BASE_RATE = {
  residential: { apartment: 6500, villa: 8500, independent: 7200, plot: 4500 },
  commercial:  { office: 9000, retail: 11000, warehouse: 4500, mixed: 7500 },
  industrial:  { factory: 4000, shed: 3200, land: 2500 },
};

const LOCATION = {
  koramangala: 1.60, indiranagar: 1.65, hsr_layout: 1.45, whitefield: 1.35,
  sarjapur: 1.22,    hebbal: 1.30,       yelahanka: 1.10,  electronic_city: 1.15,
  marathahalli: 1.25, btm_layout: 1.35,  bannerghatta: 1.05, kengeri: 0.88,
  jp_nagar: 1.20,    jayanagar: 1.40,    malleswaram: 1.38, rajajinagar: 1.30,
  default: 1.0,
};

const LEGAL = { freehold_clear: 1.00, freehold_disputed: 0.82, leasehold: 0.88, encumbered: 0.78 };
const OCCUPANCY = { self: 1.0, rented: 1.03, vacant: 0.96, commercial_tenant: 1.05 };

export function runValuation({ area, age, legal, occupancy, rent = 0, propertyType = 'residential', subtype = 'apartment', location = 'default' }) {
  const baseRate   = (BASE_RATE[propertyType] || BASE_RATE.residential)[subtype] || 6500;
  const locFactor  = LOCATION[location.toLowerCase().replace(/\s+/g, '_')] || LOCATION.default;
  const ageFactor  = age <= 5 ? 1.0 : Math.max(0.60, 1 - (age - 5) * 0.012);
  const legalFactor   = LEGAL[legal]     || 1.0;
  const occupancyFactor = OCCUPANCY[occupancy] || 1.0;
  const rentBoost  = rent > 50000 ? 1.06 : rent > 25000 ? 1.02 : rent === 0 ? 0.97 : 1.0;

  const mvPerSqft  = Math.round(baseRate * locFactor * ageFactor * legalFactor * occupancyFactor * rentBoost);
  const mvLakhs    = (mvPerSqft * area) / 100000;
  const mv_low     = Math.round(mvLakhs * 0.92);
  const mv_high    = Math.round(mvLakhs * 1.08);

  // Resale Index
  const locScore      = Math.min(100, locFactor * 62);
  const legalScore    = legal === 'freehold_clear' ? 95 : legal === 'leasehold' ? 72 : legal === 'freehold_disputed' ? 55 : 40;
  const ageScore      = Math.max(20, 100 - age * 1.8);
  const rentalScore   = rent > 40000 ? 90 : rent > 20000 ? 75 : rent > 0 ? 60 : 50;
  const occScore      = occupancy === 'rented' ? 85 : occupancy === 'self' ? 80 : 60;

  const resaleIndex   = Math.min(100, Math.max(15, Math.round(
    locScore * 0.30 + legalScore * 0.20 + ageScore * 0.20 + rentalScore * 0.10 + occScore * 0.10 + 70 * 0.10
  )));

  const liquidityDiscount = resaleIndex >= 80 ? 12 : resaleIndex >= 65 ? 19 : resaleIndex >= 50 ? 26 : 36;
  const timeLow  = resaleIndex >= 80 ? 30  : resaleIndex >= 65 ? 45  : 90;
  const timeHigh = resaleIndex >= 80 ? 60  : resaleIndex >= 65 ? 90  : 180;
  const distressValue = Math.round(mv_low * (1 - liquidityDiscount / 100));
  const ltvMax   = mvLakhs <= 30 ? 75 : mvLakhs <= 75 ? 80 : 75;

  const policy = resaleIndex >= 72 && legal === 'freehold_clear' ? 'desktop-approve'
    : resaleIndex >= 55 && legal !== 'encumbered' ? 'field-review' : 'legal-review';

  const confidence = legal === 'freehold_clear' && age < 15 ? 'high'
    : legal === 'encumbered' || age > 25 ? 'low' : 'medium';

  const flags = [];
  if (age > 20)                       flags.push('Age > 20 years — structural assessment recommended');
  if (legal === 'encumbered')         flags.push('Existing encumbrance — mandatory legal review');
  if (legal === 'freehold_disputed')  flags.push('Title dispute detected — halt disbursement until resolved');
  if (resaleIndex < 55)               flags.push('Low resale index — extended liquidation timeline expected');
  if (occupancy === 'vacant')         flags.push('Vacant property — verify physical condition');

  return { mv_low, mv_high, mvPerSqft, resaleIndex, liquidityDiscount, timeLow, timeHigh, distressValue, ltvMax, policy, confidence, flags };
}
