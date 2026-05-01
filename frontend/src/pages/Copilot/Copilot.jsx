import { useState, useRef, useEffect } from 'react';
import { streamChat } from '../../services/api.js';
import { useApp } from '../../context/AppContext.jsx';

const PROMPTS = [
  'Estimate value and resale risk for this 2BHK in Whitefield.',
  'Why is the distress discount high?',
  'What would change if the property were freehold with rental income?',
  'Generate an underwriter summary in 5 bullet points.',
  'What data is missing and how does it affect confidence?',
  'Compare prime vs peripheral micro-market risk.',
  'RBI LTV guidelines for commercial property LAP.',
  'Red flags that warrant a legal review recommendation.',
];

let msgId = 0;

export default function Copilot() {
  const { lastValuation } = useApp();
  const [messages, setMessages]   = useState([]);
  const [history, setHistory]     = useState([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  function addMsg(role, content, id) {
    const key = id ?? ++msgId;
    setMessages(m => [...m, { key, role, content }]);
    return key;
  }

  function updateMsg(key, content) {
    setMessages(m => m.map(msg => msg.key === key ? { ...msg, content } : msg));
  }

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || streaming) return;
    setInput('');

    addMsg('user', msg);
    const newHistory = [...history, { role: 'user', content: msg }];

    // Inject case context if available
    if (lastValuation && history.length === 0) {
      const ctx = `[CONTEXT: Last valuation — ${lastValuation.address || 'Property'}, ${lastValuation.propertyType}/${lastValuation.subtype}, ${lastValuation.area}sqft, ${lastValuation.age}y, MV: ₹${lastValuation.mv_low}L-₹${lastValuation.mv_high}L, RI: ${lastValuation.resaleIndex}, Confidence: ${lastValuation.confidence}, Policy: ${lastValuation.policy}]`;
      newHistory.unshift({ role: 'system', content: ctx });
    }

    setHistory(newHistory);
    setStreaming(true);
    const aiKey = ++msgId;
    setMessages(m => [...m, { key: aiKey, role: 'ai', content: '', typing: true }]);

    let accumulated = '';
    try {
      for await (const chunk of streamChat(newHistory)) {
        accumulated += chunk;
        updateMsg(aiKey, accumulated);
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
      setMessages(m => m.map(msg => msg.key === aiKey ? { ...msg, typing: false } : msg));
      setHistory(h => [...h, { role: 'assistant', content: accumulated }]);
    } catch {
      updateMsg(aiKey, '⚠ Connection error. Is the backend running?');
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function formatContent(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="font-family:var(--mono);background:var(--surface2);padding:1px 4px;border-radius:3px;font-size:11px">$1</code>')
      .replace(/\n/g, '<br>');
  }

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Intelligence · Underwriting Copilot</div>
        <div className="page-title">AI Copilot</div>
        <div className="page-desc">Ask about valuations, explain scores, run scenarios, or generate credit memos</div>
      </div>

      <div className="chat-wrap">
        {/* Chat box */}
        <div className="chat-box">
          <div className="chat-topbar">
            <div className="chat-av">✦</div>
            <div style={{ flex: 1 }}>
              <div className="chat-name">CollateralIQ Copilot</div>
              <div className="chat-status">● Online · Underwriting Specialist · v2.0</div>
            </div>
            {lastValuation && (
              <div className="chat-context-badge">
                📋 Case: {lastValuation.address?.slice(0, 20) || lastValuation.subtype} · RI:{lastValuation.resaleIndex}
              </div>
            )}
          </div>

          <div className="chat-body" ref={bodyRef}>
            <div className="msg ai">
              <div className="msg-bubble">
                Hello! I'm your <strong>CollateralIQ Copilot</strong> — AI underwriting assistant.<br /><br />
                I can help with property valuation, risk analysis, credit memos, what-if scenarios, and RBI/NBFC compliance.<br /><br />
                {lastValuation ? (
                  <span style={{ color: 'var(--gold)' }}>📋 I have context from your last valuation ({lastValuation.address || lastValuation.subtype}). Ask me anything about it!</span>
                ) : (
                  <span style={{ color: 'var(--text3)' }}>Run a valuation first to give me case context, or ask general questions.</span>
                )}
              </div>
              <div className="msg-time">Just now</div>
            </div>

            {messages.map(msg => (
              <div className={`msg ${msg.role}`} key={msg.key}>
                <div className="msg-bubble">
                  {msg.typing && !msg.content ? (
                    <div className="dots"><span /><span /><span /></div>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                  )}
                </div>
                <div className="msg-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              rows={1}
              placeholder="Ask about collateral value, explain scores, generate memos…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={streaming}
            />
            <button className="btn-send" onClick={() => send()} disabled={streaming || !input.trim()}>
              {streaming ? '⏳' : '↑'}
            </button>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="chat-prompts">
          <div className="prompts-header">Quick Prompts</div>
          <div className="prompt-list">
            {PROMPTS.map(p => (
              <div className="prompt-item" key={p} onClick={() => send(p)}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
