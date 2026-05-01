// ── What-If Scenario Service ──────────────────────────────────────────────────
// Deterministic sensitivity engine. No AI required — runs in microseconds.

const BASE = { mv_low: 95, mv_high: 115, ri: 72, ld: 19, ts_low: 45, ts_high: 90 };

const LEGAL_FACTOR  = { freehold_clear: 1.0, freehold_disputed: 0.85, leasehold: 0.90, encumbered: 0.80 };
const MARKET_FACTOR = { prime: 1.35, mid: 1.0, peripheral: 0.78, distressed: 0.60 };
const LEGAL_RI      = { freehold_clear: 5, freehold_disputed: -15, leasehold: -8, encumbered: -18 };
const MARKET_RI     = { prime: 12, mid: 0, peripheral: -10, distressed: -22 };

const LEGAL_INSIGHT = {
  freehold_clear:    'Clear freehold title maximises liquidity.',
  freehold_disputed: '⚠ Title dispute significantly reduces resale index — legal review warranted.',
  leasehold:         'Leasehold reduces collateral quality — verify residual tenure.',
  encumbered:        '⚠ Encumbrance flag: existing lien detected. Legal review mandatory.',
};
const MARKET_INSIGHT = {
  prime:      'Prime micro-market supports strong exit liquidity.',
  mid:        'Mid-market location with adequate demand depth.',
  peripheral: 'Peripheral location — expect longer liquidation window.',
  distressed: '⚠ Distressed / oversupplied area — high liquidation risk.',
};

export function analyzeScenario({ age, area, rent, floor, legal, market }) {
  const total = (1 - Math.max(0, (age - 5) * 0.012))
    * (area < 600 ? 0.88 : area > 3000 ? 0.94 : 1.0)
    * (floor === 0 ? 0.94 : floor <= 3 ? 0.97 : floor >= 15 ? 0.95 : 1.0)
    * (rent > 50000 ? 1.06 : rent > 25000 ? 1.02 : rent === 0 ? 0.96 : 1.0)
    * (LEGAL_FACTOR[legal]  || 1.0)
    * (MARKET_FACTOR[market] || 1.0);

  const mv_low  = Math.round(BASE.mv_low  * total);
  const mv_high = Math.round(BASE.mv_high * total);

  const ri = Math.min(100, Math.max(15,
    BASE.ri + (LEGAL_RI[legal] || 0) + (MARKET_RI[market] || 0) - Math.max(0, (age - 10) * 0.5)
  ));

  const ld     = ri >= 80 ? 12 : ri >= 65 ? 19 : ri >= 50 ? 26 : 36;
  const ts_low = ri >= 80 ? 30 : ri >= 60 ? 45 : 90;
  const ts_high= ri >= 80 ? 60 : ri >= 60 ? 90 : 180;

  const policy = ri >= 72 && legal === 'freehold_clear' ? 'desktop-approve'
    : ri >= 55 && legal !== 'encumbered' ? 'field-review' : 'legal-review';

  return {
    mv_low, mv_high,
    ri: Math.round(ri), riDelta: Math.round(ri - BASE.ri),
    ld, ts_low, ts_high, policy,
    insight: `${LEGAL_INSIGHT[legal] || ''} ${MARKET_INSIGHT[market] || ''}`.trim(),
    base: BASE,
  };
}
