import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar   from './components/Sidebar/Sidebar.jsx';
import Toast     from './components/Toast/Toast.jsx';
import Dashboard  from './pages/Dashboard/Dashboard.jsx';
import Estimate   from './pages/Estimate/Estimate.jsx';
import Results    from './pages/Results/Results.jsx';
import WhatIf     from './pages/WhatIf/WhatIf.jsx';
import Portfolio  from './pages/Portfolio/Portfolio.jsx';
import Copilot    from './pages/Copilot/Copilot.jsx';
import Audit      from './pages/Audit/Audit.jsx';

const PAGES = { dashboard: Dashboard, estimate: Estimate, results: Results, whatif: WhatIf, portfolio: Portfolio, copilot: Copilot, audit: Audit };

const LABELS = {
  dashboard: 'Dashboard', estimate: 'Valuation Estimate', results: 'Results Dashboard',
  whatif: 'What-If Simulator', portfolio: 'Portfolio View', copilot: 'AI Copilot', audit: 'Audit Trail',
};

function Shell() {
  const { page, navigate } = useApp();
  const Page = PAGES[page] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div className="page-breadcrumb">
            CollateralIQ / <span>{LABELS[page]}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">● LIVE</div>
            <div className="topbar-version">v2.0</div>
            {page !== 'estimate' && (
              <button className="topbar-btn" onClick={() => navigate('estimate')}>+ New Case</button>
            )}
          </div>
        </div>
        <div className="page-content">
          <Page navigate={navigate} />
        </div>
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
