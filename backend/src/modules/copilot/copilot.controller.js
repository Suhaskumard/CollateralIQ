import { chatCompletion, chatStream } from './copilot.service.js';

export async function chat(req, res, next) {
  try {
    const { messages = [], stream = false } = req.body;

    if (stream) {
      res.setHeader('Content-Type',  'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection',    'keep-alive');

      for await (const chunk of chatStream(messages)) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reply = await chatCompletion(messages);
    res.json({ reply });
  } catch (err) { next(err); }
}
