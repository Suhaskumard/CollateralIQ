import { useApp } from '../../context/AppContext.jsx';

const NAV = [
  { section: 'Overview' },
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { section: 'Analysis' },
  { id: 'estimate',  icon: '⬡', label: 'Valuation Estimate' },
  { id: 'whatif',    icon: '⟳', label: 'What-If Simulator' },
  { id: 'portfolio', icon: '▦', label: 'Portfolio View' },
  { section: 'Intelligence' },
  { id: 'copilot',   icon: '✦', label: 'AI Copilot' },
  { id: 'audit',     icon: '☰', label: 'Audit Trail' },
];

export default function Sidebar() {
  const { page, navigate } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="logo-icon">⬡</div>
          <span>CollateralIQ</span>
        </div>
        <div className="brand-tagline">Collateral Intelligence</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div className="nav-section" key={i}>{item.section}</div>
          ) : (
            <div
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-av">👤</div>
          <div>
            <div className="user-name">Credit Analyst</div>
            <div className="user-role">NBFCPro · Bengaluru</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
