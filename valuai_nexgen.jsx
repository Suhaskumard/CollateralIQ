import { useState, useRef, useEffect, useCallback } from "react";

// ─── ICONS ────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = 2, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  folder: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  arch: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  bot: "M12 2a2 2 0 012 2v2h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2z M9 12h.01 M15 12h.01",
  building: "M3 9l9-7 9 7v11H3V9z M9 22V12h6v10",
  chart: "M18 20V10M12 20V4M6 20v-6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cpu: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  git: "M6 3a2 2 0 100 4 2 2 0 000-4zM18 17a2 2 0 100 4 2 2 0 000-4zM12 7a2 2 0 100 4 2 2 0 000-4z M6 5v2m6-2v2m0 6v4m6-6v2M6 7c0 4 6 5 6 5s6 1 6 5",
  close: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  info: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01",
  map: "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
};

// ─── FOLDER STRUCTURE DATA ─────────────────────────────────
const folderTree = {
  name: "valuai/",
  type: "root",
  color: "#c8a84b",
  children: [
    {
      name: "frontend/",
      type: "folder",
      badge: "Next.js + React",
      color: "#61dafb",
      children: [
        { name: "app/", type: "folder", children: [
          { name: "page.tsx", type: "file", desc: "Root landing & auth redirect" },
          { name: "layout.tsx", type: "file", desc: "Global layout, fonts, providers" },
          { name: "(dashboard)/", type: "folder", children: [
            { name: "page.tsx", type: "file", desc: "Main underwriter dashboard" },
            { name: "cases/[id]/page.tsx", type: "file", desc: "Single case deep-dive" },
            { name: "portfolio/page.tsx", type: "file", desc: "Portfolio collateral monitor" },
            { name: "audit/page.tsx", type: "file", desc: "Audit trail & history" },
          ]},
          { name: "(auth)/", type: "folder", children: [
            { name: "login/page.tsx", type: "file", desc: "SSO / Keycloak login" },
          ]},
        ]},
        { name: "components/", type: "folder", children: [
          { name: "valuation/", type: "folder", badge: "Core UI", children: [
            { name: "EstimateForm.tsx", type: "file", desc: "Property input form with validation" },
            { name: "ResultsDashboard.tsx", type: "file", desc: "Score cards, gauges, charts" },
            { name: "ExplainabilityPanel.tsx", type: "file", desc: "Driver chips & risk flags" },
            { name: "MicroMarketMap.tsx", type: "file", desc: "Leaflet/Mapbox integration" },
            { name: "ConfidenceGauge.tsx", type: "file", desc: "Animated confidence ring" },
            { name: "LiquidityMeter.tsx", type: "file", desc: "Resale index radial chart" },
          ]},
          { name: "chatbot/", type: "folder", badge: "AI Copilot", children: [
            { name: "CopilotPanel.tsx", type: "file", desc: "Chat interface & history" },
            { name: "QuickPrompts.tsx", type: "file", desc: "One-click prompt cards" },
            { name: "ChatBubble.tsx", type: "file", desc: "Message bubble component" },
            { name: "MarkdownRenderer.tsx", type: "file", desc: "AI response formatter" },
          ]},
          { name: "ui/", type: "folder", children: [
            { name: "ValueBandCard.tsx", type: "file", desc: "Market & distress value band" },
            { name: "PolicyBadge.tsx", type: "file", desc: "Desktop/field/legal review badge" },
            { name: "ScoreBar.tsx", type: "file", desc: "Animated score progress bar" },
            { name: "ChipGroup.tsx", type: "file", desc: "Driver & flag chip set" },
            { name: "DownloadReport.tsx", type: "file", desc: "PDF credit memo generator" },
          ]},
        ]},
        { name: "lib/", type: "folder", children: [
          { name: "api.ts", type: "file", desc: "API client & typed fetchers" },
          { name: "valuation.ts", type: "file", desc: "Client-side scoring helpers" },
          { name: "formatters.ts", type: "file", desc: "INR, %, date formatters" },
        ]},
        { name: "hooks/", type: "folder", children: [
          { name: "useValuation.ts", type: "file", desc: "SWR-powered estimate hook" },
          { name: "useChat.ts", type: "file", desc: "Chat history & streaming" },
          { name: "useCase.ts", type: "file", desc: "Case CRUD & polling" },
        ]},
        { name: "styles/", type: "folder", children: [
          { name: "globals.css", type: "file", desc: "Tailwind base + design tokens" },
          { name: "theme.ts", type: "file", desc: "Color palette & typography scale" },
        ]},
        { name: "public/", type: "folder", children: [
          { name: "icons/", type: "folder" },
          { name: "fonts/", type: "folder" },
        ]},
      ]
    },
    {
      name: "backend/",
      type: "folder",
      badge: "FastAPI + Python",
      color: "#3ecf8e",
      children: [
        { name: "app/", type: "folder", children: [
          { name: "main.py", type: "file", desc: "FastAPI app entry, CORS, routers" },
          { name: "config.py", type: "file", desc: "Env vars, settings, feature flags" },
          { name: "dependencies.py", type: "file", desc: "Auth, DB, cache injection" },
        ]},
        { name: "routers/", type: "folder", badge: "API Layer", children: [
          { name: "cases.py", type: "file", desc: "POST /cases/estimate, GET /cases/{id}" },
          { name: "whatif.py", type: "file", desc: "POST /cases/{id}/what-if scenarios" },
          { name: "chat.py", type: "file", desc: "POST /chat/query — LLM orchestration" },
          { name: "portfolio.py", type: "file", desc: "GET /portfolio — batch case list" },
          { name: "metadata.py", type: "file", desc: "GET /metadata — master dropdowns" },
          { name: "health.py", type: "file", desc: "GET /health/models — model status" },
        ]},
        { name: "services/", type: "folder", badge: "Business Logic", children: [
          { name: "valuation_service.py", type: "file", desc: "Orchestrates all valuation engines" },
          { name: "geocoding_service.py", type: "file", desc: "Address → lat/lon + micro-market" },
          { name: "guidance_value_service.py", type: "file", desc: "Circle rate / ready reckoner fetch" },
          { name: "amenity_service.py", type: "file", desc: "OSM proximity: metro, schools, hospitals" },
          { name: "listing_service.py", type: "file", desc: "Public listing density & price bands" },
          { name: "chat_service.py", type: "file", desc: "Claude API orchestration + RAG" },
          { name: "report_service.py", type: "file", desc: "Credit memo PDF generation" },
          { name: "fraud_service.py", type: "file", desc: "Anomaly & geolocation checks" },
        ]},
        { name: "models/", type: "folder", badge: "DB Models", children: [
          { name: "property_case.py", type: "file", desc: "PropertyCase ORM model" },
          { name: "property_geo.py", type: "file", desc: "PostGIS geo model" },
          { name: "valuation_output.py", type: "file", desc: "Output bands & scores" },
          { name: "explainability.py", type: "file", desc: "Drivers, flags, confidence" },
          { name: "audit_log.py", type: "file", desc: "Immutable audit records" },
          { name: "user.py", type: "file", desc: "User roles & access" },
        ]},
        { name: "schemas/", type: "folder", children: [
          { name: "case_schema.py", type: "file", desc: "Pydantic request/response schemas" },
          { name: "valuation_schema.py", type: "file", desc: "Typed output payloads" },
          { name: "chat_schema.py", type: "file", desc: "Chat message schemas" },
        ]},
        { name: "db/", type: "folder", children: [
          { name: "database.py", type: "file", desc: "SQLAlchemy async engine + session" },
          { name: "migrations/", type: "folder", desc: "Alembic migration versions" },
          { name: "seed.py", type: "file", desc: "Dev seed data & fixtures" },
        ]},
        { name: "middleware/", type: "folder", children: [
          { name: "auth.py", type: "file", desc: "Keycloak JWT validation" },
          { name: "rate_limit.py", type: "file", desc: "Redis-backed rate limiting" },
          { name: "audit.py", type: "file", desc: "Request/response audit logging" },
        ]},
      ]
    },
    {
      name: "ml/",
      type: "folder",
      badge: "Scikit + XGBoost",
      color: "#f97316",
      children: [
        { name: "engines/", type: "folder", badge: "Dual Engine", children: [
          { name: "valuation_engine.py", type: "file", desc: "Market value band: rules + XGBoost + quantile" },
          { name: "liquidity_engine.py", type: "file", desc: "Resale index composite scorer" },
          { name: "distress_engine.py", type: "file", desc: "Discount band by asset class & micro-market" },
          { name: "liquidation_engine.py", type: "file", desc: "Time-to-sell range predictor" },
          { name: "confidence_engine.py", type: "file", desc: "Data completeness & consistency scorer" },
          { name: "anomaly_engine.py", type: "file", desc: "Fraud & outlier detection" },
        ]},
        { name: "features/", type: "folder", children: [
          { name: "location_features.py", type: "file", desc: "Guidance value, amenity distances, H3 indexing" },
          { name: "property_features.py", type: "file", desc: "Type, size, age, floor, standardization" },
          { name: "legal_features.py", type: "file", desc: "Tenure, title clarity, encumbrance" },
          { name: "market_features.py", type: "file", desc: "Listing density, price dispersion, days-on-market" },
          { name: "income_features.py", type: "file", desc: "Rent yield, occupancy, investor attractiveness" },
          { name: "feature_store.py", type: "file", desc: "Cached derived feature retrieval" },
        ]},
        { name: "training/", type: "folder", children: [
          { name: "train_valuation.py", type: "file", desc: "XGBoost + quantile regression pipeline" },
          { name: "train_liquidity.py", type: "file", desc: "Weighted composite training" },
          { name: "evaluate.py", type: "file", desc: "MAPE, calibration, Shapley analysis" },
          { name: "cross_validate.py", type: "file", desc: "Spatial cross-validation by micro-market" },
        ]},
        { name: "registry/", type: "folder", badge: "MLflow", children: [
          { name: "model_registry.py", type: "file", desc: "MLflow model loading & versioning" },
          { name: "experiment_tracker.py", type: "file", desc: "Run logging, metrics, artifacts" },
          { name: "drift_monitor.py", type: "file", desc: "Feature drift & micro-market SLA" },
        ]},
        { name: "explainability/", type: "folder", children: [
          { name: "shap_explainer.py", type: "file", desc: "SHAP driver ranking per prediction" },
          { name: "driver_formatter.py", type: "file", desc: "Human-readable driver labels" },
          { name: "policy_recommender.py", type: "file", desc: "Desktop/field/legal review logic" },
        ]},
      ]
    },
    {
      name: "data/",
      type: "folder",
      badge: "Public-Data-First",
      color: "#a78bfa",
      children: [
        { name: "pipelines/", type: "folder", children: [
          { name: "guidance_value_pipeline.py", type: "file", desc: "Karnataka Stamps & Registration scraper" },
          { name: "osm_pipeline.py", type: "file", desc: "OpenStreetMap amenity layer ingestion" },
          { name: "listing_pipeline.py", type: "file", desc: "Public listing density & price scraper" },
          { name: "gtfs_pipeline.py", type: "file", desc: "Metro/bus GTFS stop data ingestion" },
        ]},
        { name: "schemas/", type: "folder", children: [
          { name: "guidance_value.sql", type: "file" },
          { name: "micro_market.sql", type: "file" },
          { name: "listing_snapshot.sql", type: "file" },
        ]},
        { name: "notebooks/", type: "folder", children: [
          { name: "eda_bengaluru.ipynb", type: "file", desc: "Exploratory data analysis" },
          { name: "feature_correlation.ipynb", type: "file" },
          { name: "valuation_benchmarks.ipynb", type: "file" },
        ]},
      ]
    },
    {
      name: "infrastructure/",
      type: "folder",
      badge: "Docker + K8s",
      color: "#38bdf8",
      children: [
        { name: "docker/", type: "folder", children: [
          { name: "Dockerfile.frontend", type: "file" },
          { name: "Dockerfile.backend", type: "file" },
          { name: "Dockerfile.ml", type: "file" },
          { name: "docker-compose.yml", type: "file", desc: "Local dev: all services" },
        ]},
        { name: "k8s/", type: "folder", children: [
          { name: "frontend-deploy.yaml", type: "file" },
          { name: "backend-deploy.yaml", type: "file" },
          { name: "ml-deploy.yaml", type: "file" },
          { name: "postgres-statefulset.yaml", type: "file" },
          { name: "redis-deploy.yaml", type: "file" },
          { name: "ingress.yaml", type: "file" },
        ]},
        { name: "terraform/", type: "folder", children: [
          { name: "main.tf", type: "file", desc: "Cloud infra provisioning" },
          { name: "variables.tf", type: "file" },
          { name: "outputs.tf", type: "file" },
        ]},
      ]
    },
    {
      name: "docs/",
      type: "folder",
      color: "#e879f9",
      children: [
        { name: "api-reference.md", type: "file", desc: "OpenAPI endpoint docs" },
        { name: "ml-model-cards/", type: "folder" },
        { name: "architecture.md", type: "file" },
        { name: "deployment-guide.md", type: "file" },
      ]
    },
  ]
};

