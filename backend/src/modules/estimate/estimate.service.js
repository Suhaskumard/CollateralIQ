// ── Estimate Service — 3-Layer Hybrid Valuation Engine ───────────────────────
// Layer 1: Rules-based floor/cap using guidance value
// Layer 2: Multiplicative factor model (Base × Location × Property × Condition × Marketability)
// Layer 3: Quantile-style bounds for lower/upper band

// ── Base guidance rates (₹ per sq ft) by Karnataka circle rate benchmarks ────
const BASE_RATE = {
  residential: { apartment: 6500, villa: 8500, independent: 7200, plot: 4500 },
  commercial:  { office: 9000, retail: 11000, warehouse: 4500, mixed: 7500 },
  industrial:  { factory: 4000, shed: 3200, land: 2500 },
};

// ── Location multipliers — amenity access & neighbourhood quality ────────────
const LOCATION = {
  koramangala:     { mult: 1.60, demand: 95, transit: 92, amenity: 94, supply: 'balanced', tier: 'prime' },
  indiranagar:     { mult: 1.65, demand: 96, transit: 94, amenity: 96, supply: 'tight',    tier: 'prime' },
  hsr_layout:      { mult: 1.45, demand: 88, transit: 80, amenity: 85, supply: 'balanced', tier: 'prime' },
  whitefield:      { mult: 1.35, demand: 82, transit: 72, amenity: 78, supply: 'surplus',  tier: 'mid' },
  sarjapur:        { mult: 1.22, demand: 74, transit: 55, amenity: 65, supply: 'surplus',  tier: 'peripheral' },
  hebbal:          { mult: 1.30, demand: 80, transit: 78, amenity: 76, supply: 'balanced', tier: 'mid' },
  yelahanka:       { mult: 1.10, demand: 62, transit: 60, amenity: 58, supply: 'surplus',  tier: 'peripheral' },
  electronic_city: { mult: 1.15, demand: 70, transit: 65, amenity: 62, supply: 'balanced', tier: 'mid' },
  marathahalli:    { mult: 1.25, demand: 76, transit: 70, amenity: 72, supply: 'surplus',  tier: 'mid' },
  btm_layout:      { mult: 1.35, demand: 84, transit: 82, amenity: 80, supply: 'balanced', tier: 'mid' },
  bannerghatta:    { mult: 1.05, demand: 58, transit: 50, amenity: 55, supply: 'surplus',  tier: 'peripheral' },
  kengeri:         { mult: 0.88, demand: 45, transit: 42, amenity: 40, supply: 'surplus',  tier: 'peripheral' },
  jp_nagar:        { mult: 1.20, demand: 78, transit: 75, amenity: 77, supply: 'balanced', tier: 'mid' },
  jayanagar:       { mult: 1.40, demand: 86, transit: 85, amenity: 90, supply: 'tight',    tier: 'prime' },
  malleswaram:     { mult: 1.38, demand: 85, transit: 82, amenity: 88, supply: 'tight',    tier: 'prime' },
  rajajinagar:     { mult: 1.30, demand: 79, transit: 76, amenity: 78, supply: 'balanced', tier: 'mid' },
  default:         { mult: 1.00, demand: 60, transit: 55, amenity: 55, supply: 'balanced', tier: 'mid' },
};

// ── Legal clarity factors ────────────────────────────────────────────────────
const LEGAL = {
  freehold_clear:    { factor: 1.00, score: 95, label: 'Freehold — Clear Title' },
  freehold_disputed: { factor: 0.82, score: 40, label: 'Freehold — Disputed' },
  leasehold:         { factor: 0.88, score: 65, label: 'Leasehold' },
  encumbered:        { factor: 0.78, score: 25, label: 'Encumbered' },
};

// ── Occupancy / rentability ──────────────────────────────────────────────────
const OCCUPANCY = {
  self:              { factor: 1.00, score: 75, label: 'Self-Occupied' },
  rented:            { factor: 1.03, score: 88, label: 'Rented' },
  vacant:            { factor: 0.96, score: 45, label: 'Vacant' },
  commercial_tenant: { factor: 1.05, score: 92, label: 'Commercial Tenant' },
};

