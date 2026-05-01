import { useState } from 'react';
import { api } from '../../services/api.js';
import { toast, useApp } from '../../context/AppContext.jsx';

const LOCATIONS = [
  ['default', 'Select location...'],
  ['koramangala', 'Koramangala'], ['indiranagar', 'Indiranagar'],
  ['hsr_layout', 'HSR Layout'], ['whitefield', 'Whitefield'],
  ['sarjapur', 'Sarjapur Road'], ['hebbal', 'Hebbal'],
  ['marathahalli', 'Marathahalli'], ['btm_layout', 'BTM Layout'],
  ['electronic_city', 'Electronic City'], ['jp_nagar', 'JP Nagar'],
  ['jayanagar', 'Jayanagar'], ['malleswaram', 'Malleswaram'],
  ['yelahanka', 'Yelahanka'], ['kengeri', 'Kengeri'],
  ['bannerghatta', 'Bannerghatta Road'], ['rajajinagar', 'Rajajinagar'],
];

export default function Estimate({ navigate }) {
  const { saveValuation } = useApp();
  const [form, setForm] = useState({
    address: '', propertyType: 'residential', subtype: 'apartment',
    location: 'default', area: '', age: '', legal: 'freehold_clear',
    occupancy: 'self', rent: '0', floor: '3', has_lift: true,
    docs_complete: true,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const subtypeOptions = {
    residential: [['apartment','Apartment'],['villa','Villa'],['independent','Independent House'],['plot','Plot']],
    commercial:  [['office','Office Space'],['retail','Retail/Shop'],['warehouse','Warehouse'],['mixed','Mixed-Use']],
    industrial:  [['factory','Factory'],['shed','Industrial Shed'],['land','Industrial Land']],
  };

  async function runEstimate() {
    if (!form.area || !form.age) { toast('⚠️', 'Please fill in Area and Age'); return; }
    setLoading(true);
    try {
      const r = await api.runEstimate({
        ...form,
        area: +form.area, age: +form.age, rent: +form.rent || 0,
        floor: +form.floor || 1, has_lift: form.has_lift,
        docs_complete: form.docs_complete,
      });
      setResult(r);
      saveValuation(r);
      toast('✅', 'Valuation complete — view full results dashboard');
    } catch (e) {
      toast('❌', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveAndContinue() {
    if (!result) return;
    try {
      await api.saveCase({
        address: form.address || 'Unknown Address',
        propertyType: form.propertyType, subtype: form.subtype,
        location: form.location, area: form.area, age: form.age,
        mv_low: result.mv_low, mv_high: result.mv_high, mv_base: result.mv_base,
        resaleIndex: result.resaleIndex, ltvMax: result.ltvMax,
        policy: result.policy, confidence: result.confidence,
        confidenceLabel: result.confidenceLabel,
        distressValue: result.distressValue,
        liquidityDiscount: result.liquidityDiscount,
      });
      toast('💾', 'Case saved to portfolio');
      navigate('portfolio');
    } catch (e) {
      toast('❌', e.message);
    }
  }

  const riColor = (v) => v >= 75 ? 'var(--green)' : v >= 50 ? 'var(--amber)' : 'var(--red)';
  const confColor = (v) => v >= 75 ? 'var(--green)' : v >= 50 ? 'var(--amber)' : 'var(--red)';

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Collateral Valuation Engine v2.0</div>
        <div className="page-title">Valuation Estimate</div>
        <div className="page-desc">Run AI-assisted collateral valuation with full risk & explainability breakdown</div>
      </div>

      <div className="estimate-grid">
        {/* ── Form ── */}
        <div className="card">
          <div className="card-header"><div className="card-title">Property Details</div></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="fg span2">
                <label>Property Address</label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 42 Koramangala 5th Block, Bengaluru" />
              </div>
              <div className="fg">
                <label>Property Type</label>
                <select value={form.propertyType} onChange={e => { set('propertyType', e.target.value); set('subtype', subtypeOptions[e.target.value][0][0]); }}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              <div className="fg">
                <label>Sub-Type</label>
                <select value={form.subtype} onChange={e => set('subtype', e.target.value)}>
                  {(subtypeOptions[form.propertyType] || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="fg span2">
                <label>Micro-Location</label>
                <select value={form.location} onChange={e => set('location', e.target.value)}>
                  {LOCATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Built-up Area (sq ft)</label>
                <input type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. 1250" min="100" />
              </div>
              <div className="fg">
                <label>Age of Property (years)</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 8" min="0" max="60" />
              </div>
              <div className="fg">
                <label>Floor Level</label>
                <input type="number" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="e.g. 5" min="0" max="50" />
              </div>
              <div className="fg">
                <label>Has Lift?</label>
                <select value={form.has_lift ? 'yes' : 'no'} onChange={e => set('has_lift', e.target.value === 'yes')}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="fg">
                <label>Legal Status</label>
                <select value={form.legal} onChange={e => set('legal', e.target.value)}>
                  <option value="freehold_clear">Freehold — Clear Title</option>
                  <option value="freehold_disputed">Freehold — Disputed</option>
                  <option value="leasehold">Leasehold</option>
                  <option value="encumbered">Encumbered</option>
                </select>
              </div>
              <div className="fg">
                <label>Occupancy Status</label>
                <select value={form.occupancy} onChange={e => set('occupancy', e.target.value)}>
                  <option value="self">Self-Occupied</option>
                  <option value="rented">Rented</option>
                  <option value="vacant">Vacant</option>
                  <option value="commercial_tenant">Commercial Tenant</option>
                </select>
              </div>
              <div className="fg">
                <label>Monthly Rental (₹)</label>
                <input type="number" value={form.rent} onChange={e => set('rent', e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="fg">
                <label>Docs Complete?</label>
                <select value={form.docs_complete ? 'yes' : 'no'} onChange={e => set('docs_complete', e.target.value === 'yes')}>
                  <option value="yes">Yes — All documents available</option>
                  <option value="no">No — Partial / missing</option>
                </select>
              </div>
            </div>
            <button className="btn-analyze" onClick={runEstimate} disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? <><div className="spinner" /> Analysing…</> : '⬡ Run Valuation'}
            </button>
          </div>
        </div>

        {/* ── Results Summary ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Valuation Summary</div>
            {result && <div className="card-action" onClick={() => navigate('results')} style={{ cursor: 'pointer' }}>View Full Report →</div>}
          </div>
          <div className="card-body">
            {!result ? (
              <div className="result-placeholder">
                <div className="big-icon">⬡</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--text2)' }}>Awaiting Input</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', maxWidth: '240px' }}>Fill in property details and click Run Valuation to see the collateral report</div>
              </div>
            ) : (
              <>
                {/* Market Value */}
                <div className="r-card">
                  <div className="r-tag">Market Value Band</div>
                  <div className="r-val">₹{result.mv_low}L — ₹{result.mv_high}L</div>
                  <div className="r-sub">Base: ₹{result.mv_base}L · ₹{result.mvPerSqft?.toLocaleString()}/sq ft</div>
                </div>

                <div className="result-grid-3" style={{ marginBottom: '12px' }}>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Resale Index</div>
                    <div className="r-val" style={{ color: riColor(result.resaleIndex) }}>{result.resaleIndex}</div>
                    <div className="r-sub">/100 · {result.resaleLabel}</div>
                  </div>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Confidence</div>
                    <div className="r-val" style={{ color: confColor(result.confidence) }}>{result.confidence}</div>
                    <div className="r-sub">/100 · {result.confidenceLabel}</div>
                  </div>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Max LTV</div>
                    <div className="r-val" style={{ color: 'var(--teal)' }}>{result.ltvMax}%</div>
                    <div className="r-sub">RBI norm</div>
                  </div>
                </div>

                <div className="result-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Distress Value</div>
                    <div className="r-val" style={{ color: 'var(--red)', fontSize: '18px' }}>₹{result.distress_low}L–₹{result.distress_high}L</div>
                    <div className="r-sub">{result.liquidityDiscount}% discount</div>
                  </div>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Time to Sell</div>
                    <div className="r-val" style={{ fontSize: '18px' }}>{result.timeLow}–{result.timeHigh}d</div>
                    <div className="r-sub">{result.resaleLabel}</div>
                  </div>
                </div>

                {/* Policy */}
                <div className="r-card">
                  <div className="r-tag">Underwriting Policy</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className={`policy-pill policy-${result.policy === 'desktop-approve' ? 'desktop' : result.policy === 'field-review' ? 'field' : 'legal'}`}>
                      {result.policy?.replace(/-/g, ' ').toUpperCase()}
                    </span>
                    <span className={`conf-pill conf-${result.confidenceLabel?.toLowerCase()}`}>
                      {result.confidence}/100 CONFIDENCE
                    </span>
                  </div>
                </div>

                {/* Drivers preview */}
                {result.positiveDrivers?.length > 0 && (
                  <div className="drivers-preview">
                    {result.positiveDrivers.slice(0, 2).map((d, i) => (
                      <div key={i} className="driver-mini positive">✅ {d.factor}</div>
                    ))}
                    {result.negativeDrivers?.slice(0, 1).map((d, i) => (
                      <div key={i} className="driver-mini negative">⚠ {d.factor}</div>
                    ))}
                  </div>
                )}

                {/* Flags */}
                {result.flags?.length > 0 && (
                  <div className="flag-list">
                    {result.flags.slice(0, 3).map((f, i) => (
                      <div className={`flag-item ${f.severity === 'critical' ? 'flag-critical' : ''}`} key={i}>
                        {f.severity === 'critical' ? '🔴' : '⚠'} {f.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button className="topbar-btn" onClick={() => navigate('results')} style={{ flex: 1 }}>◉ Full Report</button>
                  <button className="topbar-btn" onClick={saveAndContinue} style={{ flex: 1, background: 'var(--teal)', color: '#000' }}>💾 Save Case</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