// ─── STYLES ───────────────────────────────────────────────
const S = {
  app: { fontFamily: "'Space Grotesk', sans-serif", background: "#08090d", color: "#e8e6e0", minHeight: "100vh", display: "flex", flexDirection: "column" },
  nav: { background: "rgba(8,9,13,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(200,168,75,0.2)", padding: "0 32px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  brand: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#c8a84b", letterSpacing: "0.5px", cursor: "pointer" },
  brandSub: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  navTabs: { display: "flex", gap: 4 },
  tab: (active) => ({ padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: active ? "rgba(200,168,75,0.15)" : "transparent", color: active ? "#c8a84b" : "rgba(255,255,255,0.5)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }),
  body: { flex: 1, display: "flex", flexDirection: "column" },
};

// ─── MAIN APP ──────────────────────────────────────────────
export default function ValuAI() {
  const [tab, setTab] = useState("dashboard");
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={S.app}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            <div style={S.brand}>Valu<span style={{ color: "#fff" }}>AI</span></div>
            <div style={S.brandSub}>Collateral Intelligence Platform</div>
          </div>
          <div style={{ width: 1, height: 32, background: "rgba(200,168,75,0.2)", margin: "0 8px" }} />
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#c8a84b", background: "rgba(200,168,75,0.1)", padding: "3px 10px", borderRadius: 4, border: "1px solid rgba(200,168,75,0.3)" }}>
            NBFC-GRADE · BENGALURU FOCUS
          </div>
        </div>
        <div style={S.navTabs}>
          {[
            { id: "dashboard", label: "Dashboard", icon: Icons.home },
            { id: "copilot", label: "AI Copilot", icon: Icons.chat },
            { id: "architecture", label: "Architecture", icon: Icons.arch },
            { id: "codebase", label: "Codebase", icon: Icons.folder },
          ].map(t => (
            <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
              <Icon d={t.icon} size={13} />
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3ecf8e", boxShadow: "0 0 8px #3ecf8e" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>All systems live</span>
        </div>
      </nav>

      <div style={S.body}>
        {tab === "dashboard" && <DashboardTab onCaseCreated={setCaseData} caseData={caseData} />}
        {tab === "copilot" && <CopilotTab caseData={caseData} />}
        {tab === "architecture" && <ArchTab />}
        {tab === "codebase" && <CodebaseTab />}
      </div>
    </div>
  );
}

// ─── DASHBOARD TAB ─────────────────────────────────────────
function DashboardTab({ onCaseCreated, caseData }) {
  const [form, setForm] = useState({
    address: "Whitefield, Bengaluru", type: "residential", subtype: "apartment",
    size: "1250", age: "8", floor: "5", lift: "yes",
    occupancy: "rented", rent: "32000", tenure: "freehold_clear_title"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(caseData);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const runEstimate = async () => {
    setLoading(true);
    try {
      const prompt = `You are a property valuation engine for Indian NBFCs. Given this property, output ONLY valid JSON (no markdown, no explanation) with exactly these fields:
{
  "market_value_low": number in lakhs,
  "market_value_high": number in lakhs,
  "market_value_per_sqft": number,
  "guidance_value_per_sqft": number,
  "distress_value_low": number in lakhs,
  "distress_value_high": number in lakhs,
  "liquidity_discount_pct": number,
  "resale_index": number 0-100,
  "time_to_sell_low": number days,
  "time_to_sell_high": number days,
  "confidence": number 0-1,
  "policy_recommendation": "desktop-approve" | "field-review" | "legal-review",
  "key_drivers": ["driver1","driver2","driver3"],
  "risk_flags": ["flag1","flag2"],
  "location_score": number 0-100,
  "legal_score": number 0-100,
  "age_score": number 0-100,
  "rental_score": number 0-100,
  "market_score": number 0-100,
  "one_line_summary": "string"
}

Property: ${form.address}, ${form.subtype}, ${form.size} sqft, ${form.age} years old, Floor ${form.floor}, Lift: ${form.lift}, Occupancy: ${form.occupancy}, Rent: ₹${form.rent}/mo, Tenure: ${form.tenure}

Use Indian market expertise. Whitefield Bengaluru guidance ~₹5,500-7,000/sqft. Apply location, age, legal, marketability multipliers accurately.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      onCaseCreated(parsed);
    } catch (e) {
      // fallback demo data
      const demo = { market_value_low: 95, market_value_high: 115, market_value_per_sqft: 8200, guidance_value_per_sqft: 6500, distress_value_low: 75, distress_value_high: 90, liquidity_discount_pct: 21, resale_index: 72, time_to_sell_low: 45, time_to_sell_high: 90, confidence: 0.68, policy_recommendation: "desktop-approve", key_drivers: ["proximity_to_metro","standard_2bhk_configuration","active_rental_demand"], risk_flags: ["high_micro_market_competition","moderate_building_age"], location_score: 78, legal_score: 92, age_score: 65, rental_score: 74, market_score: 61, one_line_summary: "Mid-tier 2BHK in high-demand Whitefield corridor. Suitable for desktop-led underwriting at 65% LTV." };
      setResult(demo);
      onCaseCreated(demo);
    }
    setLoading(false);
  };

  const input = (label, key, opts = {}) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>{label}</div>
      {opts.options ? (
        <select value={form[key]} onChange={set(key)} style={inputSt}>
          {opts.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input value={form[key]} onChange={set(key)} placeholder={opts.placeholder} style={inputSt} />
      )}
    </div>
  );

  const inputSt = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#e8e6e0", fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", outline: "none" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", flex: 1, overflow: "hidden" }}>
      {/* FORM PANEL */}
      <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto", padding: "28px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 3, color: "#c8a84b", textTransform: "uppercase", marginBottom: 6 }}>New Case</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#fff" }}>Property Estimate</div>
        </div>

        <SectionDivider label="Location" />
        {input("Address / Area", "address")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>{input("Type", "type", { options: [{ v: "residential", l: "Residential" }, { v: "commercial", l: "Commercial" }, { v: "industrial", l: "Industrial" }] })}</div>
          <div>{input("Subtype", "subtype", { options: [{ v: "apartment", l: "Apartment" }, { v: "villa", l: "Villa" }, { v: "plot", l: "Plot" }, { v: "shop", l: "Shop" }, { v: "office", l: "Office" }] })}</div>
        </div>

        <SectionDivider label="Property Details" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>{input("Area (sq ft)", "size")}</div>
          <div>{input("Building Age (yrs)", "age")}</div>
          <div>{input("Floor Level", "floor")}</div>
          <div>{input("Lift Available", "lift", { options: [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }] })}</div>
        </div>

        <SectionDivider label="Income & Legal" />
        {input("Occupancy", "occupancy", { options: [{ v: "rented", l: "Rented" }, { v: "self-occupied", l: "Self-Occupied" }, { v: "vacant", l: "Vacant" }] })}
        {input("Monthly Rent (₹)", "rent")}
        {input("Legal Tenure", "tenure", { options: [{ v: "freehold_clear_title", l: "Freehold — Clear Title" }, { v: "freehold_disputed", l: "Freehold — Disputed" }, { v: "leasehold", l: "Leasehold" }] })}

        <button
          onClick={runEstimate}
          disabled={loading}
          style={{ width: "100%", marginTop: 20, padding: "13px", background: loading ? "rgba(200,168,75,0.4)" : "#c8a84b", color: loading ? "rgba(0,0,0,0.5)" : "#08090d", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
        >
          {loading ? (
            <><LoadingDots /> Analyzing with AI…</>
          ) : (
            <><Icon d={Icons.zap} size={14} /> Run Intelligence Engine</>
          )}
        </button>
      </div>

      {/* RESULTS PANEL */}
      <div style={{ overflowY: "auto", padding: "28px 28px" }}>
        {!result ? (
          <EmptyState />
        ) : (
          <ResultsView r={result} address={form.address} subtype={form.subtype} size={form.size} />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, opacity: 0.4 }}>
      <div style={{ fontSize: 64 }}>🏢</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#fff" }}>Ready to Assess</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>Enter property details and run the intelligence engine to get market value, distress value, resale index, and confidence score.</div>
    </div>
  );
}

function ResultsView({ r, address, subtype, size }) {
  const policyColor = r.policy_recommendation === "desktop-approve" ? "#3ecf8e" : r.policy_recommendation === "field-review" ? "#f59e0b" : "#ef4444";
  const resaleColor = r.resale_index >= 80 ? "#3ecf8e" : r.resale_index >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 3, color: "#c8a84b", textTransform: "uppercase", marginBottom: 4 }}>Assessment Complete</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#fff" }}>{address} · {subtype} · {size} sq ft</div>
        </div>
        <div style={{ padding: "6px 14px", background: policyColor + "20", border: `1px solid ${policyColor}40`, borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: policyColor, fontFamily: "'Space Mono', monospace" }}>
          {r.policy_recommendation.replace(/-/g, " ")}
        </div>
      </div>

      {/* MAIN VALUE */}
      <div style={{ background: "linear-gradient(135deg, rgba(200,168,75,0.1) 0%, rgba(200,168,75,0.03) 100%)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 12, padding: "24px 28px" }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Market Value Range</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: "#c8a84b", lineHeight: 1 }}>₹{r.market_value_low}L – ₹{r.market_value_high}L</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <Pill label={`₹${r.market_value_per_sqft?.toLocaleString()}/sqft market`} color="#c8a84b" />
          <Pill label={`₹${r.guidance_value_per_sqft?.toLocaleString()}/sqft guidance`} color="rgba(255,255,255,0.4)" />
        </div>
      </div>

      {/* TWIN CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <MetricCard label="Distress Value" value={`₹${r.distress_value_low}L – ₹${r.distress_value_high}L`} sub={`−${r.liquidity_discount_pct}% liquidity discount`} icon="🔥" />
        <MetricCard label="Time to Liquidate" value={`${r.time_to_sell_low}–${r.time_to_sell_high} days`} sub="under normal market conditions" icon="⏱" />
      </div>

      {/* SCORES ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <ScoreCard label="Resale Potential Index" score={r.resale_index} max={100} color={resaleColor} sub={r.resale_index >= 80 ? "Highly Liquid" : r.resale_index >= 50 ? "Moderate Liquidity" : "Illiquid"} />
        <ScoreCard label="Confidence Score" score={Math.round(r.confidence * 100)} max={100} color={r.confidence >= 0.7 ? "#3ecf8e" : r.confidence >= 0.5 ? "#f59e0b" : "#ef4444"} sub={`Data quality: ${r.confidence >= 0.7 ? "Strong" : r.confidence >= 0.5 ? "Adequate" : "Weak"}`} />
      </div>

      {/* FACTOR BREAKDOWN */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 16 }}>Factor Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Location & Accessibility", score: r.location_score, weight: "30%" },
            { label: "Legal Clarity", score: r.legal_score, weight: "20%" },
            { label: "Age & Condition", score: r.age_score, weight: "10%" },
            { label: "Rental Attractiveness", score: r.rental_score, weight: "10%" },
            { label: "Market Supply-Demand", score: r.market_score, weight: "10%" },
          ].map(f => (
            <div key={f.label} style={{ display: "grid", gridTemplateColumns: "180px 1fr 40px", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{f.label}</div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${f.score}%`, background: f.score >= 75 ? "#3ecf8e" : f.score >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 4, transition: "width 1s ease" }} />
              </div>
              <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: "#c8a84b", textAlign: "right" }}>{f.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DRIVERS & FLAGS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "rgba(62,207,142,0.05)", border: "1px solid rgba(62,207,142,0.2)", borderRadius: 12, padding: "20px" }}>
          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "#3ecf8e", textTransform: "uppercase", marginBottom: 12 }}>✓ Key Drivers</div>
          {(r.key_drivers || []).map(d => (
            <div key={d} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ecf8e", flexShrink: 0 }} />
              {d.replace(/_/g, " ")}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "20px" }}>
          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "#ef4444", textTransform: "uppercase", marginBottom: 12 }}>⚠ Risk Flags</div>
          {(r.risk_flags || []).map(f => (
            <div key={f} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              {f.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 24px" }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Underwriter Summary</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{r.one_line_summary}</div>
      </div>
    </div>
  );
}

// ─── COPILOT TAB ───────────────────────────────────────────
function CopilotTab({ caseData }) {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I'm your **ValuAI Underwriting Copilot**, powered by Claude.\n\nI specialize in Indian property-backed lending — LAP, home loans, collateral assessment. I can:\n- Estimate and explain any property's market & distress value\n- Simulate what-if scenarios (title dispute, vacant property, etc.)\n- Generate credit memo bullet points\n- Recommend LTV ratios by risk band\n\n" + (caseData ? `I have your last assessment loaded. Resale Index: **${caseData.resale_index}**, Confidence: **${caseData.confidence}**.` : "Try a quick prompt below, or ask me anything about a property.") }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const send = async (msg) => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    historyRef.current.push({ role: "user", content: userMsg });
    setLoading(true);

    const system = `You are ValuAI, an expert AI underwriting copilot for Indian NBFCs specializing in LAP (Loan Against Property) and secured lending. You help credit managers assess collateral value, liquidity risk, and enforcement risk for Indian real estate.

Expert knowledge:
- Indian property markets (Bengaluru focus: Whitefield, Koramangala, HSR, Hebbal, etc.)
- Circle rates / guidance values — Karnataka Dept of Stamps & Registration
- NBFC lending norms, RBI LTV guidelines (residential 90/80/75% by ticket size)
- Valuation formula: Market Value = Base Guidance × Location Multiplier × Property Adjustment × Condition/Age × Marketability
- Resale Index = 0.30×location + 0.20×fungibility + 0.20×legal + 0.10×age + 0.10×rental + 0.10×market
- Distress discount bands: prime 10-18%, mid-market 15-25%, old/legal issues 25-40%
- Liquidation time: index 80-100→30-60 days, 60-79→45-90 days, 40-59→90-180 days, <40→180+
${caseData ? `\nActive case context: Market value ₹${caseData.market_value_low}-${caseData.market_value_high}L, Distress ₹${caseData.distress_value_low}-${caseData.distress_value_high}L, Resale Index ${caseData.resale_index}/100, Confidence ${caseData.confidence}, Policy: ${caseData.policy_recommendation}` : ""}

Be concise, use numbers, give specific guidance. Format with **bold** for key terms. Keep under 200 words unless writing a detailed memo. Never fabricate regulatory rules.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: historyRef.current })
      });
      const data = await res.json();
      const reply = data.content.map(b => b.text || "").join("");
      historyRef.current.push({ role: "assistant", content: reply });
      setMessages(m => [...m, { role: "ai", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "ai", content: "Connection error. Please retry." }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    { label: "Valuation", text: "Estimate value and resale risk for a 2BHK in Whitefield, 1250 sqft, 8 years old, rented ₹32k/month, freehold clear title." },
    { label: "LTV Policy", text: "What LTV ratio should I use for a property with resale index 55 and confidence 0.6?" },
    { label: "What-If", text: "How does valuation change if this freehold property had a title dispute?" },
    { label: "Credit Memo", text: "Generate a 5-bullet credit memo for underwriting a mid-market Bengaluru apartment with resale index 72." },
    { label: "Distress Risk", text: "What factors cause a high distress discount in Indian property markets?" },
  ];

  const formatMsg = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c8a84b">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", flex: 1, overflow: "hidden" }}>
      {/* CHAT */}
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        {/* HEADER */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#c8a84b,#8b6914)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>ValuAI Copilot</div>
            <div style={{ fontSize: 11, color: "#3ecf8e" }}>● Powered by Claude · Collateral specialist</div>
          </div>
          {caseData && <div style={{ marginLeft: "auto", fontSize: 11, fontFamily: "'Space Mono', monospace", padding: "3px 10px", background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 4, color: "#c8a84b" }}>CASE LOADED</div>}
        </div>
        {/* MESSAGES */}
        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? "#c8a84b" : "rgba(255,255,255,0.06)",
                border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                fontSize: 14, lineHeight: 1.6,
                color: m.role === "user" ? "#08090d" : "rgba(255,255,255,0.85)",
              }} dangerouslySetInnerHTML={{ __html: formatMsg(m.content) }} />
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex" }}>
              <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <LoadingDots />
              </div>
            </div>
          )}
        </div>
        {/* INPUT */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about property, distress value, LTV policy, what-if scenarios..."
            rows={1}
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#e8e6e0", fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", resize: "none", outline: "none" }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{ width: 42, height: 42, borderRadius: 10, background: "#c8a84b", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: loading || !input.trim() ? 0.4 : 1 }}
          >
            <Icon d={Icons.send} size={16} color="#08090d" />
          </button>
        </div>
      </div>

      {/* QUICK PROMPTS */}
      <div style={{ padding: "20px 16px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>Quick Prompts</div>
        {quickPrompts.map(p => (
          <div key={p.label} onClick={() => send(p.text)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(200,168,75,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#c8a84b", marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{p.text.slice(0, 80)}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ARCHITECTURE TAB ──────────────────────────────────────
function ArchTab() {
  const layers = [
    { label: "Channel Layer", items: ["Web Portal (Next.js)", "REST API", "AI Chatbot Copilot", "Underwriter Dashboard"], color: "#c8a84b" },
    { label: "Input Validation", items: ["Address Parsing & Geocoding", "Schema Checks (Pydantic)", "Fraud & Anomaly Checks", "Geolocation Mismatch Detection"], color: "#a78bfa" },
    { label: "Data Acquisition", items: ["Guidance Value / Circle Rate", "OpenStreetMap Amenity Layer", "Public Listings Density", "GTFS Transport Data"], color: "#38bdf8" },
    { label: "Feature Store", items: ["Location Intelligence (H3)", "Property Characteristics", "Legal & Tenure Signals", "Market Activity Proxies"], color: "#f97316" },
    { label: "Dual-Engine Model", items: ["Market Value Band (XGBoost + Quantile)", "Distress Discount Engine", "Resale Potential Index (0-100)", "Time-to-Liquidate Predictor"], color: "#3ecf8e" },
    { label: "Explainability Layer", items: ["SHAP Driver Ranking", "Risk Flags (Legal / Market / Age)", "Confidence Score Decomposition", "Policy Recommendation"], color: "#e879f9" },
    { label: "Governance & Audit", items: ["Immutable Audit Logs", "Model Versioning (MLflow)", "Human Override Threshold", "Compliance Reporting"], color: "#ef4444" },
  ];

  const techStack = [
    { cat: "Frontend", items: "Next.js · React · Tailwind · Leaflet / Mapbox", color: "#61dafb" },
    { cat: "Backend", items: "FastAPI · Python · Pydantic · SQLAlchemy", color: "#3ecf8e" },
    { cat: "ML", items: "XGBoost · LightGBM · Scikit-learn · SHAP", color: "#f97316" },
    { cat: "Geospatial", items: "PostGIS · GeoPandas · Shapely · H3/S2", color: "#38bdf8" },
    { cat: "Storage", items: "PostgreSQL · Redis · S3-compatible", color: "#a78bfa" },
    { cat: "MLOps", items: "MLflow · DVC · Evidently AI · Prometheus", color: "#e879f9" },
    { cat: "Auth", items: "Keycloak · Enterprise SSO · JWT", color: "#c8a84b" },
    { cat: "Deploy", items: "Docker · Kubernetes · Terraform", color: "#ef4444" },
  ];

  return (
    <div style={{ overflowY: "auto", padding: "32px 40px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 3, color: "#c8a84b", textTransform: "uppercase", marginBottom: 8 }}>System Design</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#fff" }}>Platform Architecture</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Bloomberg Terminal for Real Estate Collateral — 7-layer intelligence stack</div>
      </div>

      {/* LAYER STACK */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 48 }}>
        {layers.map((l, i) => (
          <div key={l.label} style={{ display: "grid", gridTemplateColumns: "200px 1fr", background: "rgba(255,255,255,0.02)", border: `1px solid ${l.color}20`, borderLeft: `3px solid ${l.color}`, borderRadius: "0 8px 8px 0", padding: "14px 20px", gap: 24 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: l.color, letterSpacing: 1, marginBottom: 2 }}>Layer {String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e6e0" }}>{l.label}</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {l.items.map(item => (
                <div key={item} style={{ fontSize: 12, padding: "3px 10px", background: l.color + "15", border: `1px solid ${l.color}30`, borderRadius: 4, color: "rgba(255,255,255,0.7)" }}>{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FORMULA */}
      <div style={{ marginBottom: 48 }}>
        <SectionTitle>Valuation Formula</SectionTitle>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px 28px", fontFamily: "'Space Mono', monospace", fontSize: 13, lineHeight: 2.4, color: "rgba(255,255,255,0.7)" }}>
          <span style={{ color: "#c8a84b", fontWeight: 700 }}>Market Value</span> = Base Guidance Value
          <span style={{ color: "#38bdf8" }}>  × Location Multiplier</span> <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>[transit, amenities, neighbourhood]</span>
          <br />
          <span style={{ color: "#3ecf8e" }}>  × Property Adjustment</span> <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>[type, size, floor, standardization]</span>
          <br />
          <span style={{ color: "#f97316" }}>  × Condition / Age Adjustment</span> <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>[depreciation bucket]</span>
          <br />
          <span style={{ color: "#a78bfa" }}>  × Marketability Adjustment</span> <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>[rental yield, demand signal]</span>
        </div>
      </div>

      {/* TECH STACK */}
      <div>
        <SectionTitle>Technology Stack</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {techStack.map(t => (
            <div key={t.cat} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${t.color}25`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: t.color, marginBottom: 8 }}>{t.cat}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{t.items}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CODEBASE TAB ──────────────────────────────────────────
function CodebaseTab() {
  const [expanded, setExpanded] = useState({ "frontend/": true, "backend/": true, "ml/": false, "data/": false, "infrastructure/": false });
  const [selected, setSelected] = useState(null);
  const toggle = (name) => setExpanded(e => ({ ...e, [name]: !e[name] }));

  const stats = [
    { label: "Total Files", value: "94", icon: Icons.file },
    { label: "Top-Level Folders", value: "5", icon: Icons.folder },
    { label: "API Endpoints", value: "8", icon: Icons.zap },
    { label: "ML Engines", value: "6", icon: Icons.cpu },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", flex: 1, overflow: "hidden" }}>
      {/* TREE */}
      <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ padding: "0 8px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 3, color: "#c8a84b", textTransform: "uppercase", marginBottom: 4 }}>Project Root</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#fff" }}>valuai/ codebase</div>
        </div>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, padding: "0 8px" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", color: "#c8a84b" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <FolderNode node={folderTree} depth={0} expanded={expanded} onToggle={toggle} onSelect={setSelected} selected={selected} />
      </div>

      {/* DETAIL */}
      <div style={{ overflowY: "auto", padding: "28px 32px" }}>
        {selected ? (
          <FileDetail node={selected} />
        ) : (
          <ProjectOverview />
        )}
      </div>
    </div>
  );
}

function FolderNode({ node, depth, expanded, onToggle, onSelect, selected }) {
  const isExp = expanded[node.name];
  const isFile = node.type === "file";
  const indent = depth * 16;

  return (
    <div>
      <div
        onClick={() => isFile ? onSelect(node) : onToggle(node.name)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 6, cursor: "pointer", marginLeft: indent, background: selected === node ? "rgba(200,168,75,0.1)" : "transparent", transition: "background 0.15s" }}
        onMouseEnter={e => { if (selected !== node) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { if (selected !== node) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: 13, flexShrink: 0 }}>{isFile ? "📄" : isExp ? "📂" : "📁"}</span>
        <span style={{ fontSize: 12, color: isFile ? "rgba(255,255,255,0.6)" : (node.color || "#c8a84b"), fontFamily: isFile ? "'Space Mono', monospace" : "'Space Grotesk', sans-serif", fontWeight: isFile ? 400 : 500 }}>{node.name}</span>
        {node.badge && <span style={{ fontSize: 9, padding: "1px 6px", background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 4, color: "#c8a84b", letterSpacing: 0.5 }}>{node.badge}</span>}
      </div>
      {!isFile && isExp && node.children && node.children.map(child => (
        <FolderNode key={child.name} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} onSelect={onSelect} selected={selected} />
      ))}
    </div>
  );
}

function FileDetail({ node }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "#c8a84b", textTransform: "uppercase", marginBottom: 6 }}>File Detail</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#fff" }}>{node.name}</div>
        {node.desc && <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8, lineHeight: 1.6 }}>{node.desc}</div>}
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "20px 24px", fontFamily: "'Space Mono', monospace", fontSize: 12, lineHeight: 2, color: "rgba(255,255,255,0.5)" }}>
        <span style={{ color: "#a78bfa" }}>// {node.name}</span><br />
        <span style={{ color: "#38bdf8" }}>// Role:</span> {node.desc || "Component module"}<br />
        <span style={{ color: "#38bdf8" }}>// Type:</span> {node.name.endsWith(".py") ? "Python module" : node.name.endsWith(".tsx") || node.name.endsWith(".ts") ? "TypeScript / React" : node.name.endsWith(".sql") ? "SQL schema" : node.name.endsWith(".yaml") || node.name.endsWith(".yml") ? "Kubernetes / Docker config" : "Configuration file"}<br />
      </div>
    </div>
  );
}

