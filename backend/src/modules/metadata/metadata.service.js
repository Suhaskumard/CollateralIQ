// ── Metadata Service — Master data for UI ────────────────────────────────────

export function getPropertyTypes() {
  return {
    residential: {
      label: 'Residential',
      subtypes: [
        { id: 'apartment', label: 'Apartment', fungibility: 90 },
        { id: 'villa', label: 'Villa', fungibility: 60 },
        { id: 'independent', label: 'Independent House', fungibility: 55 },
        { id: 'plot', label: 'Plot / Land', fungibility: 70 },
      ],
    },
    commercial: {
      label: 'Commercial',
      subtypes: [
        { id: 'office', label: 'Office Space', fungibility: 65 },
        { id: 'retail', label: 'Retail / Shop', fungibility: 70 },
        { id: 'warehouse', label: 'Warehouse', fungibility: 45 },
        { id: 'mixed', label: 'Mixed-Use', fungibility: 50 },
      ],
    },
    industrial: {
      label: 'Industrial',
      subtypes: [
        { id: 'factory', label: 'Factory', fungibility: 30 },
        { id: 'shed', label: 'Industrial Shed', fungibility: 25 },
        { id: 'land', label: 'Industrial Land', fungibility: 40 },
      ],
    },
  };
}

export function getLocations() {
  return [
    { id: 'koramangala',     label: 'Koramangala',      lat: 12.9352, lon: 77.6245, tier: 'prime', demand: 95 },
    { id: 'indiranagar',     label: 'Indiranagar',      lat: 12.9784, lon: 77.6408, tier: 'prime', demand: 96 },
    { id: 'hsr_layout',      label: 'HSR Layout',       lat: 12.9116, lon: 77.6474, tier: 'prime', demand: 88 },
    { id: 'whitefield',      label: 'Whitefield',       lat: 12.9698, lon: 77.7499, tier: 'mid',   demand: 82 },
    { id: 'sarjapur',        label: 'Sarjapur Road',    lat: 12.8590, lon: 77.7870, tier: 'peripheral', demand: 74 },
    { id: 'hebbal',          label: 'Hebbal',           lat: 13.0358, lon: 77.5970, tier: 'mid',   demand: 80 },
    { id: 'yelahanka',       label: 'Yelahanka',        lat: 13.1005, lon: 77.5960, tier: 'peripheral', demand: 62 },
    { id: 'electronic_city', label: 'Electronic City',  lat: 12.8399, lon: 77.6770, tier: 'mid',   demand: 70 },
    { id: 'marathahalli',    label: 'Marathahalli',     lat: 12.9591, lon: 77.7008, tier: 'mid',   demand: 76 },
    { id: 'btm_layout',      label: 'BTM Layout',       lat: 12.9166, lon: 77.6101, tier: 'mid',   demand: 84 },
    { id: 'bannerghatta',    label: 'Bannerghatta Road',lat: 12.8878, lon: 77.5960, tier: 'peripheral', demand: 58 },
    { id: 'kengeri',         label: 'Kengeri',          lat: 12.9063, lon: 77.4830, tier: 'peripheral', demand: 45 },
    { id: 'jp_nagar',        label: 'JP Nagar',         lat: 12.9070, lon: 77.5850, tier: 'mid',   demand: 78 },
    { id: 'jayanagar',       label: 'Jayanagar',        lat: 12.9250, lon: 77.5838, tier: 'prime', demand: 86 },
    { id: 'malleswaram',     label: 'Malleswaram',      lat: 13.0035, lon: 77.5695, tier: 'prime', demand: 85 },
    { id: 'rajajinagar',     label: 'Rajajinagar',      lat: 12.9880, lon: 77.5560, tier: 'mid',   demand: 79 },
  ];
}

export function getModelHealth() {
  return {
    status: 'operational',
    version: '2.0.0',
    engine: 'hybrid-3-layer',
    layers: ['rules-based-floor-cap', 'multiplicative-factor-model', 'quantile-bounds'],
    lastUpdated: '2026-05-01',
    uptime: process.uptime(),
    features: {
      marketValueBand: true,
      distressRange: true,
      resaleIndex: true,
      confidenceScore: true,
      explainability: true,
      whatIfSimulation: true,
      aiCopilot: true,
    },
  };
}
