import { useState, useRef, useEffect } from 'react';
import { streamChat } from '../../services/api.js';

const PROMPTS = [
  'What LTV should I offer on a leasehold property in Sarjapur?',
  'Explain distress value discounts for NBFC enforcement',
  'How does floor level impact collateral quality?',
  'What is the resale index formula?',
  'Compare prime vs peripheral micro-market risk',
  'Generate a credit memo summary for a ₹80L apartment',
  'RBI LTV guidelines for commercial property LAP',
  'Red flags that warrant a legal review recommendation',
];

let msgId = 0;

export default function Copilot() {
  const [messages, setMessages]   = useState([]);
  const [history, setHistory]     = useState([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const bodyRef = useRef(null);

  // Scroll to bottom whenever messages change
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

    const userKey = addMsg('user', msg);
    const newHistory = [...history, { role: 'user', content: msg }];
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
        <div className="page-eyebrow">Intelligence</div>
        <div className="page-title">AI Copilot</div>
      </div>

      <div className="chat-wrap">
        {/* Chat box */}
        <div className="chat-box">
          <div className="chat-topbar">
            <div className="chat-av">✦</div>
            <div>
              <div className="chat-name">ValuAI Copilot</div>
              <div className="chat-status">● Online · Collateral Underwriting Specialist · GPT-4o</div>
            </div>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {/* Welcome message */}
            <div className="msg ai">
              <div className="msg-bubble">
                Hello! I'm your AI underwriting copilot, powered by GPT-4o.<br /><br />
                I specialize in Indian property-backed lending — LAP, home loans, commercial mortgages. Ask me anything about collateral value, LTV, liquidity risk, or RBI guidelines.
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
              placeholder="Ask about collateral value, LTV, risk flags…"
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
