import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

const MOCK = {
  totalCases: 0, avgLtv: 65, avgResaleIndex: 72, avgConfidence: 60,
  riskDistribution: { low: 0, medium: 0, high: 0 },
  policyDistribution: { 'desktop-approve': 0, 'field-review': 0, 'legal-review': 0 },
  confidenceDistribution: { high: 0, medium: 0, low: 0 },
  locationSummary: [], attentionCases: [], valueBands: {},
  recentCases: [], totalPortfolioValue: 0, portfolioHealth: 'strong',
};

function MiniDonut({ data, colors, size = 80 }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(data);
  let cumulative = 0;
  const segments = entries.map(([, v], i) => {
    const pct = v / total;
    const start = cumulative;
    cumulative += pct;
    return { pct, start, color: colors[i] || 'var(--text3)' };
  });
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth="7"
          strokeDasharray={`${circ * s.pct} ${circ * (1 - s.pct)}`}
          strokeDashoffset={-circ * s.start}
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      ))}
    </svg>
  );
}

export default function Dashboard({ navigate }) {
  const [metrics, setMetrics] = useState(MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardMetrics()
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const m = metrics;
  const total = m.riskDistribution.low + m.riskDistribution.medium + m.riskDistribution.high || 1;

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">May 2026 · Bengaluru Region · NBFCPro</div>
        <div className="page-title">Portfolio Dashboard</div>
        <div className="page-desc">Real-time collateral intelligence across your active cases</div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Cases</div>
          <div className="kpi-value gold">{loading ? '—' : m.totalCases}</div>
          <div className="kpi-sub">All time</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Portfolio Value</div>
          <div className="kpi-value gold">{loading ? '—' : `₹${m.totalPortfolioValue}L`}</div>
          <div className="kpi-sub">Total market value</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Resale Index</div>
          <div className="kpi-value" style={{ color: m.avgResaleIndex >= 70 ? 'var(--green)' : m.avgResaleIndex >= 55 ? 'var(--amber)' : 'var(--red)' }}>
            {loading ? '—' : m.avgResaleIndex}
          </div>
          <div className="kpi-sub">{m.portfolioHealth === 'strong' ? 'Highly liquid' : m.portfolioHealth === 'moderate' ? 'Moderate liquidity' : 'Low liquidity'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Confidence</div>
          <div className="kpi-value" style={{ color: m.avgConfidence >= 70 ? 'var(--green)' : m.avgConfidence >= 50 ? 'var(--amber)' : 'var(--red)' }}>
            {loading ? '—' : `${m.avgConfidence}/100`}
          </div>
          <div className="kpi-sub">Data quality score</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Risk Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Risk Distribution</div>
            <div className="card-action">{m.totalCases} cases</div>
          </div>
          <div className="card-body">
            {[
              { label: 'Low Risk (RI ≥ 75)', key: 'low', color: 'var(--green)' },
              { label: 'Medium Risk (RI 55–74)', key: 'medium', color: 'var(--amber)' },
              { label: 'High Risk (RI < 55)', key: 'high', color: 'var(--red)' },
            ].map(({ label, key, color }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
                  <span>{label}</span>
                  <span style={{ color }}>{m.riskDistribution[key]} cases</span>
                </div>
                <div className="risk-bar">
                  <div className="risk-bar-fill" style={{ width: `${(m.riskDistribution[key] / total) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Policy Distribution</div>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <MiniDonut
              data={{ da: m.policyDistribution['desktop-approve'], fr: m.policyDistribution['field-review'], lr: m.policyDistribution['legal-review'] }}
              colors={['var(--green)', 'var(--amber)', 'var(--red)']}
            />
            <div style={{ flex: 1 }}>
              {[
                { label: 'Desktop Approve', val: m.policyDistribution['desktop-approve'], color: 'var(--green)' },
                { label: 'Field Review', val: m.policyDistribution['field-review'], color: 'var(--amber)' },
                { label: 'Legal Review', val: m.policyDistribution['legal-review'], color: 'var(--red)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    {label}
                  </span>
                  <span style={{ color, fontFamily: 'var(--mono)', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Cases</div>
            <div className="card-action" style={{ cursor: 'pointer' }} onClick={() => navigate('portfolio')}>All Cases →</div>
          </div>
          {m.recentCases.length === 0 ? (
            <div className="empty-state">
              <span className="icon">📋</span>
              <p>No cases yet. Run your first estimate →</p>
              <button className="topbar-btn" style={{ marginTop: '12px' }} onClick={() => navigate('estimate')}>+ New Case</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Address</th><th>RI</th><th>Conf</th><th>Policy</th></tr>
              </thead>
              <tbody>
                {m.recentCases.map((c) => (
                  <tr key={c.id}>
                    <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                    <td><span style={{ color: c.resaleIndex >= 70 ? 'var(--green)' : c.resaleIndex >= 55 ? 'var(--amber)' : 'var(--red)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{c.resaleIndex || '—'}</span></td>
                    <td><span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: (c.confidence || 60) >= 70 ? 'var(--green)' : 'var(--amber)' }}>{c.confidence || '—'}</span></td>
                    <td>
                      <span className={`badge ${c.policy === 'desktop-approve' ? 'badge-green' : c.policy === 'field-review' ? 'badge-amber' : 'badge-red'}`}>
                        {(c.policy || 'N/A').replace(/-/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Attention Needed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚠ Needs Attention</div>
          </div>
          {m.attentionCases?.length === 0 ? (
            <div className="empty-state">
              <span className="icon">✅</span>
              <p>No cases requiring attention</p>
            </div>
          ) : (
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {m.attentionCases?.map(c => (
                <div key={c.id} className="attention-row">
                  <div className="att-addr">{c.address || 'Unknown'}</div>
                  <div className="att-metrics">
                    <span style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '11px' }}>RI:{c.resaleIndex}</span>
                    <span className={`badge ${c.policy === 'legal-review' ? 'badge-red' : 'badge-amber'}`}>
                      {(c.policy || '').replace(/-/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
