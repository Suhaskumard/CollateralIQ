import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

const MOCK = {
  totalCases: 0, avgLtv: 65, avgResaleIndex: 72,
  riskDistribution: { low: 0, medium: 0, high: 0 },
  recentCases: [], portfolioHealth: 'strong',
};

export default function Dashboard({ navigate }) {
  const [metrics, setMetrics] = useState(MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardMetrics()
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { totalCases, avgLtv, avgResaleIndex, riskDistribution, recentCases, portfolioHealth } = metrics;
  const total = riskDistribution.low + riskDistribution.medium + riskDistribution.high || 1;

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
          <div className="kpi-value gold">{loading ? '—' : totalCases}</div>
          <div className="kpi-sub">All time</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg LTV Cap</div>
          <div className="kpi-value teal">{loading ? '—' : `${avgLtv}%`}</div>
          <div className="kpi-sub">RBI norm guided</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Resale Index</div>
          <div className="kpi-value" style={{ color: avgResaleIndex >= 70 ? 'var(--green)' : avgResaleIndex >= 55 ? 'var(--amber)' : 'var(--red)' }}>
            {loading ? '—' : avgResaleIndex}
          </div>
          <div className="kpi-sub">{portfolioHealth === 'strong' ? 'Highly liquid' : portfolioHealth === 'moderate' ? 'Moderate liquidity' : 'Low liquidity'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Portfolio Health</div>
          <div className="kpi-value" style={{ color: portfolioHealth === 'strong' ? 'var(--green)' : portfolioHealth === 'moderate' ? 'var(--amber)' : 'var(--red)', fontSize: '20px', paddingTop: '4px' }}>
            {loading ? '—' : portfolioHealth.toUpperCase()}
          </div>
          <div className="kpi-sub">Based on avg resale index</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Risk Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Risk Distribution</div>
            <div className="card-action">{totalCases} cases</div>
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
                  <span style={{ color }}>{riskDistribution[key]} cases</span>
                </div>
                <div className="risk-bar">
                  <div className="risk-bar-fill" style={{ width: `${(riskDistribution[key] / total) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cases */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Cases</div>
            <div className="card-action" style={{ cursor: 'pointer' }} onClick={() => navigate('portfolio')}>All Cases →</div>
          </div>
          {recentCases.length === 0 ? (
            <div className="empty-state">
              <span className="icon">📋</span>
              <p>No cases yet. Run your first estimate →</p>
              <button className="topbar-btn" style={{ marginTop: '12px' }} onClick={() => navigate('estimate')}>+ New Case</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Address</th><th>RI</th><th>Policy</th></tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c.id}>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                    <td><span style={{ color: c.resaleIndex >= 70 ? 'var(--green)' : c.resaleIndex >= 55 ? 'var(--amber)' : 'var(--red)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{c.resaleIndex || '—'}</span></td>
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
      </div>
    </>
  );
}
