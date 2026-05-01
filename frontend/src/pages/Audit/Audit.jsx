import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

const ACTION_COLOR = {
  ESTIMATE_RUN: 'gold',
  CASE_SAVED:   'green',
  CASE_DELETED: 'red',
  default:      'teal',
};

const ACTION_ICON = {
  ESTIMATE_RUN: '⬡',
  CASE_SAVED:   '💾',
  CASE_DELETED: '🗑',
  default:      '●',
};

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Audit() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditTrail(200)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Compliance & Traceability</div>
        <div className="page-title">Audit Trail</div>
        <div className="page-desc">Complete immutable log of all valuation and portfolio events</div>
      </div>

      <div className="audit-wrap">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Event Log</div>
            <div className="card-action">{loading ? 'Loading…' : `${events.length} events`}</div>
          </div>

          {loading ? (
            <div className="empty-state"><span className="icon">⏳</span><p>Loading audit trail…</p></div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <span className="icon">☰</span>
              <p>No events yet. Run a valuation to generate audit entries.</p>
            </div>
          ) : (
            events.map(ev => {
              const color = ACTION_COLOR[ev.action] || ACTION_COLOR.default;
              const icon  = ACTION_ICON[ev.action]  || ACTION_ICON.default;
              const details = ev.details || {};
              return (
                <div className="audit-event" key={ev.id}>
                  <div className={`audit-dot ${color !== 'gold' ? color : ''}`}
                    style={color === 'gold' ? { background: 'var(--gold)' } : {}} />
                  <div className="audit-time">{fmt(ev.timestamp)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="audit-action">{icon} {ev.action.replace(/_/g, ' ')}</div>
                    <div className="audit-detail">
                      {details.address && <span>Address: <strong style={{ color: 'var(--text)' }}>{details.address}</strong> · </span>}
                      {details.policy  && <span>Policy: <span className={`badge ${details.policy === 'desktop-approve' ? 'badge-green' : details.policy === 'field-review' ? 'badge-amber' : 'badge-red'}`}>{details.policy.replace(/-/g, ' ')}</span> · </span>}
                      {details.mv_low  && <span>MV: <strong style={{ color: 'var(--gold)' }}>₹{details.mv_low}L–₹{details.mv_high}L</strong> · </span>}
                      {details.id      && <span>ID: <span className="mono">{String(details.id).slice(0, 8).toUpperCase()}</span></span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text3)', flexShrink: 0 }}>
                    {ev.user || 'analyst'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
