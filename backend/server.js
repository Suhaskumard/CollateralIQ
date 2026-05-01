import 'dotenv/config';
import { createApp } from './src/app.js';
import { PORT } from './src/config/index.js';

const app = createApp();

app.listen(PORT, () => {
  console.log(`\n🏦  CollateralIQ API  →  http://localhost:${PORT}`);
  console.log(`📋  Routes:`);
  console.log(`    GET    /api/dashboard/metrics`);
  console.log(`    POST   /api/estimate/run`);
  console.log(`    POST   /api/whatif/analyze`);
  console.log(`    GET    /api/portfolio`);
  console.log(`    POST   /api/portfolio/save`);
  console.log(`    DELETE /api/portfolio/:id`);
  console.log(`    POST   /api/copilot/chat`);
  console.log(`    GET    /api/audit/trail`);
  console.log(`    POST   /api/audit/log\n`);
});
