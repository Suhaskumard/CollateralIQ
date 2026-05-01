import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_MODEL } from '../../config/index.js';

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are ValuAI Copilot, an expert AI underwriting copilot for Indian NBFCs specializing in property-backed lending (LAP, home loans, commercial mortgages).

Your expertise:
- Indian real estate markets (Bengaluru: Whitefield, Koramangala, HSR, Sarjapur, Indiranagar, Hebbal)
- Karnataka Dept of Stamps & Registration — circle rates / guidance values
- NBFC lending norms, RBI LTV guidelines (75% for ≤₹30L, 80% for ₹30-75L, 75% for >₹75L residential; 55-65% commercial)
- Valuation formula: Market Value = Guidance Value × Location × Property Adj × Condition × Marketability
- Resale Index = 0.30×L + 0.20×F + 0.20×J + 0.10×A + 0.10×R + 0.10×M
- Distress discounts: prime/clear title 10-18%, mid-market 15-25%, old/niche/legal issues 25-40%
- Liquidation timelines: RI 80-100 → 30-60d, 60-79 → 45-90d, 40-59 → 90-180d, <40 → 180d+
- Policy: desktop-approve (clean), field-review (moderate risk), legal-review (title/legal issues)

Be concise, expert, and use India-specific data. Under 300 words unless writing a formal credit memo.`;

const MOCK_RESPONSES = {
  ltv: `**LTV Guidelines (RBI Master Circular)**\n\n- Residential ≤₹30L → **75% LTV**\n- Residential ₹30-75L → **80% LTV**\n- Residential >₹75L → **75% LTV**\n- Commercial/LAP → **55-65% LTV**`,
  distress: `**Distress Value Discounts**\n\n- Prime location, clear title → **10-18%**\n- Mid-market → **15-25%**\n- Old property / legal issues → **25-40%**\n\nDistress Value = Market Value × (1 − Discount%)`,
  default: `I'm ValuAI Copilot — your collateral intelligence assistant.\n\nI can help with property valuation, LTV assessment, resale index analysis, distress value calculations, and RBI/NBFC compliance guidance.\n\n⚙️ *Add your \`OPENAI_API_KEY\` to \`backend/.env\` to unlock full GPT-4o responses.*`,
};

function getMockResponse(msg = '') {
  const l = msg.toLowerCase();
  if (l.includes('ltv') || l.includes('loan')) return MOCK_RESPONSES.ltv;
  if (l.includes('distress') || l.includes('discount')) return MOCK_RESPONSES.distress;
  return MOCK_RESPONSES.default;
}

export async function chatCompletion(messages) {
  if (!OPENAI_API_KEY) return getMockResponse(messages.at(-1)?.content);
  const res = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 1000,
    temperature: 0.4,
  });
  return res.choices[0].message.content;
}

export async function* chatStream(messages) {
  if (!OPENAI_API_KEY) {
    const mock = getMockResponse(messages.at(-1)?.content);
    for (const char of mock) {
      yield char;
      await new Promise(r => setTimeout(r, 8));
    }
    return;
  }
  const stream = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 1000,
    temperature: 0.4,
    stream: true,
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) yield text;
  }
}
