import { useApp } from '../../context/AppContext.jsx';

// ── SVG Gauge Component ──────────────────────────────────────────────────────
function Gauge({ value, max = 100, label, sublabel, color, size = 120 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct * 0.75); // 270° arc
  return (
    <div className="gauge-wrap" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="gauge-svg">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border2)" strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round"
          transform={`rotate(135 ${size/2} ${size/2})`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${circ * 0.75 * pct} ${circ}`} strokeLinecap="round"
          transform={`rotate(135 ${size/2} ${size/2})`} className="gauge-fill" />
      </svg>
      <div className="gauge-center">
        <div className="gauge-value" style={{ color }}>{value}</div>
        <div className="gauge-label">{label}</div>
      </div>
      {sublabel && <div className="gauge-sub">{sublabel}</div>}
    </div>
  );
}

// ── Horizontal Bar ───────────────────────────────────────────────────────────
function HBar({ label, score, max = 100, color }) {
  return (
    <div className="hbar-row">
      <div className="hbar-label">{label}</div>
      <div className="hbar-track">
        <div className="hbar-fill" style={{ width: `${(score / max) * 100}%`, background: color }} />
      </div>
      <div className="hbar-score" style={{ color }}>{score}</div>
    </div>
  );
}

// ── Driver Chip ──────────────────────────────────────────────────────────────
function DriverChip({ factor, impact, detail, positive }) {
  const cls = positive ? 'driver-chip positive' : 'driver-chip negative';
  return (
    <div className={cls}>
      <div className="chip-icon">{positive ? '▲' : '▼'}</div>
      <div className="chip-body">
        <div className="chip-factor">{factor}</div>
        <div className="chip-detail">{detail}</div>
      </div>
      <div className={`chip-impact impact-${impact}`}>{impact}</div>
    </div>
  );
}

export default function Results({ navigate }) {
  const { lastValuation: r } = useApp();

  if (!r) {
    return (
      <div className="empty-state" style={{ marginTop: '80px' }}>
        <span className="icon">◉</span>
        <p>No valuation results yet.</p>
        <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>Run a valuation estimate to see the full results dashboard</p>
        <button className="topbar-btn" style={{ marginTop: '16px' }} onClick={() => navigate('estimate')}>⬡ Run Valuation</button>
      </div>
    );
  }

  const riColor = r.resaleIndex >= 75 ? 'var(--green)' : r.resaleIndex >= 50 ? 'var(--amber)' : 'var(--red)';
  const confColor = r.confidence >= 75 ? 'var(--green)' : r.confidence >= 50 ? 'var(--amber)' : 'var(--red)';

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Collateral Assessment Report · {r.modelVersion}</div>
        <div className="page-title">Results Dashboard</div>
        <div className="page-desc">{r.address || 'Property'} · {r.propertyType}/{r.subtype} · {r.area} sqft · {r.age}y</div>
      </div>

      {/* ── Policy Banner ──────────────────────────────────────────────── */}
      <div className={`policy-banner policy-banner-${r.policy === 'desktop-approve' ? 'green' : r.policy === 'field-review' ? 'amber' : 'red'}`}>
        <div className="policy-banner-left">
          <span className="policy-banner-icon">{r.policy === 'desktop-approve' ? '✓' : r.policy === 'field-review' ? '⚡' : '⚠'}</span>
          <div>
            <div className="policy-banner-title">{r.policy?.replace(/-/g, ' ').toUpperCase()}</div>
            <div className="policy-banner-sub">{r.policy === 'desktop-approve' ? 'Automated approval eligible' : r.policy === 'field-review' ? 'Physical verification required' : 'Legal review mandatory before proceeding'}</div>
          </div>
        </div>
        <div className="policy-banner-right">
          <span className={`conf-pill-lg conf-${r.confidenceLabel?.toLowerCase()}`}>{r.confidence}/100 CONFIDENCE</span>
        </div>
      </div>

      {/* ── Scorecards Row ─────────────────────────────────────────────── */}
      <div className="results-grid-4">
        <div className="scorecard">
          <div className="sc-label">Market Value Band</div>
          <div className="sc-value gold">₹{r.mv_low}L — ₹{r.mv_high}L</div>
          <div className="sc-sub">Base: ₹{r.mv_base}L · ₹{r.mvPerSqft?.toLocaleString()}/sqft</div>
        </div>
        <div className="scorecard">
          <div className="sc-label">Distress Value</div>
          <div className="sc-value red">₹{r.distress_low}L — ₹{r.distress_high}L</div>
          <div className="sc-sub">{r.distressBand} · {r.liquidityDiscount}% discount</div>
        </div>
        <div className="scorecard">
          <div className="sc-label">Max LTV (RBI)</div>
          <div className="sc-value teal">{r.ltvMax}%</div>
          <div className="sc-sub">Eligible: ₹{Math.round(r.mv_low * r.ltvMax / 100)}L — ₹{Math.round(r.mv_high * r.ltvMax / 100)}L</div>
        </div>
        <div className="scorecard">
          <div className="sc-label">Est. Liquidation</div>
          <div className="sc-value">{r.timeLow} — {r.timeHigh} days</div>
          <div className="sc-sub">{r.resaleLabel}</div>
        </div>
      </div>

      {/* ── Gauges Row ─────────────────────────────────────────────────── */}
      <div className="results-grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Resale Potential Index</div><div className="card-action">{r.resaleLabel}</div></div>
          <div className="card-body" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <Gauge value={r.resaleIndex} label="/100" sublabel={r.resaleLabel} color={riColor} size={140} />
            <div style={{ flex: 1 }}>
              {r.resaleBreakdown && Object.values(r.resaleBreakdown).map(b => (
                <HBar key={b.label} label={`${b.label} (${b.weight}%)`} score={b.score} color={riColor} />
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Confidence Score</div><div className="card-action">{r.confidenceLabel}</div></div>
          <div className="card-body" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <Gauge value={r.confidence} label="/100" sublabel={r.confidenceLabel} color={confColor} size={140} />
            <div style={{ flex: 1 }}>
              {r.confidenceBreakdown && Object.values(r.confidenceBreakdown).map(b => (
                <HBar key={b.label} label={`${b.label} (${b.weight}%)`} score={b.score} color={confColor} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Explainability ─────────────────────────────────────────────── */}
      <div className="results-grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">✅ Positive Value Drivers</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {r.positiveDrivers?.length ? r.positiveDrivers.map((d, i) => (
              <DriverChip key={i} {...d} positive />
            )) : <div className="empty-hint">No significant positive drivers detected</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">⚠ Negative Value Drivers</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {r.negativeDrivers?.length ? r.negativeDrivers.map((d, i) => (
              <DriverChip key={i} {...d} positive={false} />
            )) : <div className="empty-hint">No significant risk factors detected</div>}
          </div>
        </div>
      </div>

      {/* ── Liquidity & Warnings ───────────────────────────────────────── */}
      <div className="results-grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Liquidity Discount Breakdown</div><div className="card-action">{r.liquidityDiscount}% total</div></div>
          <div className="card-body">
            {r.liquidityDiscountFactors && Object.entries(r.liquidityDiscountFactors).map(([k, v]) => (
              <div key={k} className="ld-row">
                <span className="ld-label">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                <div className="ld-bar-track"><div className="ld-bar-fill" style={{ width: `${(v / 10) * 100}%` }} /></div>
                <span className="ld-val">+{v}%</span>
              </div>
            ))}
            {r.liquidityReducers?.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {r.liquidityReducers.map((lr, i) => <div key={i} className="lr-item">⚡ {lr}</div>)}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Risk Flags & Warnings</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {r.flags?.length ? r.flags.map((f, i) => (
              <div key={i} className={`flag-card flag-${f.severity}`}>
                <span className="flag-sev">{f.severity === 'critical' ? '🔴' : f.severity === 'warning' ? '🟡' : 'ℹ️'}</span>
                {f.text}
              </div>
            )) : <div className="empty-hint">✅ No risk flags — clean assessment</div>}

            {r.dataWarnings?.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: '12px' }}>Data Sufficiency</div>
                {r.dataWarnings.map((w, i) => <div key={i} className="data-warn">📋 {w}</div>)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Valuation Factors ──────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header"><div className="card-title">Valuation Factor Decomposition</div><div className="card-action">Model v{r.modelVersion}</div></div>
        <div className="card-body">
          <div className="factor-grid">
            {r.factors && Object.entries(r.factors).map(([k, v]) => (
              <div key={k} className="factor-cell">
                <div className="factor-name">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                <div className="factor-val" style={{ color: v >= 1 ? 'var(--green)' : 'var(--red)' }}>×{v}</div>
              </div>
            ))}
            <div className="factor-cell">
              <div className="factor-name">Guidance Value</div>
              <div className="factor-val" style={{ color: 'var(--gold)' }}>₹{r.guidanceValue}L</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Bar ─────────────────────────────────────────────────── */}
      <div className="action-bar">
        <button className="action-btn" onClick={() => { window.print(); }}>📄 Download Report</button>
        <button className="action-btn" onClick={() => navigate('whatif')}>🔄 What-If Analysis</button>
        <button className="action-btn" onClick={() => navigate('copilot')}>✦ Ask Copilot</button>
        <button className="action-btn primary" onClick={() => navigate('estimate')}>⬡ New Valuation</button>
      </div>
    </>
  );
}
