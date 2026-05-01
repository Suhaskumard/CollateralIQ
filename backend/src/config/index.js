import 'dotenv/config';

export const PORT         = process.env.PORT         || 8000;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const OPENAI_MODEL   = process.env.OPENAI_MODEL   || 'gpt-4o';

export const CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];
