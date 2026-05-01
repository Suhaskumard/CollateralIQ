import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { toast } from '../../context/AppContext.jsx';

export default function Portfolio({ navigate }) {
  const [cases, setCases]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getPortfolio()
      .then(setCases)
      .catch(() => toast('❌', 'Could not load portfolio'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function deleteCase(id) {
    if (!confirm('Remove this case from portfolio?')) return;
    try {
      await api.deleteCase(id);
      toast('🗑', 'Case removed');
      load();
    } catch { toast('❌', 'Delete failed'); }
  }

  const policyBadge = (p) => {
    if (p === 'desktop-approve') return <span className="badge badge-green">Desktop Approve</span>;
    if (p === 'field-review')    return <span className="badge badge-amber">Field Review</span>;
    return <span className="badge badge-red">Legal Review</span>;
  };

  const confBadge = (c) => {
    const cls = c === 'high' ? 'badge-green' : c === 'medium' ? 'badge-amber' : 'badge-red';
    return <span className={`badge ${cls}`}>{c}</span>;
  };

  const riColor = (r) => r >= 70 ? 'var(--green)' : r >= 55 ? 'var(--amber)' : 'var(--red)';

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-eyebrow">Collateral Book</div>
          <div className="page-title">Portfolio View</div>
        </div>
        <button className="topbar-btn" onClick={() => navigate('estimate')}>+ Add Case</button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-header">
          <div className="card-title">All Cases — Live + History</div>
          <div className="card-action">{loading ? 'Loading…' : `${cases.length} case${cases.length !== 1 ? 's' : ''}`}</div>
        </div>

        {loading ? (
          <div className="empty-state"><span className="icon">⏳</span><p>Loading portfolio…</p></div>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <span className="icon">📋</span>
            <p>No cases yet. Run your first estimate →</p>
            <button className="topbar-btn" style={{ marginTop: '12px' }} onClick={() => navigate('estimate')}>+ New Case</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th><th>Address</th><th>Type</th><th>Area</th>
                <th>Market Value</th><th>Resale Index</th><th>Confidence</th>
                <th>Policy</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c.id}>
                  <td><span className="mono">{c.id?.slice(0, 8).toUpperCase()}</span></td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{c.subtype || c.propertyType || '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{Number(c.area || 0).toLocaleString()} sqft</td>
                  <td style={{ color: 'var(--gold)', fontFamily: 'var(--mono)' }}>
                    ₹{c.mv_low}L–₹{c.mv_high}L
                  </td>
                  <td>
                    <span style={{ color: riColor(c.resaleIndex), fontFamily: 'var(--mono)', fontWeight: 700 }}>
                      {c.resaleIndex ?? '—'}
                    </span>
                  </td>
                  <td>{c.confidence ? confBadge(c.confidence) : '—'}</td>
                  <td>{policyBadge(c.policy)}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text3)' }}>
                    {c.date ? new Date(c.date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <button onClick={() => deleteCase(c.id)}
                      style={{ background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--red)', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px' }}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
