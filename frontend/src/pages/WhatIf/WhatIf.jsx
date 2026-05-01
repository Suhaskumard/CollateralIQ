import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../services/api.js';

const DEFAULTS = { age: 8, area: 1250, rent: 32000, floor: 5, legal: 'freehold_clear', market: 'mid' };
const BASE = { mv_low: 95, mv_high: 115, ri: 72, ld: 19, ts_low: 45, ts_high: 90 };

export default function WhatIf() {
  const [params, setParams] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const debounceRef = useRef(null);

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const analyze = useCallback(async (p) => {
    try { setResult(await api.analyzeWhatIf(p)); } catch {}
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyze(params), 200);
  }, [params, analyze]);

  const ri    = result?.ri    ?? BASE.ri;
  const riDelta = result?.riDelta ?? 0;
  const mvLow = result?.mv_low ?? BASE.mv_low;
  const mvHigh= result?.mv_high ?? BASE.mv_high;
  const ld    = result?.ld    ?? BASE.ld;
  const tsLow = result?.ts_low ?? BASE.ts_low;
  const tsHigh= result?.ts_high ?? BASE.ts_high;
  const policy= result?.policy ?? 'field-review';
  const insight = result?.insight ?? 'Adjust sliders to see scenario impact.';

  const rows = [
    { label: 'Market Value', baseVal: `₹${BASE.mv_low}L–₹${BASE.mv_high}L`, adjVal: `₹${mvLow}L–₹${mvHigh}L`, better: mvLow >= BASE.mv_low },
    { label: 'Resale Index', baseVal: BASE.ri, adjVal: ri, better: ri >= BASE.ri, delta: `${riDelta >= 0 ? '+' : ''}${riDelta} vs base` },
    { label: 'Liquidity Discount', baseVal: `${BASE.ld}%`, adjVal: `${ld}%`, better: ld <= BASE.ld },
    { label: 'Time to Sell', baseVal: `${BASE.ts_low}–${BASE.ts_high}d`, adjVal: `${tsLow}–${tsHigh}d`, better: tsLow <= BASE.ts_low },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Scenario Analysis</div>
        <div className="page-title">What-If Simulator</div>
        <div className="page-desc">Adjust parameters and see how collateral metrics change in real time</div>
      </div>

      <div className="whatif-grid">
        {/* Controls */}
        <div className="scenario-card">
          <div className="scenario-header"><div className="scenario-title">⚙ Parameter Controls</div></div>
          <div className="scenario-body">
            {[
              { k: 'age',   label: 'Property Age (years)', min: 1, max: 40, step: 1 },
              { k: 'area',  label: 'Area (sq ft)',          min: 300, max: 5000, step: 50 },
              { k: 'rent',  label: 'Monthly Rent (₹)',      min: 0, max: 150000, step: 1000, fmt: v => `₹${Number(v).toLocaleString()}` },
              { k: 'floor', label: 'Floor Level',           min: 0, max: 30, step: 1 },
            ].map(({ k, label, min, max, step, fmt }) => (
              <div className="slider-group" key={k}>
                <label>{label} <span>{fmt ? fmt(params[k]) : params[k]}</span></label>
                <input type="range" min={min} max={max} step={step} value={params[k]}
                  onChange={e => set(k, +e.target.value)} />
              </div>
            ))}

            <div className="fg">
              <label>Legal Status</label>
              <select value={params.legal} onChange={e => set('legal', e.target.value)}>
                <option value="freehold_clear">Freehold — Clear Title</option>
                <option value="freehold_disputed">Freehold — Disputed</option>
                <option value="leasehold">Leasehold</option>
                <option value="encumbered">Encumbered</option>
              </select>
            </div>
            <div className="fg">
              <label>Micro-market</label>
              <select value={params.market} onChange={e => set('market', e.target.value)}>
                <option value="prime">Prime (Koramangala, Indiranagar)</option>
                <option value="mid">Mid-market (Whitefield, HSR)</option>
                <option value="peripheral">Peripheral (Sarjapur, Hennur)</option>
                <option value="distressed">Distressed / Oversupplied</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Output */}
        <div className="scenario-card">
          <div className="scenario-header"><div className="scenario-title">📊 Live Scenario Output</div></div>
          <div className="scenario-body">
            <div className="comparison-grid">
              {rows.map(({ label, baseVal, adjVal, better, delta }) => (
                <>
                  <div className="comp-cell base" key={label + '_b'}>
                    <div className="comp-label">{label} (Base)</div>
                    <div className="comp-val">{baseVal}</div>
                  </div>
                  <div className="comp-cell" key={label + '_a'}>
                    <div className="comp-label">{label} (Adjusted)</div>
                    <div className={`comp-val ${better ? 'better' : 'worse'}`}>{adjVal}</div>
                    {delta && <div className="delta-badge">{delta}</div>}
                  </div>
                </>
              ))}
            </div>

            <div className="r-card mt-12">
              <div className="r-tag">Policy Recommendation</div>
              <span className={`policy-pill policy-${policy === 'desktop-approve' ? 'desktop' : policy === 'field-review' ? 'field' : 'legal'}`}>
                {policy.replace(/-/g, ' ').toUpperCase()}
              </span>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '10px', lineHeight: 1.5 }}>
                {insight}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
