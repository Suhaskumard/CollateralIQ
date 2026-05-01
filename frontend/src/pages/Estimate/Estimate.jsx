import { useState } from 'react';
import { api } from '../../services/api.js';
import { toast } from '../../context/AppContext.jsx';

const LOCATIONS = [
  ['default', 'Select location...'],
  ['koramangala', 'Koramangala'],
  ['indiranagar', 'Indiranagar'],
  ['hsr_layout', 'HSR Layout'],
  ['whitefield', 'Whitefield'],
  ['sarjapur', 'Sarjapur Road'],
  ['hebbal', 'Hebbal'],
  ['marathahalli', 'Marathahalli'],
  ['btm_layout', 'BTM Layout'],
  ['electronic_city', 'Electronic City'],
  ['jp_nagar', 'JP Nagar'],
  ['jayanagar', 'Jayanagar'],
  ['malleswaram', 'Malleswaram'],
  ['yelahanka', 'Yelahanka'],
  ['kengeri', 'Kengeri'],
];

export default function Estimate({ navigate }) {
  const [form, setForm] = useState({
    address: '', propertyType: 'residential', subtype: 'apartment',
    location: 'default', area: '', age: '', legal: 'freehold_clear',
    occupancy: 'self', rent: '0',
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
      });
      setResult(r);
      toast('✅', 'Valuation complete');
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
        area: form.area, age: form.age,
        mv_low: result.mv_low, mv_high: result.mv_high,
        resaleIndex: result.resaleIndex, ltvMax: result.ltvMax,
        policy: result.policy, confidence: result.confidence,
      });
      toast('💾', 'Case saved to portfolio');
      navigate('portfolio');
    } catch (e) {
      toast('❌', e.message);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Collateral Valuation Engine</div>
        <div className="page-title">Valuation Estimate</div>
        <div className="page-desc">Run AI-assisted collateral valuation with full risk breakdown</div>
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
              <div className="fg span2">
                <label>Monthly Rental Income (₹, if rented)</label>
                <input type="number" value={form.rent} onChange={e => set('rent', e.target.value)} placeholder="0" min="0" />
              </div>
            </div>
            <button className="btn-analyze" onClick={runEstimate} disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? <><div className="spinner" /> Analysing…</> : '⬡ Run Valuation'}
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Valuation Report</div>
            {result && <div className="card-action" onClick={saveAndContinue} style={{ cursor: 'pointer' }}>💾 Save Case →</div>}
          </div>
          <div className="card-body">
            {!result ? (
              <div className="result-placeholder">
                <div className="big-icon">⬡</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--text2)' }}>Awaiting Input</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', maxWidth: '240px' }}>Fill in property details and click Run Valuation to see the full collateral report</div>
              </div>
            ) : (
              <>
                {/* Market Value */}
                <div className="r-card">
                  <div className="r-tag">Market Value Range</div>
                  <div className="r-val">₹{result.mv_low}L — ₹{result.mv_high}L</div>
                  <div className="r-sub">₹{result.mvPerSqft?.toLocaleString()}/sq ft · {form.area} sq ft</div>
                </div>

                <div className="result-grid-3" style={{ marginBottom: '12px' }}>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Resale Index</div>
                    <div className="r-val" style={{ color: result.resaleIndex >= 70 ? 'var(--green)' : result.resaleIndex >= 55 ? 'var(--amber)' : 'var(--red)' }}>{result.resaleIndex}</div>
                    <div className="r-sub">/100</div>
                  </div>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Liquidity Discount</div>
                    <div className="r-val" style={{ color: 'var(--amber)' }}>{result.liquidityDiscount}%</div>
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
                    <div className="r-val" style={{ color: 'var(--red)' }}>₹{result.distressValue}L</div>
                    <div className="r-sub">Post liquidation</div>
                  </div>
                  <div className="r-card" style={{ margin: 0 }}>
                    <div className="r-tag">Time to Sell</div>
                    <div className="r-val" style={{ fontSize: '16px', paddingTop: '4px' }}>{result.timeLow}–{result.timeHigh}d</div>
                  </div>
                </div>

                {/* Policy */}
                <div className="r-card">
                  <div className="r-tag">Underwriting Policy</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className={`policy-pill policy-${result.policy === 'desktop-approve' ? 'desktop' : result.policy === 'field-review' ? 'field' : 'legal'}`}>
                      {result.policy?.replace(/-/g, ' ').toUpperCase()}
                    </span>
                    <span className={`conf-pill conf-${result.confidence}`}>
                      {result.confidence?.toUpperCase()} CONFIDENCE
                    </span>
                  </div>
                </div>

                {/* Flags */}
                {result.flags?.length > 0 && (
                  <div className="flag-list">
                    {result.flags.map((f, i) => <div className="flag-item" key={i}>⚠ {f}</div>)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