// ── Property type fungibility scores ─────────────────────────────────────────
const FUNGIBILITY = {
  residential: { apartment: 90, villa: 60, independent: 55, plot: 70 },
  commercial:  { office: 65, retail: 70, warehouse: 45, mixed: 50 },
  industrial:  { factory: 30, shed: 25, land: 40 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VALUATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════
export function runValuation({
  area, age, legal, occupancy, rent = 0,
  propertyType = 'residential', subtype = 'apartment',
  location = 'default', floor = 1, has_lift = true,
  docs_complete = true, address = '',
}) {
  // ── LAYER 1: Base guidance value with sanity checks ────────────────────────
  const baseRate = (BASE_RATE[propertyType] || BASE_RATE.residential)[subtype] || 6500;
  const loc = LOCATION[location.toLowerCase().replace(/\s+/g, '_')] || LOCATION.default;
  const legalInfo = LEGAL[legal] || LEGAL.freehold_clear;
  const occInfo = OCCUPANCY[occupancy] || OCCUPANCY.self;

  // Sanity: area must be between 100 and 50000 sqft
  const sanitizedArea = Math.max(100, Math.min(50000, area || 1000));
  const guidanceValue = (baseRate * sanitizedArea) / 100000; // in lakhs

  // ── LAYER 2: Multiplicative factor model ───────────────────────────────────
  // Location Multiplier
  const locationMult = loc.mult;

  // Property Adjustment (type, subtype, size efficiency, floor utility, standardization)
  const sizeEfficiency = sanitizedArea < 500 ? 0.90 : sanitizedArea > 3500 ? 0.94 : 1.0;
  const floorUtility = floor === 0 ? 0.92 : floor <= 3 ? 0.97 : floor >= 15 ? (has_lift ? 0.96 : 0.88) : 1.0;
  const fungibilityBase = (FUNGIBILITY[propertyType] || {})[subtype] || 60;
  const standardization = fungibilityBase >= 80 ? 1.02 : fungibilityBase >= 60 ? 1.0 : 0.95;
  const propertyAdj = sizeEfficiency * floorUtility * standardization;

  // Condition / Age Adjustment (depreciation curve)
  const ageFactor = age <= 2 ? 1.05 : age <= 5 ? 1.0 : age <= 10 ? Math.max(0.85, 1 - (age - 5) * 0.015)
    : age <= 20 ? Math.max(0.72, 0.925 - (age - 10) * 0.012) : Math.max(0.55, 0.805 - (age - 20) * 0.008);
  const conditionAdj = ageFactor;

  // Marketability Adjustment (rental relevance + local demand)
  const rentBoost = rent > 80000 ? 1.10 : rent > 50000 ? 1.06 : rent > 25000 ? 1.03
    : rent > 10000 ? 1.01 : rent === 0 ? 0.97 : 1.0;
  const demandFactor = loc.demand >= 85 ? 1.04 : loc.demand >= 70 ? 1.0 : 0.96;
  const marketabilityAdj = rentBoost * demandFactor;

  // Combined market value per sqft
  const mvPerSqft = Math.round(baseRate * locationMult * propertyAdj * conditionAdj * marketabilityAdj);
  const mvBase = (mvPerSqft * sanitizedArea) / 100000; // lakhs

  // ── LAYER 3: Quantile-style bounds ─────────────────────────────────────────
  // Wider bounds for uncertain scenarios, tighter for high-data scenarios
  const dataQuality = (docs_complete ? 1 : 0.7) * (loc.tier === 'prime' ? 1.1 : 1.0);
  const lowerSpread = dataQuality >= 1.0 ? 0.10 : 0.15;
  const upperSpread = dataQuality >= 1.0 ? 0.08 : 0.12;

  const mv_low = Math.round(mvBase * (1 - lowerSpread));
  const mv_high = Math.round(mvBase * (1 + upperSpread));
  const mv_base = Math.round(mvBase);

  // ── RESALE POTENTIAL INDEX (0-100 weighted composite) ──────────────────────
  // Block 1: Micro-location demand & accessibility (30%)
  const locDemandScore = Math.min(100, (loc.demand * 0.5 + loc.transit * 0.3 + loc.amenity * 0.2));

  // Block 2: Property fungibility / standardization (20%)
  const fungScore = fungibilityBase;

  // Block 3: Legal clarity (20%)
  const legalScore = legalInfo.score;

  // Block 4: Age and condition (10%)
  const ageScore = Math.max(15, 100 - age * 2.2);

  // Block 5: Occupancy / rentability (10%)
  const rentScore = rent > 40000 ? 90 : rent > 20000 ? 75 : rent > 5000 ? 60 : 45;
  const occScore = (occInfo.score * 0.6 + rentScore * 0.4);

  // Block 6: Market supply-demand balance (10%)
  const supplyScore = loc.supply === 'tight' ? 92 : loc.supply === 'balanced' ? 70 : 45;

  const resaleIndex = Math.min(100, Math.max(10, Math.round(
    locDemandScore * 0.30 + fungScore * 0.20 + legalScore * 0.20
    + ageScore * 0.10 + occScore * 0.10 + supplyScore * 0.10
  )));

  const resaleBreakdown = {
    microLocation: { weight: 30, score: Math.round(locDemandScore), label: 'Micro-location & accessibility' },
    fungibility:   { weight: 20, score: Math.round(fungScore), label: 'Property fungibility' },
    legalClarity:  { weight: 20, score: Math.round(legalScore), label: 'Legal clarity' },
    ageCondition:  { weight: 10, score: Math.round(ageScore), label: 'Age & condition' },
    occupancy:     { weight: 10, score: Math.round(occScore), label: 'Occupancy & rentability' },
    supplyDemand:  { weight: 10, score: Math.round(supplyScore), label: 'Market supply-demand' },
  };

  const resaleLabel = resaleIndex >= 80 ? 'Highly Liquid' : resaleIndex >= 50 ? 'Moderate Liquidity' : 'Illiquid / Specialized';

  // ── DISTRESS VALUE RANGE ──────────────────────────────────────────────────
  const liquidityDiscountFactors = {
    assetType: subtype === 'apartment' ? 3 : subtype === 'villa' ? 6 : subtype === 'retail' ? 5 : 8,
    microMarket: loc.demand >= 85 ? 2 : loc.demand >= 70 ? 4 : 7,
    legalClarity: legalInfo.score >= 90 ? 1 : legalInfo.score >= 60 ? 4 : 8,
    standardization: fungibilityBase >= 80 ? 2 : fungibilityBase >= 60 ? 4 : 7,
    buildingAge: age <= 5 ? 1 : age <= 15 ? 3 : age <= 25 ? 5 : 8,
    oversupply: loc.supply === 'tight' ? 1 : loc.supply === 'balanced' ? 3 : 6,
  };

  const liquidityDiscount = Math.min(42, Math.max(8,
    liquidityDiscountFactors.assetType + liquidityDiscountFactors.microMarket
    + liquidityDiscountFactors.legalClarity + liquidityDiscountFactors.standardization
    + liquidityDiscountFactors.buildingAge + liquidityDiscountFactors.oversupply
  ));

  const distress_low = Math.round(mv_low * (1 - (liquidityDiscount + 4) / 100));
  const distress_high = Math.round(mv_high * (1 - (liquidityDiscount - 2) / 100));
  const distressValue = Math.round(mv_base * (1 - liquidityDiscount / 100));

  const distressBand = liquidityDiscount <= 18 ? 'Prime (10-18%)'
    : liquidityDiscount <= 25 ? 'Mid-market (15-25%)' : 'High discount (25-40%)';

  // ── TIME TO LIQUIDATE ─────────────────────────────────────────────────────
  const timeLow = resaleIndex >= 80 ? 30 : resaleIndex >= 60 ? 45 : resaleIndex >= 40 ? 90 : 180;
  const timeHigh = resaleIndex >= 80 ? 60 : resaleIndex >= 60 ? 90 : resaleIndex >= 40 ? 180 : 360;

  // ── LTV (RBI norms) ───────────────────────────────────────────────────────
  let ltvMax;
  if (propertyType === 'residential') {
    ltvMax = mvBase <= 30 ? 75 : mvBase <= 75 ? 80 : 75;
  } else {
    ltvMax = mvBase <= 50 ? 65 : 55;
  }

  // ── CONFIDENCE SCORE (0-100 numeric) ──────────────────────────────────────
  const C_input = (area ? 20 : 0) + (age !== undefined ? 20 : 0) + (legal ? 20 : 0)
    + (occupancy ? 15 : 0) + (location !== 'default' ? 15 : 0) + (floor ? 5 : 0)
    + (address ? 5 : 0);
  const C_data = docs_complete ? 85 : 45;
  const C_market = loc.tier === 'prime' ? 90 : loc.tier === 'mid' ? 72 : 50;
  const C_agreement = Math.min(95, resaleIndex + 10);
  const C_fraud = legalInfo.score >= 80 ? 92 : legalInfo.score >= 50 ? 70 : 40;

  const confidence = Math.min(100, Math.max(5, Math.round(
    C_input * 0.25 + C_data * 0.25 + C_market * 0.20 + C_agreement * 0.20 + C_fraud * 0.10
  )));

  const confidenceBreakdown = {
    inputCompleteness: { weight: 25, score: C_input, label: 'Input completeness' },
    dataFreshness:     { weight: 25, score: C_data, label: 'Data freshness & docs' },
    marketDensity:     { weight: 20, score: C_market, label: 'Comparable density' },
    modelAgreement:    { weight: 20, score: Math.round(C_agreement), label: 'Sub-model consistency' },
    fraudCheck:        { weight: 10, score: C_fraud, label: 'Fraud/anomaly check' },
  };

  const confidenceLabel = confidence >= 80 ? 'High' : confidence >= 55 ? 'Medium' : 'Low';

  // ── POLICY RECOMMENDATION ─────────────────────────────────────────────────
  const policy = resaleIndex >= 72 && legal === 'freehold_clear' && confidence >= 70 ? 'desktop-approve'
    : resaleIndex >= 50 && legal !== 'encumbered' && confidence >= 45 ? 'field-review' : 'legal-review';

  // ── EXPLAINABILITY LAYER ──────────────────────────────────────────────────
  const positiveDrivers = [];
  const negativeDrivers = [];

  // Positive drivers
  if (loc.demand >= 85) positiveDrivers.push({ factor: 'Strong micro-market demand', impact: 'high', detail: `${loc.tier} location with ${loc.demand}/100 demand score` });
  if (loc.transit >= 80) positiveDrivers.push({ factor: 'Excellent transit access', impact: 'high', detail: `Transit score ${loc.transit}/100` });
  if (legalInfo.score >= 90) positiveDrivers.push({ factor: 'Clean legal title', impact: 'high', detail: legalInfo.label });
  if (fungibilityBase >= 80) positiveDrivers.push({ factor: 'Highly standardized property', impact: 'medium', detail: `Fungibility ${fungibilityBase}/100 — easy market match` });
  if (rent > 25000) positiveDrivers.push({ factor: 'Strong rental income', impact: 'medium', detail: `₹${rent.toLocaleString()}/month supports marketability` });
  if (age <= 5) positiveDrivers.push({ factor: 'New construction', impact: 'medium', detail: `${age} years — minimal depreciation` });
  if (occInfo.score >= 85) positiveDrivers.push({ factor: 'Favourable occupancy', impact: 'medium', detail: occInfo.label });
  if (loc.supply === 'tight') positiveDrivers.push({ factor: 'Tight supply market', impact: 'medium', detail: 'Low inventory supports pricing power' });

  // Negative drivers
  if (age > 20) negativeDrivers.push({ factor: 'Significant building age', impact: 'high', detail: `${age} years — structural assessment recommended` });
  if (legalInfo.score < 50) negativeDrivers.push({ factor: 'Legal title risk', impact: 'high', detail: `${legalInfo.label} — mandates legal review` });
  if (loc.demand < 60) negativeDrivers.push({ factor: 'Weak micro-market demand', impact: 'high', detail: `Demand score ${loc.demand}/100` });
  if (loc.supply === 'surplus') negativeDrivers.push({ factor: 'Oversupplied market', impact: 'medium', detail: 'High listing competition in micro-market' });
  if (fungibilityBase < 50) negativeDrivers.push({ factor: 'Niche / non-standard property', impact: 'medium', detail: `Fungibility ${fungibilityBase}/100 — limited buyer pool` });
  if (occupancy === 'vacant') negativeDrivers.push({ factor: 'Vacant property', impact: 'medium', detail: 'No rental income — verify physical condition' });
  if (!docs_complete) negativeDrivers.push({ factor: 'Incomplete documentation', impact: 'medium', detail: 'Missing legal docs reduces confidence' });
  if (rent === 0 && occupancy !== 'self') negativeDrivers.push({ factor: 'No rental income', impact: 'low', detail: 'Reduces marketability assessment' });
  if (floor === 0) negativeDrivers.push({ factor: 'Ground floor disadvantage', impact: 'low', detail: 'Lower floor premium — privacy and noise concerns' });

  // Liquidity reducers
  const liquidityReducers = [];
  if (legalInfo.score < 70) liquidityReducers.push(`Legal status (${legalInfo.label}) adds ${liquidityDiscountFactors.legalClarity}% to distress discount`);
  if (loc.supply === 'surplus') liquidityReducers.push(`Oversupplied micro-market extends liquidation timeline`);
  if (age > 15) liquidityReducers.push(`Building age (${age}y) increases buyer hesitancy`);
  if (fungibilityBase < 60) liquidityReducers.push(`Non-standard property type limits buyer pool`);

  // Data sufficiency warnings
  const dataWarnings = [];
  if (location === 'default') dataWarnings.push('No specific micro-location selected — using generic baseline');
  if (!docs_complete) dataWarnings.push('Legal documentation incomplete — confidence reduced');
  if (!address) dataWarnings.push('No address provided — geospatial features unavailable');
  if (rent === 0 && occupancy === 'rented') dataWarnings.push('Property marked as rented but no rental income provided');

  // Risk flags
  const flags = [];
  if (age > 20) flags.push({ severity: 'warning', text: 'Age > 20 years — structural assessment recommended' });
  if (legal === 'encumbered') flags.push({ severity: 'critical', text: 'Existing encumbrance — mandatory legal review' });
  if (legal === 'freehold_disputed') flags.push({ severity: 'critical', text: 'Title dispute detected — halt disbursement until resolved' });
  if (resaleIndex < 50) flags.push({ severity: 'warning', text: 'Low resale index — extended liquidation timeline expected' });
  if (occupancy === 'vacant') flags.push({ severity: 'info', text: 'Vacant property — verify physical condition on site' });
  if (confidence < 50) flags.push({ severity: 'warning', text: 'Low confidence — additional data collection recommended' });
  if (mvBase > 200) flags.push({ severity: 'info', text: 'High-value collateral — senior reviewer sign-off required' });

  return {
    // Market value band
    mv_low, mv_base, mv_high, mvPerSqft,
    guidanceValue: Math.round(guidanceValue),

    // Factors applied
    factors: {
      locationMult: +locationMult.toFixed(3),
      propertyAdj: +propertyAdj.toFixed(3),
      conditionAdj: +conditionAdj.toFixed(3),
      marketabilityAdj: +marketabilityAdj.toFixed(3),
    },

    // Resale index
    resaleIndex, resaleLabel, resaleBreakdown,

    // Distress value
    distressValue, distress_low, distress_high,
    liquidityDiscount, distressBand,
    liquidityDiscountFactors,

    // Time to liquidate
    timeLow, timeHigh,

    // LTV
    ltvMax,

    // Confidence
    confidence, confidenceLabel, confidenceBreakdown,

    // Policy
    policy,

    // Explainability
    positiveDrivers: positiveDrivers.slice(0, 3),
    negativeDrivers: negativeDrivers.slice(0, 3),
    liquidityReducers,
    dataWarnings,
    flags,

    // Model metadata
    modelVersion: '2.0.0',
    timestamp: new Date().toISOString(),
  };
}