function ProjectOverview() {
  const phases = [
    { phase: "Phase 1", title: "MVP", time: "4–6 weeks", items: ["Input form + geocoding + guidance value lookup", "Rules-based market band + liquidity index", "Amenity distance scoring + manual override", "JSON/API output + downloadable summary"], color: "#3ecf8e" },
    { phase: "Phase 2", title: "Smart Engine", time: "6–10 weeks", items: ["Listing-based market activity proxies", "XGBoost quantile valuation model", "Anomaly detection + confidence scoring", "AI chatbot for result explanation + what-if"], color: "#c8a84b" },
    { phase: "Phase 3", title: "Enterprise", time: "8–12 weeks", items: ["LOS/LMS integration", "Role-based governance + audit dashboard", "Calibration with realized recovery data", "Portfolio-level collateral monitoring"], color: "#a78bfa" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 3, color: "#c8a84b", textTransform: "uppercase", marginBottom: 6 }}>Click any file in the tree</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#fff" }}>Project Overview</div>
      </div>
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Phased Rollout Plan</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {phases.map(p => (
            <div key={p.phase} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${p.color}25`, borderLeft: `3px solid ${p.color}`, borderRadius: "0 10px 10px 0", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: p.color }}>{p.phase} · </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{p.title}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.3)" }}>{p.time}</span>
              </div>
              {p.items.map(item => (
                <div key={item} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, display: "flex", gap: 8 }}>
                  <span style={{ color: p.color }}>→</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
      {label}
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#fff", marginBottom: 16 }}>{children}</div>;
}

function MetricCard({ label, value, sub, icon }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8 }}>{icon} {label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#fff", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{sub}</div>
    </div>
  );
}

function ScoreCard({ label, score, max, color, sub }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color }}>{score}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>/ {max}</div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${(score / max) * 100}%`, background: color, borderRadius: 4, transition: "width 1s ease" }} />
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sub}</div>
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <div style={{ fontSize: 11, padding: "3px 10px", background: color + "15", border: `1px solid ${color}30`, borderRadius: 4, color, fontFamily: "'Space Mono', monospace" }}>{label}</div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a84b", display: "inline-block", animation: `pulse 1.2s ${i * 0.2}s infinite`, opacity: 0.4 }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </span>
  );
}
