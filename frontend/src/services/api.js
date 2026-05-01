/**
 * API service layer — all backend communication lives here.
 * Vite proxy forwards /api → http://localhost:8000
 */

const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboardMetrics = ()     => request('GET',  '/dashboard/metrics');

// ── Estimate ───────────────────────────────────────────────────────────────
export const runEstimate = (data)         => request('POST', '/estimate/run', data);

// ── What-If ────────────────────────────────────────────────────────────────
export const analyzeWhatIf = (data)       => request('POST', '/whatif/analyze', data);

// ── Portfolio ──────────────────────────────────────────────────────────────
export const getPortfolio = ()            => request('GET',  '/portfolio');
export const saveCase     = (data)        => request('POST', '/portfolio/save', data);
export const deleteCase   = (id)          => request('DELETE', `/portfolio/${id}`);

// ── Copilot ────────────────────────────────────────────────────────────────
export const sendChat = (messages)        => request('POST', '/copilot/chat', { messages });

// ── Audit ──────────────────────────────────────────────────────────────────
export const getAuditTrail = (limit = 100) => request('GET', `/audit/trail?limit=${limit}`);
export const logAuditEvent  = (data)        => request('POST', '/audit/log', data);

// ── Bundle all exports as `api` for convenience ───────────────────────────
export const api = {
  getDashboardMetrics,
  runEstimate,
  analyzeWhatIf,
  getPortfolio,
  saveCase,
  deleteCase,
  sendChat,
  getAuditTrail,
  logAuditEvent,
  streamChat,
};

/**
 * Streaming chat — yields text chunks via Server-Sent Events
 */
export async function* streamChat(messages) {
  const res = await fetch(`${BASE}/copilot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true }),
  });

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const { text } = JSON.parse(payload);
        if (text) yield text;
      } catch { /* skip malformed */ }
    }
  }
}
